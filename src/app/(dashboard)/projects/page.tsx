export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { getProjectsWithStats } from "@/features/projects/queries";
import { ProjectsClient } from "./projects-client";
import { SessionUser } from "@/types";

interface Props {
  searchParams: Promise<{ status?: string; search?: string; page?: string; sort?: string }>;
}

export default async function ProjectsPage({ searchParams }: Props) {
  const session = await auth();
  const user = session?.user as SessionUser;
  const params = await searchParams;

  const { projects, total, pages } = await getProjectsWithStats({
    status: params.status,
    search: params.search,
    page: params.page ? parseInt(params.page) : 1,
    sort: params.sort || "-createdAt",
    userId: user.id,
    role: user.role,
  });

  return (
    <ProjectsClient
      projects={projects}
      total={total}
      pages={pages}
      currentPage={params.page ? parseInt(params.page) : 1}
      canCreate={user.role !== "TEAM_MEMBER"}
    />
  );
}
