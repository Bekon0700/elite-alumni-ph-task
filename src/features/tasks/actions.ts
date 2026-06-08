"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { can, canUpdateTask } from "@/lib/rbac";
import { createTaskSchema, updateTaskSchema } from "@/schemas/task.schema";
import { createTask, updateTask, deleteTask, updateTaskStatus } from "./service";
import { SessionUser } from "@/types";
import { Task } from "@/models/Task";
import { connectDB } from "@/lib/db";

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
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const user = session.user as SessionUser;
  if (!can(user, "delete_task")) return { error: "You don't have permission to delete tasks" };

  try {
    await deleteTask(id, user.id);
    revalidatePath("/projects");
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to delete task" };
  }
}

export async function updateTaskStatusAction(id: string, status: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const user = session.user as SessionUser;

  await connectDB();
  const task = await Task.findById(id);
  if (!task) return { error: "Task not found" };

  if (!canUpdateTask(user, task.assigneeId?.toString() || "", task.status)) {
    return { error: "You don't have permission to update this task" };
  }

  try {
    await updateTaskStatus(id, status, user.id);
    revalidatePath("/projects");
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to update task status" };
  }
}
