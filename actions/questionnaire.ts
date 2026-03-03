"use server"

/**
 * IRA Platform - Questionnaire Management Server Actions
 *
 * CRUD operations for managing dynamic questionnaire questions.
 * Only REVIEWER role can create/update/delete questions.
 * Both roles can read active questions.
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
  CreateDynamicQuestionSchema,
  UpdateDynamicQuestionSchema,
  ReorderQuestionsSchema,
  type ActionResponse,
} from "@/lib/types"
import { Errors, AppError, ErrorCode } from "@/lib/errors"
import { ZodError } from "zod"
import type { Question } from "@prisma/client"

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

  console.error("Unexpected error in questionnaire action:", error)
  return {
    success: false,
    error: "An unexpected error occurred",
    code: ErrorCode.UNKNOWN_ERROR,
  }
}

// ============================================================================
// Read Operations
// ============================================================================

/**
 * Get all questions (active + inactive) for reviewer management
 */
export async function getQuestions(): Promise<ActionResponse<Question[]>> {
  try {
    await verifyRole("REVIEWER")

    const questions = await prisma.question.findMany({
      orderBy: { order: "asc" },
    })

    return { success: true, data: questions }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

/**
 * Get active questions for assessor questionnaire
 */
export async function getActiveQuestions(): Promise<ActionResponse<Question[]>> {
  try {
    await verifyAuth()

    const questions = await prisma.question.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    })

    return { success: true, data: questions }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

// ============================================================================
// Create
// ============================================================================

/**
 * Create a new question
 */
export async function createQuestion(
  input: unknown
): Promise<ActionResponse<Question>> {
  try {
    const session = await verifyRole("REVIEWER")
    const validated = CreateDynamicQuestionSchema.parse(input)

    // Get max order for auto-ordering
    const maxOrder = await prisma.question.aggregate({
      _max: { order: true },
    })
    const nextOrder = (maxOrder._max.order ?? 0) + 1

    const question = await prisma.question.create({
      data: {
        text: validated.text,
        section: validated.section,
        displayNumber: validated.displayNumber,
        helpText: validated.helpText || null,
        inputType: validated.inputType,
        options: validated.options,
        maxScore: validated.maxScore,
        unit: validated.unit || null,
        order: nextOrder,
        type: "ELIGIBILITY", // Default, not used in dynamic system
        isActive: true,
      },
    })

    await createAuditLog(session.user.id, "QUESTION_CREATED", undefined, {
      questionId: question.id,
      text: question.text.substring(0, 100),
    })

    revalidateTag("questions", "hours")

    return {
      success: true,
      data: question,
      message: "Question created successfully",
    }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

// ============================================================================
// Update
// ============================================================================

/**
 * Update an existing question
 */
export async function updateQuestion(
  questionId: string,
  input: unknown
): Promise<ActionResponse<Question>> {
  try {
    const session = await verifyRole("REVIEWER")
    const validated = UpdateDynamicQuestionSchema.parse(input)

    const existing = await prisma.question.findUnique({
      where: { id: questionId },
    })

    if (!existing) {
      throw Errors.questionNotFound(questionId)
    }

    // Build update data - only include provided fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {}

    if (validated.text !== undefined) updateData.text = validated.text
    if (validated.section !== undefined) updateData.section = validated.section
    if (validated.displayNumber !== undefined) updateData.displayNumber = validated.displayNumber
    if (validated.helpText !== undefined) updateData.helpText = validated.helpText
    if (validated.inputType !== undefined) updateData.inputType = validated.inputType
    if (validated.options !== undefined) updateData.options = validated.options
    if (validated.maxScore !== undefined) updateData.maxScore = validated.maxScore
    if (validated.unit !== undefined) updateData.unit = validated.unit
    if (validated.isActive !== undefined) updateData.isActive = validated.isActive

    const question = await prisma.question.update({
      where: { id: questionId },
      data: updateData,
    })

    await createAuditLog(session.user.id, "QUESTION_UPDATED", undefined, {
      questionId: question.id,
      changes: Object.keys(updateData),
    })

    revalidateTag("questions", "hours")

    return {
      success: true,
      data: question,
      message: "Question updated successfully",
    }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

// ============================================================================
// Delete (Soft Delete)
// ============================================================================

/**
 * Soft-delete a question (set isActive = false)
 */
export async function deleteQuestion(
  questionId: string
): Promise<ActionResponse<Question>> {
  try {
    const session = await verifyRole("REVIEWER")

    const existing = await prisma.question.findUnique({
      where: { id: questionId },
    })

    if (!existing) {
      throw Errors.questionNotFound(questionId)
    }

    const question = await prisma.question.update({
      where: { id: questionId },
      data: { isActive: false },
    })

    await createAuditLog(session.user.id, "QUESTION_DELETED", undefined, {
      questionId: question.id,
      text: question.text.substring(0, 100),
    })

    revalidateTag("questions", "hours")

    return {
      success: true,
      data: question,
      message: "Question deleted successfully",
    }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}

// ============================================================================
// Reorder
// ============================================================================

/**
 * Reorder questions by providing ordered array of IDs
 */
export async function reorderQuestions(
  input: unknown
): Promise<ActionResponse<void>> {
  try {
    const session = await verifyRole("REVIEWER")
    const validated = ReorderQuestionsSchema.parse(input)

    await prisma.$transaction(
      validated.questionIds.map((id, index) =>
        prisma.question.update({
          where: { id },
          data: { order: index + 1 },
        })
      )
    )

    await createAuditLog(session.user.id, "QUESTIONS_REORDERED", undefined, {
      count: validated.questionIds.length,
    })

    revalidateTag("questions", "hours")

    return { success: true, data: undefined, message: "Questions reordered" }
  } catch (error) {
    return handleActionError(handlePrismaError(error))
  }
}
