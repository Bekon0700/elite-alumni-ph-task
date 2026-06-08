"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ProjectSummary {
  _id: string;
  name: string;
  status: string;
  pending: number;
  progress: number;
  daysUntilDeadline: number;
}

export function ProjectSummaries({ projects }: { projects: ProjectSummary[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Project Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No active projects</p>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <Link key={project._id} href={`/projects/${project._id}`} className="block">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">{project.name}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {project.daysUntilDeadline > 0
                      ? `${project.daysUntilDeadline}d left`
                      : "Overdue"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={project.progress} className="flex-1" />
                  <span className="text-xs text-muted-foreground w-16 text-right">
                    {project.progress}% done
                  </span>
                </div>
                {project.pending > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {project.pending} task{project.pending > 1 ? "s" : ""} pending
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
