import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getActiveQuestions } from "@/actions/questionnaire"
import { Calculator, CheckCircle2, HelpCircle, Target } from "lucide-react"

export const metadata = {
    title: "Scoring Guide | IRA Platform",
    description: "Understand how IPO readiness assessments are scored",
}

export default async function ScoringGuidePage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect("/login")
    }

    if (session.user.role !== "REVIEWER") {
        redirect("/dashboard")
    }

    const result = await getActiveQuestions()
    const questions = result.success ? result.data : []

    // Group by section
    const sections = new Map<string, typeof questions>()
    for (const q of questions) {
        const list = sections.get(q.section) || []
        list.push(q)
        sections.set(q.section, list)
    }

    const totalMaxScore = questions.reduce((sum, q) => sum + q.maxScore, 0)

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="glass rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Calculator className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold">Scoring Guide</h1>
                        <p className="text-sm text-foreground/60">
                            Understand how IPO readiness assessments are scored
                        </p>
                    </div>
                </div>
            </div>

            {/* Rating Tiers */}
            <div className="glass rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Rating Tiers
                </h2>

                <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="text-sm text-green-600 font-medium">IPO Ready</p>
                        <p className="text-2xl font-bold text-green-500">≥65%</p>
                        <p className="text-xs text-foreground/60 mt-1">Strong fundamentals, ready for listing</p>
                    </div>
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-sm text-yellow-600 font-medium">Needs Improvement</p>
                        <p className="text-2xl font-bold text-yellow-500">45–65%</p>
                        <p className="text-xs text-foreground/60 mt-1">Has potential, needs work in some areas</p>
                    </div>
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-sm text-red-600 font-medium">Not Ready</p>
                        <p className="text-2xl font-bold text-red-500">&lt;45%</p>
                        <p className="text-xs text-foreground/60 mt-1">Significant gaps to address</p>
                    </div>
                </div>

                {totalMaxScore > 0 && (
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                        <p className="text-sm">
                            <strong>Maximum Score:</strong> {totalMaxScore} points across {questions.length} active question{questions.length !== 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-foreground/60 mt-1">
                            Final percentage = (Total Score ÷ {totalMaxScore}) × 100
                        </p>
                    </div>
                )}
            </div>

            {/* How Scoring Works */}
            <div className="glass rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    How Scoring Works
                </h2>
                <div className="space-y-4 text-sm">
                    {[
                        { n: 1, title: "Assessor Gathers Data", desc: "Financial data is fetched from Probe42 and verified by the assessor" },
                        { n: 2, title: "Questions Answered", desc: "Yes/No and numeric questions are answered by the assessor" },
                        { n: 3, title: "Automatic Score Calculation", desc: "Each answer is scored based on the thresholds defined per question" },
                        { n: 4, title: "Rating Determined", desc: "Total percentage determines IPO Ready / Needs Improvement / Not Ready" },
                    ].map(({ n, title, desc }) => (
                        <div key={n} className="flex gap-3">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{n}</div>
                            <div>
                                <p className="font-medium">{title}</p>
                                <p className="text-foreground/60">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Active Questions by Section */}
            {questions.length === 0 ? (
                <div className="glass rounded-xl p-6 text-center text-foreground/50 text-sm">
                    No active questions configured yet. Add questions via the Questionnaire Manager.
                </div>
            ) : (
                Array.from(sections.entries()).map(([section, sectionQuestions]) => (
                    <div key={section} className="glass rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-semibold">{section}</h2>
                            <span className="text-xs text-foreground/50">
                                {sectionQuestions.reduce((s, q) => s + q.maxScore, 0)} pts total
                            </span>
                        </div>
                        <div className="space-y-6">
                            {sectionQuestions.map((q, idx) => {
                                const options = q.options as Array<{ label?: string; score?: number; min?: number; max?: number }> | null
                                const isLast = idx === sectionQuestions.length - 1
                                return (
                                    <div key={q.id} className={!isLast ? "border-b border-foreground/10 pb-6" : ""}>
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <p className="font-medium text-sm">
                                                <span className="text-primary mr-2">Q{q.displayNumber}.</span>
                                                {q.text}
                                            </p>
                                            <span className="text-xs text-primary shrink-0">Max: {q.maxScore} pts</span>
                                        </div>
                                        {q.helpText && (
                                            <p className="text-xs text-foreground/50 mb-3">{q.helpText}</p>
                                        )}
                                        {options && options.length > 0 && (
                                            q.inputType === "boolean" ? (
                                                <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                                                    {options.map((opt, i) => (
                                                        <div
                                                            key={i}
                                                            className={`p-2 rounded text-center ${i === 0 ? "bg-green-500/10" : "bg-red-500/10"}`}
                                                        >
                                                            <p className="font-medium">{opt.label}</p>
                                                            <p className={`font-bold ${i === 0 ? "text-green-500" : "text-red-500"}`}>
                                                                {opt.score ?? 0} pts
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="overflow-x-auto mt-3">
                                                    <table className="w-full text-xs">
                                                        <thead>
                                                            <tr className="border-b border-foreground/10">
                                                                <th className="text-left py-2 text-foreground/60 font-medium">Range{q.unit ? ` (${q.unit})` : ""}</th>
                                                                <th className="text-right py-2 text-foreground/60 font-medium">Score</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {options.map((opt, i) => (
                                                                <tr key={i} className={i < options.length - 1 ? "border-b border-foreground/5" : ""}>
                                                                    <td className="py-2">
                                                                        {opt.min !== undefined && opt.max !== undefined
                                                                            ? `${opt.min} – ${opt.max}`
                                                                            : opt.label ?? "-"}
                                                                    </td>
                                                                    <td className="py-2 text-right font-medium text-green-500">{opt.score ?? 0}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))
            )}

            {/* Rating Summary */}
            {questions.length > 0 && (
                <div className="glass rounded-xl p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Score Summary
                    </h2>
                    <div className="p-4 rounded-lg bg-foreground/5 text-sm space-y-2">
                        <p><strong>Total Active Questions:</strong> {questions.length}</p>
                        <p><strong>Maximum Possible Score:</strong> {totalMaxScore} points</p>
                        <div className="border-t border-foreground/10 pt-2 mt-2 space-y-1 text-foreground/70">
                            <p>≥ 65% of {totalMaxScore} = <strong>{(totalMaxScore * 0.65).toFixed(1)} pts</strong> → IPO Ready</p>
                            <p>45–65% of {totalMaxScore} = <strong>{(totalMaxScore * 0.45).toFixed(1)}–{(totalMaxScore * 0.65).toFixed(1)} pts</strong> → Needs Improvement</p>
                            <p>&lt; 45% of {totalMaxScore} = &lt;<strong>{(totalMaxScore * 0.45).toFixed(1)} pts</strong> → Not Ready</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
