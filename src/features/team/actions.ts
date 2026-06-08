"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";
import { logActivity } from "@/features/activity/service";
import { SessionUser } from "@/types";

export async function addMemberToProject(projectId: string, email: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const user = session.user as SessionUser;
  if (!can(user, "manage_members")) return { error: "You don't have permission to manage members" };

  await connectDB();

  const member = await User.findOne({ email: email.toLowerCase().trim() });
  if (!member) return { error: "No user found with this email" };

  const project = await Project.findById(projectId);
  if (!project) return { error: "Project not found" };

  if (project.members.some((m) => m.toString() === member._id.toString())) {
    return { error: "User is already a member of this project" };
  }

  project.members.push(member._id);
  await project.save();

  await Notification.create({
    userId: member._id,
    message: `You were added to project "${project.name}"`,
    type: "MEMBER_ADDED",
    relatedProjectId: project._id,
  });

  await logActivity({
    action: "MEMBER_ADDED",
    message: `Member added to "${project.name}"`,
    userId: user.id,
    projectId: project._id.toString(),
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/team");
  return { success: true };
}

export async function removeMemberFromProject(projectId: string, memberId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const user = session.user as SessionUser;
  if (!can(user, "manage_members")) return { error: "You don't have permission to manage members" };

  await connectDB();
  const project = await Project.findById(projectId);
  if (!project) return { error: "Project not found" };

  project.members = project.members.filter((m) => m.toString() !== memberId);
  await project.save();

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/team");
  return { success: true };
}
