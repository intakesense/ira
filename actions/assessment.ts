"use server"

/**
 * IRA Platform - Assessment Server Actions
 * 
 * Core assessment operations for the new stepper-based flow.
 * Handles: read operations, review workflow (approve/reject)
 */

import { revalidateTag } from "next/cache"
import prisma from "@/lib/prisma"
import {
  verifyAuth,
  verifyRole,
  createAuditLog,
  handlePrismaError,
} from "@/lib/dal"
import {
  ApproveAssessmentSchema,
  RejectAssessmentSchema,
  type ActionResponse,
  type ApproveAssessmentInput,
  type RejectAssessmentInput,
} from "@/lib/types"
import { Errors, AppError, ErrorCode } from "@/lib/errors"
import { ZodError } from "zod"
import type { Assessment } from "@prisma/client"
import {
  sendAssessmentRejectedEmail,
  getAppBaseUrl
} from "@/lib/email"

// ============================================================================
// Error Handler
// ============================================================================

function handleActionError(error: unknown): ActionResponse<never> {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      context: error.context,
    }
  }

  if (error instanceof ZodError) {
    return {
      success: false,
      error: error.issues[0]?.message || "Invalid input",
      code: ErrorCode.INVALID_INPUT,
    }
  }

  console.error("Unexpected error in assessment action:", error)
  return {
    success: false,
    error: "An unexpected error occurred",
    code: ErrorCode.UNKNOWN_ERROR,
  }
}

// ============================================================================
// Types
// ============================================================================

export type AssessmentWithRelations = Assessment & {
  lead: {
    id: string
    leadId: string
    companyName: string
    cin: string
    status: string
  }
  assessor: {
    id: string
    name: string
    email: string
  }
  answers: {
    id: string
    questionId: string
    answerValue: string
    score: number
  }[]
}

type ReviewHistoryEntry = {
  reviewedAt: string
  action: "APPROVED" | "REJECTED"
  comments: string
  reviewerId: string
  reviewerName: string
}

// ============================================================================
// Read Operations
// ============================================================================

/**
 * Get assessment by lead ID
 */
export async function getAssessment(
  leadId: string
): Promise<ActionResponse<AssessmentWithRelations | null>> {
  try {
    const session = await verifyAuth()

    const assessment = await prisma.assessment.findUnique({
      where: { leadId },
      include: {
        lead: {
          select: {
            id: true,
            leadId: true,
            companyName: true,
            cin: true,
            status: true,
            assignedAssessorId: true,
          },
        },
        assessor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        answers: {
          select: {
            id: true,
            questionId: true,
            answerValue: true,
            score: true,
          },
        },
      },
    })

    if (!assessment) {
      return { success: true, data: null }
    }

    // Access control: Assessors can only view their own assessments
    if (
      session.user.role === "ASSESSOR" &&
      assessment.assessorId !== session.user.id
    ) {
      throw Errors.insufficientPermissions()
    }

    return { success: true, data: assessment as AssessmentWithRelations }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

/**
 * Get assessment by ID
 */
export async function getAssessmentById(
  assessmentId: string
): Promise<ActionResponse<AssessmentWithRelations>> {
  try {
    const session = await verifyAuth()

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        lead: {
          select: {
            id: true,
            leadId: true,
            companyName: true,
            cin: true,
            status: true,
            assignedAssessorId: true,
          },
        },
        assessor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        answers: {
          select: {
            id: true,
            questionId: true,
            answerValue: true,
            score: true,
          },
        },
      },
    })

    if (!assessment) {
      throw Errors.assessmentNotFound(assessmentId)
    }

    // Access control
    if (
      session.user.role === "ASSESSOR" &&
      assessment.assessorId !== session.user.id
    ) {
      throw Errors.insufficientPermissions()
    }

    return { success: true, data: assessment as AssessmentWithRelations }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

/**
 * Get all assessments pending review (REVIEWER only)
 */
export async function getPendingReviews(): Promise<
  ActionResponse<AssessmentWithRelations[]>
> {
  try {
    await verifyRole("REVIEWER")

    const assessments = await prisma.assessment.findMany({
      where: { status: "SUBMITTED" },
      include: {
        lead: {
          select: {
            id: true,
            leadId: true,
            companyName: true,
            cin: true,
            status: true,
          },
        },
        assessor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    })

    return { success: true, data: assessments as AssessmentWithRelations[] }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

// ============================================================================
// Review Operations (REVIEWER only)
// ============================================================================

/**
 * Approve assessment (REVIEWER only)
 */
export async function approveAssessment(
  assessmentId: string,
  input: unknown
): Promise<ActionResponse<Assessment>> {
  try {
    const session = await verifyRole("REVIEWER")
    const validatedData = ApproveAssessmentSchema.parse(input) as ApproveAssessmentInput

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        lead: {
          select: {
            id: true,
            leadId: true,
            companyName: true,
          },
        },
        assessor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!assessment) {
      throw Errors.assessmentNotFound(assessmentId)
    }

    if (assessment.status !== "SUBMITTED") {
      throw Errors.invalidStatusTransition(assessment.status, "APPROVED")
    }

    // Build review history entry
    const newHistoryEntry: ReviewHistoryEntry = {
      reviewedAt: new Date().toISOString(),
      action: "APPROVED",
      comments: validatedData.comments || "",
      reviewerId: session.user.id,
      reviewerName: session.user.name,
    }

    const existingHistory = (assessment.reviewHistory || []) as ReviewHistoryEntry[]
    const updatedHistory = [...existingHistory, newHistoryEntry]

    // Update assessment and lead status
    const [updatedAssessment] = await prisma.$transaction([
      prisma.assessment.update({
        where: { id: assessmentId },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewHistory: updatedHistory,
        },
      }),
      prisma.lead.update({
        where: { id: assessment.lead.id },
        data: {
          status: "COMPLETED",
          updatedAt: new Date(),
        },
      }),
    ])

    await createAuditLog(
      session.user.id,
      "ASSESSMENT_APPROVED",
      assessment.lead.id,
      {
        assessmentId,
        comments: validatedData.comments,
      }
    )

    // Note: No approval email function exists yet - skip for now

    revalidateTag(`lead-${assessment.leadId}`, "hours")
    revalidateTag("reviews", "hours")
    revalidateTag("leads", "hours")

    return {
      success: true,
      data: updatedAssessment,
      message: "Assessment approved successfully",
    }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

/**
 * Reject assessment (REVIEWER only)
 */
export async function rejectAssessment(
  assessmentId: string,
  input: unknown
): Promise<ActionResponse<Assessment>> {
  try {
    const session = await verifyRole("REVIEWER")
    const validatedData = RejectAssessmentSchema.parse(input) as RejectAssessmentInput

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        lead: {
          select: {
            id: true,
            leadId: true,
            companyName: true,
          },
        },
        assessor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!assessment) {
      throw Errors.assessmentNotFound(assessmentId)
    }

    if (assessment.status !== "SUBMITTED") {
      throw Errors.invalidStatusTransition(assessment.status, "REJECTED")
    }

    // Build review history entry
    const newHistoryEntry: ReviewHistoryEntry = {
      reviewedAt: new Date().toISOString(),
      action: "REJECTED",
      comments: validatedData.comments,
      reviewerId: session.user.id,
      reviewerName: session.user.name,
    }

    const existingHistory = (assessment.reviewHistory || []) as ReviewHistoryEntry[]
    const updatedHistory = [...existingHistory, newHistoryEntry]

    // Update assessment - goes back to DRAFT for resubmission
    const updatedAssessment = await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewHistory: updatedHistory,
      },
    })

    await createAuditLog(
      session.user.id,
      "ASSESSMENT_REJECTED",
      assessment.lead.id,
      {
        assessmentId,
        comments: validatedData.comments,
      }
    )

    // Send notification email
    try {
      const baseUrl = getAppBaseUrl()
      await sendAssessmentRejectedEmail({
        assessorEmail: assessment.assessor.email,
        assessorName: assessment.assessor.name,
        companyName: assessment.lead.companyName,
        leadId: assessment.lead.leadId,
        reviewerName: session.user.name,
        actionUrl: `${baseUrl}/dashboard/leads/${assessment.lead.id}/assessment`,
        comments: validatedData.comments,
      })
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError)
    }

    revalidateTag(`lead-${assessment.leadId}`, "hours")
    revalidateTag("reviews", "hours")

    return {
      success: true,
      data: updatedAssessment,
      message: "Assessment rejected - sent back for revision",
    }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}
