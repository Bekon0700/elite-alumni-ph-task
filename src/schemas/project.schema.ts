import { z } from "zod";
import { futureDateStringSchema, mongoIdSchema, projectStatusSchema } from "./common.schema";

export const createProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  description: z.string().optional().default(""),
  deadline: futureDateStringSchema,
  status: projectStatusSchema.default("ACTIVE"),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  id: mongoIdSchema,
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
