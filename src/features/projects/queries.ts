import { connectDB } from "@/lib/db";
import { canAccessProject } from "@/lib/access";
import { Project } from "@/models/Project";
import { Task } from "@/models/Task";
import { SessionUser } from "@/types";

function withoutMissingPopulates<T extends { members?: unknown[] }>(project: T): T {
  return {
    ...project,
    members: (project.members ?? []).filter(Boolean),
  };
}

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

  return { projects: JSON.parse(JSON.stringify(projects.map(withoutMissingPopulates))), total, pages: Math.ceil(total / limit) };
}

export async function getProjectWithTasks(projectId: string, user?: SessionUser) {
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

  if (!project) {
    return { project: null, tasks: [] };
  }

  if (user && !canAccessProject(user, project)) {
    return { project: null, tasks: [] };
  }

  return {
    project: JSON.parse(JSON.stringify(withoutMissingPopulates(project))),
    tasks: JSON.parse(JSON.stringify(tasks)),
  };
}
