"use client";

import { useRouter } from "next/navigation";
import { FileIcon, ExternalLink, Paperclip } from "lucide-react";
import { FileUpload } from "./file-upload";
import { Attachment } from "@/types";

interface TaskAttachmentsProps {
  taskId: string;
  attachments: Attachment[];
  canUpload: boolean;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TaskAttachments({ taskId, attachments, canUpload }: TaskAttachmentsProps) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Paperclip className="h-4 w-4" />
        Attachments ({attachments.length}/5)
      </h4>

      {attachments.length > 0 && (
        <ul className="space-y-2">
          {attachments.map((file) => (
            <li
              key={file.publicId}
              className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm"
            >
              <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.fileName}</p>
                <p className="text-xs text-muted-foreground">{formatSize(file.sizeBytes)}</p>
              </div>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </li>
          ))}
        </ul>
      )}

      {attachments.length === 0 && (
        <p className="text-sm text-muted-foreground">No attachments yet.</p>
      )}

      {canUpload && attachments.length < 5 && (
        <FileUpload
          taskId={taskId}
          currentCount={attachments.length}
          onUploadComplete={() => router.refresh()}
        />
      )}
    </div>
  );
}
