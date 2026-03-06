// app/api/send-payment-link/route.ts
import { NextResponse } from "next/server";
import { sendPaymentLinkEmail } from "@/lib/email"; // Adjust path as needed

export async function POST(req: Request) {
  try {
    const { email, link, amount, description, name } = await req.json();

    if (!email || !link) {
      return NextResponse.json(
        { error: "Email and link are required" },
        { status: 400 }
      );
    }
const baseAmount = 50000;
const gst = Math.round(baseAmount * 0.18);
const total = baseAmount + gst;
    // Send email using centralized service
    const result = await sendPaymentLinkEmail({
    recipientEmail: email,
    recipientName: name,                          
    paymentLink: link,
    amount: total.toLocaleString("en-IN"),                                
    items: [
    { label: "IRA Score Improvement Plan", amount: "₹50,000" },
    { label: "GST (18%)", amount: `₹${gst.toLocaleString("en-IN")}` },  // "₹9,000"
  ],
description: "We've reviewed your IRA Score and have prepared a personalised improvement plan for you. Complete the steps below to get started."
  });

    if (!result.success) {
      console.error("Failed to send payment link email:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      messageId: result.messageId
    });

  } catch (error: any) {
    console.error("Error sending payment link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}