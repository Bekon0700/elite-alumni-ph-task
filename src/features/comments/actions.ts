"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Comment } from "@/models/Comment";
import { Task } from "@/models/Task";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";
import { logActivity } from "@/features/activity/service";
import { SessionUser } from "@/types";

type CommentAuthor = { name: string; email: string };

function serializeComment(
  comment: {
    _id: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    userId: mongoose.Types.ObjectId;
  },
  author: CommentAuthor
) {
  return {
    _id: comment._id.toString(),
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    userId: author,
  };
}

async function resolveAuthors(
  userIds: string[]
): Promise<Map<string, CommentAuthor>> {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueIds.length === 0) return new Map();

  const users = await User.find({ _id: { $in: uniqueIds } })
    .select("name email")
    .lean();

  return new Map(
    users.map((user) => [
      user._id.toString(),
      { name: user.name, email: user.email },
    ])
  );
}

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
    userId: new mongoose.Types.ObjectId(user.id),
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

  return {
    success: true,
    comment: serializeComment(comment, {
      name: user.name ?? "Unknown user",
      email: user.email ?? "",
    }),
  };
}

export async function getComments(taskId: string) {
  await connectDB();

  const comments = await Comment.find({ taskId })
    .sort({ createdAt: -1 })
    .lean();

  const authorMap = await resolveAuthors(
    comments.map((comment) => comment.userId.toString())
  );

  const fallbackAuthor: CommentAuthor = { name: "Unknown user", email: "" };

  return comments.map((comment) =>
    serializeComment(
      comment,
      authorMap.get(comment.userId.toString()) ?? fallbackAuthor
    )
  );
}
