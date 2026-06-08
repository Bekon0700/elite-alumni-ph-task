import { z } from "zod";

export const createTaskSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  title: z.string().min(2, "Task title must be at least 2 characters"),
  description: z.string().optional().default(""),
  assigneeId: z.string().optional(),
  dueDate: z.string().refine((val) => {
    const date = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, "Please select a valid deadline."),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).default("TODO"),
});

export const updateTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
