import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { cin, otp } = await req.json();

  const verification = await prisma.verification.findUnique({
    where: { identifier_value: { identifier: cin, value: otp } },
  });

  if (!verification) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
  }

  if (verification.expiresAt < new Date()) {
    return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
  }

  const lead = await prisma.lead.findUnique({
    where: { cin },
    select: { leadId: true }
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  // Delete used OTP
  await prisma.verification.delete({
    where: { identifier_value: { identifier: cin, value: otp } },
  });

  // Set cookie
  const response = NextResponse.json({ success: true });
  response.cookies.set("client_portal_lead", lead.leadId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return response;
}