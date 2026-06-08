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

  const project = await Project.findByIdAndUpdate(id, updateData, { returnDocument: "after" });
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
