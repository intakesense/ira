// IRA Platform - Error Handling
// Structured error types for consistent error handling across server actions

export enum ErrorCode {
  // Auth errors
  UNAUTHORIZED = "UNAUTHORIZED",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  USER_INACTIVE = "USER_INACTIVE",

  // Resource errors
  LEAD_NOT_FOUND = "LEAD_NOT_FOUND",
  ASSESSMENT_NOT_FOUND = "ASSESSMENT_NOT_FOUND",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  DOCUMENT_NOT_FOUND = "DOCUMENT_NOT_FOUND",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",

  // Validation errors
  INVALID_INPUT = "INVALID_INPUT",
  DUPLICATE_CIN = "DUPLICATE_CIN",
  DUPLICATE_RESOURCE = "DUPLICATE_RESOURCE",

  // Concurrency errors
  CONCURRENT_MODIFICATION = "CONCURRENT_MODIFICATION",
  STALE_DATA = "STALE_DATA",

  // Business logic errors
  INVALID_STATUS_TRANSITION = "INVALID_STATUS_TRANSITION",
  ASSESSOR_NOT_ASSIGNED = "ASSESSOR_NOT_ASSIGNED",
  ASSESSMENT_ALREADY_SUBMITTED = "ASSESSMENT_ALREADY_SUBMITTED",

  // Question management errors
  QUESTION_NOT_FOUND = "QUESTION_NOT_FOUND",
  NO_ACTIVE_QUESTIONS = "NO_ACTIVE_QUESTIONS",
  QUESTIONS_OUTDATED = "QUESTIONS_OUTDATED",

  // Assessment errors
  ELIGIBILITY_NOT_COMPLETED = "ELIGIBILITY_NOT_COMPLETED",
  ELIGIBILITY_FAILED = "ELIGIBILITY_FAILED",
  INCOMPLETE_ASSESSMENT = "INCOMPLETE_ASSESSMENT",
  ASSESSMENT_NOT_SUBMITTED = "ASSESSMENT_NOT_SUBMITTED",

  // System errors
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
  CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  NOT_FOUND = "NOT_FOUND",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",

  // Probe42-specific errors
  COMPANY_INACTIVE = "COMPANY_INACTIVE",   // Error 8: company is inactive, stop all update calls
  COMPANY_NOT_PROBED = "COMPANY_NOT_PROBED", // Error 18: not probed yet, call update() first
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number = 400,
    public context?: Record<string, unknown>
  ) {
    super(message)
    this.name = "AppError"
  }
}

// Error factory functions
export const Errors = {
  unauthorized: (message = "Please sign in to continue") =>
    new AppError(ErrorCode.UNAUTHORIZED, message, 401),

  insufficientPermissions: (requiredRole?: string) =>
    new AppError(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      requiredRole
        ? `This action requires ${requiredRole} role`
        : "You don't have permission to perform this action",
      403
    ),

  userInactive: () =>
    new AppError(
      ErrorCode.USER_INACTIVE,
      "Your account has been deactivated. Please contact administrator.",
      403
    ),

  leadNotFound: (leadId?: string) =>
    new AppError(
      ErrorCode.LEAD_NOT_FOUND,
      "Lead not found",
      404,
      leadId ? { leadId } : undefined
    ),

  duplicateCIN: (cin: string) =>
    new AppError(
      ErrorCode.DUPLICATE_CIN,
      "A lead with this CIN already exists",
      409,
      { cin }
    ),

  concurrentModification: () =>
    new AppError(
      ErrorCode.CONCURRENT_MODIFICATION,
      "This record was modified by another user. Please refresh and try again.",
      409
    ),

  invalidInput: (details: string) =>
    new AppError(ErrorCode.INVALID_INPUT, details, 400),

  invalidStatusTransition: (from: string, to: string) =>
    new AppError(
      ErrorCode.INVALID_STATUS_TRANSITION,
      `Cannot transition from ${from} to ${to}`,
      400,
      { from, to }
    ),

  databaseError: (details?: string) =>
    new AppError(
      ErrorCode.DATABASE_ERROR,
      details || "A database error occurred",
      500
    ),

  assessmentNotFound: (assessmentId?: string) =>
    new AppError(
      ErrorCode.ASSESSMENT_NOT_FOUND,
      "Assessment not found",
      404,
      assessmentId ? { assessmentId } : undefined
    ),

  questionNotFound: (questionId?: string) =>
    new AppError(
      ErrorCode.QUESTION_NOT_FOUND,
      "Question not found",
      404,
      questionId ? { questionId } : undefined
    ),

  documentNotFound: (documentId?: string) =>
    new AppError(
      ErrorCode.DOCUMENT_NOT_FOUND,
      "Document not found",
      404,
      documentId ? { documentId } : undefined
    ),

  noActiveQuestions: (type?: string) =>
    new AppError(
      ErrorCode.NO_ACTIVE_QUESTIONS,
      type ? `No active ${type} questions found` : "No active questions found",
      400,
      type ? { type } : undefined
    ),

  questionsOutdated: () =>
    new AppError(
      ErrorCode.QUESTIONS_OUTDATED,
      "Questions have been updated since this assessment was started",
      409
    ),

  eligibilityNotCompleted: () =>
    new AppError(
      ErrorCode.ELIGIBILITY_NOT_COMPLETED,
      "Please complete eligibility check before proceeding to main assessment",
      400
    ),

  eligibilityFailed: (failedQuestions: string[]) =>
    new AppError(
      ErrorCode.ELIGIBILITY_FAILED,
      "Company is not eligible for IPO assessment",
      400,
      { failedQuestions }
    ),

  incompleteAssessment: (missingSections: string[]) =>
    new AppError(
      ErrorCode.INCOMPLETE_ASSESSMENT,
      "Please complete all sections before submitting",
      400,
      { missingSections }
    ),

  assessmentNotSubmitted: () =>
    new AppError(
      ErrorCode.ASSESSMENT_NOT_SUBMITTED,
      "Assessment must be submitted before review",
      400
    ),

  EXTERNAL_API_ERROR: (details: string) =>
    new AppError(
      ErrorCode.EXTERNAL_API_ERROR,
      details || "External API error occurred",
      502
    ),

  unknown: (error: unknown) => {
    if (error instanceof AppError) return error
    if (error instanceof Error) {
      return new AppError(ErrorCode.UNKNOWN_ERROR, error.message, 500)
    }
    return new AppError(ErrorCode.UNKNOWN_ERROR, "An unexpected error occurred", 500)
  },
}

// User-friendly error messages for display
export function getErrorMessage(error: AppError | ErrorCode | string): string {
  const code = typeof error === "string" ? error : error instanceof AppError ? error.code : error

  const messages: Record<ErrorCode, string> = {
    [ErrorCode.UNAUTHORIZED]: "Please sign in to continue",
    [ErrorCode.INSUFFICIENT_PERMISSIONS]: "You don't have permission to perform this action",
    [ErrorCode.SESSION_EXPIRED]: "Your session has expired. Please sign in again",
    [ErrorCode.USER_INACTIVE]: "Your account is inactive. Contact administrator",
    [ErrorCode.LEAD_NOT_FOUND]: "Lead not found",
    [ErrorCode.ASSESSMENT_NOT_FOUND]: "Assessment not found",
    [ErrorCode.USER_NOT_FOUND]: "User not found",
    [ErrorCode.DOCUMENT_NOT_FOUND]: "Document not found",
    [ErrorCode.RESOURCE_NOT_FOUND]: "Resource not found",
    [ErrorCode.INVALID_INPUT]: "Invalid input provided",
    [ErrorCode.DUPLICATE_CIN]: "A lead with this CIN already exists",
    [ErrorCode.DUPLICATE_RESOURCE]: "This resource already exists",
    [ErrorCode.CONCURRENT_MODIFICATION]: "Record was modified by another user. Please refresh",
    [ErrorCode.STALE_DATA]: "Data is out of date. Please refresh",
    [ErrorCode.INVALID_STATUS_TRANSITION]: "Invalid status change",
    [ErrorCode.ASSESSOR_NOT_ASSIGNED]: "No assessor assigned to this lead",
    [ErrorCode.ASSESSMENT_ALREADY_SUBMITTED]: "Assessment has already been submitted",
    [ErrorCode.QUESTION_NOT_FOUND]: "Question not found",
    [ErrorCode.NO_ACTIVE_QUESTIONS]: "No active questions found",
    [ErrorCode.QUESTIONS_OUTDATED]: "Questions have been updated",
    [ErrorCode.ELIGIBILITY_NOT_COMPLETED]: "Complete eligibility check first",
    [ErrorCode.ELIGIBILITY_FAILED]: "Company is not eligible",
    [ErrorCode.INCOMPLETE_ASSESSMENT]: "Complete all sections first",
    [ErrorCode.ASSESSMENT_NOT_SUBMITTED]: "Assessment must be submitted first",
    [ErrorCode.DATABASE_ERROR]: "A database error occurred",
    [ErrorCode.EXTERNAL_API_ERROR]: "External API error occurred",
    [ErrorCode.CONFIGURATION_ERROR]: "Configuration error",
    [ErrorCode.RATE_LIMIT_EXCEEDED]: "Rate limit exceeded. Please try again later",
    [ErrorCode.NOT_FOUND]: "Resource not found",
    [ErrorCode.UNKNOWN_ERROR]: "An unexpected error occurred",
    [ErrorCode.COMPANY_INACTIVE]: "Company is inactive and cannot be refreshed",
    [ErrorCode.COMPANY_NOT_PROBED]: "Company has not been probed yet. Trigger an update first",
  }

  return messages[code as ErrorCode] || "An error occurred"
}