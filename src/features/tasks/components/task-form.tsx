"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createTaskAction, updateTaskAction } from "../actions";

interface Member {
  _id: string;
  name: string;
}

function memberId(member: Member) {
  return String(member._id);
}

interface TaskFormProps {
  projectId: string;
  members: Member[];
  task?: {
    _id: string;
    title: string;
    description: string;
    assigneeId: { _id: string } | string | null;
    dueDate: string;
    priority: string;
    status: string;
  };
  onSuccess?: () => void;
}

export function TaskForm({ projectId, members, task, onSuccess }: TaskFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEdit = !!task;

  const initialAssignee = task?.assigneeId
    ? typeof task.assigneeId === "string"
      ? task.assigneeId
      : String(task.assigneeId._id)
    : "";

  const [assigneeId, setAssigneeId] = useState(initialAssignee || "none");
  const [priority, setPriority] = useState(task?.priority || "MEDIUM");
  const [status, setStatus] = useState(task?.status || "TODO");

  const selectedMember = members.find((m) => memberId(m) === assigneeId);

  function handleSubmit(formData: FormData) {
    if (!isEdit) formData.append("projectId", projectId);
    if (isEdit) formData.append("id", task._id);
    formData.set("assigneeId", assigneeId === "none" ? "" : assigneeId);
    formData.set("priority", priority);
    formData.set("status", status);

    startTransition(async () => {
      const action = isEdit ? updateTaskAction : createTaskAction;
      const result = await action(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(isEdit ? "Task updated" : "Task created");
        onSuccess?.();
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Task Title</Label>
        <Input id="title" name="title" defaultValue={task?.title} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={task?.description} rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={(v) => v && setPriority(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select priority">
                {priority === "HIGH" ? "High" : priority === "LOW" ? "Low" : "Medium"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="assigneeId">Assign To</Label>
          <Select value={assigneeId} onValueChange={(v) => setAssigneeId(v ?? "none")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Unassigned">
                {assigneeId === "none" ? "Unassigned" : selectedMember?.name ?? "Unassigned"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Unassigned</SelectItem>
              {members.map((m) => (
                <SelectItem key={memberId(m)} value={memberId(m)}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(v) => v && setStatus(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status">
                {status === "TODO"
                  ? "Todo"
                  : status === "IN_PROGRESS"
                    ? "In Progress"
                    : "Completed"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO">Todo</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : isEdit ? "Update Task" : "Create Task"}
      </Button>
    </form>
  );
}
