import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { LeadStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.event !== "payment.captured") {
      return NextResponse.json({ received: true });
    }

    const payment = event.payload.payment.entity;
    const email = payment.email;

    const lead = await prisma.lead.findFirst({
      where: { email },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: LeadStatus.COMPLETED },
    });

    await prisma.auditLog.create({
      data: {
        userId: lead.createdById,
        leadId: lead.id,
        action: "LEAD_STATUS_UPDATED",
        details: {
          oldStatus: lead.status,
          newStatus: LeadStatus.COMPLETED,
          trigger: "razorpay_payment_captured",
          paymentId: payment.id,
          amount: payment.amount,
        },
      },
    });

    revalidatePath(`/dashboard/leads/${lead.leadId}`);
    revalidatePath("/dashboard/leads");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}