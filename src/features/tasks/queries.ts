import { connectDB } from "@/lib/db";
import { Task } from "@/models/Task";

export async function getTasks(filters: {
  projectId?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  search?: string;
  overdue?: string;
  page?: number;
  limit?: number;
  sort?: string;
  userId?: string;
  role?: string;
}) {
  await connectDB();
  const { projectId, status, priority, assigneeId, search, overdue, page = 1, limit = 20, sort = "-createdAt", userId, role } = filters;

  const query: Record<string, unknown> = {};

  if (projectId) query.projectId = projectId;
  if (status && status !== "ALL") query.status = status;
  if (priority && priority !== "ALL") query.priority = priority;
  if (assigneeId) query.assigneeId = assigneeId;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (overdue === "true") {
    query.dueDate = { $lt: new Date() };
    query.status = { $ne: "COMPLETED" };
  }

  if (role === "TEAM_MEMBER" && userId) {
    query.assigneeId = userId;
  }

  const skip = (page - 1) * limit;

  let sortQuery: string = sort;
  if (sort === "priority") {
    sortQuery = "-priority";
  }

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .populate("assigneeId", "name email")
      .populate("projectId", "name")
      .lean(),
    Task.countDocuments(query),
  ]);

  return { tasks: JSON.parse(JSON.stringify(tasks)), total, pages: Math.ceil(total / limit) };
}

export async function getTaskById(
  taskId: string,
  filters?: { userId?: string; role?: string }
) {
  await connectDB();

  const task = await Task.findById(taskId)
    .populate("assigneeId", "name email")
    .populate("projectId", "name members")
    .lean();

  if (!task || !task.projectId) return null;

  const { userId, role } = filters ?? {};
  if (role === "TEAM_MEMBER" && userId) {
    const isAssignee = task.assigneeId?._id?.toString() === userId;
    const project = task.projectId as { members?: { toString(): string }[] } | null;
    const isMember = project?.members?.some((m) => m.toString() === userId);
    if (!isAssignee && !isMember) return null;
  }

  return JSON.parse(JSON.stringify(task));
}
