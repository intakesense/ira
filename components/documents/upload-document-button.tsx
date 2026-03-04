"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { uploadDocument } from "@/actions/documents";
import { toast } from "sonner";

export function UploadDocumentButton({ leadId }: { leadId: string }) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const result = await uploadDocument({ leadId }, file);

      if (result.success) {
        toast.success("Document uploaded successfully");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset input
    }
  }

  return (
    <div>
      <input
        type="file"
        id="document-upload"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx"
        onChange={handleUpload}
        disabled={uploading}
      />

      <label
        htmlFor="document-upload"
        className={`inline-flex items-center justify-center gap-2 rounded-lg border border-foreground/10 px-4 py-2 text-sm font-medium transition-all ${
          uploading
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer hover:bg-foreground/5 active:scale-95"
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            <span className="hidden md:inline">Upload Document</span>
            <span className="md:hidden">Upload</span>
          </>
        )}
      </label>
    </div>
  );
}
