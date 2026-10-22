import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { syncOverdueLoans } from "@/lib/library";
import { formatRelative, statusLabel } from "@/lib/utils";
import { Badge, loanTone } from "@/components/ui/badge";
import { AlertTriangle, BookOpen, ClipboardList, Users } from "lucide-react";

export const metadata = { title: "CRM Дашборд" };

export default async function AdminDashboard() {
  await syncOverdueLoans();

  const [
    books,
    users,
    activeLoans,
    overdueLoans,
    reservations,
    recentLoans,
    recentActivity,
    topBooks,
  ] = await Promise.all([
    prisma.book.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.loan.count({ where: { status: "ACTIVE" } }),
    prisma.loan.count({ where: { status: "OVERDUE" } }),
    prisma.reservation.count({ where: { status: { in: ["WAITING", "READY"] } } }),
    prisma.loan.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: true, book: true },
    }),
    prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    prisma.loan.groupBy({
      by: ["bookId"],
      _count: { bookId: true },
      orderBy: { _count: { bookId: "desc" } },
      take: 5,
    }),
  ]);

  const topBookIds = topBooks.map((t) => t.bookId);
  const bookMap = Object.fromEntries(
    (
      await prisma.book.findMany({
        where: { id: { in: topBookIds } },
      })
    ).map((b) => [b.id, b])
  );

  const stats = [
    { label: "Книг в фонде", value: books, icon: BookOpen },
    { label: "Читателей", value: users, icon: Users },
    { label: "Активных выдач", value: activeLoans, icon: ClipboardList },
    { label: "Просрочек", value: overdueLoans, icon: AlertTriangle },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Дашборд</h1>
      <p className="mt-1 text-[var(--muted)]">Обзор библиотеки в реальном времени</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--muted)]">{s.label}</p>
              <s.icon className="h-4 w-4 text-[var(--accent)]" />
            </div>
            <p className="mt-2 font-display text-3xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="stat-card inline-flex items-center gap-3">
          <span className="text-sm text-[var(--muted)]">Активных броней</span>
          <span className="font-display text-xl font-semibold text-[var(--accent)]">{reservations}</span>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Последние выдачи</h2>
            <Link href="/admin/loans" className="text-sm text-[var(--accent)] hover:underline">
              Все →
            </Link>
          </div>
          <div className="space-y-3">
            {recentLoans.map((loan) => (
              <div key={loan.id} className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-3 last:border-0">
                <div>
                  <p className="font-medium">{loan.book.title}</p>
                  <p className="text-sm text-[var(--muted)]">{loan.user.name}</p>
                </div>
                <Badge tone={loanTone(loan.status)}>{statusLabel(loan.status)}</Badge>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Лента активности</h2>
            <Link href="/admin/activity" className="text-sm text-[var(--accent)] hover:underline">
              Все →
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity.map((a) => (
              <div key={a.id} className="border-b border-[var(--line)] pb-3 last:border-0">
                <p className="text-sm">
                  <span className="text-[var(--accent)]">{a.action}</span>
                  {a.details ? ` — ${a.details}` : ""}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {a.user?.name ?? "Система"} · {formatRelative(a.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <h2 className="mb-4 font-display text-xl font-semibold">Топ книг по выдачам</h2>
        <div className="space-y-2">
          {topBooks.map((t, i) => (
            <div
              key={t.bookId}
              className="flex items-center justify-between rounded-xl bg-[var(--surface-2)] px-4 py-3"
            >
              <p>
                <span className="mr-3 text-[var(--muted)]">{i + 1}.</span>
                {bookMap[t.bookId]?.title ?? t.bookId}
              </p>
              <span className="text-sm text-[var(--accent)]">{t._count.bookId} выдач</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
