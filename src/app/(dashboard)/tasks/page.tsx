export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { getTasks } from "@/features/tasks/queries";
import { TasksClient } from "./tasks-client";
import { parseTasksListQuery } from "@/schemas/common.schema";
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
  const query = parseTasksListQuery(params);

  const { tasks, total, pages } = await getTasks({
    projectId: query.projectId,
    status: query.status,
    priority: query.priority,
    search: query.search,
    overdue: query.overdue,
    page: query.page,
    sort: query.sort,
    userId: user.id,
    role: user.role,
  });

  return (
    <TasksClient
      tasks={tasks}
      total={total}
      pages={pages}
      currentPage={query.page}
      userRole={user.role}
    />
  );
}
