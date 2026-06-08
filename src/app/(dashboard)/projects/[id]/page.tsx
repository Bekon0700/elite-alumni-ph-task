export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProjectWithTasks } from "@/features/projects/queries";
import { ProjectDetailClient } from "./project-detail-client";
import { SessionUser } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const user = session?.user as SessionUser;

  const { project, tasks } = await getProjectWithTasks(id);
  if (!project) notFound();

  return <ProjectDetailClient project={project} tasks={tasks} user={user} />;
}
