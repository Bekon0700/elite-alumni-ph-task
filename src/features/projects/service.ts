import { connectDB } from "@/lib/db";
import { deleteUploadedAsset } from "@/lib/cloudinary";
import { Project } from "@/models/Project";
import { Task } from "@/models/Task";
import { Comment } from "@/models/Comment";
import { Notification } from "@/models/Notification";
import { Activity } from "@/models/Activity";
import { logActivity } from "@/features/activity/service";
import { CreateProjectInput, UpdateProjectInput } from "@/schemas/project.schema";

export async function createProject(data: CreateProjectInput, userId: string) {
  await connectDB();
  const project = await Project.create({
    ...data,
    deadline: new Date(data.deadline),
    createdBy: userId,
    members: [userId],
  });

  await logActivity({
    action: "PROJECT_CREATED",
    message: `Project "${project.name}" created`,
    userId,
    projectId: project._id.toString(),
  });

  return project;
}

export async function updateProject(data: UpdateProjectInput, userId: string) {
  await connectDB();
  const { id, ...updates } = data;

  const updateData: Record<string, unknown> = { ...updates };
  if (updates.deadline) {
    updateData.deadline = new Date(updates.deadline);
  }

  const project = await Project.findByIdAndUpdate(id, updateData, { returnDocument: "after" });
  if (!project) throw new Error("Project not found");

  await logActivity({
    action: "PROJECT_UPDATED",
    message: `Project "${project.name}" updated`,
    userId,
    projectId: project._id.toString(),
  });

  return project;
}

export async function deleteProject(id: string, userId: string) {
  await connectDB();
  const project = await Project.findById(id);
  if (!project) throw new Error("Project not found");

  const tasks = await Task.find({ projectId: id }).lean();
  const taskIds = tasks.map((task) => task._id);

  for (const task of tasks) {
    for (const attachment of task.attachments ?? []) {
      await deleteUploadedAsset(attachment.publicId, attachment.mimeType);
    }
  }

  await Promise.all([
    taskIds.length > 0 ? Comment.deleteMany({ taskId: { $in: taskIds } }) : Promise.resolve(),
    Notification.deleteMany({
      $or: [
        { relatedProjectId: id },
        ...(taskIds.length > 0 ? [{ relatedTaskId: { $in: taskIds } }] : []),
      ],
    }),
    Activity.deleteMany({
      $or: [
        { projectId: id },
        ...(taskIds.length > 0 ? [{ taskId: { $in: taskIds } }] : []),
      ],
    }),
    Task.deleteMany({ projectId: id }),
  ]);

  await Project.findByIdAndDelete(id);

  await logActivity({
    action: "PROJECT_DELETED",
    message: `Project "${project.name}" deleted`,
    userId,
    projectId: id,
  });

  return project;
}
