import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");

    if (!leadId) {
      return NextResponse.json({ error: "leadId required" }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: { leadId },
      orderBy: { createdAt: "asc" },
      take: 100, // last 100 messages
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Chat fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
