"use client";

import { format } from "date-fns";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TaskItem {
  _id: string;
  title: string;
  dueDate: string;
  priority: string;
  projectId: { name: string } | null;
  assigneeId: { name: string } | null;
}

export function UpcomingDeadlines({ tasks }: { tasks: TaskItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" /> Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task._id} className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.projectId?.name} • {format(new Date(task.dueDate), "MMM d")}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    task.priority === "HIGH"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : ""
                  }
                >
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function HighPriorityTasks({ tasks }: { tasks: TaskItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500" /> High Priority Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No high priority tasks</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task._id} className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.projectId?.name} • Due {format(new Date(task.dueDate), "MMM d")}
                  </p>
                </div>
                {task.assigneeId && (
                  <span className="text-xs text-muted-foreground">{task.assigneeId.name}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
