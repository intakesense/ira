"use client";
import { useState } from "react";
import { sendClientPortalAccess } from "@/actions/lead";

interface Props {
  leadId: string;
}

interface Props {
  leadId: string;
}

export default function SendPortalAccessButton({ leadId }: Props) {
  const [loading, setLoading] = useState(false);
  const [sentAt, setSentAt] = useState<Date | null>();
  const [showResend, setShowResend] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      const result = await sendClientPortalAccess(leadId);
      if (result.success) {
        setSentAt(new Date());
        setShowResend(false);
        alert("✅ Portal access email sent successfully!");
      } else {
        alert("❌ Failed: " + result.error);
      }
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Already sent — show sent status + resend option
  if (sentAt && !showResend) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-green-500 font-medium">
          ✓ Portal access sent
        </div>
        <div className="text-xs text-foreground/50">
          Sent on {new Date(sentAt).toLocaleString()}
        </div>
        <button
          onClick={() => setShowResend(true)}
          className="text-xs text-primary hover:text-primary/80 underline"
        >
          Resend email
        </button>
      </div>
    );
  }

  // Resend confirmation
  if (showResend) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-foreground/60">
          This will generate a new password and resend the email.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleClick}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center rounded-lg bg-green-600 px-4 h-10 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 active:scale-95 transition-all"
          >
            {loading ? "Sending..." : "Confirm Resend"}
          </button>
          <button
            onClick={() => setShowResend(false)}
            className="flex-1 inline-flex items-center justify-center rounded-lg border border-border px-4 h-10 text-sm font-medium hover:bg-muted active:scale-95 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // First time send
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 h-10 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all w-full"
    >
      {loading ? "Sending..." : "✓ Send Portal Access"}
    </button>
  );
}
