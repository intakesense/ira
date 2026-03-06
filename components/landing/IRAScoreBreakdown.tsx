"use client";

import { useEffect, useRef, useState } from "react";
import { BarChart3, Shield, TrendingUp, Users } from "lucide-react";
import { colors as themeColors } from "@/lib/theme/colors";

const pillars = [
  {
    icon: BarChart3,
    title: "Financial Health",
    weight: "30%",
    description:
      "Revenue growth trajectory, EBITDA margins, debt-equity ratios, and cash flow stability assessed against public market benchmarks.",
    points: ["3-year revenue trend", "Profitability ratios", "Working capital"],
    color: themeColors.blue[600],
    bg: themeColors.blue[50],
    border: themeColors.blue[100],
    bar: themeColors.blue[500],
  },
  {
    icon: Shield,
    title: "Compliance & Governance",
    weight: "25%",
    description:
      "Regulatory adherence, board composition, audit quality, and statutory filings reviewed for SEBI and Companies Act requirements.",
    points: ["SEBI readiness", "Board structure", "Audit trail"],
    color: themeColors.amber[600],
    bg: themeColors.amber[50],
    border: themeColors.amber[100],
    bar: themeColors.amber[500],
  },
  {
    icon: TrendingUp,
    title: "Market Readiness",
    weight: "25%",
    description:
      "Sector positioning, competitive moat, TAM sizing, and investor narrative strength evaluated for institutional appetite.",
    points: ["Sector positioning", "Competitive moat", "Growth story"],
    color: themeColors.blue[700],
    bg: themeColors.blue[50],
    border: themeColors.blue[100],
    bar: themeColors.blue[600],
  },
  {
    icon: Users,
    title: "Management Quality",
    weight: "20%",
    description:
      "Promoter background, leadership depth, succession planning, and track record of execution evaluated by our expert panel.",
    points: ["Promoter credibility", "Leadership depth", "Execution record"],
    color: themeColors.gray[700],
    bg: themeColors.gray[50],
    border: themeColors.gray[200],
    bar: themeColors.gray[600],
  },
];

export function IRAScoreBreakdown() {
  const ref = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      style={{
        background: themeColors.gray[50],
        padding: "80px 1rem",
        borderBottom: `1px solid ${themeColors.gray[100]}`,
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 64,
            opacity: animate ? 1 : 0,
            transform: animate ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 999,
              background: themeColors.amber[50],
              border: `1px solid ${themeColors.amber[200]}`,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: themeColors.amber[500],
              }}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: themeColors.amber[700],
              }}
            >
              How We Score
            </span>
          </div>

          <h2
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: themeColors.gray[900],
              lineHeight: 1.15,
              marginBottom: 16,
              letterSpacing: "-0.02em",
            }}
          >
            What Makes Up Your{" "}
            <span
              style={{
                background: `linear-gradient(90deg, ${themeColors.amber[500]}, ${themeColors.amber[600]})`,
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              IRA Score™
            </span>
          </h2>

          <p
            style={{
              fontSize: 17,
              color: themeColors.gray[500],
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Our proprietary scoring engine evaluates four core pillars — each
            weighted by SEBI-aligned public market standards.
          </p>
        </div>

        {/* Pillars grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 24,
          }}
        >
          {pillars.map((pillar, i) => (
            <div
              key={pillar.title}
              style={{
                background: themeColors.white,
                borderRadius: 16,
                padding: 28,
                border: `1px solid ${themeColors.gray[100]}`,
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                opacity: animate ? 1 : 0,
                transform: animate ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.55s ease ${0.1 + i * 0.1}s, transform 0.55s ease ${0.1 + i * 0.1}s`,
              }}
            >
              {/* Card header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: pillar.bg,
                      border: `1.5px solid ${pillar.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <pillar.icon size={22} color={pillar.color} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: themeColors.gray[900],
                        marginBottom: 2,
                      }}
                    >
                      {pillar.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: themeColors.gray[400],
                        fontWeight: 500,
                      }}
                    >
                      Weighted contribution
                    </div>
                  </div>
                </div>

                {/* Weight badge */}
                <div
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    background: pillar.bg,
                    border: `1px solid ${pillar.border}`,
                    fontSize: 18,
                    fontWeight: 800,
                    color: pillar.color,
                    letterSpacing: "-0.02em",
                    flexShrink: 0,
                  }}
                >
                  {pillar.weight}
                </div>
              </div>

              {/* Weight bar */}
              <div
                style={{
                  height: 4,
                  background: themeColors.gray[100],
                  borderRadius: 999,
                  overflow: "hidden",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: animate ? pillar.weight : "0%",
                    background: pillar.bar,
                    borderRadius: 999,
                    transition: `width 0.9s ease ${0.3 + i * 0.1}s`,
                  }}
                />
              </div>

              {/* Description */}
              <p
                style={{
                  fontSize: 13.5,
                  color: themeColors.gray[500],
                  lineHeight: 1.65,
                  marginBottom: 16,
                }}
              >
                {pillar.description}
              </p>

              {/* Points */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {pillar.points.map((point) => (
                  <span
                    key={point}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      background: pillar.bg,
                      border: `1px solid ${pillar.border}`,
                      fontSize: 12,
                      fontWeight: 600,
                      color: pillar.color,
                    }}
                  >
                    {point}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div
          style={{
            marginTop: 40,
            padding: "20px 28px",
            borderRadius: 14,
            background: themeColors.white,
            border: `1px solid ${themeColors.gray[100]}`,
            display: "flex",
            alignItems: "center",
            gap: 16,
            opacity: animate ? 1 : 0,
            transition: "opacity 0.6s ease 0.5s",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: themeColors.amber[500],
              flexShrink: 0,
            }}
          />
          <p
            style={{
              fontSize: 13.5,
              color: themeColors.gray[500],
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            <span style={{ fontWeight: 600, color: themeColors.gray[700] }}>
              Remaining 0% is contextual:
            </span>{" "}
            Industry-specific adjustments and macroeconomic factors are applied
            dynamically by our expert review panel before finalising your IRA
            Score™.
          </p>
        </div>
      </div>
    </section>
  );
}
