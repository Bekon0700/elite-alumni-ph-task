"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { assertTaskAccess } from "@/lib/access";
import { requireSession, parseInput } from "@/lib/action-utils";
import { Comment } from "@/models/Comment";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";
import { logActivity } from "@/features/activity/service";
import { addCommentSchema, getCommentsSchema } from "@/schemas/comment.schema";

type CommentAuthor = { name: string; email: string };

export type CommentDTO = {
  _id: string;
  content: string;
  createdAt: string;
  userId: { name: string; email: string };
};

function serializeComment(
  comment: {
    _id: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    userId: mongoose.Types.ObjectId;
  },
  author: CommentAuthor
): CommentDTO {
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
  const session = await requireSession();
  if ("error" in session) return session;

  const parsed = parseInput(addCommentSchema, { taskId, content });
  if ("error" in parsed) return parsed;

  const access = await assertTaskAccess(session.user, parsed.data.taskId);
  if ("error" in access && access.error) return { error: access.error };

  const task = access.task;
  const user = session.user;

  const comment = await Comment.create({
    taskId: parsed.data.taskId,
    userId: new mongoose.Types.ObjectId(user.id),
    content: parsed.data.content,
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
  revalidatePath(`/tasks/${parsed.data.taskId}`);

  return {
    success: true,
    comment: serializeComment(comment, {
      name: user.name ?? "Unknown user",
      email: user.email ?? "",
    }),
  };
}

export async function getComments(
  taskId: string
): Promise<CommentDTO[] | { error: string }> {
  const session = await requireSession();
  if ("error" in session) return session;

  const parsed = parseInput(getCommentsSchema, { taskId });
  if ("error" in parsed) return parsed;

  const access = await assertTaskAccess(session.user, parsed.data.taskId);
  if ("error" in access && access.error) return { error: access.error };

  await connectDB();

  const comments = await Comment.find({ taskId: parsed.data.taskId })
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
