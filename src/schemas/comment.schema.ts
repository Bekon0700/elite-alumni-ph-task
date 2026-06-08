import { z } from "zod";
import { mongoIdSchema } from "./common.schema";

export const addCommentSchema = z.object({
  taskId: mongoIdSchema,
  content: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment must be under 2000 characters"),
});

export const getCommentsSchema = z.object({
  taskId: mongoIdSchema,
});
