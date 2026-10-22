import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { AdminBookForm } from "@/components/admin/book-form";

export const metadata = { title: "Книги · CRM" };

export default async function AdminBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const books = await prisma.book.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { author: { contains: q, mode: "insensitive" } },
            { isbn: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { category: true, _count: { select: { loans: true } } },
    orderBy: { title: "asc" },
    take: 100,
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Фонд книг</h1>
          <p className="mt-1 text-[var(--muted)]">{books.length} записей</p>
        </div>
      </div>

      <form className="mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Поиск..."
          className="h-11 w-full max-w-md rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 outline-none focus:border-[var(--accent)]"
        />
      </form>

      <div className="mb-8">
        <AdminBookForm categories={categories} />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--line)]">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-[var(--surface-2)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Название</th>
              <th className="px-4 py-3 font-medium">Автор</th>
              <th className="px-4 py-3 font-medium">Жанр</th>
              <th className="px-4 py-3 font-medium">Экземпляры</th>
              <th className="px-4 py-3 font-medium">Выдач</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id} className="border-t border-[var(--line)]">
                <td className="px-4 py-3 font-medium">{book.title}</td>
                <td className="px-4 py-3 text-[var(--muted)]">{book.author}</td>
                <td className="px-4 py-3">
                  <Badge>{book.category.name}</Badge>
                </td>
                <td className="px-4 py-3">
                  {book.availableCopies}/{book.totalCopies}
                </td>
                <td className="px-4 py-3">{book._count.loans}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/books/${book.id}`} className="text-[var(--accent)] hover:underline">
                    Открыть
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
