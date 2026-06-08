"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Plus, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { TaskForm } from "@/features/tasks/components/task-form";
import { TaskCard } from "@/features/tasks/components/task-card";
import { AddMemberDialog } from "@/features/team/components/add-member-dialog";
import { SessionUser } from "@/types";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ON_HOLD: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

interface Props {
  project: {
    _id: string;
    name: string;
    description: string;
    deadline: string;
    status: string;
    members: { _id: string; name: string; email: string; role: string }[];
    createdBy: { name: string; email: string };
  };
  tasks: Array<{
    _id: string;
    title: string;
    description: string;
    assigneeId: { _id: string; name: string; email: string } | null;
    dueDate: string;
    priority: string;
    status: string;
    projectId: string;
  }>;
  user: SessionUser;
}

export function ProjectDetailClient({ project, tasks, user }: Props) {
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const canManage = user.role === "ADMIN" || user.role === "PROJECT_MANAGER";

  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <Badge className={statusColors[project.status]}>{project.status.replace("_", " ")}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" /> Deadline
            </div>
            <p className="font-medium">{format(new Date(project.deadline), "MMM d, yyyy")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Users className="h-4 w-4" /> Members
            </div>
            <p className="font-medium">{project.members.length} members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground mb-1">Progress</div>
            <div className="flex items-center gap-2">
              <Progress value={progress} className="flex-1" />
              <span className="text-sm font-medium">{progress}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tasks ({tasks.length})</h2>
        <div className="flex gap-2">
          {canManage && (
            <>
              <Button variant="outline" size="sm" onClick={() => setMemberDialogOpen(true)}>
                <Users className="h-4 w-4 mr-2" /> Add Member
              </Button>
              <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
                  <AddMemberDialog projectId={project._id} onSuccess={() => setMemberDialogOpen(false)} />
                </DialogContent>
              </Dialog>
              <Button size="sm" onClick={() => setTaskDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Task
              </Button>
              <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
                  <TaskForm
                    projectId={project._id}
                    members={project.members}
                    onSuccess={() => setTaskDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No tasks yet. {canManage && "Create the first task!"}
        </div>
      ) : (
        <div className="grid gap-3">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} members={project.members} userRole={user.role} userId={user.id} />
          ))}
        </div>
      )}
    </div>
  );
}
