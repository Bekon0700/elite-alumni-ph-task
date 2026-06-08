"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Comment } from "@/models/Comment";
import { Task } from "@/models/Task";
import { Notification } from "@/models/Notification";
import { logActivity } from "@/features/activity/service";
import { SessionUser } from "@/types";

export async function addComment(taskId: string, content: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const user = session.user as SessionUser;

  if (!content.trim()) return { error: "Comment cannot be empty" };

  await connectDB();

  const task = await Task.findById(taskId);
  if (!task) return { error: "Task not found" };

  const comment = await Comment.create({
    taskId,
    userId: user.id,
    content: content.trim(),
  });

  if (task.assigneeId && task.assigneeId.toString() !== user.id) {
    await Notification.create({
      userId: task.assigneeId,
      message: `New comment on task "${task.title}"`,
      type: "COMMENT",
      relatedProjectId: task.projectId,
      relatedTaskId: task._id,
    });
  }

  await logActivity({
    action: "COMMENT_ADDED",
    message: `Comment added to task "${task.title}"`,
    userId: user.id,
    projectId: task.projectId.toString(),
    taskId: task._id.toString(),
  });

  revalidatePath(`/projects/${task.projectId}`);
  revalidatePath(`/tasks/${taskId}`);
  return { success: true, comment: JSON.parse(JSON.stringify(comment)) };
}

export async function getComments(taskId: string) {
  await connectDB();
  const comments = await Comment.find({ taskId })
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(comments));
}
