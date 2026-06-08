"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Users, MoreVertical, Trash2, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { deleteProjectAction } from "../actions";
import { useSession } from "next-auth/react";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ON_HOLD: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

interface ProjectCardProps {
  project: {
    _id: string;
    name: string;
    description: string;
    deadline: string;
    status: string;
    members: { _id: string; name: string }[];
    createdBy?: { name: string };
  };
  onEdit?: () => void;
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const { data: session } = useSession();
  const canManage = session?.user?.role === "ADMIN" || session?.user?.role === "PROJECT_MANAGER";

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this project?")) return;
    const result = await deleteProjectAction(project._id);
    if (result?.error) toast.error(result.error);
    else toast.success("Project deleted");
  }

  return (
    <Card className="group relative cursor-pointer hover:shadow-md transition-shadow">
      <Link
        href={`/projects/${project._id}`}
        className="absolute inset-0 z-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`View project ${project.name}`}
      />
      <CardHeader className="relative z-10 flex flex-row items-start justify-between space-y-0 pb-2 pointer-events-none">
        <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors flex-1 pr-2">
          {project.name}
        </CardTitle>
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger className="pointer-events-auto h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent opacity-0 group-hover:opacity-100">
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="pointer-events-auto">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="relative z-10 pointer-events-none">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {project.description || "No description"}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(project.deadline), "MMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {project.members?.length || 0}
            </span>
          </div>
          <Badge className={statusColors[project.status] || ""} variant="secondary">
            {project.status.replace("_", " ")}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
