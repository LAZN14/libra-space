import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ToggleUserButton } from "@/components/admin/toggle-user-button";

export const metadata = { title: "Читатели · CRM" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const users = await prisma.user.findMany({
    where: {
      role: "USER",
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { membershipId: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      _count: {
        select: {
          loans: true,
        },
      },
      loans: {
        where: { status: { in: ["ACTIVE", "OVERDUE"] } },
        select: { id: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Читатели</h1>
      <p className="mt-1 text-[var(--muted)]">Все клиенты и их активность</p>

      <form className="my-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Имя, email или номер билета..."
          className="h-11 w-full max-w-md rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 outline-none focus:border-[var(--accent)]"
        />
      </form>

      <div className="overflow-x-auto rounded-2xl border border-[var(--line)]">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-[var(--surface-2)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">Имя</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Билет</th>
              <th className="px-4 py-3">На руках</th>
              <th className="px-4 py-3">Всего выдач</th>
              <th className="px-4 py-3">Регистрация</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-[var(--line)]">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/users/${u.id}`} className="hover:text-[var(--accent)]">
                    {u.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">{u.email}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {u.membershipId.slice(0, 10).toUpperCase()}
                </td>
                <td className="px-4 py-3">{u.loans.length}</td>
                <td className="px-4 py-3">{u._count.loans}</td>
                <td className="px-4 py-3 text-[var(--muted)]">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <Badge tone={u.isActive ? "green" : "rose"}>
                    {u.isActive ? "Активен" : "Блок"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <ToggleUserButton userId={u.id} isActive={u.isActive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
