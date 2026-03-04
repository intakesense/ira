// IRA Platform - Shared TypeScript Types

import { z } from "zod"
import { type ErrorCode } from "./errors"

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const CreateLeadSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(200),
  contactPerson: z.string().min(2, "Contact person name must be at least 2 characters").max(100),
  phone: z.string().refine((val) => /^\+91-[0-9]{10}$/.test(val), {
    message: "Phone must be in format: +91-XXXXXXXXXX"
  }).nullable().optional(),
  email: z.string().email("Invalid email address"),
  cin: z.string().refine((val) => /^[UL][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(val), {
    message: "Invalid CIN format (e.g., U12345MH2020PTC123456)"
  }),
  address: z.string().min(10, "Address must be at least 10 characters").max(500),
  // Optional Probe42 data from lead creation flow
  probe42Data: z.any().optional(),
})

export const UpdateLeadSchema = z.object({
  companyName: z.string().min(2).max(200).optional(),
  contactPerson: z.string().min(2).max(100).optional(),
  phone: z.string().refine((val) => /^\+91-[0-9]{10}$/.test(val), {
    message: "Phone must be in format: +91-XXXXXXXXXX"
  }).nullable().optional(),
  email: z.string().email().optional(),
  address: z.string().min(10).max(500).optional(),
})

export const AssignAssessorSchema = z.object({
  assessorId: z.string().min(1, "Assessor ID is required"),
})

export const UpdateLeadStatusSchema = z.object({
  status: z.enum(["NEW", "ASSIGNED", "IN_REVIEW", "PAYMENT_PENDING", "COMPLETED"]),
})

// ============================================
// QUESTION SCHEMAS
// ============================================

// Question snapshot schema for validation
export const QuestionItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  helpText: z.string().nullable(),
  order: z.number(),
})

export const QuestionSnapshotSchema = z.object({
  eligibility: z.array(QuestionItemSchema),
  company: z.array(QuestionItemSchema),
  financial: z.array(QuestionItemSchema),
  sector: z.array(QuestionItemSchema),
})

export const CreateQuestionSchema = z.object({
  type: z.enum(["ELIGIBILITY", "COMPANY", "FINANCIAL", "SECTOR"]),
  text: z.string().min(10, "Question text must be at least 10 characters").max(1000),
  helpText: z.string().max(1000).optional(),
  order: z.number().int().positive().optional(),
})

export const UpdateQuestionSchema = z.object({
  text: z.string().min(10).max(1000).optional(),
  helpText: z.string().max(1000).optional().nullable(),
  order: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
})

export const ReorderQuestionsSchema = z.object({
  questionIds: z.array(z.string()).min(1, "At least one question ID required"),
})

// ============================================
// ASSESSMENT SCHEMAS
// ============================================

// Eligibility answer schema
export const EligibilityAnswerSchema = z.object({
  checked: z.boolean(),
  remark: z.string().max(500).optional(),
})

export const UpdateEligibilityAnswersSchema = z.record(
  z.string(),
  EligibilityAnswerSchema
)

// Main assessment answer schema
export const AssessmentAnswerSchema = z.object({
  score: z.number().int().min(-1).max(2),
  remark: z.string().max(1000).optional(),
  evidenceLink: z.string().url().optional().or(z.literal("")),
})

export const UpdateAssessmentAnswersSchema = z.record(
  z.string(),
  AssessmentAnswerSchema
)

// Unified update schema for auto-save (prevents race conditions)
export const UpdateAllAssessmentAnswersSchema = z.object({
  companyAnswers: z.record(z.string(), AssessmentAnswerSchema).optional(),
  financialAnswers: z.record(z.string(), AssessmentAnswerSchema).optional(),
  sectorAnswers: z.record(z.string(), AssessmentAnswerSchema).optional(),
})

// Review schemas
export const ApproveAssessmentSchema = z.object({
  comments: z.string().max(2000).optional(),
  confirmOldQuestions: z.boolean().optional(),
})

export const RejectAssessmentSchema = z.object({
  comments: z.string().min(10, "Please provide detailed feedback").max(2000),
})

// Review history entry schema
export const ReviewHistoryEntrySchema = z.object({
  reviewedAt: z.string(),
  action: z.enum(["APPROVED", "REJECTED"]),
  comments: z.string(),
  reviewerId: z.string(),
  reviewerName: z.string(),
})

export const ReviewHistorySchema = z.array(ReviewHistoryEntrySchema)

// ============================================
// TYPE EXPORTS (from Zod schemas)
// ============================================

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>
export type UpdateLeadInput = z.infer<typeof UpdateLeadSchema>
export type AssignAssessorInput = z.infer<typeof AssignAssessorSchema>
export type UpdateLeadStatusInput = z.infer<typeof UpdateLeadStatusSchema>

export type QuestionItem = z.infer<typeof QuestionItemSchema>
export type QuestionSnapshot = z.infer<typeof QuestionSnapshotSchema>
export type CreateQuestionInput = z.infer<typeof CreateQuestionSchema>
export type UpdateQuestionInput = z.infer<typeof UpdateQuestionSchema>
export type ReorderQuestionsInput = z.infer<typeof ReorderQuestionsSchema>

export type EligibilityAnswer = z.infer<typeof EligibilityAnswerSchema>
export type UpdateEligibilityAnswersInput = z.infer<typeof UpdateEligibilityAnswersSchema>
export type AssessmentAnswer = z.infer<typeof AssessmentAnswerSchema>
export type UpdateAssessmentAnswersInput = z.infer<typeof UpdateAssessmentAnswersSchema>
export type UpdateAllAssessmentAnswersInput = z.infer<typeof UpdateAllAssessmentAnswersSchema>

export type ApproveAssessmentInput = z.infer<typeof ApproveAssessmentSchema>
export type RejectAssessmentInput = z.infer<typeof RejectAssessmentSchema>
export type ReviewHistoryEntry = z.infer<typeof ReviewHistoryEntrySchema>
export type ReviewHistory = z.infer<typeof ReviewHistorySchema>

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Safely parse question snapshot with fallback to empty arrays
 * Prevents runtime crashes from corrupted JSON data
 */
export function parseQuestionSnapshot(snapshot: unknown): QuestionSnapshot {
  const result = QuestionSnapshotSchema.safeParse(snapshot)

  if (result.success) {
    return result.data
  }

  // Log error for debugging but don't crash
  console.error("Invalid question snapshot:", result.error)

  // Return safe default
  return {
    eligibility: [],
    company: [],
    financial: [],
    sector: [],
  }
}

// ============================================
// SERVER ACTION RETURN TYPES
// ============================================

export type ActionResponse<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; code?: ErrorCode; context?: Record<string, unknown> }

// Lead with relations
export type LeadWithRelations = {
  id: string
  leadId: string
  companyName: string
  contactPerson: string
  phone: string | null
  email: string
  cin: string
  address: string
  status: "NEW" | "ASSIGNED" | "IN_REVIEW" | "PAYMENT_PENDING" | "COMPLETED"
  assignedAssessor: {
    id: string
    name: string
    email: string
  } | null
  createdBy: {
    id: string
    name: string
    email: string
  }
  assessment: {
    id: string
    status: string
    currentStep: number
    companyVerified: boolean
    financialVerified: boolean
    percentage: number | null
    rating: string | null
    totalScore: number | null
    maxScore: number | null
  } | null
  _count: {
    documents: number
  }
  // Probe42 fields
  probe42Fetched: boolean
  probe42FetchedAt: Date | null
  probe42LegalName: string | null
  probe42Status: string | null
  probe42Classification: string | null
  probe42PaidUpCapital: bigint | null
  probe42AuthCapital: bigint | null
  probe42Pan: string | null
  probe42Website: string | null
  probe42IncorpDate: Date | null
  probe42ComplianceStatus: string | null
  probe42DirectorCount: number | null
  probe42GstCount: number | null
  probe42Data: unknown
  probe42ReportDownloaded: boolean
  probe42ReportDownloadedAt: Date | null
  probe42ReportFailedAt: Date | null
  createdAt: Date
  updatedAt: Date
  createdById: string
  paymentLink: string | null        
  paymentLinkSentAt: Date | null 
  portalAccessSentAt: Date | null

}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate a display Lead ID in format: LD-YYYY-XXX
 * @param count - The current count of leads (used to generate sequential ID)
 * @returns A unique lead ID string
 */
export function generateLeadId(count: number): string {
  const year = new Date().getFullYear()
  const sequence = String(count + 1).padStart(3, "0")
  return `LD-${year}-${sequence}`
}

/**
 * Get display status with color
 */
export function getStatusDisplay(status: string): { label: string; color: string } {
  const statusMap: Record<string, { label: string; color: string }> = {
    NEW: { label: "New", color: "bg-blue-500/10 text-blue-500" },
    ASSIGNED: { label: "Assigned", color: "bg-purple-500/10 text-purple-500" },
    IN_REVIEW: { label: "In Review", color: "bg-yellow-500/10 text-yellow-500" },
    PAYMENT_PENDING: { label: "Payment Pending", color: "bg-orange-500/10 text-orange-500" },
    COMPLETED: { label: "Completed", color: "bg-green-500/10 text-green-500" },
  }
  return statusMap[status] || { label: status, color: "bg-gray-500/10 text-gray-500" }
}

/**
 * Sort leads by status priority (for reviewer dashboard)
 * Priority: NEW > IN_REVIEW > PAYMENT_PENDING > ASSIGNED > COMPLETED
 */
export function sortLeadsByStatusPriority(leads: LeadWithRelations[]): LeadWithRelations[] {
  const priorityMap: Record<string, number> = {
    NEW: 1,
    IN_REVIEW: 2,
    PAYMENT_PENDING: 3,
    ASSIGNED: 4,
    COMPLETED: 5,
  }

  return [...leads].sort((a, b) => {
    const priorityA = priorityMap[a.status] || 999
    const priorityB = priorityMap[b.status] || 999
    if (priorityA !== priorityB) return priorityA - priorityB
    // If same priority, sort by most recent first
    return b.createdAt.getTime() - a.createdAt.getTime()
  })
}