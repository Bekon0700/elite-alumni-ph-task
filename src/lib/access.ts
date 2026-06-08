import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Task } from "@/models/Task";
import { SessionUser } from "@/types";

type ProjectAccess = {
  members?: Array<{ toString(): string } | string>;
  createdBy?: { toString(): string } | string;
};

export function canAccessProject(user: SessionUser, project: ProjectAccess): boolean {
  if (user.role === "ADMIN" || user.role === "PROJECT_MANAGER") return true;

  const members = project.members ?? [];
  return members.some((member) => member.toString() === user.id);
}

export async function loadTaskForAccess(taskId: string) {
  await connectDB();
  return Task.findById(taskId).populate("projectId", "members");
}

export async function assertTaskAccess(user: SessionUser, taskId: string) {
  const task = await loadTaskForAccess(taskId);
  if (!task) return { error: "Task not found" as const };

  if (user.role === "ADMIN" || user.role === "PROJECT_MANAGER") {
    return { task };
  }

  const project = task.projectId as ProjectAccess | null;
  const isAssignee = task.assigneeId?.toString() === user.id;
  const isMember = project ? canAccessProject(user, project) : false;

  if (!isAssignee && !isMember) {
    return { error: "Forbidden" as const };
  }

  return { task };
}

export async function assertProjectAccess(user: SessionUser, projectId: string) {
  await connectDB();
  const project = await Project.findById(projectId).lean();
  if (!project) return { error: "Project not found" as const };

  if (!canAccessProject(user, project)) {
    return { error: "Forbidden" as const };
  }

  return { project };
}
