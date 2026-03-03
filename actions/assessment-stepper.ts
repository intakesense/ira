"use server"

/**
 * IRA Platform - Assessment Server Actions
 *
 * Stepper-based assessment flow:
 * Step 1: Company Verification (from Probe42)
 * Step 2: Financial Data Verification (from Probe42)
 * Step 3: Dynamic Questionnaire (from Question table)
 */

import { revalidateTag } from "next/cache"
import prisma from "@/lib/prisma"
import {
    verifyAuth,
    createAuditLog,
    handlePrismaError,
} from "@/lib/dal"
import { type ActionResponse } from "@/lib/types"
import { Errors, AppError, ErrorCode } from "@/lib/errors"
import { ZodError, z } from "zod"
import type { Assessment } from "@prisma/client"
import { sendAssessmentSubmittedEmail, getAppBaseUrl } from "@/lib/email"
import { calculateAnswerScore, calculateDynamicScore, type DynamicScoringResult } from "@/lib/dynamic-scoring"

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

export type AssessmentWithLead = Assessment & {
    lead: {
        id: string
        leadId: string
        companyName: string
        cin: string
        status: string
        probe42Data: unknown
        probe42Fetched: boolean
        address: string
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
    }
    assessor: {
        id: string
        name: string
        email: string
    }
}

// ============================================================================
// Validation Schemas
// ============================================================================

const CompanyVerificationSchema = z.object({
    companyName: z.string().min(1),
    address: z.string().min(1),
    pan: z.string().optional(),
    gstNumbers: z.array(z.string()).optional(),
})

const FinancialVerificationSchema = z.object({
    paidUpCapital: z.number().optional(),
    outstandingShares: z.number().optional(),
    netWorth: z.number().optional(),
    shortTermBorrowings: z.number().optional(),
    longTermBorrowings: z.number().optional(),
    debtEquityRatio: z.number().optional(),
    turnover: z.array(z.number().nullable()).length(3).optional(),
    ebitda: z.array(z.number().nullable()).length(3).optional(),
    eps: z.number().optional(),
})


// ========================================i====================================
// Read Operations
// ============================================================================

/**
 * Get assessment with full details for stepper
 * @param displayLeadId - The lead's display ID (e.g., "LD-2025-001")
 */
export async function getAssessmentForStepper(
    displayLeadId: string
): Promise<ActionResponse<AssessmentWithLead | null>> {
    try {
        const session = await verifyAuth()

        // First, find the lead by its display ID (LD-2025-XXX format)
        const lead = await prisma.lead.findUnique({
            where: { leadId: displayLeadId },
            select: { id: true },
        })

        if (!lead) {
            return { success: true, data: null }
        }

        // Now find assessment by lead's UUID
        const assessment = await prisma.assessment.findUnique({
            where: { leadId: lead.id },
            include: {
                lead: {
                    select: {
                        id: true,
                        leadId: true,
                        companyName: true,
                        address: true,
                        cin: true,
                        status: true,
                        probe42Data: true,
                        probe42Fetched: true,
                        probe42LegalName: true,
                        probe42Status: true,
                        probe42Classification: true,
                        probe42PaidUpCapital: true,
                        probe42AuthCapital: true,
                        probe42Pan: true,
                        probe42Website: true,
                        probe42IncorpDate: true,
                        probe42ComplianceStatus: true,
                        probe42DirectorCount: true,
                        probe42GstCount: true,
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

        return { success: true, data: assessment as AssessmentWithLead }
    } catch (error) {
        return handleActionError(handlePrismaError(error))
    }
}

// ============================================================================
// Step 1: Company Verification
// ============================================================================

/**
 * Verify company data and advance to step 2
 */
export async function verifyCompanyData(
    assessmentId: string,
    input: unknown
): Promise<ActionResponse<Assessment>> {
    try {
        const session = await verifyAuth()
        const validatedData = CompanyVerificationSchema.parse(input)

        const assessment = await prisma.assessment.findUnique({
            where: { id: assessmentId },
            include: { lead: true },
        })

        if (!assessment) {
            throw Errors.assessmentNotFound(assessmentId)
        }

        // Only assigned assessor can update
        if (
            session.user.role === "ASSESSOR" &&
            assessment.assessorId !== session.user.id
        ) {
            throw Errors.insufficientPermissions()
        }

        // Can only update if DRAFT
        if (assessment.status !== "DRAFT") {
            throw new AppError(
                ErrorCode.INVALID_INPUT,
                "Cannot modify submitted assessment",
                400
            )
        }

        // Update assessment
        const updatedAssessment = await prisma.assessment.update({
            where: { id: assessmentId },
            data: {
                companyVerified: true,
                companyVerifiedAt: new Date(),
                companyDataSnapshot: validatedData,
                currentStep: 2,
                updatedAt: new Date(),
            },
        })

        await createAuditLog(
            session.user.id,
            "ASSESSMENT_UPDATED",
            assessment.leadId,
            { action: "company_verified", assessmentId }
        )

        revalidateTag(`lead-${assessment.leadId}`, "hours")

        return {
            success: true,
            data: updatedAssessment,
            message: "Company data verified"
        }
    } catch (error) {
        return handleActionError(handlePrismaError(error))
    }
}

// ============================================================================
// Step 2: Financial Verification
// ============================================================================

/**
 * Verify financial data and advance to step 3
 */
export async function verifyFinancialData(
    assessmentId: string,
    input: unknown
): Promise<ActionResponse<Assessment>> {
    try {
        const session = await verifyAuth()
        const validatedData = FinancialVerificationSchema.parse(input)

        const assessment = await prisma.assessment.findUnique({
            where: { id: assessmentId },
            include: { lead: true },
        })

        if (!assessment) {
            throw Errors.assessmentNotFound(assessmentId)
        }

        // Only assigned assessor can update
        if (
            session.user.role === "ASSESSOR" &&
            assessment.assessorId !== session.user.id
        ) {
            throw Errors.insufficientPermissions()
        }

        // Must have completed step 1
        if (!assessment.companyVerified) {
            throw new AppError(
                ErrorCode.INVALID_INPUT,
                "Please complete company verification first",
                400
            )
        }

        // Can only update if DRAFT
        if (assessment.status !== "DRAFT") {
            throw new AppError(
                ErrorCode.INVALID_INPUT,
                "Cannot modify submitted assessment",
                400
            )
        }

        // Update assessment
        const updatedAssessment = await prisma.assessment.update({
            where: { id: assessmentId },
            data: {
                financialVerified: true,
                financialVerifiedAt: new Date(),
                financialDataSnapshot: validatedData,
                currentStep: 3,
                updatedAt: new Date(),
            },
        })

        await createAuditLog(
            session.user.id,
            "ASSESSMENT_UPDATED",
            assessment.leadId,
            { action: "financial_verified", assessmentId }
        )

        revalidateTag(`lead-${assessment.leadId}`, "hours")

        return {
            success: true,
            data: updatedAssessment,
            message: "Financial data verified"
        }
    } catch (error) {
        return handleActionError(handlePrismaError(error))
    }
}

// ============================================================================
// Submit Assessment
// ============================================================================

/**
 * Submit assessment with dynamic scoring
 */
export async function submitAssessment(
    assessmentId: string
): Promise<ActionResponse<{ assessment: Assessment; score: DynamicScoringResult }>> {
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

        // Only assigned assessor can submit
        if (assessment.assessorId !== session.user.id) {
            throw Errors.insufficientPermissions()
        }

        if (!assessment.companyVerified) {
            throw new AppError(ErrorCode.INVALID_INPUT, "Please complete company verification first", 400)
        }
        if (!assessment.financialVerified) {
            throw new AppError(ErrorCode.INVALID_INPUT, "Please complete financial verification first", 400)
        }
        if (assessment.status !== "DRAFT") {
            throw new AppError(ErrorCode.INVALID_INPUT, "Assessment already submitted", 400)
        }

        // Fetch active questions
        const activeQuestions = await prisma.question.findMany({
            where: { isActive: true },
            orderBy: { order: "asc" },
        })

        // Fetch answers for this assessment
        const dynamicAnswers = await prisma.assessmentAnswer.findMany({
            where: { assessmentId },
        })

        // Validate all active questions have answers
        const answeredIds = new Set(dynamicAnswers.map(a => a.questionId))
        const unanswered = activeQuestions.filter(q => !answeredIds.has(q.id))
        if (unanswered.length > 0) {
            throw new AppError(
                ErrorCode.INVALID_INPUT,
                `Please answer all questions before submitting. ${unanswered.length} question(s) unanswered.`,
                400
            )
        }

        const dynamicResult = calculateDynamicScore(activeQuestions, dynamicAnswers)

        // Snapshot questions at submission time for permanent record
        const questionsSnapshot = activeQuestions.map(q => ({
            id: q.id,
            text: q.text,
            section: q.section,
            displayNumber: q.displayNumber,
            inputType: q.inputType,
            options: q.options,
            maxScore: q.maxScore,
            unit: q.unit,
            helpText: q.helpText,
            order: q.order,
        }))

        const updatedAssessment = await prisma.$transaction(async (tx) => {
            const updated = await tx.assessment.update({
                where: { id: assessmentId },
                data: {
                    status: "SUBMITTED",
                    submittedAt: new Date(),
                    scoreBreakdown: JSON.parse(JSON.stringify(dynamicResult.breakdown)),
                    totalScore: dynamicResult.totalScore,
                    maxScore: dynamicResult.maxScore,
                    percentage: dynamicResult.percentage,
                    rating: dynamicResult.rating,
                    questionsSnapshot: JSON.parse(JSON.stringify(questionsSnapshot)),
                    usesDynamicQuestions: true,
                    updatedAt: new Date(),
                },
            })

            await tx.lead.update({
                where: { id: assessment.lead.id },
                data: { status: "IN_REVIEW", updatedAt: new Date() },
            })

            return updated
        })

        await createAuditLog(
            session.user.id,
            "ASSESSMENT_SUBMITTED",
            assessment.lead.id,
            {
                assessmentId,
                leadDisplayId: assessment.lead.leadId,
                totalScore: dynamicResult.totalScore,
                percentage: dynamicResult.percentage,
                rating: dynamicResult.rating,
            }
        )

        try {
            const reviewers = await prisma.user.findMany({
                where: { role: "REVIEWER", isActive: true },
                select: { email: true, name: true },
            })

            if (reviewers.length > 0) {
                const baseUrl = getAppBaseUrl()
                const firstReviewer = reviewers[0]
                await sendAssessmentSubmittedEmail({
                    reviewerName: firstReviewer.name,
                    reviewerEmail: firstReviewer.email,
                    companyName: assessment.lead.companyName,
                    leadId: assessment.lead.leadId,
                    assessorName: assessment.assessor.name,
                    totalScore: dynamicResult.totalScore,
                    percentage: dynamicResult.percentage,
                    rating: dynamicResult.rating,
                    actionUrl: `${baseUrl}/dashboard/reviews`,
                })
            }
        } catch (emailError) {
            console.error("Failed to send notification emails:", emailError)
        }

        revalidateTag(`lead-${assessment.leadId}`, "hours")
        revalidateTag("reviews", "hours")

        return {
            success: true,
            data: { assessment: updatedAssessment, score: dynamicResult },
            message: `Assessment submitted with score: ${dynamicResult.totalScore}/${dynamicResult.maxScore} (${dynamicResult.percentage.toFixed(1)}%)`,
        }
    } catch (error) {
        return handleActionError(handlePrismaError(error))
    }
}

// ============================================================================
// Navigation Helpers
// ============================================================================

/**
 * Go back to a previous step
 */
export async function goToStep(
    assessmentId: string,
    step: 1 | 2 | 3
): Promise<ActionResponse<Assessment>> {
    try {
        const session = await verifyAuth()

        const assessment = await prisma.assessment.findUnique({
            where: { id: assessmentId },
        })

        if (!assessment) {
            throw Errors.assessmentNotFound(assessmentId)
        }

        // Only assigned assessor can navigate
        if (
            session.user.role === "ASSESSOR" &&
            assessment.assessorId !== session.user.id
        ) {
            throw Errors.insufficientPermissions()
        }

        // Can only navigate if DRAFT
        if (assessment.status !== "DRAFT") {
            throw new AppError(
                ErrorCode.INVALID_INPUT,
                "Cannot modify submitted assessment",
                400
            )
        }

        // Validate step based on completion status
        if (step === 3 && !assessment.financialVerified) {
            throw new AppError(
                ErrorCode.INVALID_INPUT,
                "Please complete financial verification first",
                400
            )
        }
        if (step === 2 && !assessment.companyVerified) {
            throw new AppError(
                ErrorCode.INVALID_INPUT,
                "Please complete company verification first",
                400
            )
        }

        const updatedAssessment = await prisma.assessment.update({
            where: { id: assessmentId },
            data: {
                currentStep: step,
                updatedAt: new Date(),
            },
        })

        return { success: true, data: updatedAssessment }
    } catch (error) {
        return handleActionError(handlePrismaError(error))
    }
}

// ============================================================================
// Dynamic Answer Saving
// ============================================================================

/**
 * Save a dynamic questionnaire answer (auto-save per question)
 */
export async function saveDynamicAnswer(
    assessmentId: string,
    questionId: string,
    answerValue: string
): Promise<ActionResponse<void>> {
    try {
        const session = await verifyAuth()

        const assessment = await prisma.assessment.findUnique({
            where: { id: assessmentId },
        })

        if (!assessment) {
            throw Errors.assessmentNotFound(assessmentId)
        }

        if (session.user.role === "ASSESSOR" && assessment.assessorId !== session.user.id) {
            throw Errors.insufficientPermissions()
        }

        if (assessment.status !== "DRAFT") {
            throw new AppError(ErrorCode.INVALID_INPUT, "Cannot modify submitted assessment", 400)
        }

        // Fetch the question to calculate score
        const question = await prisma.question.findUnique({
            where: { id: questionId },
        })

        if (!question) {
            throw Errors.questionNotFound(questionId)
        }

        // Calculate score for this answer
        const score = calculateAnswerScore(answerValue, question)

        // Upsert the answer
        await prisma.assessmentAnswer.upsert({
            where: {
                assessmentId_questionId: {
                    assessmentId,
                    questionId,
                },
            },
            update: {
                answerValue,
                score,
            },
            create: {
                assessmentId,
                questionId,
                answerValue,
                score,
            },
        })

        return { success: true, data: undefined }
    } catch (error) {
        return handleActionError(handlePrismaError(error))
    }
}
