"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createProjectAction, updateProjectAction } from "../actions";

interface ProjectFormProps {
  project?: {
    _id: string;
    name: string;
    description: string;
    deadline: string;
    status: string;
  };
  onSuccess?: () => void;
}

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEdit = !!project;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const action = isEdit ? updateProjectAction : createProjectAction;
      if (isEdit) formData.append("id", project._id);
      const result = await action(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(isEdit ? "Project updated" : "Project created");
        onSuccess?.();
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Project Name</Label>
        <Input id="name" name="name" defaultValue={project?.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={project?.description} rows={3} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="deadline">Deadline</Label>
        <Input
          id="deadline"
          name="deadline"
          type="date"
          defaultValue={project?.deadline ? new Date(project.deadline).toISOString().split("T")[0] : ""}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select name="status" defaultValue={project?.status || "ACTIVE"}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="ON_HOLD">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : isEdit ? "Update Project" : "Create Project"}
      </Button>
    </form>
  );
}
