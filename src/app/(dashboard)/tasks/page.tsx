export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { getTasks } from "@/features/tasks/queries";
import { TasksClient } from "./tasks-client";
import { SessionUser } from "@/types";

interface Props {
  searchParams: Promise<{
    projectId?: string;
    status?: string;
    priority?: string;
    search?: string;
    overdue?: string;
    page?: string;
    sort?: string;
  }>;
}

export default async function TasksPage({ searchParams }: Props) {
  const session = await auth();
  const user = session?.user as SessionUser;
  const params = await searchParams;

  const { tasks, total, pages } = await getTasks({
    projectId: params.projectId,
    status: params.status,
    priority: params.priority,
    search: params.search,
    overdue: params.overdue,
    page: params.page ? parseInt(params.page) : 1,
    sort: params.sort || "-createdAt",
    userId: user.id,
    role: user.role,
  });

  return (
    <TasksClient
      tasks={tasks}
      total={total}
      pages={pages}
      currentPage={params.page ? parseInt(params.page) : 1}
      userRole={user.role}
    />
  );
}
