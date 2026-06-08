import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Task } from "@/models/Task";
import { canUpdateTask } from "@/lib/rbac";
import { generateSignedUploadParams } from "@/lib/cloudinary";
import { signUploadSchema } from "@/schemas/upload.schema";
import { SessionUser } from "@/types";

const MAX_FILES = parseInt(process.env.UPLOAD_MAX_FILES_PER_TASK || "5", 10);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as SessionUser;
  const body = await req.json();

  const parsed = signUploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { taskId } = parsed.data;

  await connectDB();
  const task = await Task.findById(taskId);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (!canUpdateTask(user, task.assigneeId?.toString() || "", task.status)) {
    return NextResponse.json({ error: "You cannot attach files to this task." }, { status: 403 });
  }

  if (task.status === "COMPLETED") {
    return NextResponse.json({ error: "Cannot attach files to completed tasks." }, { status: 400 });
  }

  if (task.attachments && task.attachments.length >= MAX_FILES) {
    return NextResponse.json({ error: "Maximum attachments reached for this task." }, { status: 400 });
  }

  const params = generateSignedUploadParams(taskId);
  return NextResponse.json(params);
}
