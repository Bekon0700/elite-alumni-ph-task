import { z } from "zod";

const MAX_SIZE_MB = parseInt(process.env.UPLOAD_MAX_SIZE_MB || "10", 10);
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

export const signUploadSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number().max(MAX_SIZE_BYTES, `File must be under ${MAX_SIZE_MB}MB.`),
  mimeType: z.string().refine(
    (val) => ALLOWED_MIME_TYPES.includes(val) || val.startsWith("image/"),
    "File type not supported."
  ),
});

export const confirmUploadSchema = z.object({
  taskId: z.string().min(1),
  publicId: z.string().min(1),
  secureUrl: z.string().url(),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().positive(),
});

export type SignUploadInput = z.infer<typeof signUploadSchema>;
export type ConfirmUploadInput = z.infer<typeof confirmUploadSchema>;
