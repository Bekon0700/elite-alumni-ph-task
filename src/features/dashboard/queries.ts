import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Task } from "@/models/Task";
import { Activity } from "@/models/Activity";

export async function getDashboardStats() {
  await connectDB();

  const now = new Date();

  const [
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
  ] = await Promise.all([
    Project.countDocuments(),
    Task.countDocuments(),
    Task.countDocuments({ status: "COMPLETED" }),
    Task.countDocuments({ status: { $in: ["TODO", "IN_PROGRESS"] } }),
    Task.countDocuments({ dueDate: { $lt: now }, status: { $ne: "COMPLETED" } }),
  ]);

  return { totalProjects, totalTasks, completedTasks, pendingTasks, overdueTasks };
}

export async function getTasksByPriority() {
  await connectDB();
  const result = await Task.aggregate([
    { $group: { _id: "$priority", count: { $sum: 1 } } },
  ]);
  return result.map((r) => ({ name: r._id, value: r.count }));
}

export async function getTaskStatusDistribution() {
  await connectDB();
  const result = await Task.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  return result.map((r) => ({ name: r._id.replace("_", " "), value: r.count }));
}

export async function getProjectSummaries() {
  await connectDB();
  const projects = await Project.find({ status: { $ne: "COMPLETED" } })
    .sort({ deadline: 1 })
    .limit(5)
    .lean();

  const summaries = await Promise.all(
    projects.map(async (p) => {
      const [total, completed] = await Promise.all([
        Task.countDocuments({ projectId: p._id }),
        Task.countDocuments({ projectId: p._id, status: "COMPLETED" }),
      ]);
      const pending = total - completed;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      const daysUntilDeadline = Math.ceil(
        (new Date(p.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return {
        _id: p._id.toString(),
        name: p.name,
        status: p.status,
        pending,
        progress,
        daysUntilDeadline,
      };
    })
  );

  return summaries;
}

export async function getRecentActivitiesForDashboard() {
  await connectDB();
  const activities = await Activity.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("userId", "name")
    .lean();
  return JSON.parse(JSON.stringify(activities));
}

export async function getUpcomingDeadlines() {
  await connectDB();
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const tasks = await Task.find({
    dueDate: { $gte: new Date(), $lte: nextWeek },
    status: { $ne: "COMPLETED" },
  })
    .sort({ dueDate: 1 })
    .limit(5)
    .populate("assigneeId", "name")
    .populate("projectId", "name")
    .lean();

  return JSON.parse(JSON.stringify(tasks));
}

export async function getHighPriorityTasks() {
  await connectDB();
  const tasks = await Task.find({
    priority: "HIGH",
    status: { $ne: "COMPLETED" },
  })
    .sort({ dueDate: 1 })
    .limit(5)
    .populate("assigneeId", "name")
    .populate("projectId", "name")
    .lean();

  return JSON.parse(JSON.stringify(tasks));
}

export async function getTeamProductivity() {
  await connectDB();
  const result = await Task.aggregate([
    { $match: { assigneeId: { $ne: null } } },
    {
      $group: {
        _id: "$assigneeId",
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        name: "$user.name",
        total: 1,
        completed: 1,
      },
    },
    { $sort: { completed: -1 } },
    { $limit: 8 },
  ]);

  return result.map((r) => ({ name: r.name, total: r.total, completed: r.completed }));
}

export async function getProjectProgressTrend() {
  await connectDB();

  const projects = await Project.find({ status: { $ne: "COMPLETED" } })
    .sort({ updatedAt: -1 })
    .limit(5)
    .lean();

  const weekLabels: string[] = [];
  const weekEnds: Date[] = [];
  for (let i = 7; i >= 0; i--) {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    end.setDate(end.getDate() - i * 7);
    weekEnds.push(end);
    weekLabels.push(
      end.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    );
  }

  const projectSeries = await Promise.all(
    projects.map(async (project) => {
      const total = await Task.countDocuments({ projectId: project._id });
      const progressByWeek = await Promise.all(
        weekEnds.map(async (endDate) => {
          const completed = await Task.countDocuments({
            projectId: project._id,
            status: "COMPLETED",
            updatedAt: { $lte: endDate },
          });
          return total > 0 ? Math.round((completed / total) * 100) : 0;
        })
      );
      return {
        name: project.name.length > 18 ? `${project.name.slice(0, 18)}…` : project.name,
        progressByWeek,
      };
    })
  );

  const chartData = weekLabels.map((week, index) => {
    const point: Record<string, string | number> = { week };
    projectSeries.forEach((series) => {
      point[series.name] = series.progressByWeek[index];
    });
    return point;
  });

  return {
    chartData,
    projectNames: projectSeries.map((s) => s.name),
  };
}
