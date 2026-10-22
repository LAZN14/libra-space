import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookCard } from "@/components/book-card";
import { CatalogFilters } from "@/components/catalog-filters";
import { Prisma } from "@prisma/client";

const PAGE_SIZE = 12;

export const metadata = { title: "Каталог" };

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const category = sp.category ?? "";
  const availability = sp.availability ?? "";
  const page = Math.max(1, Number(sp.page || 1));

  const where: Prisma.BookWhereInput = {};

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { author: { contains: q, mode: "insensitive" } },
      { isbn: { contains: q, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  if (availability === "available") where.availableCopies = { gt: 0 };
  if (availability === "unavailable") where.availableCopies = { lte: 0 };

  const [categories, total, books] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.book.count({ where }),
    prisma.book.findMany({
      where,
      include: { category: true },
      orderBy: [{ title: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (availability) params.set("availability", availability);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return s ? `/catalog?${s}` : "/catalog";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold">Каталог книг</h1>
        <p className="mt-2 text-[var(--muted)]">
          Найдено: {total} {total === 1 ? "книга" : total < 5 ? "книги" : "книг"}
        </p>
      </div>

      <Suspense fallback={null}>
        <CatalogFilters categories={categories} />
      </Suspense>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book, i) => (
          <BookCard
            key={book.id}
            id={book.id}
            title={book.title}
            author={book.author}
            coverColor={book.coverColor}
            categoryName={book.category.name}
            availableCopies={book.availableCopies}
            totalCopies={book.totalCopies}
            publishedYear={book.publishedYear}
            index={i}
          />
        ))}
      </div>

      {books.length === 0 && (
        <div className="mt-16 text-center text-[var(--muted)]">
          Ничего не найдено. Попробуйте изменить фильтры.
        </div>
      )}

      {pages > 1 && (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium transition ${
                p === page
                  ? "bg-[var(--accent)] text-white"
                  : "border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)]"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
