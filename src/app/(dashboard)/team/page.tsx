import { getTeamWithWorkload } from "@/features/team/queries";
import { TeamClient } from "./team-client";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const team = await getTeamWithWorkload();
  return <TeamClient team={team} />;
}
