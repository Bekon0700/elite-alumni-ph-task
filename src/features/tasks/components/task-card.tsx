"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, MoreVertical, Trash2, Edit, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { deleteTaskAction, updateTaskStatusAction } from "../actions";
import { TaskForm } from "./task-form";
import { Role } from "@/types";

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

interface TaskCardProps {
  task: {
    _id: string;
    title: string;
    description: string;
    assigneeId: { _id: string; name: string; email: string } | null;
    dueDate: string;
    priority: string;
    status: string;
    projectId: string;
  };
  members: { _id: string; name: string }[];
  userRole: Role;
  userId: string;
}

export function TaskCard({ task, members, userRole, userId }: TaskCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const canManage = userRole === "ADMIN" || userRole === "PROJECT_MANAGER";
  const isAssignee = task.assigneeId?._id === userId;
  const canEdit = canManage || (isAssignee && task.status !== "COMPLETED");

  async function handleDelete() {
    if (!confirm("Delete this task?")) return;
    const result = await deleteTaskAction(task._id);
    if (result?.error) toast.error(result.error);
    else toast.success("Task deleted");
  }

  function handleStatusChange(status: string) {
    startTransition(async () => {
      const result = await updateTaskStatusAction(task._id, status);
      if (result?.error) toast.error(result.error);
      else toast.success(`Task marked as ${status.replace("_", " ")}`);
    });
  }

  return (
    <>
      <Card className="group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link href={`/tasks/${task._id}`} className="font-medium truncate hover:underline">
                  {task.title}
                </Link>
                <Badge className={priorityColors[task.priority]} variant="secondary">
                  {task.priority}
                </Badge>
                <Badge className={statusColors[task.status]} variant="secondary">
                  {task.status.replace("_", " ")}
                </Badge>
              </div>
              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{task.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(task.dueDate), "MMM d, yyyy")}
                </span>
                {task.assigneeId && (
                  <span>Assigned to: {task.assigneeId.name}</span>
                )}
              </div>
            </div>
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent opacity-0 group-hover:opacity-100">
                  <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <ArrowRight className="h-4 w-4 mr-2" /> Change Status
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => handleStatusChange("TODO")} disabled={isPending}>
                        Todo
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange("IN_PROGRESS")} disabled={isPending}>
                        In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange("COMPLETED")} disabled={isPending}>
                        Completed
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  {canManage && (
                    <>
                      <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
          <TaskForm
            projectId={task.projectId}
            members={members}
            task={task}
            onSuccess={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
