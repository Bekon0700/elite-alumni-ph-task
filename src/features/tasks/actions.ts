"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { can, canUpdateTask } from "@/lib/rbac";
import { createTaskSchema, updateTaskSchema, bulkUpdateStatusSchema, bulkUpdatePrioritySchema, bulkTaskIdsSchema } from "@/schemas/task.schema";
import {
  deleteAttachmentSchema,
  idParamSchema,
  updateTaskStatusSchema,
} from "@/schemas/common.schema";
import { requireSession, parseInput } from "@/lib/action-utils";
import { createTask, updateTask, deleteTask, updateTaskStatus, bulkUpdateTaskStatus, bulkUpdateTaskPriority, bulkDeleteTasks } from "./service";
import { SessionUser } from "@/types";
import { Task } from "@/models/Task";
import { connectDB } from "@/lib/db";
import { deleteUploadedAsset } from "@/lib/cloudinary";
import { logActivity } from "@/features/activity/service";

export async function createTaskAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const user = session.user as SessionUser;
  if (!can(user, "create_task")) return { error: "You don't have permission to create tasks" };

  const raw = {
    projectId: formData.get("projectId") as string,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    assigneeId: formData.get("assigneeId") as string,
    dueDate: formData.get("dueDate") as string,
    priority: (formData.get("priority") as string) || "MEDIUM",
    status: (formData.get("status") as string) || "TODO",
  };

  const parsed = createTaskSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await createTask(parsed.data, user.id);
    revalidatePath("/projects");
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to create task" };
  }
}

export async function updateTaskAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const user = session.user as SessionUser;
  const taskId = formData.get("id") as string;

  await connectDB();
  const task = await Task.findById(taskId);
  if (!task) return { error: "Task not found" };

  if (!canUpdateTask(user, task.assigneeId?.toString() || "", task.status)) {
    return { error: "You don't have permission to update this task" };
  }

  const raw = {
    id: taskId,
    title: formData.get("title") as string || undefined,
    description: formData.get("description") as string || undefined,
    assigneeId: formData.get("assigneeId") as string || undefined,
    dueDate: formData.get("dueDate") as string || undefined,
    priority: formData.get("priority") as string || undefined,
    status: formData.get("status") as string || undefined,
  };

  const parsed = updateTaskSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await updateTask(parsed.data, user.id);
    revalidatePath("/projects");
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to update task" };
  }
}

export async function deleteTaskAction(id: string) {
  const session = await requireSession();
  if ("error" in session) return session;

  const parsed = parseInput(idParamSchema, { id });
  if ("error" in parsed) return parsed;

  const user = session.user;
  if (!can(user, "delete_task")) return { error: "You don't have permission to delete tasks" };

  try {
    await deleteTask(parsed.data.id, user.id);
    revalidatePath("/projects");
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to delete task" };
  }
}

export async function updateTaskStatusAction(id: string, status: string) {
  const session = await requireSession();
  if ("error" in session) return session;

  const parsed = parseInput(updateTaskStatusSchema, { id, status });
  if ("error" in parsed) return parsed;

  const user = session.user;

  await connectDB();
  const task = await Task.findById(parsed.data.id);
  if (!task) return { error: "Task not found" };

  if (!canUpdateTask(user, task.assigneeId?.toString() || "", task.status)) {
    return { error: "You don't have permission to update this task" };
  }

  try {
    await updateTaskStatus(parsed.data.id, parsed.data.status, user.id);
    revalidatePath("/projects");
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to update task status" };
  }
}

export async function deleteAttachmentAction(taskId: string, publicId: string) {
  const session = await requireSession();
  if ("error" in session) return session;

  const parsed = parseInput(deleteAttachmentSchema, { taskId, publicId });
  if ("error" in parsed) return parsed;

  const user = session.user;

  if (!parsed.data.publicId.includes(parsed.data.taskId)) {
    return { error: "Invalid attachment" };
  }

  await connectDB();
  const task = await Task.findById(parsed.data.taskId);
  if (!task) return { error: "Task not found" };

  if (!canUpdateTask(user, task.assigneeId?.toString() || "", task.status)) {
    return { error: "You cannot remove attachments from this task." };
  }

  if (task.status === "COMPLETED") {
    return { error: "Cannot remove attachments from completed tasks." };
  }

  const attachment = task.attachments.find((file) => file.publicId === parsed.data.publicId);
  if (!attachment) return { error: "Attachment not found" };

  await deleteUploadedAsset(parsed.data.publicId, attachment.mimeType);

  task.attachments = task.attachments.filter((file) => file.publicId !== parsed.data.publicId);
  await task.save();

  await logActivity({
    action: "FILE_REMOVED",
    message: `File "${attachment.fileName}" removed from task "${task.title}"`,
    userId: user.id,
    projectId: task.projectId.toString(),
    taskId: task._id.toString(),
  });

  revalidatePath(`/projects/${task.projectId}`);
  revalidatePath(`/tasks/${parsed.data.taskId}`);
  revalidatePath("/tasks");

  return { success: true };
}

async function filterPermittedTaskIds(
  taskIds: string[],
  user: SessionUser,
  action: "update" | "delete"
): Promise<string[]> {
  await connectDB();
  const permitted: string[] = [];

  for (const id of taskIds) {
    const task = await Task.findById(id);
    if (!task) continue;

    if (action === "delete") {
      if (can(user, "delete_task")) permitted.push(id);
      continue;
    }

    if (canUpdateTask(user, task.assigneeId?.toString() || "", task.status)) {
      permitted.push(id);
    }
  }

  return permitted;
}

function bulkResultMessage(action: string, updated: number, skipped: number) {
  if (updated === 0) {
    return { error: `No tasks could be ${action}. You may not have permission for the selected tasks.` };
  }

  if (skipped > 0) {
    return {
      success: true,
      message: `${updated} task(s) ${action}. ${skipped} skipped due to permissions or errors.`,
    };
  }

  return { success: true, message: `${updated} task(s) ${action}.` };
}

export async function bulkUpdateTaskStatusAction(taskIds: string[], status: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const user = session.user as SessionUser;
  const parsed = bulkUpdateStatusSchema.safeParse({ taskIds, status });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const permittedIds = await filterPermittedTaskIds(parsed.data.taskIds, user, "update");
  const permissionSkipped = parsed.data.taskIds.length - permittedIds.length;
  const result = await bulkUpdateTaskStatus(permittedIds, parsed.data.status, user.id);

  revalidatePath("/projects");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");

  const response = bulkResultMessage(
    "updated",
    result.updated,
    permissionSkipped + result.skipped
  );
  if ("error" in response) return response;
  return response;
}

export async function bulkUpdateTaskPriorityAction(taskIds: string[], priority: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const user = session.user as SessionUser;
  const parsed = bulkUpdatePrioritySchema.safeParse({ taskIds, priority });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const permittedIds = await filterPermittedTaskIds(parsed.data.taskIds, user, "update");
  const permissionSkipped = parsed.data.taskIds.length - permittedIds.length;
  const result = await bulkUpdateTaskPriority(permittedIds, parsed.data.priority, user.id);

  revalidatePath("/projects");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");

  const response = bulkResultMessage(
    "updated",
    result.updated,
    permissionSkipped + result.skipped
  );
  if ("error" in response) return response;
  return response;
}

export async function bulkDeleteTasksAction(taskIds: string[]) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const user = session.user as SessionUser;
  if (!can(user, "delete_task")) {
    return { error: "You don't have permission to delete tasks" };
  }

  const parsed = bulkTaskIdsSchema.safeParse({ taskIds });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const permittedIds = await filterPermittedTaskIds(parsed.data.taskIds, user, "delete");
  const permissionSkipped = parsed.data.taskIds.length - permittedIds.length;
  const result = await bulkDeleteTasks(permittedIds, user.id);

  revalidatePath("/projects");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");

  const response = bulkResultMessage(
    "deleted",
    result.updated,
    permissionSkipped + result.skipped
  );
  if ("error" in response) return response;
  return response;
}
