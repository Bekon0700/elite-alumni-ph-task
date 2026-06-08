import { connectDB } from "@/lib/db";
import { Task } from "@/models/Task";
import { Notification } from "@/models/Notification";
import { logActivity } from "@/features/activity/service";
import { CreateTaskInput, UpdateTaskInput } from "@/schemas/task.schema";

export async function createTask(data: CreateTaskInput, userId: string) {
  await connectDB();

  const existing = await Task.findOne({ projectId: data.projectId, title: data.title });
  if (existing) {
    throw new Error("This task already exists in the project.");
  }

  const task = await Task.create({
    ...data,
    dueDate: new Date(data.dueDate),
    assigneeId: data.assigneeId || undefined,
  });

  await logActivity({
    action: "TASK_CREATED",
    message: `Task "${task.title}" created`,
    userId,
    projectId: data.projectId,
    taskId: task._id.toString(),
  });

  if (data.assigneeId && data.assigneeId !== userId) {
    await Notification.create({
      userId: data.assigneeId,
      message: `Task "${task.title}" assigned to you`,
      type: "TASK_ASSIGNED",
      relatedProjectId: data.projectId,
      relatedTaskId: task._id,
    });

    await logActivity({
      action: "TASK_ASSIGNED",
      message: `Task "${task.title}" assigned`,
      userId,
      projectId: data.projectId,
      taskId: task._id.toString(),
    });
  }

  return task;
}

export async function updateTask(data: UpdateTaskInput, userId: string) {
  await connectDB();

  const task = await Task.findById(data.id);
  if (!task) throw new Error("Task not found");

  if (data.assigneeId && task.status === "COMPLETED") {
    throw new Error("Completed tasks cannot be reassigned.");
  }

  if (data.dueDate) {
    const date = new Date(data.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      throw new Error("Please select a valid deadline.");
    }
  }

  if (data.title && data.title !== task.title) {
    const duplicate = await Task.findOne({
      projectId: task.projectId,
      title: data.title,
      _id: { $ne: task._id },
    });
    if (duplicate) {
      throw new Error("This task already exists in the project.");
    }
  }

  const updates: Record<string, unknown> = {};
  if (data.title) updates.title = data.title;
  if (data.description !== undefined) updates.description = data.description;
  if (data.assigneeId) updates.assigneeId = data.assigneeId;
  if (data.dueDate) updates.dueDate = new Date(data.dueDate);
  if (data.priority) updates.priority = data.priority;
  if (data.status) updates.status = data.status;

  const updated = await Task.findByIdAndUpdate(data.id, updates, { new: true });

  if (data.status && data.status !== task.status) {
    await logActivity({
      action: "TASK_STATUS_CHANGED",
      message: `Task "${task.title}" marked as ${data.status}`,
      userId,
      projectId: task.projectId.toString(),
      taskId: task._id.toString(),
    });

    if (task.assigneeId) {
      await Notification.create({
        userId: task.assigneeId,
        message: `Task "${task.title}" status changed to ${data.status}`,
        type: "STATUS_CHANGE",
        relatedProjectId: task.projectId,
        relatedTaskId: task._id,
      });
    }
  }

  if (data.assigneeId && data.assigneeId !== task.assigneeId?.toString()) {
    await Notification.create({
      userId: data.assigneeId,
      message: `Task "${task.title}" assigned to you`,
      type: "TASK_ASSIGNED",
      relatedProjectId: task.projectId,
      relatedTaskId: task._id,
    });
  }

  return updated;
}

export async function deleteTask(id: string, userId: string) {
  await connectDB();
  const task = await Task.findByIdAndDelete(id);
  if (!task) throw new Error("Task not found");

  await logActivity({
    action: "TASK_DELETED",
    message: `Task "${task.title}" deleted`,
    userId,
    projectId: task.projectId.toString(),
    taskId: id,
  });

  return task;
}

export async function updateTaskStatus(id: string, status: string, userId: string) {
  await connectDB();
  const task = await Task.findById(id);
  if (!task) throw new Error("Task not found");

  task.status = status as "TODO" | "IN_PROGRESS" | "COMPLETED";
  await task.save();

  await logActivity({
    action: "TASK_STATUS_CHANGED",
    message: `Task "${task.title}" marked as ${status}`,
    userId,
    projectId: task.projectId.toString(),
    taskId: id,
  });

  return task;
}

export interface BulkActionResult {
  updated: number;
  skipped: number;
}

export async function bulkUpdateTaskStatus(
  taskIds: string[],
  status: string,
  userId: string
): Promise<BulkActionResult> {
  let updated = 0;
  let skipped = 0;

  for (const id of taskIds) {
    try {
      await updateTaskStatus(id, status, userId);
      updated++;
    } catch {
      skipped++;
    }
  }

  return { updated, skipped };
}

export async function bulkUpdateTaskPriority(
  taskIds: string[],
  priority: string,
  userId: string
): Promise<BulkActionResult> {
  let updated = 0;
  let skipped = 0;

  for (const id of taskIds) {
    try {
      await updateTask({ id, priority: priority as "HIGH" | "MEDIUM" | "LOW" }, userId);
      updated++;
    } catch {
      skipped++;
    }
  }

  return { updated, skipped };
}

export async function bulkDeleteTasks(
  taskIds: string[],
  userId: string
): Promise<BulkActionResult> {
  let updated = 0;
  let skipped = 0;

  for (const id of taskIds) {
    try {
      await deleteTask(id, userId);
      updated++;
    } catch {
      skipped++;
    }
  }

  return { updated, skipped };
}
