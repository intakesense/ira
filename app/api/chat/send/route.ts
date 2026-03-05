import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  try {
    const { leadId, content, senderType, senderName } = await req.json();

    if (!leadId || !content || !senderType || !senderName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Verify lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { id: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Save message to DB
    const message = await prisma.message.create({
      data: {
        leadId,
        content,
        senderType, // "CLIENT" or "TEAM"
        senderName,
      },
    });

    // Trigger Pusher event on lead-specific channel
    await pusherServer.trigger(`lead-${leadId}`, "new-message", {
      id: message.id,
      content: message.content,
      senderType: message.senderType,
      senderName: message.senderName,
      createdAt: message.createdAt,
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("Chat send error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}