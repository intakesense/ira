"use client";

import { ClipboardCheck, LineChart, Building } from "lucide-react";
import { colors } from "@/lib/theme/colors";

export const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      style={{
        padding: "96px 0",
        backgroundColor: colors.white,
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <h2
            style={{
              color: colors.brand[700],
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Our Process
          </h2>

          <h3
            style={{
              marginTop: 12,
              fontSize: 40,
              fontWeight: 800,
              color: colors.gray[900],
            }}
          >
            Your Journey to Listing
          </h3>

          <p
            style={{
              marginTop: 16,
              fontSize: 18,
              color: colors.gray[500],
              maxWidth: 680,
              marginInline: "auto",
            }}
          >
            From eligibility check to ringing the bell, we guide you through
            every stage of the IPO journey.
          </p>
        </div>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 48,
          }}
        >
          {[
            {
              step: "STEP 1",
              title: "Check Eligibility",
              desc: "Instantly check if your company meets BSE/NSE criteria using our free eligibility tool.",
              Icon: ClipboardCheck,
            },
            {
              step: "STEP 2",
              title: "IRA Deep Dive",
              desc: "We analyze financials, compliance, and sector performance to generate your IRA Score™.",
              Icon: LineChart,
            },
            {
              step: "STEP 3",
              title: "IPO Listing",
              desc: "End-to-end support for DRHP, merchant bankers, roadshows, or a strategic readiness plan.",
              Icon: Building,
            },
          ].map(({ step, title, desc, Icon }) => (
            <div
              key={step}
              style={{
                padding: 36,
                borderRadius: 20,
                background: `linear-gradient(
  135deg,
  rgba(37, 99, 235, 0.08),
  rgba(219, 234, 254, 0.6)
)`,
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(37, 99, 235, 0.15)",
                color: colors.white,
                boxShadow: "0 20px 40px rgba(3,18,43,0.35)",
                transition: "all 0.35s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.boxShadow =
                  "0 30px 60px rgba(37,99,235,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 20px 40px rgba(3,18,43,0.35)";
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  backgroundColor: colors.blue[100],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 24,
                }}
              >
                <Icon size={30} color={colors.brand[700]} />
              </div>

              {/* Step badge */}
              <div
                style={{
                  display: "inline-block",
                  backgroundColor: colors.brand[700],
                  color: colors.white,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "6px 14px",
                  borderRadius: 999,
                  marginBottom: 20,
                }}
              >
                {step}
              </div>

              <h4
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  marginBottom: 14,
                  color: colors.blue[800],
                }}
              >
                {title}
              </h4>

              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: colors.blue[800],
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
