import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookCard } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookMarked, Clock3, ShieldCheck, Users } from "lucide-react";

export default async function HomePage() {
  const [bookCount, userCount, activeLoans, featured, categories] = await Promise.all([
    prisma.book.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.loan.count({ where: { status: { in: ["ACTIVE", "OVERDUE"] } } }),
    prisma.book.findMany({
      take: 6,
      orderBy: { createdAt: "asc" },
      include: { category: true },
    }),
    prisma.category.findMany({
      include: { _count: { select: { books: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="grain">
      <section className="relative overflow-hidden paper-grid">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs font-medium tracking-wide text-[var(--accent)] uppercase">
              Онлайн-библиотека нового формата
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-[var(--ink)] sm:text-5xl lg:text-6xl">
              LibraSpace
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--ink-soft)]">
              Каталог из сотни книг, умная выдача, очередь и личный кабинет. Читайте спокойно —
              сроки, продления и история всегда под рукой.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalog">
                <Button size="lg">
                  Открыть каталог
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline">
                  Стать читателем
                </Button>
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[
                { label: "Книг", value: bookCount },
                { label: "Читателей", value: userCount },
                { label: "На руках", value: activeLoans },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]/80 p-3 text-center">
                  <p className="font-display text-2xl font-semibold text-[var(--accent)]">{s.value}</p>
                  <p className="text-xs text-[var(--muted)]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-6 rounded-[2rem] bg-[var(--accent)]/10 blur-2xl" />
            <div className="relative grid grid-cols-2 gap-4">
              {featured.slice(0, 4).map((book, i) => (
                <div
                  key={book.id}
                  className={`animate-floaty rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-lg ${
                    i % 2 ? "mt-8" : ""
                  }`}
                  style={{ animationDelay: `${i * 0.4}s` }}
                >
                  <div
                    className="mb-3 h-28 rounded-xl"
                    style={{
                      background: `linear-gradient(145deg, ${book.coverColor}, ${book.coverColor}99)`,
                    }}
                  />
                  <p className="font-display text-sm font-semibold line-clamp-2">{book.title}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{book.author}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: BookMarked,
              title: "Умная выдача",
              text: "Лимиты, сроки, штрафы и продление — всё считается автоматически.",
            },
            {
              icon: Clock3,
              title: "Очередь на книги",
              text: "Нет экземпляра? Встаньте в очередь и получите уведомление в кабинете.",
            },
            {
              icon: ShieldCheck,
              title: "CRM для админов",
              text: "История клиентов, выдачи, просрочки и управление фондом в одном месте.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]/80 p-6">
              <f.icon className="mb-4 h-6 w-6 text-[var(--accent)]" />
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold">Популярное в каталоге</h2>
            <p className="mt-2 text-[var(--muted)]">Подборка книг, с которых стоит начать</p>
          </div>
          <Link href="/catalog" className="text-sm font-medium text-[var(--accent)] hover:underline">
            Весь каталог →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((book, i) => (
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
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="mb-6 font-display text-3xl font-semibold">Жанры</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/catalog?category=${c.slug}`}
              className="group rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-5 py-4 transition hover:border-[var(--accent)]/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium group-hover:text-[var(--accent)]">{c.name}</p>
                <Users className="h-4 w-4 text-[var(--muted)]" />
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">{c._count.books} книг</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
