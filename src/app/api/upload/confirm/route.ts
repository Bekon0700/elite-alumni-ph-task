import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Task } from "@/models/Task";
import { canUpdateTask } from "@/lib/rbac";
import { verifyUploadedAsset } from "@/lib/cloudinary";
import { confirmUploadSchema } from "@/schemas/upload.schema";
import { logActivity } from "@/features/activity/service";
import { SessionUser } from "@/types";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as SessionUser;
  const body = await req.json();

  const parsed = confirmUploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { taskId, publicId, secureUrl, fileName, mimeType, sizeBytes } = parsed.data;

  if (!publicId.includes(taskId)) {
    return NextResponse.json({ error: "Invalid upload path" }, { status: 400 });
  }

  await connectDB();
  const task = await Task.findById(taskId);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (!canUpdateTask(user, task.assigneeId?.toString() || "", task.status)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const asset = await verifyUploadedAsset(publicId);
  if (!asset) {
    return NextResponse.json({ error: "Upload verification failed" }, { status: 400 });
  }

  task.attachments.push({
    publicId,
    url: secureUrl,
    fileName,
    mimeType,
    sizeBytes,
    uploadedBy: user.id as unknown as import("mongoose").Types.ObjectId,
    uploadedAt: new Date(),
  });
  await task.save();

  await logActivity({
    action: "FILE_ATTACHED",
    message: `File "${fileName}" attached to task "${task.title}"`,
    userId: user.id,
    projectId: task.projectId.toString(),
    taskId: task._id.toString(),
  });

  return NextResponse.json({ success: true });
}
