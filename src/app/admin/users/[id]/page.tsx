import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, statusLabel } from "@/lib/utils";
import { Badge, loanTone } from "@/components/ui/badge";
import { ToggleUserButton } from "@/components/admin/toggle-user-button";
import { UserNotesForm } from "@/components/admin/user-notes-form";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      loans: {
        include: { book: true },
        orderBy: { borrowedAt: "desc" },
      },
      reservations: {
        include: { book: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!user) notFound();

  return (
    <div>
      <Link href="/admin/users" className="text-sm text-[var(--muted)] hover:text-[var(--accent)]">
        ← К читателям
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">{user.name}</h1>
          <p className="mt-1 text-[var(--muted)]">
            {user.email} · {user.phone ?? "без телефона"}
          </p>
          <p className="mt-1 font-mono text-sm text-[var(--accent)]">
            Билет {user.membershipId.slice(0, 12).toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone={user.isActive ? "green" : "rose"}>
            {user.isActive ? "Активен" : "Заблокирован"}
          </Badge>
          {user.role === "USER" && (
            <ToggleUserButton userId={user.id} isActive={user.isActive} />
          )}
        </div>
      </div>

      <div className="mt-8">
        <UserNotesForm userId={user.id} notes={user.notes ?? ""} />
      </div>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl font-semibold">Полная история выдач</h2>
        <div className="overflow-x-auto rounded-2xl border border-[var(--line)]">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-[var(--surface-2)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3">Книга</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Взята</th>
                <th className="px-4 py-3">Срок</th>
                <th className="px-4 py-3">Возврат</th>
                <th className="px-4 py-3">Штраф</th>
              </tr>
            </thead>
            <tbody>
              {user.loans.map((loan) => (
                <tr key={loan.id} className="border-t border-[var(--line)]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/books/${loan.bookId}`} className="hover:text-[var(--accent)]">
                      {loan.book.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={loanTone(loan.status)}>{statusLabel(loan.status)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{formatDate(loan.borrowedAt)}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{formatDate(loan.dueDate)}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {loan.returnedAt ? formatDate(loan.returnedAt) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {loan.fineAmount > 0 ? `${loan.fineAmount} ₽` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 font-display text-xl font-semibold">Активность пользователя</h2>
        <div className="space-y-2">
          {user.activityLogs.map((a) => (
            <div key={a.id} className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm">
              <span className="text-[var(--accent)]">{a.action}</span>
              {a.details ? ` — ${a.details}` : ""}
              <span className="ml-2 text-xs text-[var(--muted)]">{formatDate(a.createdAt)}</span>
            </div>
          ))}
          {user.activityLogs.length === 0 && (
            <p className="text-[var(--muted)]">Записей пока нет</p>
          )}
        </div>
      </section>
    </div>
  );
}
