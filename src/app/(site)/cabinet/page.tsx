import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncOverdueLoans } from "@/lib/library";
import { BookCover } from "@/components/book-cover";
import { Badge, loanTone } from "@/components/ui/badge";
import {
  ReturnButton,
  RenewButton,
  CancelReservationButton,
  BorrowButton,
} from "@/components/loan-actions";
import { daysUntil, formatDate, formatDateShort, statusLabel } from "@/lib/utils";
import { redirect } from "next/navigation";

export const metadata = { title: "Личный кабинет" };

export default async function CabinetPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await syncOverdueLoans();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      loans: {
        include: { book: true },
        orderBy: { borrowedAt: "desc" },
      },
      reservations: {
        where: { status: { in: ["WAITING", "READY"] } },
        include: { book: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) redirect("/login");

  const active = user.loans.filter((l) => l.status === "ACTIVE" || l.status === "OVERDUE");
  const history = user.loans.filter((l) => l.status === "RETURNED" || l.status === "LOST");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">Здравствуйте, {user.name}</h1>
          <p className="mt-2 text-[var(--muted)]">
            Читательский билет: <span className="font-mono text-[var(--ink)]">{user.membershipId.slice(0, 10).toUpperCase()}</span>
          </p>
        </div>
        <Link href="/catalog" className="text-sm font-medium text-[var(--accent)] hover:underline">
          В каталог →
        </Link>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="stat-card">
          <p className="text-sm text-[var(--muted)]">На руках</p>
          <p className="mt-1 font-display text-3xl font-semibold">{active.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-[var(--muted)]">В очереди</p>
          <p className="mt-1 font-display text-3xl font-semibold">{user.reservations.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-[var(--muted)]">Прочитано</p>
          <p className="mt-1 font-display text-3xl font-semibold">{history.length}</p>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="mb-4 font-display text-2xl font-semibold">Текущие выдачи</h2>
        {active.length === 0 ? (
          <p className="text-[var(--muted)]">Пока пусто — загляните в каталог.</p>
        ) : (
          <div className="space-y-3">
            {active.map((loan) => {
              const days = daysUntil(loan.dueDate);
              return (
                <div
                  key={loan.id}
                  className="flex flex-col gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center"
                >
                  <BookCover
                    title={loan.book.title}
                    author={loan.book.author}
                    color={loan.book.coverColor}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <Link href={`/books/${loan.bookId}`} className="font-display text-lg font-semibold hover:text-[var(--accent)]">
                      {loan.book.title}
                    </Link>
                    <p className="text-sm text-[var(--muted)]">{loan.book.author}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone={loanTone(loan.status)}>{statusLabel(loan.status)}</Badge>
                      <Badge tone={days < 0 ? "rose" : days <= 3 ? "amber" : "slate"}>
                        {days < 0
                          ? `Просрочено на ${Math.abs(days)} дн.`
                          : `Осталось ${days} дн. · до ${formatDateShort(loan.dueDate)}`}
                      </Badge>
                      {loan.fineAmount > 0 && (
                        <Badge tone="rose">Штраф {loan.fineAmount} ₽</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {loan.status === "ACTIVE" && <RenewButton loanId={loan.id} />}
                    <ReturnButton loanId={loan.id} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-12">
        <h2 className="mb-4 font-display text-2xl font-semibold">Очередь и брони</h2>
        {user.reservations.length === 0 ? (
          <p className="text-[var(--muted)]">Нет активных броней.</p>
        ) : (
          <div className="space-y-3">
            {user.reservations.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{r.book.title}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Badge tone={loanTone(r.status)}>{statusLabel(r.status)}</Badge>
                    {r.status === "WAITING" && <Badge>Место #{r.position}</Badge>}
                    {r.status === "READY" && r.book.availableCopies > 0 && (
                      <BorrowButton bookId={r.bookId} />
                    )}
                  </div>
                </div>
                <CancelReservationButton reservationId={r.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl font-semibold">История</h2>
        {history.length === 0 ? (
          <p className="text-[var(--muted)]">История пуста.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[var(--line)]">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-[var(--surface-2)] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Книга</th>
                  <th className="px-4 py-3 font-medium">Взята</th>
                  <th className="px-4 py-3 font-medium">Возврат</th>
                  <th className="px-4 py-3 font-medium">Штраф</th>
                </tr>
              </thead>
              <tbody>
                {history.map((loan) => (
                  <tr key={loan.id} className="border-t border-[var(--line)] bg-[var(--surface)]">
                    <td className="px-4 py-3">
                      <Link href={`/books/${loan.bookId}`} className="hover:text-[var(--accent)]">
                        {loan.book.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">{formatDate(loan.borrowedAt)}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">
                      {loan.returnedAt ? formatDate(loan.returnedAt) : "—"}
                    </td>
                    <td className="px-4 py-3">{loan.fineAmount > 0 ? `${loan.fineAmount} ₽` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
