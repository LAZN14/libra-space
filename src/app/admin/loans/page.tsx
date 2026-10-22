import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { syncOverdueLoans } from "@/lib/library";
import { formatDate, statusLabel } from "@/lib/utils";
import { Badge, loanTone } from "@/components/ui/badge";
import { ForceReturnButton } from "@/components/admin/force-return-button";
import { LoanStatus } from "@prisma/client";

export const metadata = { title: "Выдачи · CRM" };

export default async function AdminLoansPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await syncOverdueLoans();
  const { status } = await searchParams;

  const where =
    status && Object.values(LoanStatus).includes(status as LoanStatus)
      ? { status: status as LoanStatus }
      : undefined;

  const loans = await prisma.loan.findMany({
    where,
    include: { user: true, book: true },
    orderBy: { borrowedAt: "desc" },
    take: 100,
  });

  const filters = [
    { value: "", label: "Все" },
    { value: "ACTIVE", label: "Активные" },
    { value: "OVERDUE", label: "Просроченные" },
    { value: "RETURNED", label: "Возвращённые" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Выдачи</h1>
      <p className="mt-1 text-[var(--muted)]">Полная история всех операций</p>

      <div className="my-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.label}
            href={f.value ? `/admin/loans?status=${f.value}` : "/admin/loans"}
            className={`rounded-xl px-3 py-2 text-sm ${
              (status ?? "") === f.value
                ? "bg-[var(--accent)] text-[#04140d]"
                : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--line)]">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-[var(--surface-2)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">Книга</th>
              <th className="px-4 py-3">Читатель</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Взята</th>
              <th className="px-4 py-3">Срок</th>
              <th className="px-4 py-3">Продлений</th>
              <th className="px-4 py-3">Штраф</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id} className="border-t border-[var(--line)]">
                <td className="px-4 py-3">
                  <Link href={`/admin/books/${loan.bookId}`} className="hover:text-[var(--accent)]">
                    {loan.book.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${loan.userId}`} className="hover:text-[var(--accent)]">
                    {loan.user.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={loanTone(loan.status)}>{statusLabel(loan.status)}</Badge>
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">{formatDate(loan.borrowedAt)}</td>
                <td className="px-4 py-3 text-[var(--muted)]">{formatDate(loan.dueDate)}</td>
                <td className="px-4 py-3">{loan.renewedCount}</td>
                <td className="px-4 py-3">
                  {loan.fineAmount > 0 ? `${loan.fineAmount} ₽` : "—"}
                </td>
                <td className="px-4 py-3">
                  {(loan.status === "ACTIVE" || loan.status === "OVERDUE") && (
                    <ForceReturnButton loanId={loan.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
