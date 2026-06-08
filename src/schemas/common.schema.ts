import { z } from "zod";

export const mongoIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid ID");

export const optionalMongoIdSchema = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? undefined : val),
  mongoIdSchema.optional()
);

export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]);
export const taskPrioritySchema = z.enum(["HIGH", "MEDIUM", "LOW"]);
export const projectStatusSchema = z.enum(["ACTIVE", "COMPLETED", "ON_HOLD"]);

export const futureDateStringSchema = z.string().refine((val) => {
  const date = new Date(val);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return !Number.isNaN(date.getTime()) && date >= today;
}, "Please select a valid deadline.");

export const idParamSchema = z.object({ id: mongoIdSchema });
export const taskIdParamSchema = z.object({ taskId: mongoIdSchema });

export const updateTaskStatusSchema = z.object({
  id: mongoIdSchema,
  status: taskStatusSchema,
});

export const updateProjectStatusSchema = z.object({
  id: mongoIdSchema,
  status: projectStatusSchema,
});

export const deleteAttachmentSchema = z.object({
  taskId: mongoIdSchema,
  publicId: z.string().min(1, "Attachment ID is required"),
});

export const tasksListQuerySchema = z.object({
  projectId: mongoIdSchema.optional(),
  status: z.enum(["ALL", "TODO", "IN_PROGRESS", "COMPLETED"]).optional(),
  priority: z.enum(["ALL", "HIGH", "MEDIUM", "LOW"]).optional(),
  search: z.string().max(200).optional(),
  overdue: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  sort: z.enum(["-createdAt", "dueDate", "priority", "-updatedAt"]).default("-createdAt"),
});

export const projectsListQuerySchema = z.object({
  status: z.enum(["ALL", "ACTIVE", "COMPLETED", "ON_HOLD"]).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  sort: z.enum(["-createdAt", "-updatedAt", "deadline", "name"]).default("-createdAt"),
});

const DEFAULT_TASKS_QUERY: z.infer<typeof tasksListQuerySchema> = {
  page: 1,
  sort: "-createdAt",
};

const DEFAULT_PROJECTS_QUERY: z.infer<typeof projectsListQuerySchema> = {
  page: 1,
  sort: "-createdAt",
};

export function parseTasksListQuery(params: Record<string, string | undefined>) {
  const parsed = tasksListQuerySchema.safeParse(params);
  return parsed.success ? parsed.data : DEFAULT_TASKS_QUERY;
}

export function parseProjectsListQuery(params: Record<string, string | undefined>) {
  const parsed = projectsListQuerySchema.safeParse(params);
  return parsed.success ? parsed.data : DEFAULT_PROJECTS_QUERY;
}

export function firstValidationError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Invalid input";
}
