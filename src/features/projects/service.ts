import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { logActivity } from "@/features/activity/service";
import { CreateProjectInput, UpdateProjectInput } from "@/schemas/project.schema";

export async function createProject(data: CreateProjectInput, userId: string) {
  await connectDB();
  const project = await Project.create({
    ...data,
    deadline: new Date(data.deadline),
    createdBy: userId,
    members: [userId],
  });

  await logActivity({
    action: "PROJECT_CREATED",
    message: `Project "${project.name}" created`,
    userId,
    projectId: project._id.toString(),
  });

  return project;
}

export async function updateProject(data: UpdateProjectInput, userId: string) {
  await connectDB();
  const { id, ...updates } = data;

  const updateData: Record<string, unknown> = { ...updates };
  if (updates.deadline) {
    updateData.deadline = new Date(updates.deadline);
  }

  const project = await Project.findByIdAndUpdate(id, updateData, { new: true });
  if (!project) throw new Error("Project not found");

  await logActivity({
    action: "PROJECT_UPDATED",
    message: `Project "${project.name}" updated`,
    userId,
    projectId: project._id.toString(),
  });

  return project;
}

export async function deleteProject(id: string, userId: string) {
  await connectDB();
  const project = await Project.findByIdAndDelete(id);
  if (!project) throw new Error("Project not found");

  await logActivity({
    action: "PROJECT_DELETED",
    message: `Project "${project.name}" deleted`,
    userId,
    projectId: id,
  });

  return project;
}

export async function getProjects(filters: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  userId?: string;
  role?: string;
}) {
  await connectDB();
  const { status, search, page = 1, limit = 10, sort = "-createdAt", userId, role } = filters;

  const query: Record<string, unknown> = {};

  if (status && status !== "ALL") {
    query.status = status;
  }

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (role === "TEAM_MEMBER" && userId) {
    query.members = userId;
  }

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

  return { projects, total, pages: Math.ceil(total / limit) };
}

export async function getProjectById(id: string) {
  await connectDB();
  return Project.findById(id)
    .populate("createdBy", "name email")
    .populate("members", "name email role")
    .lean();
}
