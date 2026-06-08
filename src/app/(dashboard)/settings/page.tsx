export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";
import { Role } from "@/types";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = {
    name: session.user.name ?? "User",
    email: session.user.email ?? "",
    role: session.user.role as Role,
  };

  return <SettingsClient user={user} />;
}
