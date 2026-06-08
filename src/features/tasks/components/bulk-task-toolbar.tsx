"use client";

import { useState, useTransition } from "react";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Role } from "@/types";
import {
  bulkDeleteTasksAction,
  bulkUpdateTaskPriorityAction,
  bulkUpdateTaskStatusAction,
} from "../actions";

interface BulkTaskToolbarProps {
  selectedIds: string[];
  userRole: Role;
  onClear: () => void;
  onComplete: () => void;
}

export function BulkTaskToolbar({
  selectedIds,
  userRole,
  onClear,
  onComplete,
}: BulkTaskToolbarProps) {
  const [status, setStatus] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const canDelete = userRole === "ADMIN" || userRole === "PROJECT_MANAGER";

  if (selectedIds.length === 0) return null;

  function runAction(action: () => Promise<{ error?: string; message?: string } | void>) {
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      if (result?.message) toast.success(result.message);
      onClear();
      onComplete();
    });
  }

  function handleStatusApply() {
    if (!status) {
      toast.error("Select a status to apply");
      return;
    }
    runAction(() => bulkUpdateTaskStatusAction(selectedIds, status));
  }

  function handlePriorityApply() {
    if (!priority) {
      toast.error("Select a priority to apply");
      return;
    }
    runAction(() => bulkUpdateTaskPriorityAction(selectedIds, priority));
  }

  function handleDelete() {
    if (!confirm(`Delete ${selectedIds.length} selected task(s)?`)) return;
    runAction(() => bulkDeleteTasksAction(selectedIds));
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{selectedIds.length} selected</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={onClear}
          disabled={isPending}
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v ?? "")} disabled={isPending}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Set status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO">Todo</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" size="sm" variant="secondary" onClick={handleStatusApply} disabled={isPending}>
            Apply
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select value={priority} onValueChange={(v) => setPriority(v ?? "")} disabled={isPending}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Set priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" size="sm" variant="secondary" onClick={handlePriorityApply} disabled={isPending}>
            Apply
          </Button>
        </div>

        {canDelete && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
