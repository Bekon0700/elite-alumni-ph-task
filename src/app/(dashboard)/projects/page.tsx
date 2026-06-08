export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { getProjectsWithStats } from "@/features/projects/queries";
import { ProjectsClient } from "./projects-client";
import { parseProjectsListQuery } from "@/schemas/common.schema";
import { SessionUser } from "@/types";

interface Props {
  searchParams: Promise<{ status?: string; search?: string; page?: string; sort?: string }>;
}

export default async function ProjectsPage({ searchParams }: Props) {
  const session = await auth();
  const user = session?.user as SessionUser;
  const params = await searchParams;
  const query = parseProjectsListQuery(params);

  const { projects, total, pages } = await getProjectsWithStats({
    status: query.status,
    search: query.search,
    page: query.page,
    sort: query.sort,
    userId: user.id,
    role: user.role,
  });

  return (
    <ProjectsClient
      projects={projects}
      total={total}
      pages={pages}
      currentPage={query.page}
      canCreate={user.role !== "TEAM_MEMBER"}
    />
  );
}
