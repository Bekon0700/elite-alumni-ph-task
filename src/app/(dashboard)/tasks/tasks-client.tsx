"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { updateTaskStatusAction } from "@/features/tasks/actions";
import { isActionError } from "@/lib/action-result";
import { BulkTaskToolbar } from "@/features/tasks/components/bulk-task-toolbar";
import { Role } from "@/types";
import { toast } from "sonner";

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

interface TaskItem {
  _id: string;
  title: string;
  description: string;
  assigneeId: { _id: string; name: string } | null;
  projectId: { _id: string; name: string } | null;
  dueDate: string;
  priority: string;
  status: string;
}

interface Props {
  tasks: TaskItem[];
  total: number;
  pages: number;
  currentPage: number;
  userRole: Role;
}

export function TasksClient({ tasks, total, pages, currentPage, userRole }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const allSelected = tasks.length > 0 && selectedIds.length === tasks.length;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  function updateParams(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/tasks?${params.toString()}`);
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/tasks?${params.toString()}`);
  }

  function handleQuickStatus(taskId: string, status: string | null) {
    if (!status) return;
    startTransition(async () => {
      const result = await updateTaskStatusAction(taskId, status);
      if (isActionError(result)) toast.error(result.error);
    });
  }

  function toggleTask(taskId: string, checked: boolean) {
    setSelectedIds((prev) =>
      checked ? [...prev, taskId] : prev.filter((id) => id !== taskId)
    );
  }

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? tasks.map((task) => task._id) : []);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tasks</h1>
        <p className="text-sm text-muted-foreground">{total} task(s) total</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-9"
            defaultValue={searchParams.get("search") ?? ""}
            onChange={(e) => {
              const timeout = setTimeout(() => updateParams("search", e.target.value), 300);
              return () => clearTimeout(timeout);
            }}
          />
        </div>
        <Select defaultValue={searchParams.get("status") ?? "ALL"} onValueChange={(v) => updateParams("status", v)}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="TODO">Todo</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue={searchParams.get("priority") ?? "ALL"} onValueChange={(v) => updateParams("priority", v)}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Priority</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue={searchParams.get("sort") ?? "-createdAt"} onValueChange={(v) => updateParams("sort", v)}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="-createdAt">Latest Created</SelectItem>
            <SelectItem value="dueDate">Nearest Deadline</SelectItem>
            <SelectItem value="priority">Highest Priority</SelectItem>
            <SelectItem value="-updatedAt">Recently Updated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <BulkTaskToolbar
        selectedIds={selectedIds}
        userRole={userRole}
        onClear={() => setSelectedIds([])}
        onComplete={() => router.refresh()}
      />

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No tasks found.</div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-1">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(checked) => toggleAll(checked === true)}
              aria-label="Select all tasks on this page"
            />
            <span className="text-sm text-muted-foreground">Select all on page</span>
          </div>

          {tasks.map((task) => (
            <Card
              key={task._id}
              className={`hover:shadow-sm transition-shadow ${selectedSet.has(task._id) ? "ring-2 ring-primary/40" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={selectedSet.has(task._id)}
                      onCheckedChange={(checked) => toggleTask(task._id, checked === true)}
                      aria-label={`Select ${task.title}`}
                      className="mt-1"
                    />
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
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {task.projectId && <span>Project: {task.projectId.name}</span>}
                        <span>{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                        {task.assigneeId && <span>→ {task.assigneeId.name}</span>}
                      </div>
                    </div>
                  </div>
                  <Select
                    value={task.status}
                    onValueChange={(v) => handleQuickStatus(task._id, v)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">Todo</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => goToPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
