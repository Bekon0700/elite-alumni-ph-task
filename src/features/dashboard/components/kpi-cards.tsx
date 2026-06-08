"use client";

import { FolderKanban, CheckSquare, Clock, AlertTriangle, ListTodo } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KPICardsProps {
  stats: {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
  };
}

const kpiConfig = [
  { key: "totalProjects", label: "Total Projects", icon: FolderKanban, color: "text-blue-600" },
  { key: "totalTasks", label: "Total Tasks", icon: ListTodo, color: "text-purple-600" },
  { key: "completedTasks", label: "Completed", icon: CheckSquare, color: "text-green-600" },
  { key: "pendingTasks", label: "Pending", icon: Clock, color: "text-orange-600" },
  { key: "overdueTasks", label: "Overdue", icon: AlertTriangle, color: "text-red-600" },
] as const;

export function KPICards({ stats }: KPICardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {kpiConfig.map(({ key, label, icon: Icon, color }) => (
        <Card key={key}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold mt-1">{stats[key]}</p>
              </div>
              <Icon className={`h-8 w-8 ${color} opacity-80`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
