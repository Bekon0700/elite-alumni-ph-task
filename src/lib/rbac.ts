import { SessionUser, Role } from "@/types";

type Action =
  | "create_project"
  | "update_project"
  | "delete_project"
  | "create_task"
  | "update_task"
  | "delete_task"
  | "assign_task"
  | "manage_members"
  | "view_all";

const permissions: Record<Role, Action[]> = {
  ADMIN: [
    "create_project",
    "update_project",
    "delete_project",
    "create_task",
    "update_task",
    "delete_task",
    "assign_task",
    "manage_members",
    "view_all",
  ],
  PROJECT_MANAGER: [
    "create_project",
    "update_project",
    "delete_project",
    "create_task",
    "update_task",
    "delete_task",
    "assign_task",
    "manage_members",
  ],
  TEAM_MEMBER: ["update_task"],
};

export function can(user: SessionUser, action: Action): boolean {
  return permissions[user.role]?.includes(action) ?? false;
}

export function isAdmin(user: SessionUser): boolean {
  return user.role === "ADMIN";
}

export function isProjectManager(user: SessionUser): boolean {
  return user.role === "PROJECT_MANAGER" || user.role === "ADMIN";
}

export function canUpdateTask(
  user: SessionUser,
  taskAssigneeId: string,
  taskStatus: string
): boolean {
  if (user.role === "ADMIN" || user.role === "PROJECT_MANAGER") return true;
  if (user.role === "TEAM_MEMBER") {
    return taskAssigneeId === user.id && taskStatus !== "COMPLETED";
  }
  return false;
}
