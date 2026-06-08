"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { createProjectSchema, updateProjectSchema } from "@/schemas/project.schema";
import { createProject, updateProject, deleteProject } from "./service";
import { SessionUser } from "@/types";

export async function createProjectAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const user = session.user as SessionUser;
  if (!can(user, "create_project")) return { error: "You don't have permission to create projects" };

  const raw = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    deadline: formData.get("deadline") as string,
    status: (formData.get("status") as string) || "ACTIVE",
  };

  const parsed = createProjectSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await createProject(parsed.data, user.id);
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to create project" };
  }
}

export async function updateProjectAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const user = session.user as SessionUser;
  if (!can(user, "update_project")) return { error: "You don't have permission to update projects" };

  const raw = {
    id: formData.get("id") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    deadline: formData.get("deadline") as string,
    status: formData.get("status") as string,
  };

  const parsed = updateProjectSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await updateProject(parsed.data, user.id);
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to update project" };
  }
}

export async function deleteProjectAction(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const user = session.user as SessionUser;
  if (!can(user, "delete_project")) return { error: "You don't have permission to delete projects" };

  try {
    await deleteProject(id, user.id);
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to delete project" };
  }
}

export async function updateProjectStatusAction(id: string, status: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const user = session.user as SessionUser;
  if (!can(user, "update_project")) return { error: "You don't have permission to update projects" };

  const validStatuses = ["ACTIVE", "COMPLETED", "ON_HOLD"];
  if (!validStatuses.includes(status)) return { error: "Invalid status" };

  try {
    await updateProject({ id, status: status as "ACTIVE" | "COMPLETED" | "ON_HOLD" }, user.id);
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    revalidatePath(`/projects/${id}`);
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to update project status" };
  }
}
