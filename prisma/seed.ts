/**
 * Seed script for IRA Platform
 *
 * Seeds the 11 preset questions from the hardcoded questionnaire
 * into the Question table for dynamic questionnaire management.
 *
 * Run: npx tsx prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const SEED_QUESTIONS = [
  // ===== Section: IPO Readiness =====
  {
    text: "Are you ready with your investment plan?",
    section: "IPO Readiness",
    displayNumber: "1",
    inputType: "boolean",
    options: [{ label: "Yes", score: 5 }, { label: "No", score: 0 }],
    maxScore: 5,
    order: 1,
    helpText: null,
    unit: null,
  },

  // ===== Section: Corporate Governance (2.5 pts each × 4 = 10 pts) =====
  {
    text: "Is the corporate governance plan in place with at least the requirements of Indian corporate listing norms?",
    section: "Corporate Governance",
    displayNumber: "2A",
    inputType: "boolean",
    options: [{ label: "Yes", score: 2.5 }, { label: "No", score: 0 }],
    maxScore: 2.5,
    order: 2,
    helpText: null,
    unit: null,
  },
  {
    text: "Does your financial reporting comply with statutory laws, rules, listing norms, accounting standards, etc.?",
    section: "Corporate Governance",
    displayNumber: "2B",
    inputType: "boolean",
    options: [{ label: "Yes", score: 2.5 }, { label: "No", score: 0 }],
    maxScore: 2.5,
    order: 3,
    helpText: null,
    unit: null,
  },
  {
    text: "Does your company have robust financial, operational, and internal control systems ensuring effective governance and risk management?",
    section: "Corporate Governance",
    displayNumber: "2C",
    inputType: "boolean",
    options: [{ label: "Yes", score: 2.5 }, { label: "No", score: 0 }],
    maxScore: 2.5,
    order: 4,
    helpText: null,
    unit: null,
  },
  {
    text: "Is your shareholding clear and transparent?",
    section: "Corporate Governance",
    displayNumber: "2D",
    inputType: "boolean",
    options: [{ label: "Yes", score: 2.5 }, { label: "No", score: 0 }],
    maxScore: 2.5,
    order: 5,
    helpText: null,
    unit: null,
  },

  // ===== Section: Right Team (2.5 pts each × 4 = 10 pts) =====
  {
    text: "Does the company have a professional and well-qualified senior management team with industry experience and a good track record?",
    section: "Right Team",
    displayNumber: "3A",
    inputType: "boolean",
    options: [{ label: "Yes", score: 2.5 }, { label: "No", score: 0 }],
    maxScore: 2.5,
    order: 6,
    helpText: null,
    unit: null,
  },
  {
    text: "Are there credible independent members on the board who add value to the company?",
    section: "Right Team",
    displayNumber: "3B",
    inputType: "boolean",
    options: [{ label: "Yes", score: 2.5 }, { label: "No", score: 0 }],
    maxScore: 2.5,
    order: 7,
    helpText: null,
    unit: null,
  },
  {
    text: "Is there experienced staff at the mid-management level?",
    section: "Right Team",
    displayNumber: "3C",
    inputType: "boolean",
    options: [{ label: "Yes", score: 2.5 }, { label: "No", score: 0 }],
    maxScore: 2.5,
    order: 8,
    helpText: null,
    unit: null,
  },
  {
    text: "Are key personnel within the organization recognized as per accepted market practices, regulatory norms, and corporate governance requirements (e.g., compliance officer appointed)?",
    section: "Right Team",
    displayNumber: "3D",
    inputType: "boolean",
    options: [{ label: "Yes", score: 2.5 }, { label: "No", score: 0 }],
    maxScore: 2.5,
    order: 9,
    helpText: null,
    unit: null,
  },

  // ===== Section: Financial Data =====
  {
    // Max 10 pts — 5 tiers
    text: "Enter the present paid-up capital of your company as per the last audited balance sheet.",
    section: "Financial Data",
    displayNumber: "4",
    inputType: "number",
    options: [
      { min: 10,  max: null, score: 10  },
      { min: 5,   max: 10,   score: 7.5 },
      { min: 3,   max: 5,    score: 5   },
      { min: 1,   max: 3,    score: 2.5 },
      { min: null, max: 1,   score: 0   },
    ],
    maxScore: 10,
    order: 10,
    helpText: "Amount in Crores (₹)",
    unit: "crores",
  },
  {
    // Max 5 pts — 5 tiers (1 Cr = 10,000,000 ; 50 L = 5,000,000 ; 10 L = 1,000,000 ; 1 L = 100,000)
    text: "Enter the number of shares outstanding as per the last audited balance sheet.",
    section: "Financial Data",
    displayNumber: "5",
    inputType: "number",
    options: [
      { min: 10000000, max: null,     score: 5    },
      { min: 5000000,  max: 10000000, score: 3.75 },
      { min: 1000000,  max: 5000000,  score: 2.5  },
      { min: 100000,   max: 1000000,  score: 1.25 },
      { min: null,     max: 100000,   score: 0    },
    ],
    maxScore: 5,
    order: 11,
    helpText: "Total number of shares",
    unit: "shares",
  },
  {
    // Max 10 pts — 5 tiers
    text: "Enter your company's net worth.",
    section: "Financial Data",
    displayNumber: "6",
    inputType: "number",
    options: [
      { min: 10,  max: null, score: 10  },
      { min: 5,   max: 10,   score: 7.5 },
      { min: 3,   max: 5,    score: 5   },
      { min: 1,   max: 3,    score: 2.5 },
      { min: null, max: 1,   score: 0   },
    ],
    maxScore: 10,
    order: 12,
    helpText: "Amount in Crores (₹)",
    unit: "crores",
  },
  {
    // Max 5 pts — lower borrowings is better; ₹0 gets full score
    text: "Enter your company's short-term and long-term borrowings.",
    section: "Financial Data",
    displayNumber: "7",
    inputType: "number",
    options: [
      { min: 0,    max: 0,    score: 5    }, // exactly ₹0 (no borrowings)
      { min: 0,    max: 1,    score: 3.75 }, // > 0 and < ₹1 Cr
      { min: 1,    max: 5,    score: 2.5  }, // ₹1 Cr – < ₹5 Cr
      { min: 5,    max: 10,   score: 1.25 }, // ₹5 Cr – < ₹10 Cr
      { min: 10,   max: null, score: 0    }, // ≥ ₹10 Cr
    ],
    maxScore: 5,
    order: 13,
    helpText: "Combined total in Crores (₹) — lower is better",
    unit: "crores",
  },
  {
    // Max 7.5 pts — lower D/E ratio is better
    text: "Enter your company's Debt–Equity Ratio.",
    section: "Financial Data",
    displayNumber: "8",
    inputType: "number",
    options: [
      { min: null, max: 0.5,  score: 7.5   },
      { min: 0.5,  max: 1.0,  score: 5.625 },
      { min: 1.0,  max: 1.5,  score: 3.75  },
      { min: 1.5,  max: 2.0,  score: 1.875 },
      { min: 2.0,  max: null, score: 0     },
    ],
    maxScore: 7.5,
    order: 14,
    helpText: "Ratio value (e.g., 0.5, 1.0, 1.5) — lower is better",
    unit: "ratio",
  },
  {
    // Max 7.5 pts — scored on latest year; trend analysis done via sub-questions
    text: "Enter your company's turnover for the latest financial year.",
    section: "Financial Data",
    displayNumber: "9",
    inputType: "number",
    options: [
      { min: 100, max: null, score: 7.5   },
      { min: 50,  max: 100,  score: 5.625 },
      { min: 10,  max: 50,   score: 3.75  },
      { min: 1,   max: 10,   score: 1.875 },
      { min: null, max: 1,   score: 0     },
    ],
    maxScore: 7.5,
    order: 15,
    helpText: "Amount in Crores (₹) for the latest audited year",
    unit: "crores",
  },
  {
    // Max 7.5 pts — MCQ based on how many of last 3 years had positive EBITDA
    text: "How many of the last 3 years had positive and growing EBITDA?",
    section: "Financial Data",
    displayNumber: "10",
    inputType: "boolean",
    options: [
      { label: "All 3 years", score: 7.5 },
      { label: "2 years",     score: 5   },
      { label: "1 year",      score: 2.5 },
      { label: "None",        score: 0   },
    ],
    maxScore: 7.5,
    order: 16,
    helpText: "Positive and growing EBITDA across 3 years indicates strong profitability",
    unit: null,
  },
  {
    // Max 5 pts — 5 tiers based on EPS in ₹
    text: "Enter your company's Earnings Per Share (EPS).",
    section: "Financial Data",
    displayNumber: "11",
    inputType: "number",
    options: [
      { min: 10,   max: null, score: 5    },
      { min: 5,    max: 10,   score: 3.75 },
      { min: 2,    max: 5,    score: 2.5  },
      { min: 0,    max: 2,    score: 1.25 },
      { min: null, max: 0,    score: 0    },
    ],
    maxScore: 5,
    order: 17,
    helpText: "Value in ₹ per share",
    unit: "rupees",
  },
]

async function main() {
  console.log("Seeding questions...")

  for (const q of SEED_QUESTIONS) {
    await prisma.question.upsert({
      where: {
        id: `seed-q-${q.displayNumber.toLowerCase().replace(/\s/g, "")}`,
      },
      update: {
        text: q.text,
        section: q.section,
        displayNumber: q.displayNumber,
        inputType: q.inputType,
        options: q.options,
        maxScore: q.maxScore,
        order: q.order,
        helpText: q.helpText,
        unit: q.unit,
        isActive: true,
      },
      create: {
        id: `seed-q-${q.displayNumber.toLowerCase().replace(/\s/g, "")}`,
        text: q.text,
        section: q.section,
        displayNumber: q.displayNumber,
        inputType: q.inputType,
        options: q.options,
        maxScore: q.maxScore,
        order: q.order,
        helpText: q.helpText,
        unit: q.unit,
        isActive: true,
        type: "ELIGIBILITY",
      },
    })
    console.log(`  Seeded Q${q.displayNumber}: ${q.text.substring(0, 50)}...`)
  }

  console.log(`\nDone! Seeded ${SEED_QUESTIONS.length} questions.`)
}

main()
  .catch((e) => {
    console.error("Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
