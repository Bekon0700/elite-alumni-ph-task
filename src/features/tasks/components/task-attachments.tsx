"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileIcon, ExternalLink, Paperclip, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { isActionError } from "@/lib/action-result";
import { FileUpload } from "./file-upload";
import { deleteAttachmentAction } from "../actions";
import { Attachment } from "@/types";

interface TaskAttachmentsProps {
  taskId: string;
  attachments: Attachment[];
  canUpload: boolean;
  canDelete: boolean;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TaskAttachments({
  taskId,
  attachments,
  canUpload,
  canDelete,
}: TaskAttachmentsProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(publicId: string, fileName: string) {
    if (!confirm(`Remove "${fileName}" from this task?`)) return;

    setDeletingId(publicId);
    startTransition(async () => {
      const result = await deleteAttachmentAction(taskId, publicId);
      setDeletingId(null);

      if (isActionError(result)) {
        toast.error(result.error);
        return;
      }

      toast.success("Attachment removed");
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Paperclip className="h-4 w-4" />
        Attachments ({attachments.length}/5)
      </h4>

      {attachments.length > 0 && (
        <ul className="space-y-2">
          {attachments.map((file) => {
            const isDeleting = isPending && deletingId === file.publicId;

            return (
              <li
                key={file.publicId}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
              >
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-md transition-colors hover:bg-accent/50 -my-1 py-1"
                >
                  <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate hover:underline">{file.fileName}</p>
                    <p className="text-xs text-muted-foreground">{formatSize(file.sizeBytes)}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                </a>

                {canDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    disabled={isDeleting}
                    onClick={() => handleDelete(file.publicId, file.fileName)}
                    aria-label={`Remove ${file.fileName}`}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </li>
            );
          })}
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
