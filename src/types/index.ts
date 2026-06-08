import { Types } from "mongoose";

export type Role = "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER";

export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ON_HOLD";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";

export type TaskPriority = "HIGH" | "MEDIUM" | "LOW";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Attachment {
  publicId: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
}
