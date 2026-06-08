"use server";

import { revalidatePath } from "next/cache";
import { can } from "@/lib/rbac";
import { requireSession, parseInput } from "@/lib/action-utils";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";
import { logActivity } from "@/features/activity/service";
import { addMemberSchema, removeMemberSchema } from "@/schemas/team.schema";

export async function addMemberToProject(projectId: string, email: string) {
  const session = await requireSession();
  if ("error" in session) return session;

  const user = session.user;
  if (!can(user, "manage_members")) {
    return { error: "You don't have permission to manage members" };
  }

  const parsed = parseInput(addMemberSchema, { projectId, email });
  if ("error" in parsed) return parsed;

  await connectDB();

  const member = await User.findOne({ email: parsed.data.email.toLowerCase() });
  if (!member) return { error: "No user found with this email" };

  const project = await Project.findById(parsed.data.projectId);
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

  revalidatePath(`/projects/${parsed.data.projectId}`);
  revalidatePath("/team");
  return { success: true };
}

export async function removeMemberFromProject(projectId: string, memberId: string) {
  const session = await requireSession();
  if ("error" in session) return session;

  const user = session.user;
  if (!can(user, "manage_members")) {
    return { error: "You don't have permission to manage members" };
  }

  const parsed = parseInput(removeMemberSchema, { projectId, memberId });
  if ("error" in parsed) return parsed;

  await connectDB();
  const project = await Project.findById(parsed.data.projectId);
  if (!project) return { error: "Project not found" };

  project.members = project.members.filter(
    (m) => m.toString() !== parsed.data.memberId
  );
  await project.save();

  revalidatePath(`/projects/${parsed.data.projectId}`);
  revalidatePath("/team");
  return { success: true };
}
