"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import type { Assessment } from "@prisma/client"
import { approveAssessment, rejectAssessment } from "@/actions/assessment"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ReviewApproveDialog } from "./review-approve-dialog"
import { ReviewRejectDialog } from "./review-reject-dialog"
import { getRatingLabel, getRatingColor } from "@/lib/dynamic-scoring"

type ReviewHistoryEntry = {
  reviewedAt: string
  action: "APPROVED" | "REJECTED"
  comments: string
  reviewerId: string
  reviewerName: string
}

type SnapshotQuestion = {
  id: string
  text: string
  section: string
  displayNumber: string
  inputType: string
  options?: { label: string; score?: number }[] | { min?: number; max?: number; score: number }[]
  maxScore: number
  unit?: string | null
}

type DynamicAnswer = {
  id: string
  questionId: string
  answerValue: string
  score: number
}

type Props = {
  assessment: Assessment & {
    assessor: { id: string; name: string; email: string }
    answers: DynamicAnswer[]
  }
  leadId: string
}

export function ReviewForm({ assessment, leadId }: Props) {
  const router = useRouter()
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [comments, setComments] = useState("")
  const [isPending, startTransition] = useTransition()

  const reviewHistory = assessment.reviewHistory as ReviewHistoryEntry[]
  const questions = assessment.questionsSnapshot as SnapshotQuestion[]
  const answerMap = new Map(assessment.answers.map(a => [a.questionId, a]))

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveAssessment(assessment.id, { comments })

      if (result.success) {
        toast.success("Assessment approved")
        router.push(`/dashboard/leads/${leadId}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleReject = () => {
    if (comments.trim().length < 10) {
      toast.error("Please provide detailed feedback (min 10 characters)")
      return
    }

    startTransition(async () => {
      const result = await rejectAssessment(assessment.id, { comments })

      if (result.success) {
        toast.success("Assessment rejected and sent back to assessor")
        router.push(`/dashboard/leads/${leadId}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  const ratingColorClass = (rating: string | null) => {
    const color = rating ? getRatingColor(rating as 'IPO_READY' | 'NEEDS_IMPROVEMENT' | 'NOT_READY') : 'red'
    if (color === 'green') return "bg-green-500/10 text-green-500"
    if (color === 'yellow') return "bg-yellow-500/10 text-yellow-500"
    return "bg-red-500/10 text-red-500"
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Score Summary */}
      <div className="glass rounded-xl p-4 md:p-6">
        <h3 className="text-sm md:text-base font-semibold mb-4">Assessment Score</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-foreground/60 mb-1">Total Score</p>
            <p className="text-2xl font-bold">
              {assessment.totalScore?.toFixed(1) ?? '-'} / {assessment.maxScore ?? '-'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-foreground/60 mb-1">Percentage</p>
            <p className="text-2xl font-bold">{assessment.percentage?.toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-foreground/60 mb-1">Rating</p>
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold ${ratingColorClass(assessment.rating)}`}>
              {assessment.rating ? getRatingLabel(assessment.rating as 'IPO_READY' | 'NEEDS_IMPROVEMENT' | 'NOT_READY') : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="glass rounded-xl p-4 md:p-6">
        <h3 className="text-sm md:text-base font-semibold mb-4">Score Breakdown</h3>
        <div className="grid gap-2">
          {questions.map(q => {
            const answer = answerMap.get(q.id)
            return (
              <div key={q.id} className="flex items-center justify-between p-2 rounded-lg bg-foreground/5">
                <span className="text-sm text-foreground/70">
                  {q.displayNumber}. {q.text.length > 60 ? q.text.substring(0, 60) + '...' : q.text}
                </span>
                <span className="text-sm font-medium">
                  {answer ? answer.score.toFixed(1) : '0.0'} / {q.maxScore}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Assessor Info */}
      <div className="glass rounded-xl p-4 md:p-6">
        <h3 className="text-sm md:text-base font-semibold mb-3">Assessed By</h3>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {assessment.assessor.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium">{assessment.assessor.name}</p>
            <p className="text-xs text-foreground/60">{assessment.assessor.email}</p>
          </div>
        </div>
        {assessment.submittedAt && (
          <p className="mt-3 text-xs text-foreground/60">
            Submitted: {new Date(assessment.submittedAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* Verification Status */}
      <div className="glass rounded-xl p-4 md:p-6">
        <h3 className="text-sm md:text-base font-semibold mb-4">Verification Status</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {assessment.companyVerified ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-foreground/30" />
            )}
            <span className="text-sm">Company Data Verified</span>
            {assessment.companyVerifiedAt && (
              <span className="text-xs text-foreground/50 ml-auto">
                {new Date(assessment.companyVerifiedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {assessment.financialVerified ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-foreground/30" />
            )}
            <span className="text-sm">Financial Data Verified</span>
            {assessment.financialVerifiedAt && (
              <span className="text-xs text-foreground/50 ml-auto">
                {new Date(assessment.financialVerifiedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Questionnaire Answers */}
      <div className="glass rounded-xl p-4 md:p-6">
        <h3 className="text-sm md:text-base font-semibold mb-4">Questionnaire Answers</h3>

        {Array.from(
          questions.reduce((sections, q) => {
            sections.set(q.section, [...(sections.get(q.section) ?? []), q])
            return sections
          }, new Map<string, SnapshotQuestion[]>()).entries()
        ).map(([section, sectionQuestions]) => (
          <div key={section} className="mb-4 last:mb-0">
            <p className="text-xs text-foreground/50 uppercase tracking-wide mb-2">{section}</p>
            <div className="grid gap-2">
              {sectionQuestions.map(q => {
                const answer = answerMap.get(q.id)
                const answerValue = answer?.answerValue ?? '-'
                const isBoolean = q.inputType === 'boolean'
                const isYes = answerValue === 'Yes'

                return (
                  <div key={q.id} className="flex items-center justify-between p-2 rounded bg-foreground/5">
                    <span className="text-sm">
                      {q.displayNumber}. {q.text}
                    </span>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {isBoolean ? (
                        <span className={`text-sm font-medium ${isYes ? 'text-green-500' : answerValue === '-' ? 'text-foreground/40' : 'text-red-500'}`}>
                          {answerValue}
                        </span>
                      ) : (
                        <span className="text-sm font-medium">
                          {answerValue !== '-' ? `${answerValue}${q.unit ? ` ${q.unit}` : ''}` : '-'}
                        </span>
                      )}
                      <span className="text-xs text-foreground/50">
                        ({answer ? answer.score.toFixed(1) : '0'}/{q.maxScore})
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Review History */}
      {reviewHistory.length > 0 && (
        <div className="glass rounded-xl p-4 md:p-6">
          <h3 className="text-sm md:text-base font-semibold mb-3">Review History</h3>
          <div className="space-y-3">
            {reviewHistory.map((entry, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-foreground/5">
                <div className="flex-shrink-0 mt-1">
                  {entry.action === "APPROVED" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold ${entry.action === "APPROVED" ? "text-green-500" : "text-red-500"}`}>
                      {entry.action}
                    </span>
                    <span className="text-xs text-foreground/60">•</span>
                    <span className="text-xs text-foreground/60">{entry.reviewerName}</span>
                  </div>
                  {entry.comments && (
                    <p className="text-xs text-foreground/70">{entry.comments}</p>
                  )}
                  <p className="text-xs text-foreground/60 mt-1">
                    {new Date(entry.reviewedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons (Fixed on Mobile above tab bar) */}
      <div className="fixed md:static bottom-16 md:bottom-0 left-0 right-0 z-50 p-4 md:p-0 glass-strong md:glass md:rounded-xl border-t md:border-none border-foreground/10">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowRejectDialog(true)}
            disabled={isPending}
            className="rounded-lg border-2 border-red-500/30 bg-red-500/10 text-red-500 px-4 h-12 md:h-10 text-base md:text-sm font-medium hover:bg-red-500/20 active:scale-95 transition-transform disabled:opacity-50"
          >
            Reject
          </button>
          <button
            onClick={() => setShowApproveDialog(true)}
            disabled={isPending}
            className="rounded-lg bg-green-500 px-4 h-12 md:h-10 text-base md:text-sm font-medium text-white hover:bg-green-500/90 active:scale-95 transition-transform disabled:opacity-50"
          >
            Approve
          </button>
        </div>
      </div>

      {/* Approve Dialog */}
      {showApproveDialog && (
        <ReviewApproveDialog
          onConfirm={handleApprove}
          onCancel={() => {
            setShowApproveDialog(false)
            setComments("")
          }}
          comments={comments}
          setComments={setComments}
          confirmText=""
          setConfirmText={() => { }}
          requireConfirmation={false}
          isPending={isPending}
        />
      )}

      {/* Reject Dialog */}
      {showRejectDialog && (
        <ReviewRejectDialog
          onConfirm={handleReject}
          onCancel={() => {
            setShowRejectDialog(false)
            setComments("")
          }}
          comments={comments}
          setComments={setComments}
          isPending={isPending}
        />
      )}
    </div>
  )
}
