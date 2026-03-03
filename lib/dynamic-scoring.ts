/**
 * Dynamic Scoring Algorithm
 *
 * Calculates IPO readiness score based on dynamic questions from the database.
 * Used for assessments with usesDynamicQuestions=true.
 */

import type { Question, AssessmentAnswer } from "@prisma/client"

// Re-use existing ScoringResult type shape
export type DynamicScoringResult = {
  breakdown: Record<string, { questionText: string; score: number; maxScore: number }>
  totalScore: number
  maxScore: number
  percentage: number
  rating: "IPO_READY" | "NEEDS_IMPROVEMENT" | "NOT_READY"
}

type NumberRange = {
  min?: number | null
  max?: number | null
  score: number
}

/**
 * Calculate score for a single boolean answer
 */
function scoreBooleanAnswer(
  answerValue: string,
  question: Question
): number {
  const options = question.options as Array<{ label: string; score?: number }> | null
  if (!options) return 0

  // If options have explicit scores (like Q10 with multiple choices), use them
  const matchedOption = options.find(
    (opt) => opt.label === answerValue
  )
  if (matchedOption && typeof matchedOption.score === "number") {
    return matchedOption.score
  }

  // Default: first option (Yes) = full weightage, others = 0
  if (answerValue === options[0]?.label) {
    return question.maxScore
  }

  return 0
}

/**
 * Calculate score for a single number answer
 */
function scoreNumberAnswer(
  answerValue: string,
  question: Question
): number {
  const value = parseFloat(answerValue)
  if (isNaN(value)) return 0

  const ranges = question.options as NumberRange[] | null
  if (!ranges || ranges.length === 0) return 0

  // Check exact match first (e.g., ratio = 1)
  for (const range of ranges) {
    if (range.min !== null && range.min !== undefined &&
        range.max !== null && range.max !== undefined &&
        range.min === range.max && value === range.min) {
      return range.score
    }
  }

  // Check ranges (min inclusive, max exclusive for upper bound)
  for (const range of ranges) {
    const min = range.min ?? -Infinity
    const max = range.max ?? Infinity
    // Skip exact-match ranges already handled
    if (min === max && min !== -Infinity) continue

    const aboveMin = value >= min
    const belowMax = max === Infinity ? true : value < max
    if (aboveMin && belowMax) {
      return range.score
    }
  }

  return 0
}

/**
 * Calculate score for a single answer based on question type
 */
export function calculateAnswerScore(
  answerValue: string,
  question: Question
): number {
  if (question.inputType === "boolean") {
    return scoreBooleanAnswer(answerValue, question)
  }

  if (question.inputType === "number") {
    return scoreNumberAnswer(answerValue, question)
  }

  return 0
}

/**
 * Calculate the complete IPO readiness score from dynamic questions and answers
 */
export function calculateDynamicScore(
  questions: Question[],
  answers: AssessmentAnswer[]
): DynamicScoringResult {
  const answerMap = new Map(
    answers.map((a) => [a.questionId, a])
  )

  const breakdown: Record<string, { questionText: string; score: number; maxScore: number }> = {}
  let totalScore = 0
  let maxScore = 0

  for (const question of questions) {
    const answer = answerMap.get(question.id)
    const score = answer ? answer.score : 0

    breakdown[question.id] = {
      questionText: question.text,
      score,
      maxScore: question.maxScore,
    }

    totalScore += score
    maxScore += question.maxScore
  }

  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0

  let rating: "IPO_READY" | "NEEDS_IMPROVEMENT" | "NOT_READY"
  if (percentage > 65) {
    rating = "IPO_READY"
  } else if (percentage >= 45) {
    rating = "NEEDS_IMPROVEMENT"
  } else {
    rating = "NOT_READY"
  }

  return {
    breakdown,
    totalScore: Math.round(totalScore * 100) / 100,
    maxScore: Math.round(maxScore * 100) / 100,
    percentage: Math.round(percentage * 100) / 100,
    rating,
  }
}

export function getRatingLabel(rating: DynamicScoringResult["rating"]): string {
  switch (rating) {
    case "IPO_READY": return "IPO Ready"
    case "NEEDS_IMPROVEMENT": return "Needs Improvement"
    case "NOT_READY": return "Not Ready"
  }
}

export function getRatingColor(rating: DynamicScoringResult["rating"]): string {
  switch (rating) {
    case "IPO_READY": return "green"
    case "NEEDS_IMPROVEMENT": return "yellow"
    case "NOT_READY": return "red"
  }
}
