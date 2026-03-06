import { useState } from "react";
import { ArrowRight, Shield, X } from "lucide-react";
import { colors as themeColors } from "@/lib/theme/colors";

export interface DisclaimerModalProps {
  onAgree: () => void;
  onDecline: () => void;
  onClose: () => void;
}

export function DisclaimerModal({ onAgree, onDecline, onClose }: DisclaimerModalProps) {
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      setScrolled(true);
    }
  };

  return (
    /* Backdrop */
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(17,24,39,0.72)",
        backdropFilter: "blur(6px)",
        padding: "20px",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes shimmer {
          0%   { background-position: -200% center }
          100% { background-position: 200% center }
        }
        .disc-yes:hover { filter: brightness(1.08); transform: translateY(-2px); box-shadow: 0 16px 36px rgba(245,158,11,0.45) !important; }
        .disc-no:hover  { background: #f3f4f6 !important; transform: translateY(-2px); }
        .disc-yes, .disc-no { transition: all 0.22s ease; }
      `}</style>

      {/* Card */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 580,
          background: themeColors.white,
          borderRadius: 20,
          boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
          animation: "slideUp 0.28s ease",
          overflow: "hidden",
        }}
      >
        {/* Amber accent bar */}
        <div
          style={{
            height: 5,
            background: `linear-gradient(90deg, ${themeColors.amber[400]}, ${themeColors.amber[600]})`,
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "24px 28px 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: themeColors.amber[50],
                border: `1.5px solid ${themeColors.amber[200]}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Shield size={22} color={themeColors.amber[600]} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: themeColors.amber[600],
                  marginBottom: 2,
                }}
              >
                Required
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: themeColors.gray[900],
                  lineHeight: 1.2,
                }}
              >
                IRA Scoring Assessment Disclaimer
              </h2>
            </div>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 6,
              borderRadius: 8,
              color: themeColors.gray[400],
              display: "flex",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = themeColors.gray[700])}
            onMouseLeave={(e) => (e.currentTarget.style.color = themeColors.gray[400])}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div
          onScroll={handleScroll}
          style={{
            margin: "20px 28px 0",
            maxHeight: 240,
            overflowY: "auto",
            padding: "16px 18px",
            background: themeColors.gray[50],
            borderRadius: 12,
            border: `1px solid ${themeColors.gray[200]}`,
            fontSize: 13.5,
            lineHeight: 1.7,
            color: themeColors.gray[700],
          }}
        >
          <p style={{ margin: "0 0 12px" }}>
            The Company hereby acknowledges and agrees that the IRA Scoring has been carried out
            solely on the basis of information, data, representations, and documents provided by the
            Company during the assessment process. The Company confirms that such information and
            data submitted are true, fair, complete, and accurate to the best of its knowledge.
          </p>
          <p style={{ margin: "0 0 12px" }}>
            Cosmos Investify Asset Management (or Cosmos, as applicable) has relied entirely on the
            information provided by the Company and has not independently verified or audited the
            same. Accordingly, Cosmos shall not be held liable or responsible for the accuracy,
            completeness, or reliability of any data, information, or research forming part of the
            assessment.
          </p>
          <p style={{ margin: 0 }}>
            The IRA Scoring is computed strictly based on the data and disclosures provided by the
            Company, and any variation, omission, or misstatement in such information may impact the
            outcome of the scoring. The responsibility for the authenticity and correctness of the
            submitted data shall remain solely with the Company.
          </p>
        </div>

        {/* Scroll hint */}
        {!scrolled && (
          <p
            style={{
              margin: "6px 28px 0",
              fontSize: 11.5,
              color: themeColors.gray[400],
              textAlign: "right",
            }}
          >
            ↕ Scroll to read full disclaimer
          </p>
        )}

        {/* Agreement prompt */}
        <div
          style={{
            margin: "16px 28px 0",
            padding: "12px 16px",
            borderRadius: 10,
            background: themeColors.amber[50],
            border: `1px solid ${themeColors.amber[200]}`,
            fontSize: 13,
            fontWeight: 600,
            color: themeColors.amber[700],
            textAlign: "center",
            letterSpacing: "0.01em",
          }}
        >
          Do you agree to the terms stated in this disclaimer?
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: 12,
            padding: "16px 28px 24px",
          }}
        >
          {/* NO */}
          <button
            className="disc-no"
            onClick={onDecline}
            style={{
              flex: 1,
              padding: "13px 20px",
              borderRadius: 12,
              border: `1.5px solid ${themeColors.gray[200]}`,
              background: themeColors.white,
              color: themeColors.gray[700],
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            No, I Disagree
          </button>

          {/* YES */}
          <button
            className="disc-yes"
            onClick={onAgree}
            style={{
              flex: 2,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "13px 24px",
              borderRadius: 12,
              border: "none",
              background: `linear-gradient(90deg, ${themeColors.amber[500]}, ${themeColors.amber[600]})`,
              color: themeColors.white,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              lineHeight: 1,
              boxShadow: "0 10px 28px rgba(245,158,11,0.32)",
            }}
          >
            Yes, I Agree
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
