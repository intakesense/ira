"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Hash,
  List,
  CheckSquare,
} from "lucide-react"
import { toast } from "sonner"
import { createQuestion, updateQuestion, deleteQuestion } from "@/actions/questionnaire"
import type { Question } from "@prisma/client"

// ============================================================================
// Types
// ============================================================================

/**
 * Three question types — all stored as inputType "boolean" or "number" in DB:
 *   yesno  → inputType "boolean", options [{label:"Yes"},{label:"No"}] (no explicit scores)
 *   mcq    → inputType "boolean", options [{label, score}, ...] (explicit scores per option)
 *   number → inputType "number",  options [{min, max, score}, ...]
 */
export type QuestionType = "yesno" | "mcq" | "number"

type MCQOption = { label: string; score: number }
type NumberThreshold = { min: number | null; max: number | null; score: number }

type QuestionFormData = {
  text: string
  section: string
  displayNumber: string
  helpText: string
  questionType: QuestionType
  mcqOptions: MCQOption[]
  numberThresholds: NumberThreshold[]
  maxScore: number
  unit: string
}

const EMPTY_FORM: QuestionFormData = {
  text: "",
  section: "",
  displayNumber: "",
  helpText: "",
  questionType: "yesno",
  mcqOptions: [
    { label: "", score: 0 },
    { label: "", score: 0 },
  ],
  numberThresholds: [{ min: null, max: null, score: 0 }],
  maxScore: 1,
  unit: "",
}

const SECTIONS = ["IPO Readiness", "Corporate Governance", "Right Team", "Financial Data"]

// ============================================================================
// Helpers (exported so assessor stepper can reuse the detection logic)
// ============================================================================

export function detectQuestionType(q: {
  inputType: string
  options: unknown
}): QuestionType {
  if (q.inputType === "number") return "number"
  const opts = q.options as Array<{ label?: string; score?: number }> | null
  if (
    !opts ||
    (opts.length === 2 &&
      opts[0]?.label === "Yes" &&
      opts[1]?.label === "No" &&
      opts[0]?.score === undefined &&
      opts[1]?.score === undefined)
  ) {
    return "yesno"
  }
  return "mcq"
}

function questionToFormData(q: Question): QuestionFormData {
  const qType = detectQuestionType(q)
  const options = q.options as any[] | null

  return {
    text: q.text,
    section: q.section,
    displayNumber: q.displayNumber,
    helpText: q.helpText || "",
    questionType: qType,
    mcqOptions:
      qType === "mcq" && options
        ? options.map((o: any) => ({ label: o.label ?? "", score: o.score ?? 0 }))
        : [
            { label: "", score: 0 },
            { label: "", score: 0 },
          ],
    numberThresholds:
      qType === "number" && options
        ? options.map((o: any) => ({ min: o.min ?? null, max: o.max ?? null, score: o.score ?? 0 }))
        : [{ min: null, max: null, score: 0 }],
    maxScore: q.maxScore,
    unit: q.unit || "",
  }
}

function formDataToPayload(form: QuestionFormData) {
  const base = {
    text: form.text,
    section: form.section,
    displayNumber: form.displayNumber,
    helpText: form.helpText || null,
    maxScore: form.maxScore,
  }

  if (form.questionType === "yesno") {
    return {
      ...base,
      inputType: "boolean" as const,
      options: [{ label: "Yes" }, { label: "No" }],
      unit: null,
    }
  }

  if (form.questionType === "mcq") {
    return {
      ...base,
      inputType: "boolean" as const,
      options: form.mcqOptions
        .filter((o) => o.label.trim())
        .map((o) => ({ label: o.label, score: o.score })),
      unit: null,
    }
  }

  return {
    ...base,
    inputType: "number" as const,
    options: form.numberThresholds,
    unit: form.unit || null,
  }
}

// ============================================================================
// Question Form Component
// ============================================================================

function QuestionForm({
  initialData,
  onSave,
  onCancel,
  isPending,
}: {
  initialData: QuestionFormData
  onSave: (data: QuestionFormData) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [form, setForm] = useState<QuestionFormData>(initialData)

  // MCQ handlers
  const addMcqOption = () =>
    setForm((p) => ({ ...p, mcqOptions: [...p.mcqOptions, { label: "", score: 0 }] }))

  const removeMcqOption = (i: number) => {
    if (form.mcqOptions.length <= 2) return
    setForm((p) => ({ ...p, mcqOptions: p.mcqOptions.filter((_, idx) => idx !== i) }))
  }

  const updateMcqOption = (i: number, field: "label" | "score", val: string) =>
    setForm((p) => ({
      ...p,
      mcqOptions: p.mcqOptions.map((opt, idx) =>
        idx === i
          ? { ...opt, [field]: field === "score" ? (val === "" ? 0 : parseFloat(val)) : val }
          : opt
      ),
    }))

  // Number threshold handlers
  const addThreshold = () =>
    setForm((p) => ({
      ...p,
      numberThresholds: [...p.numberThresholds, { min: null, max: null, score: 0 }],
    }))

  const removeThreshold = (i: number) => {
    if (form.numberThresholds.length <= 1) return
    setForm((p) => ({ ...p, numberThresholds: p.numberThresholds.filter((_, idx) => idx !== i) }))
  }

  const updateThreshold = (i: number, field: "min" | "max" | "score", val: string) =>
    setForm((p) => ({
      ...p,
      numberThresholds: p.numberThresholds.map((t, idx) =>
        idx === i
          ? {
              ...t,
              [field]:
                field === "score"
                  ? val === ""
                    ? 0
                    : parseFloat(val)
                  : val === ""
                  ? null
                  : parseFloat(val),
            }
          : t
      ),
    }))

  const mcqScoreExceedsMax = form.mcqOptions.some((o) => o.score > form.maxScore)

  return (
    <div className="glass rounded-xl p-5 space-y-5 border border-primary/25">
      {/* Question text */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Question Text *</label>
        <textarea
          value={form.text}
          onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
          rows={2}
          className="w-full p-3 rounded-lg border border-foreground/20 bg-background focus:border-primary outline-none text-sm resize-none"
          placeholder="e.g. Does the company have audited financials for the last 3 years?"
        />
      </div>

      {/* Section / Display No. / Max Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Section *</label>
          <select
            value={SECTIONS.includes(form.section) ? form.section : "__custom"}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                section: e.target.value === "__custom" ? "" : e.target.value,
              }))
            }
            className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background focus:border-primary outline-none text-sm"
          >
            {SECTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="__custom">Custom…</option>
          </select>
          {!SECTIONS.includes(form.section) && (
            <input
              type="text"
              value={form.section}
              onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))}
              className="w-full h-10 px-3 mt-2 rounded-lg border border-foreground/20 bg-background focus:border-primary outline-none text-sm"
              placeholder="e.g. Risk Management, Legal Compliance"
            />
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Display No. *</label>
          <input
            type="text"
            value={form.displayNumber}
            onChange={(e) => setForm((p) => ({ ...p, displayNumber: e.target.value }))}
            className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background focus:border-primary outline-none text-sm"
            placeholder="e.g. 1, 2A, 3B"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Max Score *</label>
          <input
            type="number"
            step="any"
            min={0}
            value={form.maxScore || ""}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                maxScore: e.target.value === "" ? 0 : parseFloat(e.target.value),
              }))
            }
            className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background focus:border-primary outline-none text-sm"
            placeholder="e.g. 10 (total points for this question)"
          />
        </div>
      </div>

      {/* Question Type selector */}
      <div>
        <label className="text-sm font-medium mb-2 block">Answer Type *</label>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              {
                type: "yesno" as QuestionType,
                icon: <CheckSquare className="w-4 h-4" />,
                label: "Yes / No",
                sub: "Yes = full score, No = 0",
              },
              {
                type: "mcq" as QuestionType,
                icon: <List className="w-4 h-4" />,
                label: "Multiple Choice",
                sub: "Custom score per option",
              },
              {
                type: "number" as QuestionType,
                icon: <Hash className="w-4 h-4" />,
                label: "Number Input",
                sub: "Score by value range",
              },
            ] as const
          ).map(({ type, icon, label, sub }) => {
            const active = form.questionType === type
            return (
              <button
                key={type}
                type="button"
                onClick={() => setForm((p) => ({ ...p, questionType: type }))}
                className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg border text-center transition-all ${
                  active
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-foreground/20 text-foreground/50 hover:border-foreground/40 hover:text-foreground/80 hover:bg-foreground/[0.03]"
                }`}
              >
                {icon}
                <span className="text-xs font-semibold">{label}</span>
                <span className="text-[10px] leading-tight opacity-60">{sub}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Yes/No preview ── */}
      {form.questionType === "yesno" && (
        <div className="rounded-lg bg-foreground/[0.025] border border-foreground/10 p-4">
          <p className="text-xs text-foreground/40 uppercase tracking-wide font-medium mb-3">
            Assessor sees
          </p>
          <div className="flex gap-3">
            <div className="flex-1 flex items-center justify-between px-4 py-2.5 rounded-lg bg-green-500/10 border border-green-500/25 pointer-events-none">
              <span className="text-sm font-medium">Yes</span>
              <span className="text-sm font-bold text-green-500">{form.maxScore} pts</span>
            </div>
            <div className="flex-1 flex items-center justify-between px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/25 pointer-events-none">
              <span className="text-sm font-medium">No</span>
              <span className="text-sm font-bold text-red-500">0 pts</span>
            </div>
          </div>
        </div>
      )}

      {/* ── MCQ options ── */}
      {form.questionType === "mcq" && (
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label className="text-sm font-medium">Options</label>
            <span className="text-xs text-foreground/40">Max score: {form.maxScore} pts</span>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_110px_32px] gap-2 text-xs text-foreground/40 px-1">
              <span>Option label (shown to assessor)</span>
              <span className="text-center">Score (pts)</span>
              <span />
            </div>

            {form.mcqOptions.map((opt, i) => (
              <div key={i} className="grid grid-cols-[1fr_110px_32px] gap-2 items-center">
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => updateMcqOption(i, "label", e.target.value)}
                  className="h-10 px-3 rounded-lg border border-foreground/20 bg-background focus:border-primary outline-none text-sm"
                  placeholder={
                    i === 0
                      ? "e.g. Excellent / Fully Compliant / Above 20%"
                      : i === 1
                      ? "e.g. Adequate / Partially Compliant / 10–20%"
                      : i === 2
                      ? "e.g. Poor / Non-Compliant / Below 10%"
                      : `Option ${i + 1} label`
                  }
                />
                <input
                  type="number"
                  step="any"
                  min={0}
                  value={opt.score}
                  onChange={(e) => updateMcqOption(i, "score", e.target.value)}
                  className={`h-10 px-3 rounded-lg border bg-background focus:border-primary outline-none text-sm text-center ${
                    opt.score > form.maxScore ? "border-red-400" : "border-foreground/20"
                  }`}
                  placeholder={`e.g. ${form.maxScore > 0 ? Math.round(form.maxScore * (form.mcqOptions.length - i) / form.mcqOptions.length) : 0}`}
                />
                <button
                  type="button"
                  onClick={() => removeMcqOption(i)}
                  disabled={form.mcqOptions.length <= 2}
                  className="h-10 w-8 flex items-center justify-center rounded-lg text-foreground/30 hover:text-red-500 hover:bg-red-500/10 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addMcqOption}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 mt-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add option
            </button>
          </div>

          {mcqScoreExceedsMax && (
            <p className="text-xs text-red-500 mt-2">
              Some option scores exceed the max score ({form.maxScore}).
            </p>
          )}

          {/* Preview of how assessor sees it */}
          {form.mcqOptions.some((o) => o.label.trim()) && (
            <div className="rounded-lg bg-foreground/[0.025] border border-foreground/10 p-4 mt-3">
              <p className="text-xs text-foreground/40 uppercase tracking-wide font-medium mb-3">
                Assessor sees
              </p>
              <div className="flex flex-wrap gap-2">
                {form.mcqOptions
                  .filter((o) => o.label.trim())
                  .map((opt, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-foreground/20 bg-background text-sm"
                    >
                      <span>{opt.label}</span>
                      <span className="text-xs text-foreground/40 border-l border-foreground/10 pl-2">
                        {opt.score} pts
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Number ranges ── */}
      {form.questionType === "number" && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Unit
              <span className="text-foreground/40 font-normal ml-2 text-xs">optional</span>
            </label>
            <input
              type="text"
              value={form.unit}
              onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
              className="w-40 h-10 px-3 rounded-lg border border-foreground/20 bg-background focus:border-primary outline-none text-sm"
              placeholder="e.g. crores, %, ratio, years"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Scoring Ranges
              <span className="text-foreground/40 font-normal ml-2 text-xs">
                min inclusive · max exclusive · leave blank for open-ended
              </span>
            </label>

            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_1fr_100px_32px] gap-2 text-xs text-foreground/40 px-1">
                <span>Min{form.unit ? ` (${form.unit})` : ""}</span>
                <span>Max{form.unit ? ` (${form.unit})` : ""}</span>
                <span className="text-center">Score (pts)</span>
                <span />
              </div>

              {form.numberThresholds.map((t, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_100px_32px] gap-2 items-center">
                  <input
                    type="number"
                    step="any"
                    value={t.min ?? ""}
                    onChange={(e) => updateThreshold(i, "min", e.target.value)}
                    className="h-10 px-3 rounded-lg border border-foreground/20 bg-background focus:border-primary outline-none text-sm"
                    placeholder="e.g. 0 (blank = no lower limit)"
                  />
                  <input
                    type="number"
                    step="any"
                    value={t.max ?? ""}
                    onChange={(e) => updateThreshold(i, "max", e.target.value)}
                    className="h-10 px-3 rounded-lg border border-foreground/20 bg-background focus:border-primary outline-none text-sm"
                    placeholder="e.g. 100 (blank = no upper limit)"
                  />
                  <input
                    type="number"
                    step="any"
                    min={0}
                    value={t.score}
                    onChange={(e) => updateThreshold(i, "score", e.target.value)}
                    className="h-10 px-3 rounded-lg border border-foreground/20 bg-background focus:border-primary outline-none text-sm text-center"
                    placeholder="e.g. 5"
                  />
                  <button
                    type="button"
                    onClick={() => removeThreshold(i)}
                    disabled={form.numberThresholds.length <= 1}
                    className="h-10 w-8 flex items-center justify-center rounded-lg text-foreground/30 hover:text-red-500 hover:bg-red-500/10 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addThreshold}
                className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 mt-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add range
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help text */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">
          Help Text
          <span className="text-foreground/40 font-normal ml-2 text-xs">
            optional — shown below the question to the assessor
          </span>
        </label>
        <input
          type="text"
          value={form.helpText}
          onChange={(e) => setForm((p) => ({ ...p, helpText: e.target.value }))}
          className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background focus:border-primary outline-none text-sm"
          placeholder="e.g. Consider only the last audited financial year"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-foreground/10">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="w-full sm:w-auto px-6 h-10 rounded-lg border border-foreground/20 text-sm font-medium hover:bg-foreground/5 disabled:opacity-50 transition-all"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={isPending}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Check className="w-4 h-4" /> Save Question
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// Question Card
// ============================================================================

const TYPE_BADGE: Record<QuestionType, { label: string; cls: string }> = {
  yesno: { label: "Yes / No", cls: "bg-green-500/10 text-green-600" },
  mcq: { label: "MCQ", cls: "bg-blue-500/10 text-blue-600" },
  number: { label: "Number", cls: "bg-orange-500/10 text-orange-600" },
}

function QuestionCard({
  question,
  onEdit,
  onDelete,
  isPending,
}: {
  question: Question
  onEdit: () => void
  onDelete: () => void
  isPending: boolean
}) {
  const qType = detectQuestionType(question)
  const badge = TYPE_BADGE[qType]
  const options = question.options as any[] | null

  const renderPreview = () => {
    if (qType === "yesno") {
      return (
        <div className="flex gap-2 mt-2">
          <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-600">
            Yes → {question.maxScore} pts
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-600">
            No → 0 pts
          </span>
        </div>
      )
    }
    if (qType === "mcq" && options) {
      return (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {(options as Array<{ label: string; score: number }>).map((opt, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded bg-foreground/5 text-foreground/60">
              {opt.label}: <strong className="text-foreground/80">{opt.score} pts</strong>
            </span>
          ))}
        </div>
      )
    }
    if (qType === "number" && options) {
      return (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {(options as Array<{ min?: number | null; max?: number | null; score: number }>).map(
            (t, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded bg-foreground/5 text-foreground/60">
                {t.min ?? "—"} – {t.max ?? "∞"}
                {question.unit ? ` ${question.unit}` : ""} →{" "}
                <strong className="text-foreground/80">{t.score} pts</strong>
              </span>
            )
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className={`glass rounded-xl p-4 md:p-5 transition-opacity ${!question.isActive ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded bg-primary/10 text-primary text-xs font-bold">
              {question.displayNumber}
            </span>
            <span className="text-xs text-foreground/40 font-medium uppercase tracking-wide">
              {question.section}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>
              {badge.label}
            </span>
            <span className="text-xs text-foreground/50">
              Max: <strong>{question.maxScore}</strong> pts
            </span>
            {!question.isActive && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">
                Inactive
              </span>
            )}
          </div>

          <p className="text-sm font-medium leading-snug">{question.text}</p>
          {question.helpText && (
            <p className="text-xs text-foreground/40 mt-0.5">{question.helpText}</p>
          )}
          {renderPreview()}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            disabled={isPending}
            className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-colors disabled:opacity-40"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            disabled={isPending}
            className="p-2 rounded-lg text-red-400/60 hover:text-red-500 hover:bg-red-500/5 transition-colors disabled:opacity-40"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Main QuestionnaireManager
// ============================================================================

export function QuestionnaireManager({ initialQuestions }: { initialQuestions: Question[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showInactive, setShowInactive] = useState(false)

  const activeQuestions = initialQuestions.filter((q) => q.isActive)
  const totalWeightage = activeQuestions.reduce((s, q) => s + q.maxScore, 0)

  const sections = new Map<string, Question[]>()
  for (const q of initialQuestions) {
    if (!showInactive && !q.isActive) continue
    const list = sections.get(q.section) || []
    list.push(q)
    sections.set(q.section, list)
  }

  const handleCreate = (form: QuestionFormData) => {
    startTransition(async () => {
      const result = await createQuestion(formDataToPayload(form))
      if (result.success) {
        toast.success("Question created")
        setShowAddForm(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to create question")
      }
    })
  }

  const handleUpdate = (questionId: string, form: QuestionFormData) => {
    startTransition(async () => {
      const result = await updateQuestion(questionId, formDataToPayload(form))
      if (result.success) {
        toast.success("Question updated")
        setEditingId(null)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to update question")
      }
    })
  }

  const handleDelete = (questionId: string) => {
    if (
      !confirm(
        "Delete this question? It will be hidden from future assessments (existing answers are preserved)."
      )
    )
      return

    startTransition(async () => {
      const result = await deleteQuestion(questionId)
      if (result.success) {
        toast.success("Question deleted")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to delete question")
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <p className="text-sm text-foreground/60">
            <strong className="text-foreground">{activeQuestions.length}</strong> active questions
            &middot; Total:{" "}
            <strong className="text-foreground">{totalWeightage}</strong> pts
          </p>
          <button
            onClick={() => setShowInactive((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-foreground/40 hover:text-foreground/70 transition-colors"
          >
            {showInactive ? (
              <ToggleRight className="w-4 h-4 text-primary" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
            {showInactive ? "Showing inactive" : "Show inactive"}
          </button>
        </div>

        <button
          onClick={() => {
            setShowAddForm(true)
            setEditingId(null)
          }}
          disabled={showAddForm}
          className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <QuestionForm
          initialData={EMPTY_FORM}
          onSave={handleCreate}
          onCancel={() => setShowAddForm(false)}
          isPending={isPending}
        />
      )}

      {/* Questions by section */}
      {Array.from(sections.entries()).map(([section, qs]) => (
        <div key={section}>
          <h3 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-3 px-1">
            {section}
          </h3>
          <div className="space-y-3">
            {qs.map((q) =>
              editingId === q.id ? (
                <QuestionForm
                  key={q.id}
                  initialData={questionToFormData(q)}
                  onSave={(form) => handleUpdate(q.id, form)}
                  onCancel={() => setEditingId(null)}
                  isPending={isPending}
                />
              ) : (
                <QuestionCard
                  key={q.id}
                  question={q}
                  onEdit={() => {
                    setEditingId(q.id)
                    setShowAddForm(false)
                  }}
                  onDelete={() => handleDelete(q.id)}
                  isPending={isPending}
                />
              )
            )}
          </div>
        </div>
      ))}

      {sections.size === 0 && !showAddForm && (
        <div className="glass rounded-xl p-10 text-center text-foreground/40 text-sm">
          No questions yet. Click <strong className="text-foreground/60">Add Question</strong> to get started.
        </div>
      )}
    </div>
  )
}
