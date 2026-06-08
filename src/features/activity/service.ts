import { connectDB } from "@/lib/db";
import { Activity } from "@/models/Activity";

interface LogActivityParams {
  action: string;
  message: string;
  userId: string;
  projectId?: string;
  taskId?: string;
}

export async function logActivity(params: LogActivityParams) {
  await connectDB();
  return Activity.create(params);
}

export async function getRecentActivities(limit = 10) {
  await connectDB();
  return Activity.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("userId", "name")
    .lean();
}
