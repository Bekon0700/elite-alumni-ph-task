import mongoose, { Schema, Document, Model } from "mongoose";

export interface IActivity extends Document {
  _id: mongoose.Types.ObjectId;
  action: string;
  message: string;
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    action: { type: String, required: true },
    message: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    taskId: { type: Schema.Types.ObjectId, ref: "Task" },
  },
  { timestamps: true }
);

ActivitySchema.index({ createdAt: -1 });

export const Activity: Model<IActivity> =
  mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema);
