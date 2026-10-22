import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="admin-shell min-h-screen lg:flex">
      <AdminNav />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-[var(--line)] px-4 py-4 sm:px-6">
          <p className="text-sm text-[var(--muted)]">
            Вошли как <span className="text-[var(--ink)]">{session.user.name}</span> · {session.user.email}
          </p>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
