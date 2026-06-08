import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { markNotificationReadSchema } from "@/schemas/notification.schema";
import { firstValidationError } from "@/schemas/common.schema";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json([], { status: 401 });

  await connectDB();
  const notifications = await Notification.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return NextResponse.json(notifications);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = markNotificationReadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: firstValidationError(parsed.error) },
      { status: 400 }
    );
  }

  await connectDB();
  await Notification.findOneAndUpdate(
    { _id: parsed.data.id, userId: session.user.id },
    { read: true }
  );

  return NextResponse.json({ success: true });
}
