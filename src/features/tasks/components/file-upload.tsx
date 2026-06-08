"use client";

import { useState, useRef } from "react";
import { Upload, X, FileIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf", "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

interface FileUploadProps {
  taskId: string;
  currentCount: number;
  onUploadComplete?: () => void;
}

export function FileUpload({ taskId, currentCount, onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.size > MAX_SIZE_BYTES) {
      toast.error(`File must be under ${MAX_SIZE_MB}MB.`);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type) && !file.type.startsWith("image/")) {
      toast.error("File type not supported.");
      return;
    }

    if (currentCount >= 5) {
      toast.error("Maximum attachments reached for this task.");
      return;
    }

    setUploading(true);
    try {
      const signRes = await fetch("/api/upload/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        }),
      });

      if (!signRes.ok) {
        const err = await signRes.json();
        toast.error(err.error || "Failed to prepare upload");
        return;
      }

      const { signature, timestamp, folder, public_id, cloudName, apiKey } = await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp.toString());
      formData.append("folder", folder);
      formData.append("public_id", public_id);
      formData.append("api_key", apiKey);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        { method: "POST", body: formData }
      );

      if (!uploadRes.ok) {
        toast.error("Upload to storage failed");
        return;
      }

      const uploadData = await uploadRes.json();

      const confirmRes = await fetch("/api/upload/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          publicId: uploadData.public_id,
          secureUrl: uploadData.secure_url,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: uploadData.bytes,
        }),
      });

      if (!confirmRes.ok) {
        const err = await confirmRes.json();
        toast.error(err.error || "Failed to confirm upload");
        return;
      }

      toast.success("File uploaded successfully");
      onUploadComplete?.();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
        dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {uploading ? (
        <div className="flex items-center justify-center gap-2 py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Uploading...</span>
        </div>
      ) : (
        <>
          <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag & drop or click to upload
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            Choose File
          </Button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleInputChange}
            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Max {MAX_SIZE_MB}MB • {5 - currentCount} slots remaining
          </p>
        </>
      )}
    </div>
  );
}
