import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { LeadStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  console.log("🔔 Webhook hit");
  console.log("Secret loaded:", !!process.env.RAZORPAY_WEBHOOK_SECRET);

  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.log("❌ Signature mismatch");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log("✅ Event:", event.event);

    if (event.event !== "payment.captured") {
      return NextResponse.json({ received: true });
    }

    const payment = event.payload.payment.entity;
    const leadId = payment.notes?.leadId;
    console.log("📝 leadId from notes:", leadId);

    const lead = await prisma.lead.findUnique({
      where: { leadId },
    });
    // const email = payment.email || payment.notes?.email; console.log("💳 Payment email:", payment?.email);

    // const lead = await prisma.lead.findFirst({
    //   where: { email },
    // });
    console.log("👤 Lead found:", !!lead);

    if (!lead) {
      console.log("❌ No leadId found in payment notes");
      return NextResponse.json(
        { error: "Missing leadId in notes" },
        { status: 400 },
      );
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
