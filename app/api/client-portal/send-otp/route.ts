import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { cin } = await req.json();

  const lead = await prisma.lead.findUnique({
    where: { cin },
    select: { email: true, status: true, contactPerson: true }
  });

  if (!lead || lead.status !== "COMPLETED") {
    return NextResponse.json({ error: "No active portal found for this CIN" }, { status: 404 });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store in Verification table
  await prisma.verification.upsert({
    where: { identifier_value: { identifier: cin, value: otp } },
    update: { expiresAt },
    create: { identifier: cin, value: otp, expiresAt },
  });

  // Send OTP email
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "IRA Platform <noreply@irascore.com>",
    to: lead.email,
    subject: "Your IPO Portal OTP",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Your One-Time Password</h2>
        <p>Dear ${lead.contactPerson},</p>
        <p>Use this OTP to login to your IPO Readiness Portal:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 12px; padding: 24px; background: #f3f4f6; border-radius: 12px; text-align: center; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 13px;">This OTP expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
  });

  return NextResponse.json({ success: true });
}