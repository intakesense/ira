// app/api/documents/delete/route.ts
// Client-side document delete endpoint for client portal
import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function DELETE(req: NextRequest) {
  try {
    const { documentId, leadId } = await req.json();

    if (!documentId || !leadId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { lead: true },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Verify document belongs to this lead (security check)
    if (document.leadId !== leadId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete from Vercel Blob
    await del(document.fileUrl);

    // Delete from DB
    await prisma.document.delete({ where: { id: documentId } });

    revalidatePath(`/client-portal`);
    revalidatePath(`/dashboard/leads/${document.lead.leadId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
