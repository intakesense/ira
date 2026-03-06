"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ─── Step Types ───────────────────────────────────────────────────────────────
type Step = "cin" | "otp";

// ─── Animated Background Dots ─────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "15%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)",
          animation: "float1 8s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "10%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(29,78,216,0.08) 0%, transparent 70%)",
          animation: "float2 10s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "25%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)",
          animation: "float3 12s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-30px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-25px,20px)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(15px,25px)} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeSlideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

// ─── OTP Input ────────────────────────────────────────────────────────────────
function OTPInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
const digits = Array.from({ length: 6 }, (_, i) => value?.[i] ?? "");
  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const newDigits = [...digits];
    newDigits[i] = v.slice(-1);
    const newValue = newDigits.join("").replace(/ /g, "");
    onChange(newValue);
    if (v && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pasted);
    if (pasted.length === 6) inputs.current[5]?.focus();
    e.preventDefault();
  };

  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          style={{
            width: 48,
            height: 56,
            textAlign: "center",
            fontSize: 22,
            fontWeight: 700,
            borderRadius: 12,
            border: `2px solid ${digits[i] && digits[i] !== " " ? "#2563eb" : "rgba(255,255,255,0.1)"}`,
            background:
              digits[i] && digits[i] !== " "
                ? "rgba(37,99,235,0.15)"
                : "rgba(255,255,255,0.04)",
            color: "#e8f0ff",
            outline: "none",
            transition: "all 0.2s",
            fontFamily: "'DM Mono', monospace",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Login Page ──────────────────────────────────────────────────────────
export default function ClientPortalLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("cin");
  const [cin, setCin] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [mounted, setMounted] = useState(false);
  const cinRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
  const timer = setTimeout(() => {
    cinRef.current?.focus();
  }, 600);

  return () => clearTimeout(timer);
}, []);
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((r) => r - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  // Auto-submit OTP when all 6 digits entered
  useEffect(() => {
    if (otp.length === 6 && step === "otp") {
      handleVerifyOTP();
    }
  }, [otp]);

  const handleSendOTP = async () => {
    const cinTrimmed = cin.trim().toUpperCase();
    if (!cinTrimmed) return setError("Please enter your CIN");
    if (!/^[UL][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(cinTrimmed)) {
      return setError("Invalid CIN format (e.g. U12345MH2020PTC123456)");
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/client-portal/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cin: cinTrimmed }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      setStep("otp");
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6)
      return setError("Please enter the complete 6-digit OTP");

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/client-portal/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cin: cin.trim().toUpperCase(), otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");

      // Redirect to dashboard with leadId
      router.push("/client-portal");
    } catch (err: any) {
      setError(err.message);
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtp("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/client-portal/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cin: cin.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend OTP");
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#03122b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        padding: 20,
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #082d6b inset !important; -webkit-text-fill-color: #e8f0ff !important; }
      `}</style>

      <FloatingOrbs />

      {/* Grid pattern overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          opacity: 0.03,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 440,
          animation: "fadeSlideUp 0.6s cubic-bezier(0.4,0,0.2,1) both",
        }}
      >
        {/* Logo / Brand */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 16,
              marginBottom: 16,
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              boxShadow: "0 8px 32px rgba(37,99,235,0.4)",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 6l-9.5 9.5-5-5L1 18" />
              <path d="M17 6h6v6" />
            </svg>
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            IPO Readiness Platform
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#e8f0ff",
              fontFamily: "'Playfair Display', Georgia, serif",
              lineHeight: 1.2,
            }}
          >
            Client Portal
          </h1>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: "rgba(5,29,69,0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(37,99,235,0.25)",
            borderRadius: 24,
            padding: 36,
            boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
          }}
        >
          {/* Step Indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 28,
            }}
          >
            {["cin", "otp"].map((s, i) => (
              <div
                key={s}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flex: i === 0 ? 1 : undefined,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    background:
                      step === s
                        ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                        : s === "cin" && step === "otp"
                          ? "rgba(37,99,235,0.3)"
                          : "rgba(255,255,255,0.06)",
                    color:
                      step === s
                        ? "#fff"
                        : s === "cin" && step === "otp"
                          ? "#7a9cc4"
                          : "rgba(255,255,255,0.3)",
                    border: `2px solid ${step === s ? "#2563eb" : s === "cin" && step === "otp" ? "rgba(37,99,235,0.4)" : "rgba(255,255,255,0.08)"}`,
                    transition: "all 0.3s",
                  }}
                >
                  {s === "cin" && step === "otp" ? (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: step === s ? "#7a9cc4" : "rgba(255,255,255,0.25)",
                    fontWeight: step === s ? 500 : 400,
                  }}
                >
                  {s === "cin" ? "Enter CIN" : "Verify OTP"}
                </span>
                {i === 0 && (
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background:
                        step === "otp"
                          ? "rgba(37,99,235,0.4)"
                          : "rgba(255,255,255,0.06)",
                      margin: "0 4px",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ── Step 1: CIN ── */}
          {step === "cin" && (
            <div style={{ animation: "fadeSlideDown 0.3s ease both" }}>
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#e8f0ff",
                    marginBottom: 6,
                  }}
                >
                  Enter your Company CIN
                </div>
                <div
                  style={{ fontSize: 13, color: "#7a9cc4", lineHeight: 1.5 }}
                >
                  We'll send a one-time password to your registered email
                  address.
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#7a9cc4",
                    marginBottom: 8,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  CIN Number
                </label>
                <input
                  ref={cinRef}
                  type="text"
                  value={cin}
                  onChange={(e) => {
                    setCin(e.target.value.toUpperCase());
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                  placeholder="U12345MH2020PTC123456"
                  maxLength={21}
                  style={{
                    width: "100%",
                    height: 52,
                    padding: "0 16px",
                    borderRadius: 12,
                    fontSize: 14,
                    fontFamily: "'DM Mono', monospace",
                    letterSpacing: "0.08em",
                    fontWeight: 500,
                    background: "rgba(255,255,255,0.04)",
                    border: `2px solid ${error ? "rgba(239,68,68,0.5)" : cin ? "rgba(37,99,235,0.5)" : "rgba(255,255,255,0.08)"}`,
                    color: "#e8f0ff",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                />
              </div>

              {error && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    marginBottom: 16,
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span style={{ fontSize: 13, color: "#ef4444" }}>
                    {error}
                  </span>
                </div>
              )}

              <button
                onClick={handleSendOTP}
                disabled={loading}
                style={{
                  width: "100%",
                  height: 52,
                  borderRadius: 12,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  background: loading
                    ? "rgba(37,99,235,0.4)"
                    : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: loading
                    ? "none"
                    : "0 8px 24px rgba(37,99,235,0.3)",
                  transition: "all 0.2s",
                  transform: "scale(1)",
                }}
                onMouseEnter={(e) => {
                  if (!loading)
                    (e.target as HTMLButtonElement).style.transform =
                      "scale(1.01)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.transform = "scale(1)";
                }}
              >
                {loading ? (
                  <>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ── Step 2: OTP ── */}
          {step === "otp" && (
            <div style={{ animation: "fadeSlideDown 0.3s ease both" }}>
              <div style={{ marginBottom: 28 }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#e8f0ff",
                    marginBottom: 6,
                  }}
                >
                  Check your email
                </div>
                <div
                  style={{ fontSize: 13, color: "#7a9cc4", lineHeight: 1.6 }}
                >
                  We sent a 6-digit OTP to the email registered with{" "}
                  <span
                    style={{
                      color: "#e8f0ff",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 12,
                    }}
                  >
                    {cin}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <OTPInput value={otp} onChange={setOtp} disabled={loading} />
              </div>

              {error && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    marginBottom: 16,
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span style={{ fontSize: 13, color: "#ef4444" }}>
                    {error}
                  </span>
                </div>
              )}

              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                style={{
                  width: "100%",
                  height: 52,
                  borderRadius: 12,
                  border: "none",
                  cursor:
                    loading || otp.length !== 6 ? "not-allowed" : "pointer",
                  background:
                    loading || otp.length !== 6
                      ? "rgba(37,99,235,0.3)"
                      : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow:
                    loading || otp.length !== 6
                      ? "none"
                      : "0 8px 24px rgba(37,99,235,0.3)",
                  transition: "all 0.2s",
                  marginBottom: 16,
                }}
              >
                {loading ? (
                  <>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    Verifying...
                  </>
                ) : (
                  "Verify & Login"
                )}
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <button
                  onClick={() => {
                    setStep("cin");
                    setOtp("");
                    setError("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#7a9cc4",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                  </svg>
                  Change CIN
                </button>

                <button
                  onClick={handleResend}
                  disabled={resendTimer > 0 || loading}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: resendTimer > 0 ? "not-allowed" : "pointer",
                    fontSize: 13,
                    color: resendTimer > 0 ? "#3d6190" : "#2563eb",
                    fontWeight: 500,
                    transition: "color 0.2s",
                  }}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: 12,
            color: "rgba(255,255,255,0.2)",
          }}
        >
          Secured by IRA Platform · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
