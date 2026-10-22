import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, statusLabel } from "@/lib/utils";
import { Badge, loanTone } from "@/components/ui/badge";
import { AdminEditBookForm } from "@/components/admin/edit-book-form";

export default async function AdminBookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      category: true,
      loans: {
        include: { user: true },
        orderBy: { borrowedAt: "desc" },
        take: 20,
      },
      reservations: {
        where: { status: { in: ["WAITING", "READY"] } },
        include: { user: true },
        orderBy: { position: "asc" },
      },
    },
  });
  if (!book) notFound();

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <Link href="/admin/books" className="text-sm text-[var(--muted)] hover:text-[var(--accent)]">
        ← К списку книг
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold">{book.title}</h1>
      <p className="mt-1 text-[var(--muted)]">{book.author} · ISBN {book.isbn}</p>

      <div className="mt-8">
        <AdminEditBookForm book={book} categories={categories} />
      </div>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl font-semibold">История выдач</h2>
        <div className="overflow-x-auto rounded-2xl border border-[var(--line)]">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-[var(--surface-2)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3">Читатель</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Взята</th>
                <th className="px-4 py-3">Срок</th>
                <th className="px-4 py-3">Возврат</th>
              </tr>
            </thead>
            <tbody>
              {book.loans.map((loan) => (
                <tr key={loan.id} className="border-t border-[var(--line)]">
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
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {loan.returnedAt ? formatDate(loan.returnedAt) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {book.reservations.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 font-display text-xl font-semibold">Очередь</h2>
          <div className="space-y-2">
            {book.reservations.map((r) => (
              <div key={r.id} className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm">
                #{r.position} · {r.user.name} · {statusLabel(r.status)}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
