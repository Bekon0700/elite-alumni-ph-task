import { z } from "zod";
import {
  futureDateStringSchema,
  mongoIdSchema,
  optionalMongoIdSchema,
  taskPrioritySchema,
  taskStatusSchema,
} from "./common.schema";

export const createTaskSchema = z.object({
  projectId: mongoIdSchema,
  title: z.string().min(2, "Task title must be at least 2 characters"),
  description: z.string().optional().default(""),
  assigneeId: optionalMongoIdSchema,
  dueDate: futureDateStringSchema,
  priority: taskPrioritySchema.default("MEDIUM"),
  status: taskStatusSchema.default("TODO"),
});

export const updateTaskSchema = z.object({
  id: mongoIdSchema,
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  assigneeId: optionalMongoIdSchema,
  dueDate: z.string().optional(),
  priority: taskPrioritySchema.optional(),
  status: taskStatusSchema.optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const bulkTaskIdsSchema = z.object({
  taskIds: z.array(mongoIdSchema).min(1, "Select at least one task"),
});

export const bulkUpdateStatusSchema = bulkTaskIdsSchema.extend({
  status: taskStatusSchema,
});

export const bulkUpdatePrioritySchema = bulkTaskIdsSchema.extend({
  priority: taskPrioritySchema,
});

export type BulkUpdateStatusInput = z.infer<typeof bulkUpdateStatusSchema>;
export type BulkUpdatePriorityInput = z.infer<typeof bulkUpdatePrioritySchema>;
