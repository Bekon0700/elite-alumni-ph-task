import mongoose, { Schema, Document, Model } from "mongoose";
import { TaskStatus, TaskPriority, Attachment } from "@/types";

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  assigneeId?: mongoose.Types.ObjectId;
  dueDate: Date;
  priority: TaskPriority;
  status: TaskStatus;
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema(
  {
    publicId: { type: String, required: true },
    url: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TaskSchema = new Schema<ITask>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    assigneeId: { type: Schema.Types.ObjectId, ref: "User" },
    dueDate: { type: Date, required: true },
    priority: { type: String, enum: ["HIGH", "MEDIUM", "LOW"], default: "MEDIUM" },
    status: { type: String, enum: ["TODO", "IN_PROGRESS", "COMPLETED"], default: "TODO" },
    attachments: [AttachmentSchema],
  },
  { timestamps: true }
);

TaskSchema.index({ projectId: 1, title: 1 }, { unique: true });
TaskSchema.index({ projectId: 1, status: 1 });
TaskSchema.index({ assigneeId: 1, status: 1 });
TaskSchema.index({ dueDate: 1 });

export const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
