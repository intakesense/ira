// app/api/documents/upload/route.ts
// Client-side document upload endpoint for client portal
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const leadId = formData.get("leadId") as string | null; // this is lead.id (cuid)

    // ── Validation ──────────────────────────────────────────────────────────
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!leadId) {
      return NextResponse.json(
        { error: "No leadId provided" },
        { status: 400 },
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 10MB." },
        { status: 400 },
      );
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF and Excel files are allowed." },
        { status: 400 },
      );
    }

    // ── Verify lead exists ──────────────────────────────────────────────────
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // ── Determine file type for DB enum ────────────────────────────────────
    const fileType = file.type === "application/pdf" ? "PDF" : "EXCEL";

    // ── Upload to Vercel Blob ───────────────────────────────────────────────
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const blobPath = `documents/${leadId}/${Date.now()}_${safeName}`;

    const blob = await put(blobPath, file, {
      access: "public",
      contentType: file.type,
    });

    // ── Save to DB ──────────────────────────────────────────────────────────
    const document = await prisma.document.create({
      data: {
        leadId,
        fileName: file.name,
        fileUrl: blob.url,
        fileType,
        fileSize: file.size,
        uploadedById: lead.createdById,
        source: "CLIENT",
      },
    });

    // ── Revalidate both dashboards instantly ────────────────────────────────
    revalidatePath(`/dashboard/leads/${lead.leadId}`);
    revalidatePath(`/dashboard/leads`);
    revalidatePath(`/client-portal`);

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
