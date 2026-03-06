import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  Lock,
  FileText,
  AlertTriangle,
  X,
} from "lucide-react";
import { colors } from "@/lib/theme/colors";

interface ResultsViewProps {
  isEligible: boolean;
  missingCriteria: string[];
  failureReasons?: string[];
  advice?: string;
  onReset: () => void;
  onProceed?: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  isEligible,
  missingCriteria,
  failureReasons = [],
  advice,
  onReset,
  onProceed,
}) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState("");
  const handleLeadGen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onProceed) onProceed();
    else setSubmitted(true);
    if (isEligible) {
      if (onProceed) onProceed();
      else setSubmitted(true);
      return;
    }

    // Not eligible → create link + send email in one go
    setLoading(true);
    try {
      // Step 1: Create Razorpay payment link
      const res = await fetch("/api/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      const link = data.link;

      // Step 2: Send email with the link (reusing your existing route)
      await fetch("/api/send-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, link }),
      });

      setPaymentLink(link);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center px-4 py-8 overflow-y-auto"
      style={{
        background: "rgba(3,18,43,0.85)",
      }}
    >
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Close */}
        <button
          onClick={onReset}
          className="absolute top-2 right-4 text-white/80 hover:text-white z-10 p-2 transition-colors"
          style={{ color: colors.gray[500] }}
           onMouseEnter={(e) => (e.currentTarget.style.color = colors.gray[600])}
            onMouseLeave={(e) => (e.currentTarget.style.color = colors.gray[500])}
        >
          <X size={20} />
        </button>

        {/* ================= HEADER ================= */}
        <div
          className="px-10 py-20 text-center"
          style={{
            background: isEligible
              ? `linear-gradient(135deg, ${colors.green[100]}, ${colors.blue[100]})`
              : `linear-gradient(135deg, ${colors.amber[100]}, ${colors.blue[100]})`,
          }}
        >
          <div
            className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-scale-in"
            style={{
              background: colors.white,
              boxShadow: `0 12px 30px ${
                isEligible ? colors.green[700] : colors.amber[500]
              }33`,
            }}
          >
            {isEligible ? (
              <CheckCircle2
                className="w-12 h-12 animate-pop"
                style={{ color: colors.green[700] }}
              />
            ) : (
              <XCircle
                className="w-12 h-12 animate-pop"
                style={{ color: colors.amber[500] }}
              />
            )}
          </div>

          <h2
            className="text-4xl font-serif font-bold mb-3"
            style={{ color: colors.brand[900] }}
          >
            {isEligible
              ? "You Are SME IPO Ready"
              : "Eligibility Gaps Identified"}
          </h2>

          <p
            className="text-lg max-w-xl mx-auto"
            style={{ color: colors.gray[500] }}
          >
            {isEligible
              ? "Your company meets the preliminary SME IPO eligibility criteria."
              : "The following areas must be addressed before proceeding with listing."}
          </p>
        </div>

        {/* ================= BODY ================= */}
        <div className="px-10 py-12 overflow-y-auto flex-1">
          {/* ---------- GAP SECTION ---------- */}
          {!isEligible && (
            <div className="mb-16">
              {/* Section title */}
              <div className="flex items-center mb-8 pl-2">
                <div
                  className="w-1 h-8 rounded-full mr-4"
                  style={{ background: colors.blue[700] }}
                />
                <h3
                  className="text-2xl font-bold"
                  style={{ color: colors.brand[900] }}
                >
                  Key gaps identified
                </h3>
              </div>

              {/* Gap list */}
              <div className="grid gap-2 pl-2">
                {(failureReasons.length ? failureReasons : missingCriteria).map(
                  (item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-2 items-start p-1 rounded-2xl transition-transform hover:scale-[1.01]"
                      style={{
                        background: colors.blue[100],
                        border: `1px solid ${colors.blue[200]}`,
                      }}
                    >
                      {/* Icon */}
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: colors.amber[400] }}
                      >
                        <AlertTriangle
                          className="w-4 h-4"
                          style={{ color: colors.white }}
                        />
                      </div>

                      {/* Text */}
                      <p
                        className="text-base leading-relaxed pt-0.5"
                        style={{ color: colors.gray[900] }}
                      >
                        {item}
                      </p>
                    </div>
                  ),
                )}
              </div>

              {/* Expert Insight */}
              {advice && (
                <div
                  className="mt-12 ml-2 p-6 rounded-2xl"
                  style={{
                    background: colors.blue[100],
                    borderLeft: `4px solid ${colors.blue[700]}`,
                  }}
                >
                  <div
                    className="text-xs font-bold uppercase mb-2"
                    style={{ color: colors.blue[700] }}
                  >
                    Expert Insight
                  </div>
                  <p
                    className="italic text-base leading-relaxed"
                    style={{ color: colors.brand[900] }}
                  >
                    “{advice}”
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ================= CTA ================= */}
          <div
            className="relative rounded-3xl px-12 py-12 text-center text-white overflow-hidden"
            style={{
              background: `linear-gradient(
                135deg,
                ${colors.brand[900]},
                ${colors.brand[800]}
              )`,
            }}
          >
            <div className="relative z-10 max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold mt-8">
                {isEligible
                  ? "Get Your Official IRA Score™"
                  : "Build Your IPO Readiness Plan"}
              </h3>

              <p className="text-base mb-8" style={{ color: colors.blue[100] }}>
                {isEligible
                  ? "A regulator-aligned SME IPO readiness assessment prepared by experts."
                  : "We help you close gaps and confidently prepare for SME listing."}
              </p>

              {submitted ? (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm" style={{ color: colors.blue[100] }}>
                    ✅ Payment link sent to <strong>{email}</strong>
                  </p>
                  {paymentLink && (
                    <a
                      href={paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl font-semibold flex items-center justify-center transition-transform hover:scale-[1.02]"
                      style={{
                        padding: "10px 20px",
                        background: colors.blue[500],
                        color: colors.white,
                        border: `1px solid ${colors.blue[600]}`,
                      }}
                    >
                      Open Payment Link
                      <ChevronRight className="ml-2 w-5 h-5" />
                    </a>
                  )}
                  <button
                    onClick={onReset}
                    className="underline"
                    style={{ color: colors.blue[100] }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleLeadGen}
                  className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto"
                >
                  {!onProceed && (
                    <input
                      type="email"
                      required
                      placeholder="Work email address"
                      className="flex-1 px-6 py-4 rounded-md outline-none"
                      style={{
                        background: colors.white,
                        color: colors.gray[900],
                      }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  )}

                  <button
                    type="submit"
                    className=" rounded-xl font-semibold flex items-center justify-center transition-transform hover:scale-[1.02]"
                    style={{
                      padding: "10px 20px", // ⬅️ increased height
                      background: colors.blue[500],
                      color: colors.white,
                      border: `1px solid ${colors.blue[600]}`, // ⬅️ subtle structure like checker
                    }}
                  >
                    {isEligible
                      ? "Get Free Assessment"
                      : "Get Improvement Plan"}
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </button>
                </form>
              )}
            </div>

            <Lock
              className="absolute -bottom-20 -right-20 w-64 h-64 opacity-30"
              style={{ color: colors.brand[800] }}
            />
          </div>

          {/* ================= FOOTER ================= */}
          <div
            className=" mt-12 items-center text-sm  flex justify-center"
            style={{ color: colors.gray[400] }}
          >
            <FileText className="mr-2 size-1" />
            Strictly confidential. No data shared with third parties.
          </div>
        </div>
      </div>
    </div>
  );
};
