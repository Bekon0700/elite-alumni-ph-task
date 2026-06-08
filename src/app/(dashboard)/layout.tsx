import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";
import { Role } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user
    ? {
        name: session.user.name ?? "User",
        email: session.user.email ?? "",
        role: session.user.role as Role,
      }
    : null;

  return (
    <div className="min-h-screen">
      <Sidebar user={user} />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <Header user={user} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
