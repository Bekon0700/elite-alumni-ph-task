import { z } from "zod";
import { mongoIdSchema } from "./common.schema";

export const addMemberSchema = z.object({
  projectId: mongoIdSchema,
  email: z.string().trim().email("Invalid email address"),
});

export const removeMemberSchema = z.object({
  projectId: mongoIdSchema,
  memberId: mongoIdSchema,
});
