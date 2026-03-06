'use client';

import { useState } from 'react';
import { Loader2, X, CheckCircle2, XCircle } from 'lucide-react';
import { EligibilityCriteria } from '@/lib/landing-types';
import { colors } from '@/lib/theme/colors';

interface EligibilityCheckerProps {
  onComplete: (
    eligible: boolean,
    missing: string[],
    failureReasons: string[],
    advice?: string
  ) => void;
  onCancel: () => void;
}

const QUESTIONS: EligibilityCriteria[] = [
  {
    id: 'assets',
    label: 'Is the Net Tangible Assets equal to or greater than ₹1.5 Crore?',
    description: 'Tangible assets minus total liabilities.',
    failureFeedback:
      'BSE/NSE SME platforms mandate a minimum Net Tangible Assets of ₹1.5 Cr.',
  },
  {
    id: 'track_record_company',
    label: 'Does the company/firm have a combined track record of at least 3 years?',
    description: 'Operational history of the business entity.',
    failureFeedback:
      'A minimum 3-year operational track record is required.',
  },
  {
    id: 'net_worth',
    label: 'Does the entity have a positive net worth?',
    description: 'Total assets must exceed total liabilities.',
    failureFeedback:
      'Negative net worth indicates financial distress.',
  },
  {
    id: 'track_record_promoter',
    label:
      'Does either the company or the promoter have a track record of at least 3 years?',
    description: 'Experience of promoters or company.',
    failureFeedback:
      'Promoter or company experience of at least 3 years is mandatory.',
  },
  {
    id: 'paid_up_capital',
    label: 'Is the post-issue paid-up capital ≤ ₹25 Crores?',
    description: 'SME exchange eligibility requirement.',
    failureFeedback:
      'Post-issue paid-up capital must not exceed ₹25 Crores.',
  },
];

export const EligibilityChecker: React.FC<EligibilityCheckerProps> = ({
  onComplete,
  onCancel,
}) => {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const answeredCount = Object.keys(answers).length;

  const handleAnswer = (id: string, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    if (answeredCount !== QUESTIONS.length) return;

    setIsAnalyzing(true);

    const missing: string[] = [];
    const failureReasons: string[] = [];

    QUESTIONS.forEach((q) => {
      if (answers[q.id] === false) {
        missing.push(q.label);
        q.failureFeedback && failureReasons.push(q.failureFeedback);
      }
    });

    setTimeout(() => {
      setIsAnalyzing(false);
      onComplete(missing.length === 0, missing, failureReasons);
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(3,18,43,0.85)',
      }}
    >
      <div
        className="w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        style={{
          background: colors.white,
          maxHeight: '90vh',
        }}
      >
        {/* HEADER */}
        <div
          className="sticky top-0 z-10 p-8"
          style={{
            background: `linear-gradient(
              135deg,
              ${colors.brand[900]},
              ${colors.brand[800]}
            )`,
          }}
        >
          <button
            onClick={onCancel}
            className="absolute top-0 right-4 p-2 text-white/80 z-10  transition-colors"
            style={{ color: colors.gray[500] }}
            onMouseEnter={(e) => (e.currentTarget.style.color = colors.gray[600])}
            onMouseLeave={(e) => (e.currentTarget.style.color = colors.gray[400])}
          >
            <X size={20} />
          </button>

          <h2
            className="text-3xl font-serif font-bold"
            style={{ color: colors.white }}
          >
            SME IPO Eligibility Check
          </h2>

          <p
            className="mt-2 max-w-xl"
            style={{ color: colors.blue[100] }}
          >
            Answer the questions below to assess your readiness for BSE / NSE SME listing.
          </p>

          {/* Progress */}
          <div className="mt-4">
            <div
              className="h-2 rounded-full"
              style={{ background: colors.brand[700] }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(answeredCount / QUESTIONS.length) * 100}%`,
                  background: colors.amber[500],
                }}
              />
            </div>
          </div>
        </div>

        {/* QUESTIONS (SCROLL AREA) */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {QUESTIONS.map((q, idx) => {
            const answer = answers[q.id];

            return (
              <div
                key={q.id}
                className="p-6 rounded-2xl transition"
                style={{
                  background:
                    answer === undefined
                      ? colors.blue[100]
                      : answer
                      ? colors.green[100]
                      : colors.amber[100],
                }}
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <p
                      className="font-semibold text-lg"
                      style={{ color: colors.gray[900] }}
                    >
                      {idx + 1}. {q.label}
                    </p>
                    <p
                      className="text-sm mt-1"
                      style={{ color: colors.gray[500] }}
                    >
                      {q.description}
                    </p>
                  </div>

                  {answer !== undefined &&
                    (answer ? (
                      <CheckCircle2 color={colors.green[700]} />
                    ) : (
                      <XCircle color={colors.amber[600]} />
                    ))}
                </div>

                <div className="flex gap-4 mt-5">
                  <button
                    onClick={() => handleAnswer(q.id, true)}
                    className="flex-1 py-2.5 rounded-xl font-semibold"
                    style={{
                      background:
                        answer === true ? colors.green[700] : colors.white,
                      color:
                        answer === true ? colors.white : colors.gray[900],
                      border: `1px solid ${colors.gray[200]}`,
                    }}
                  >
                    Yes
                  </button>

                  <button
                    onClick={() => handleAnswer(q.id, false)}
                    className="flex-1 py-2.5 rounded-xl font-semibold"
                    style={{
                      background:
                        answer === false ? colors.amber[600] : colors.white,
                      color:
                        answer === false ? colors.white : colors.gray[900],
                      border: `1px solid ${colors.gray[200]}`,
                    }}
                  >
                    No
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div
          className="sticky bottom-0 p-6 flex justify-between items-center border-t"
          style={{ borderColor: colors.gray[200], background: colors.white }}
        >
          <p className="text-xs" style={{ color: colors.gray[400] }}>
            All questions are mandatory
          </p>

          <button
            onClick={handleSubmit}
            disabled={answeredCount !== QUESTIONS.length || isAnalyzing}
            className="px-8 py-3 rounded-xl font-bold flex items-center gap-2"
            style={{
              background:
                answeredCount === QUESTIONS.length
                  ? colors.brand[600]
                  : colors.gray[200],
              color:
                answeredCount === QUESTIONS.length
                  ? colors.white
                  : colors.gray[500],
            }}
          >
            {isAnalyzing && <Loader2 size={18} className="animate-spin" />}
            {isAnalyzing ? 'Analyzing...' : 'Check Eligibility'}
          </button>
        </div>
      </div>
    </div>
  );
};
