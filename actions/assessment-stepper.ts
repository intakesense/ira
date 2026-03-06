"use server";

/**
 * IRA Platform - New Assessment Server Actions
 *
 * Stepper-based assessment flow:
 * Step 1: Company Verification (from Probe42)
 * Step 2: Financial Data Verification (from Probe42)
 * Step 3: Preset Questionnaire (11 questions)
 */

import { revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { verifyAuth, createAuditLog, handlePrismaError } from "@/lib/dal";
import { type ActionResponse } from "@/lib/types";
import { Errors, AppError, ErrorCode } from "@/lib/errors";
import { ZodError, z } from "zod";
import type { Assessment } from "@prisma/client";
import {
  calculatePresetScore,
  assessmentToPresetAnswers,
  type ScoringResult,
} from "@/lib/scoring-algorithm";
import { MAX_POSSIBLE_SCORE } from "@/lib/preset-questionnaire";
import { sendAssessmentSubmittedEmail, getAppBaseUrl } from "@/lib/email";

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
    };
  }

  if (error instanceof ZodError) {
    return {
      success: false,
      error: error.issues[0]?.message || "Invalid input",
      code: ErrorCode.INVALID_INPUT,
    };
  }

  console.error("Unexpected error in assessment action:", error);
  return {
    success: false,
    error: "An unexpected error occurred",
    code: ErrorCode.UNKNOWN_ERROR,
  };
}

// ============================================================================
// Types
// ============================================================================

export type AssessmentWithLead = Assessment & {
  lead: {
    id: string;
    leadId: string;
    companyName: string;
    cin: string;
    status: string;
    probe42Data: unknown;
    probe42Fetched: boolean;
    address: string;
    probe42LegalName: string | null;
    probe42Status: string | null;
    probe42Classification: string | null;
    probe42PaidUpCapital: bigint | null;
    probe42AuthCapital: bigint | null;
    probe42Pan: string | null;
    probe42Website: string | null;
    probe42IncorpDate: Date | null;
    probe42ComplianceStatus: string | null;
    probe42DirectorCount: number | null;
    probe42GstCount: number | null;
  };
  assessor: {
    id: string;
    name: string;
    email: string;
  };
};

// ============================================================================
// Validation Schemas
// ============================================================================

const CompanyVerificationSchema = z.object({
  companyName: z.string().min(1),
  address: z.string().min(1),
  pan: z.string().optional(),
  gstNumbers: z.array(z.string()).optional(),
});

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
});

const PresetAnswersSchema = z.object({
  hasInvestmentPlan: z.boolean().nullable().optional(),
  q2aGovernancePlan: z.boolean().nullable().optional(),
  q2bFinancialReporting: z.boolean().nullable().optional(),
  q2cControlSystems: z.boolean().nullable().optional(),
  q2dShareholdingClear: z.boolean().nullable().optional(),
  q3aSeniorManagement: z.boolean().nullable().optional(),
  q3bIndependentBoard: z.boolean().nullable().optional(),
  q3cMidManagement: z.boolean().nullable().optional(),
  q3dKeyPersonnel: z.boolean().nullable().optional(),
  q4PaidUpCapital: z.number().nullable().optional(),
  q5OutstandingShares: z.number().nullable().optional(),
  q6NetWorth: z.number().nullable().optional(),
  q7Borrowings: z.number().nullable().optional(),
  q8DebtEquityRatio: z.number().nullable().optional(),
  q9TurnoverYear1: z.number().nullable().optional(),
  q9TurnoverYear2: z.number().nullable().optional(),
  q9TurnoverYear3: z.number().nullable().optional(),
  q10EbitdaYear1: z.number().nullable().optional(),
  q10EbitdaYear2: z.number().nullable().optional(),
  q10EbitdaYear3: z.number().nullable().optional(),
  q11Eps: z.number().nullable().optional(),
  remarks: z.record(z.string(), z.string()).optional(),
});

// ============================================================================
// Read Operations
// ============================================================================

/**
 * Get assessment with full details for stepper
 * @param displayLeadId - The lead's display ID (e.g., "LD-2025-001")
 */
export async function getAssessmentForStepper(
  displayLeadId: string,
): Promise<ActionResponse<AssessmentWithLead | null>> {
  try {
    const session = await verifyAuth();

    // First, find the lead by its display ID (LD-2025-XXX format)
    const lead = await prisma.lead.findUnique({
      where: { leadId: displayLeadId },
      select: { id: true },
    });

    if (!lead) {
      return { success: true, data: null };
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
      },
    });

    if (!assessment) {
      return { success: true, data: null };
    }

    // Access control: Assessors can only view their own assessments
    if (
      session.user.role === "ASSESSOR" &&
      assessment.assessorId !== session.user.id
    ) {
      throw Errors.insufficientPermissions();
    }

    return { success: true, data: assessment as AssessmentWithLead };
  } catch (error) {
    return handleActionError(handlePrismaError(error));
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
  input: unknown,
): Promise<ActionResponse<Assessment>> {
  try {
    const session = await verifyAuth();
    const validatedData = CompanyVerificationSchema.parse(input);

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { lead: true },
    });

    if (!assessment) {
      throw Errors.assessmentNotFound(assessmentId);
    }

    // Only assigned assessor can update
    if (
      session.user.role === "ASSESSOR" &&
      assessment.assessorId !== session.user.id
    ) {
      throw Errors.insufficientPermissions();
    }

    // Can only update if DRAFT
    if (assessment.status !== "DRAFT") {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        "Cannot modify submitted assessment",
        400,
      );
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
    });

    await createAuditLog(
      session.user.id,
      "ASSESSMENT_UPDATED",
      assessment.leadId,
      { action: "company_verified", assessmentId },
    );

    revalidateTag(`lead-${assessment.leadId}`, "hours");

    return {
      success: true,
      data: updatedAssessment,
      message: "Company data verified",
    };
  } catch (error) {
    return handleActionError(handlePrismaError(error));
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
  input: unknown,
): Promise<ActionResponse<Assessment>> {
  try {
    const session = await verifyAuth();
    const validatedData = FinancialVerificationSchema.parse(input);

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { lead: true },
    });

    if (!assessment) {
      throw Errors.assessmentNotFound(assessmentId);
    }

    // Only assigned assessor can update
    if (
      session.user.role === "ASSESSOR" &&
      assessment.assessorId !== session.user.id
    ) {
      throw Errors.insufficientPermissions();
    }

    // Must have completed step 1
    if (!assessment.companyVerified) {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        "Please complete company verification first",
        400,
      );
    }

    // Can only update if DRAFT
    if (assessment.status !== "DRAFT") {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        "Cannot modify submitted assessment",
        400,
      );
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
    });

    await createAuditLog(
      session.user.id,
      "ASSESSMENT_UPDATED",
      assessment.leadId,
      { action: "financial_verified", assessmentId },
    );

    revalidateTag(`lead-${assessment.leadId}`, "hours");

    return {
      success: true,
      data: updatedAssessment,
      message: "Financial data verified",
    };
  } catch (error) {
    return handleActionError(handlePrismaError(error));
  }
}

// ============================================================================
// Step 3: Preset Questionnaire
// ============================================================================

/**
 * Update preset questionnaire answers (auto-save)
 */
export async function updatePresetAnswers(
  assessmentId: string,
  input: unknown,
): Promise<ActionResponse<Assessment>> {
  try {
    const session = await verifyAuth();
    const validatedData = PresetAnswersSchema.parse(input);

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { lead: true },
    });

    if (!assessment) {
      throw Errors.assessmentNotFound(assessmentId);
    }

    // Only assigned assessor can update
    if (
      session.user.role === "ASSESSOR" &&
      assessment.assessorId !== session.user.id
    ) {
      throw Errors.insufficientPermissions();
    }

    // Must have completed step 2
    if (!assessment.financialVerified) {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        "Please complete financial verification first",
        400,
      );
    }

    // Can only update if DRAFT
    if (assessment.status !== "DRAFT") {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        "Cannot modify submitted assessment",
        400,
      );
    }

    // Build update data - only include provided fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (validatedData.hasInvestmentPlan !== undefined) {
      updateData.hasInvestmentPlan = validatedData.hasInvestmentPlan;
    }
    if (validatedData.q2aGovernancePlan !== undefined) {
      updateData.q2aGovernancePlan = validatedData.q2aGovernancePlan;
    }
    if (validatedData.q2bFinancialReporting !== undefined) {
      updateData.q2bFinancialReporting = validatedData.q2bFinancialReporting;
    }
    if (validatedData.q2cControlSystems !== undefined) {
      updateData.q2cControlSystems = validatedData.q2cControlSystems;
    }
    if (validatedData.q2dShareholdingClear !== undefined) {
      updateData.q2dShareholdingClear = validatedData.q2dShareholdingClear;
    }
    if (validatedData.q3aSeniorManagement !== undefined) {
      updateData.q3aSeniorManagement = validatedData.q3aSeniorManagement;
    }
    if (validatedData.q3bIndependentBoard !== undefined) {
      updateData.q3bIndependentBoard = validatedData.q3bIndependentBoard;
    }
    if (validatedData.q3cMidManagement !== undefined) {
      updateData.q3cMidManagement = validatedData.q3cMidManagement;
    }
    if (validatedData.q3dKeyPersonnel !== undefined) {
      updateData.q3dKeyPersonnel = validatedData.q3dKeyPersonnel;
    }
    if (validatedData.q4PaidUpCapital !== undefined) {
      updateData.q4PaidUpCapital = validatedData.q4PaidUpCapital;
    }
    if (validatedData.q5OutstandingShares !== undefined) {
      updateData.q5OutstandingShares = validatedData.q5OutstandingShares;
    }
    if (validatedData.q6NetWorth !== undefined) {
      updateData.q6NetWorth = validatedData.q6NetWorth;
    }
    if (validatedData.q7Borrowings !== undefined) {
      updateData.q7Borrowings = validatedData.q7Borrowings;
    }
    if (validatedData.q8DebtEquityRatio !== undefined) {
      updateData.q8DebtEquityRatio = validatedData.q8DebtEquityRatio;
    }
    if (validatedData.q9TurnoverYear1 !== undefined) {
      updateData.q9TurnoverYear1 = validatedData.q9TurnoverYear1;
    }
    if (validatedData.q9TurnoverYear2 !== undefined) {
      updateData.q9TurnoverYear2 = validatedData.q9TurnoverYear2;
    }
    if (validatedData.q9TurnoverYear3 !== undefined) {
      updateData.q9TurnoverYear3 = validatedData.q9TurnoverYear3;
    }
    if (validatedData.q10EbitdaYear1 !== undefined) {
      updateData.q10EbitdaYear1 = validatedData.q10EbitdaYear1;
    }
    if (validatedData.q10EbitdaYear2 !== undefined) {
      updateData.q10EbitdaYear2 = validatedData.q10EbitdaYear2;
    }
    if (validatedData.q10EbitdaYear3 !== undefined) {
      updateData.q10EbitdaYear3 = validatedData.q10EbitdaYear3;
    }
    if (validatedData.q11Eps !== undefined) {
      updateData.q11Eps = validatedData.q11Eps;
    }
    if (validatedData.remarks !== undefined) {
      const existing = (assessment.remarks as Record<string, string>) || {};
      updateData.remarks = { ...existing, ...validatedData.remarks };
    }
    const updatedAssessment = await prisma.assessment.update({
      where: { id: assessmentId },
      data: updateData,
    });

    return { success: true, data: updatedAssessment };
  } catch (error) {
    return handleActionError(handlePrismaError(error));
  }
}

// ============================================================================
// Submit Assessment
// ============================================================================

/**
 * Submit assessment with score calculation
 */
export async function submitPresetAssessment(
  assessmentId: string,
): Promise<ActionResponse<{ assessment: Assessment; score: ScoringResult }>> {
  try {
    const session = await verifyAuth();

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
    });

    if (!assessment) {
      throw Errors.assessmentNotFound(assessmentId);
    }

    // Only assigned assessor can submit
    if (assessment.assessorId !== session.user.id) {
      throw Errors.insufficientPermissions();
    }

    // Must have completed all steps
    if (!assessment.companyVerified) {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        "Please complete company verification first",
        400,
      );
    }
    if (!assessment.financialVerified) {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        "Please complete financial verification first",
        400,
      );
    }

    // Can only submit if DRAFT
    if (assessment.status !== "DRAFT") {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        "Assessment already submitted",
        400,
      );
    }

    // Validate all required answers are present
    if (
      assessment.hasInvestmentPlan === null ||
      assessment.q2aGovernancePlan === null ||
      assessment.q2bFinancialReporting === null ||
      assessment.q2cControlSystems === null ||
      assessment.q2dShareholdingClear === null ||
      assessment.q3aSeniorManagement === null ||
      assessment.q3bIndependentBoard === null ||
      assessment.q3cMidManagement === null ||
      assessment.q3dKeyPersonnel === null ||
      assessment.q4PaidUpCapital === null ||
      assessment.q5OutstandingShares === null ||
      assessment.q6NetWorth === null ||
      assessment.q11Eps === null
    ) {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        "Please answer all required questions before submitting",
        400,
      );
    }

    // Calculate score
    // Validate remarks are provided for all yes/no questions
    const remarks = (assessment.remarks as Record<string, string>) || {};
    const yesNoQuestions = [
  "hasInvestmentPlan",
  "q2aGovernancePlan", "q2bFinancialReporting", "q2cControlSystems", "q2dShareholdingClear",
  "q3aSeniorManagement", "q3bIndependentBoard", "q3cMidManagement", "q3dKeyPersonnel",
  "q4PaidUpCapital", "q5OutstandingShares", "q6NetWorth", "q7Borrowings",
  "q8DebtEquityRatio", "q9Turnover", "q10Turnover", "q11Eps",
];
    const missingRemarks = yesNoQuestions.filter((q) => !remarks[q]?.trim());
    if (missingRemarks.length > 0) {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        "Please provide a reason for all yes/no questions before submitting",
        400,
      );
    }

    // Calculate score
    const presetAnswers = assessmentToPresetAnswers(assessment);
    const scoringResult = calculatePresetScore(presetAnswers);

    // Update assessment with score and submit
    const updatedAssessment = await prisma.$transaction(async (tx) => {
      const updated = await tx.assessment.update({
        where: { id: assessmentId },
        data: {
          status: "SUBMITTED",
          submittedAt: new Date(),
          scoreBreakdown: scoringResult.breakdown,
          totalScore: scoringResult.totalScore,
          maxScore: MAX_POSSIBLE_SCORE,
          percentage: scoringResult.percentage,
          rating: scoringResult.rating,
          updatedAt: new Date(),
        },
      });

      // Update lead status
      await tx.lead.update({
        where: { id: assessment.lead.id },
        data: {
          status: "IN_REVIEW",
          updatedAt: new Date(),
        },
      });

      return updated;
    });

    await createAuditLog(
      session.user.id,
      "ASSESSMENT_SUBMITTED",
      assessment.lead.id,
      {
        assessmentId,
        leadDisplayId: assessment.lead.leadId,
        totalScore: scoringResult.totalScore,
        percentage: scoringResult.percentage,
        rating: scoringResult.rating,
      },
    );

    // Notify reviewers
    try {
      const reviewers = await prisma.user.findMany({
        where: { role: "REVIEWER", isActive: true },
        select: { email: true, name: true },
      });

      if (reviewers.length > 0) {
        const baseUrl = getAppBaseUrl();
        // Send to first reviewer (sendBulkEmails can be used for multiple)
        const firstReviewer = reviewers[0];
        await sendAssessmentSubmittedEmail({
          reviewerName: firstReviewer.name,
          reviewerEmail: firstReviewer.email,
          companyName: assessment.lead.companyName,
          leadId: assessment.lead.leadId,
          assessorName: assessment.assessor.name,
          totalScore: scoringResult.totalScore,
          percentage: scoringResult.percentage,
          rating: scoringResult.rating,
          actionUrl: `${baseUrl}/dashboard/reviews`,
        });
      }
    } catch (emailError) {
      console.error("Failed to send notification emails:", emailError);
      // Don't fail the submission if email fails
    }

    revalidateTag(`lead-${assessment.leadId}`, "hours");
    revalidateTag("reviews", "hours");

    return {
      success: true,
      data: { assessment: updatedAssessment, score: scoringResult },
      message: `Assessment submitted with score: ${scoringResult.totalScore}/${MAX_POSSIBLE_SCORE} (${scoringResult.percentage.toFixed(1)}%)`,
    };
  } catch (error) {
    return handleActionError(handlePrismaError(error));
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
  step: 1 | 2 | 3,
): Promise<ActionResponse<Assessment>> {
  try {
    const session = await verifyAuth();

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      throw Errors.assessmentNotFound(assessmentId);
    }

    // Only assigned assessor can navigate
    if (
      session.user.role === "ASSESSOR" &&
      assessment.assessorId !== session.user.id
    ) {
      throw Errors.insufficientPermissions();
    }

    // Can only navigate if DRAFT
    if (assessment.status !== "DRAFT") {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        "Cannot modify submitted assessment",
        400,
      );
    }

    // Validate step based on completion status
    if (step === 3 && !assessment.financialVerified) {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        "Please complete financial verification first",
        400,
      );
    }
    if (step === 2 && !assessment.companyVerified) {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        "Please complete company verification first",
        400,
      );
    }

    const updatedAssessment = await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        currentStep: step,
        updatedAt: new Date(),
      },
    });

    return { success: true, data: updatedAssessment };
  } catch (error) {
    return handleActionError(handlePrismaError(error));
  }
}
