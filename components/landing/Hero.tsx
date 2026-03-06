"use client";

import { ArrowRight, TrendingUp, Shield, BarChart3, Award } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { colors as themeColors } from "@/lib/theme/colors";
import HeroCosmicBg from "./HeroCosmicBg";
import { DisclaimerModal } from "./DisclaimerModal";

interface HeroProps {
  onStartAssessment: () => void;
}

export const Hero = ({ onStartAssessment }: HeroProps) => {
  const scores = [92, 87, 32];
  const [scoreIndex, setScoreIndex] = useState(0);
  const score = scores[scoreIndex];
const [showDisclaimer, setShowDisclaimer] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setScoreIndex((prev) => (prev + 1) % scores.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        background: `linear-gradient(
          135deg,
          ${themeColors.brand[950]},
          ${themeColors.brand[900]},
          ${themeColors.brand[800]}
        )`,
        color: themeColors.white,
        overflow: "hidden",
      }}
    >
      <HeroCosmicBg />
      {/* BACKGROUND GLOWS */}
      <div style={{ position: "absolute", inset: 0 }}>
        <div
          style={{
            position: "absolute",
            top: "-40%",
            right: "-20%",
            width: 400,
            height: 400,
            background: themeColors.blue[800],
            opacity: 0.2,
            borderRadius: "50%",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-40%",
            left: "-20%",
            width: 400,
            height: 400,
            background: themeColors.blue[600],
            opacity: 0.15,
            borderRadius: "50%",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* CONTENT */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "5rem 1rem",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "center",
           
          }}
        >
          {/* LEFT */}
          <div>
            {/* <div
              style={{
                display: "inline-flex",
                gap: 8,
                alignItems: "center",
                padding: "8px 16px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                marginBottom: 24,
              }}
            >
              <TrendingUp size={16} color={themeColors.amber[400]} />
              <span style={{ fontSize: 14 }}>
                Trusted by Apollo Green Energy
              </span>
            </div> */}

            <h1
              style={{
                fontSize: 56,
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: 24,
              }}
            >
              From Private Enterprise to{" "}
              <span
                style={{
                  background: `linear-gradient(
                    90deg,
                    ${themeColors.amber[100]}, 
                    ${themeColors.amber[500]},
                    ${themeColors.amber[600]}
                  )`,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Public Legacy
              </span>
            </h1>

            <p
              style={{
                fontSize: 20,
                color: themeColors.blue[100],
                maxWidth: 520,
                marginBottom: 32,
              }}
            >
              Unlock your company’s IPO readiness with our AI-powered IRA
              Score™.
            </p>

            <div
              style={{
                display: "flex",
                gap: 16,
                marginBottom: 48,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {/* Primary Button */}
              <button
onClick={() => setShowDisclaimer(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: "14px 32px",
                  borderRadius: 14,
                  border: "none",
                  background: `linear-gradient(
                    90deg,
                    ${themeColors.amber[500]},
                    ${themeColors.amber[600]}
                  )`,
                  color: themeColors.white,
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: 1,
                  cursor: "pointer",
                  boxShadow: "0 12px 28px rgba(245,158,11,0.35)",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 18px 40px rgba(245,158,11,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 28px rgba(245,158,11,0.35)";
                }}
              >
                Check Eligibility Free
                <ArrowRight size={18} />
              </button>

              {/* Secondary Button */}
              <Link
                href="/methodology"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14px 32px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.35)",
                  background: "rgba(255,255,255,0.08)",
                  color: themeColors.white,
                  fontSize: 16,
                  fontWeight: 500,
                  lineHeight: 1,
                  textDecoration: "none",
                  backdropFilter: "blur(6px)",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.16)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Learn about IRA Tool
              </Link>
            </div>

            {/* TRUST */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 24,
                borderTop: "1px solid rgba(255,255,255,0.1)",
                paddingTop: 32,
              }}
            >
              {[Shield, BarChart3, Award].map((Icon, i) => (
                <div key={i} style={{ display: "flex", gap: 8 }}>
                  <Icon size={20} color={themeColors.amber[400]} />
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {["Secure", "AI-Powered", "Trusted"][i]}
                    </div>
                    <div style={{ fontSize: 12, color: themeColors.blue[200] }}>
                      {["100% Safe", "Smart Analysis", "Expert Backed"][i]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT CARD */}
          <div style={{ position: "relative",top:25 }}>
            <div
              style={{
                background: themeColors.white,
                borderRadius: 20,
                padding: 32,
                color: themeColors.gray[900],
                boxShadow: "0 40px 80px rgba(0,0,0,0.25)",
              }}
            >
              {/* HEADER */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 32,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, color: themeColors.gray[500] }}>
                    Company Assessment
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>
                    IRA Score™
                  </div>
                </div>
                <div
                  style={{
                    background: themeColors.green[100],
                    color: themeColors.green[700],
                    padding: "20px 16px",
                    borderRadius: 999,
                    fontWeight: 700,
                  }}
                >
                  IPO READY
                </div>
              </div>

              {/* SCORE */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "end" }}>
                  <div style={{ fontSize: 64, fontWeight: 700 }}>{score}</div>
                  <div style={{ fontSize: 28, color: themeColors.gray[400] }}>
                    /100
                  </div>
                </div>

                <div
                  style={{
                    height: 12,
                    background: themeColors.gray[200],
                    borderRadius: 999,
                    overflow: "hidden",
                    marginTop: 12,
                  }}
                >
                  <div
                    style={{
                      width: `${score}%`,
                      height: "100%",
                      background: `linear-gradient(
                        90deg,
                        ${themeColors.blue[700]},
                        ${themeColors.blue[600]}
                      )`,
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>

              {/* Metrics */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {[
                  {
                    icon: BarChart3,
                    title: "Financial Health",
                    sub: "Strong indicators",
                    value: "95%",
                    color: themeColors.blue[700],
                    bg: themeColors.blue[100],
                  },
                  {
                    icon: Shield,
                    title: "Compliance",
                    sub: "All requirements met",
                    value: "98%",
                    color: themeColors.amber[600],
                    bg: themeColors.amber[100],
                  },
                  {
                    icon: TrendingUp,
                    title: "Market Readiness",
                    sub: "Excellent position",
                    value: "89%",
                    color: themeColors.blue[600],
                    bg: themeColors.blue[100],
                  },
                ].map((m) => (
                  <div
                    key={m.title}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{ display: "flex", gap: 12, alignItems: "center" }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          backgroundColor: m.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <m.icon size={20} color={m.color} />
                      </div>

                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>
                          {m.title}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: themeColors.gray[500],
                          }}
                        >
                          {m.sub}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: m.color,
                      }}
                    >
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FLOATING BADGE */}
            <div
              style={{
                position: "absolute",
                top: -20,
                right: -16,
                background: `linear-gradient(
                  135deg,
                  ${themeColors.blue[200]},
                  ${themeColors.blue[700]}
                )`,
                padding: "12px 24px",
                borderRadius: 12,
                transform: "rotate(3deg)",
                fontWeight: 800,
                color: themeColors.white,
                boxShadow: "0 12px 30px rgba(37, 99, 235, 0.45)",
                border: `1px solid ${themeColors.blue[200]}`,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              FREE
              <div style={{ fontSize: 13 }}>Assessment</div>
            </div>
          </div>
        </div>
      </div>
      {/* Disclaimer Gate */}
      {showDisclaimer && (
        <DisclaimerModal
          onAgree={() => {
            setShowDisclaimer(false);
            onStartAssessment(); // proceeds to score form
          }}
          onDecline={() => setShowDisclaimer(false)}
          onClose={() => setShowDisclaimer(false)}
        />
      )}
    </div>
  );
};
