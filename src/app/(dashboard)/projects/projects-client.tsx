"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProjectCard } from "@/features/projects/components/project-card";
import { ProjectForm } from "@/features/projects/components/project-form";

interface Props {
  projects: Array<{
    _id: string;
    name: string;
    description: string;
    deadline: string;
    status: string;
    members: { _id: string; name: string }[];
    createdBy?: { name: string };
  }>;
  total: number;
  pages: number;
  currentPage: number;
  canCreate: boolean;
}

export function ProjectsClient({ projects, total, pages, currentPage, canCreate }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [editProject, setEditProject] = useState<Props["projects"][0] | null>(null);

  function updateParams(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/projects?${params.toString()}`);
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/projects?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground">{total} project(s) total</p>
        </div>
        {canCreate && (
          <Dialog open={open} onOpenChange={setOpen}>
            <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" /> New Project</Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
              </DialogHeader>
              <ProjectForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-9"
            defaultValue={searchParams.get("search") ?? ""}
            onChange={(e) => {
              const timeout = setTimeout(() => updateParams("search", e.target.value), 300);
              return () => clearTimeout(timeout);
            }}
          />
        </div>
        <Select
          defaultValue={searchParams.get("status") ?? "ALL"}
          onValueChange={(v) => updateParams("status", v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="ON_HOLD">On Hold</SelectItem>
          </SelectContent>
        </Select>
        <Select
          defaultValue={searchParams.get("sort") ?? "-createdAt"}
          onValueChange={(v) => updateParams("sort", v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-createdAt">Latest Created</SelectItem>
            <SelectItem value="deadline">Nearest Deadline</SelectItem>
            <SelectItem value="-updatedAt">Recently Updated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No projects found. {canCreate && "Create your first project!"}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={() => setEditProject(project)}
            />
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

      {editProject && (
        <Dialog open={!!editProject} onOpenChange={() => setEditProject(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            <ProjectForm project={editProject} onSuccess={() => setEditProject(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
