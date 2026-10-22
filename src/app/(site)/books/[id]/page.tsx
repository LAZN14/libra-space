import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookCover } from "@/components/book-cover";
import { Badge } from "@/components/ui/badge";
import { BorrowButton, ReserveButton } from "@/components/loan-actions";
import { formatDate, statusLabel } from "@/lib/utils";
import { Star } from "lucide-react";
import { ReviewForm } from "@/components/review-form";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await prisma.book.findUnique({ where: { id } });
  return { title: book?.title ?? "Книга" };
}

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      reservations: {
        where: { status: { in: ["WAITING", "READY"] } },
      },
    },
  });

  if (!book) notFound();

  const avgRating =
    book.reviews.length > 0
      ? book.reviews.reduce((s, r) => s + r.rating, 0) / book.reviews.length
      : 0;

  const userLoan = session?.user?.id
    ? await prisma.loan.findFirst({
        where: {
          userId: session.user.id,
          bookId: book.id,
          status: { in: ["ACTIVE", "OVERDUE"] },
        },
      })
    : null;

  const canReview = session?.user?.id
    ? !!(await prisma.loan.findFirst({
        where: { userId: session.user.id, bookId: book.id, status: "RETURNED" },
      }))
    : false;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link href="/catalog" className="text-sm text-[var(--muted)] hover:text-[var(--accent)]">
        ← Назад в каталог
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[240px_1fr]">
        <BookCover
          title={book.title}
          author={book.author}
          color={book.coverColor}
          size="lg"
          className="mx-auto lg:mx-0"
        />

        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge>{book.category.name}</Badge>
            <Badge tone={book.availableCopies > 0 ? "green" : "amber"}>
              {book.availableCopies > 0
                ? `Доступно ${book.availableCopies} из ${book.totalCopies}`
                : "Нет свободных экземпляров"}
            </Badge>
            {avgRating > 0 && (
              <Badge tone="blue">
                <Star className="mr-1 inline h-3 w-3" />
                {avgRating.toFixed(1)} ({book.reviews.length})
              </Badge>
            )}
          </div>

          <h1 className="font-display text-4xl font-semibold leading-tight">{book.title}</h1>
          <p className="mt-2 text-lg text-[var(--muted)]">{book.author}</p>

          <p className="mt-6 max-w-2xl leading-relaxed text-[var(--ink-soft)]">{book.description}</p>

          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            {[
              ["ISBN", book.isbn],
              ["Год", String(book.publishedYear)],
              ["Страниц", String(book.pages)],
              ["Издательство", book.publisher ?? "—"],
              ["Язык", book.language],
              ["Полка", book.location ?? "—"],
              ["В очереди", String(book.reservations.length)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
                <dt className="text-xs text-[var(--muted)]">{k}</dt>
                <dd className="mt-0.5 font-medium">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            {!session?.user ? (
              <Link href="/login">
                <Badge tone="slate" className="px-4 py-2 text-sm">
                  Войдите, чтобы взять книгу
                </Badge>
              </Link>
            ) : userLoan ? (
              <Badge tone="green" className="px-4 py-2 text-sm">
                У вас на руках до {formatDate(userLoan.dueDate)} ({statusLabel(userLoan.status)})
              </Badge>
            ) : book.availableCopies > 0 ? (
              <BorrowButton bookId={book.id} />
            ) : (
              <ReserveButton bookId={book.id} />
            )}
          </div>
        </div>
      </div>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold">Отзывы читателей</h2>
        {canReview && (
          <div className="mt-4 max-w-xl">
            <ReviewForm bookId={book.id} />
          </div>
        )}
        <div className="mt-6 space-y-4">
          {book.reviews.length === 0 && (
            <p className="text-[var(--muted)]">Пока нет отзывов. Будьте первым!</p>
          )}
          {book.reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]/80 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{r.user.name}</p>
                <p className="text-amber-600">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
              </div>
              {r.comment && <p className="mt-2 text-sm text-[var(--ink-soft)]">{r.comment}</p>}
              <p className="mt-2 text-xs text-[var(--muted)]">{formatDate(r.createdAt)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
