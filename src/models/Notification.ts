import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  message: string;
  type: "TASK_ASSIGNED" | "STATUS_CHANGE" | "COMMENT" | "MEMBER_ADDED";
  read: boolean;
  relatedProjectId?: mongoose.Types.ObjectId;
  relatedTaskId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["TASK_ASSIGNED", "STATUS_CHANGE", "COMMENT", "MEMBER_ADDED"],
      required: true,
    },
    read: { type: Boolean, default: false },
    relatedProjectId: { type: Schema.Types.ObjectId, ref: "Project" },
    relatedTaskId: { type: Schema.Types.ObjectId, ref: "Task" },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
