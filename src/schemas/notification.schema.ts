import { z } from "zod";
import { mongoIdSchema } from "./common.schema";

export const markNotificationReadSchema = z.object({
  id: mongoIdSchema,
});
