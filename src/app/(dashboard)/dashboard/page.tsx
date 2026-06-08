export const dynamic = "force-dynamic";

import {
  getDashboardStats,
  getTasksByPriority,
  getTaskStatusDistribution,
  getProjectSummaries,
  getRecentActivitiesForDashboard,
  getUpcomingDeadlines,
  getHighPriorityTasks,
  getTeamProductivity,
} from "@/features/dashboard/queries";
import { KPICards } from "@/features/dashboard/components/kpi-cards";
import { TasksByPriorityChart, TaskStatusChart, TeamProductivityChart } from "@/features/dashboard/components/charts";
import { ActivityFeed } from "@/features/dashboard/components/activity-feed";
import { UpcomingDeadlines, HighPriorityTasks } from "@/features/dashboard/components/upcoming-deadlines";
import { ProjectSummaries } from "@/features/dashboard/components/project-summaries";

export default async function DashboardPage() {
  const [stats, priorityData, statusData, projects, activities, deadlines, highPriority, productivity] =
    await Promise.all([
      getDashboardStats(),
      getTasksByPriority(),
      getTaskStatusDistribution(),
      getProjectSummaries(),
      getRecentActivitiesForDashboard(),
      getUpcomingDeadlines(),
      getHighPriorityTasks(),
      getTeamProductivity(),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your projects and tasks</p>
      </div>

      <KPICards stats={stats} />

      <div className="grid gap-4 lg:grid-cols-4">
        <TasksByPriorityChart data={priorityData} />
        <TaskStatusChart data={statusData} />
        <TeamProductivityChart data={productivity} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ProjectSummaries projects={projects} />
        <UpcomingDeadlines tasks={deadlines} />
        <HighPriorityTasks tasks={highPriority} />
      </div>

      <ActivityFeed activities={activities} />
    </div>
  );
}
