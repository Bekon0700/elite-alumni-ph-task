export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTaskById } from "@/features/tasks/queries";
import { TaskDetailClient } from "./task-detail-client";
import { SessionUser } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const user = session?.user as SessionUser;

  const task = await getTaskById(id, { userId: user?.id, role: user?.role });
  if (!task) notFound();

  return <TaskDetailClient task={task} />;
}
