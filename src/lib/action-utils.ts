import { auth } from "@/lib/auth";
import { SessionUser } from "@/types";
import { firstValidationError } from "@/schemas/common.schema";
import type { ZodError, ZodSchema } from "zod";

export async function requireSession(): Promise<
  { user: SessionUser } | { error: string }
> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  return { user: session.user as SessionUser };
}

export function parseInput<T>(
  schema: ZodSchema<T>,
  input: unknown
): { data: T } | { error: string } {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: firstValidationError(parsed.error as ZodError) };
  }
  return { data: parsed.data };
}
