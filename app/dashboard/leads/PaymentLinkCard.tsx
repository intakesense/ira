"use client";
import { useState } from "react";
import {
  updateLeadStatusOnPaymentLink,
  savePaymentLinkSentAt,
} from "@/actions/lead";

interface PaymentLinkCardProps {
  email?: string;
  name?: string | null;
  leadId: string;
  status: string;
  savedPaymentLink?: string;
  savedSentAt?: Date | null;
}

export default function PaymentLinkCard({
  email,
  name,
  leadId,
  status,
  savedPaymentLink = "",
  savedSentAt = null,
}: PaymentLinkCardProps) {
  // ── Hooks first — ALWAYS before any early return ──
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [paymentLink, setPaymentLink] = useState(savedPaymentLink);
  const [sentAt, setSentAt] = useState<Date | null>(savedSentAt);
  const [showResend, setShowResend] = useState(false);

  // Hide when payment is completed — AFTER hooks
  if (status === "COMPLETED") return null;

  const generateLink = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email,leadId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate link");

      setPaymentLink(data.link);
      await updateLeadStatusOnPaymentLink(leadId, data.link); // ← use data.link not state
    } catch (err: any) {
      alert("Failed to generate payment link: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(paymentLink);
    alert("Link copied!");
  };

  const sendEmail = async () => {
    if (!email) return alert("No email found for this company");
    if (!paymentLink) return alert("Generate link first");

    try {
      setSending(true);
      const res = await fetch("/api/send-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, link: paymentLink, name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");

      const now = new Date();
      setSentAt(now);
      setShowResend(false);

      // Save sentAt to DB so it persists on refresh
      await savePaymentLinkSentAt(leadId, now);
    } catch (err: any) {
      alert("❌ Email failed: " + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="glass space-y-4 rounded-2xl p-6">
      <h2 className="text-lg font-semibold">Generate Payment Link</h2>

      {!paymentLink && (
        <button
          onClick={generateLink}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all h-10 px-4 text-sm font-semibold text-primary-foreground"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      )}

      {paymentLink && (
        <div className="space-y-3">
          {sentAt && !showResend ? (
            <div className="space-y-2">
              <div className="text-sm text-green-500 font-medium">
                ✓ Payment link sent
              </div>
              <div className="text-xs text-foreground/50">
                Sent to <span className="font-medium">{email}</span> on{" "}
                {new Date(sentAt).toLocaleString()}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={copyLink}
                  className="text-xs text-primary hover:text-primary/80 underline"
                >
                  Copy link
                </button>
                <span className="text-xs text-foreground/30">·</span>
                <button
                  onClick={() => setShowResend(true)}
                  className="text-xs text-primary hover:text-primary/80 underline"
                >
                  Resend email
                </button>
              </div>
            </div>
          ) : showResend ? (
            <div className="space-y-2">
              <p className="text-xs text-foreground/60">
                This will resend the payment link to{" "}
                <span className="font-medium">{email}</span>.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={sendEmail}
                  disabled={sending}
                  className="flex-1 inline-flex items-center justify-center rounded-lg bg-primary px-4 h-10 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 active:scale-95 transition-all"
                >
                  {sending ? "Sending..." : "Confirm Resend"}
                </button>
                <button
                  onClick={() => setShowResend(false)}
                  className="flex-1 inline-flex items-center justify-center rounded-lg border border-border px-4 h-10 text-sm font-medium hover:bg-muted active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-500">Payment Link Ready</p>
              <div className="flex gap-2">
                <button
                  onClick={copyLink}
                  className="flex-1 inline-flex items-center justify-center rounded-lg border border-border bg-muted hover:bg-muted/70 active:scale-95 transition-all h-10 text-sm font-semibold text-foreground"
                >
                  Copy
                </button>
                <button
                  onClick={sendEmail}
                  disabled={!email || sending}
                  title={
                    !email
                      ? "No email available for this company"
                      : `Send to ${email}`
                  }
                  className="flex-1 inline-flex items-center justify-center rounded-lg bg-primary/15 hover:bg-primary/25 border border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all h-10 text-sm font-semibold text-primary"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
              {email && (
                <p className="text-xs text-gray-500 text-center">
                  Will send to{" "}
                  <span className="font-medium text-foreground/70">
                    {email}
                  </span>
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
