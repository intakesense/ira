"use client";
import { useState } from "react";
import { updateLeadStatusOnPaymentLink } from "@/actions/lead";

interface PaymentLinkCardProps {
  email?: string;
  name?: string | null;
  leadId: string;
}

export default function PaymentLinkCard({ email, name, leadId }: PaymentLinkCardProps) {
  const [loading, setLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState("");

  const generateLink = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      setPaymentLink(data.link);
      await updateLeadStatusOnPaymentLink(leadId);

    } catch (err) {
      alert("Failed to generate payment link");
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
      const res = await fetch("/api/send-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, link: paymentLink, name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");

      alert("✅ Email sent successfully!");
    } catch (err: any) {
      alert("❌ Email failed: " + err.message);
    }
  };

  return (
    <div className="glass space-y-4 rounded-2xl p-6">
      <h2 className="text-lg font-semibold">Generate Payment Link</h2>

      {/* Generate button */}
      <button
        onClick={generateLink}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all h-10 px-4 text-sm font-semibold text-primary-foreground"
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {paymentLink && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">Payment Link Ready</p>

          <div className="flex gap-2">
            {/* Copy */}
            <button
              onClick={copyLink}
              className="flex-1 inline-flex items-center justify-center rounded-lg border border-border bg-muted hover:bg-muted/70 active:scale-95 transition-all h-10 text-sm font-semibold text-foreground"
            >
              Copy
            </button>

            {/* Send Email */}
            <button
              onClick={sendEmail}
              disabled={!email}
              title={
                !email
                  ? "No email available for this company"
                  : `Send to ${email}`
              }
              className="flex-1 inline-flex items-center justify-center rounded-lg bg-primary/15 hover:bg-primary/25 border border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all h-10 text-sm font-semibold text-primary"
            >
              Send
            </button>
          </div>

          {email && (
            <p className="text-xs text-gray-500 text-center">
              Will send to{" "}
              <span className="font-medium text-foreground/70">{email}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
