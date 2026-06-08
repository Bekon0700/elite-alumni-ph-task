"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CommentSection } from "@/features/comments/components/comment-section";

const priorityColors: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  MEDIUM: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  LOW: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const statusColors: Record<string, string> = {
  TODO: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

interface Props {
  task: {
    _id: string;
    title: string;
    description: string;
    assigneeId: { _id: string; name: string; email: string } | null;
    projectId: { _id: string; name: string } | null;
    dueDate: string;
    priority: string;
    status: string;
  };
}

export function TaskDetailClient({ task }: Props) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href={task.projectId ? `/projects/${task.projectId._id}` : "/projects"}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{task.title}</h1>
            <Badge className={priorityColors[task.priority]} variant="secondary">
              {task.priority}
            </Badge>
            <Badge className={statusColors[task.status]} variant="secondary">
              {task.status.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Project:{" "}
            {task.projectId ? (
              <Link
                href={`/projects/${task.projectId._id}`}
                className="hover:underline text-foreground"
              >
                {task.projectId.name}
              </Link>
            ) : (
              <span>Unknown project</span>
            )}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4 space-y-4">
          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Due {format(new Date(task.dueDate), "MMM d, yyyy")}
            </span>
            {task.assigneeId && <span>Assigned to: {task.assigneeId.name}</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <CommentSection taskId={task._id} />
        </CardContent>
      </Card>
    </div>
  );
}
