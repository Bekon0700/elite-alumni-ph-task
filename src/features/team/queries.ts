import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Task } from "@/models/Task";

export async function getTeamWithWorkload() {
  await connectDB();

  const members = await User.find({}).select("name email role").lean();

  const workload = await Task.aggregate([
    { $group: {
      _id: "$assigneeId",
      total: { $sum: 1 },
      completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
      inProgress: { $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] } },
      todo: { $sum: { $cond: [{ $eq: ["$status", "TODO"] }, 1, 0] } },
    }},
  ]);

  const workloadMap = new Map(
    workload.map((w) => [w._id?.toString(), w])
  );

  const teamData = members.map((member) => {
    const stats = workloadMap.get(member._id.toString()) || { total: 0, completed: 0, inProgress: 0, todo: 0 };
    return {
      ...member,
      _id: member._id.toString(),
      stats: {
        total: stats.total,
        completed: stats.completed,
        pending: stats.inProgress + stats.todo,
        inProgress: stats.inProgress,
      },
    };
  });

  return JSON.parse(JSON.stringify(teamData));
}

export async function getMemberTasks(memberId: string) {
  await connectDB();
  const tasks = await Task.find({ assigneeId: memberId })
    .populate("projectId", "name")
    .sort("-createdAt")
    .lean();
  return JSON.parse(JSON.stringify(tasks));
}
