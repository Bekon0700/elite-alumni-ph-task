import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Task } from "@/models/Task";

export async function getProjectsWithStats(filters: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  userId?: string;
  role?: string;
}) {
  await connectDB();
  const { status, search, page = 1, limit = 12, sort = "-createdAt", userId, role } = filters;

  const query: Record<string, unknown> = {};

  if (status && status !== "ALL") query.status = status;
  if (search) query.name = { $regex: search, $options: "i" };
  if (role === "TEAM_MEMBER" && userId) query.members = userId;

  const skip = (page - 1) * limit;

  const [projects, total] = await Promise.all([
    Project.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name")
      .populate("members", "name email")
      .lean(),
    Project.countDocuments(query),
  ]);

  return { projects: JSON.parse(JSON.stringify(projects)), total, pages: Math.ceil(total / limit) };
}

export async function getProjectWithTasks(projectId: string) {
  await connectDB();
  const [project, tasks] = await Promise.all([
    Project.findById(projectId)
      .populate("createdBy", "name email")
      .populate("members", "name email role")
      .lean(),
    Task.find({ projectId })
      .populate("assigneeId", "name email")
      .sort("-createdAt")
      .lean(),
  ]);

  return {
    project: project ? JSON.parse(JSON.stringify(project)) : null,
    tasks: JSON.parse(JSON.stringify(tasks)),
  };
}
