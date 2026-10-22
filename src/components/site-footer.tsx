import Link from "next/link";
import { BookOpen } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-[var(--surface)]/50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[var(--accent)]" />
            <span className="font-display text-lg font-semibold">LibraSpace</span>
          </div>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            Современная онлайн-библиотека с каталогом, выдачей книг и личным кабинетом читателя.
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-[var(--ink)]">Навигация</p>
          <div className="flex flex-col gap-2 text-sm text-[var(--muted)]">
            <Link href="/catalog" className="hover:text-[var(--accent)]">Каталог</Link>
            <Link href="/cabinet" className="hover:text-[var(--accent)]">Личный кабинет</Link>
            <Link href="/about" className="hover:text-[var(--accent)]">О библиотеке</Link>
            <Link href="/admin" className="hover:text-[var(--accent)]">Админ CRM</Link>
          </div>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-[var(--ink)]">Правила</p>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li>Срок выдачи — 14 дней</li>
            <li>До 5 книг одновременно</li>
            <li>Продление до 2 раз</li>
            <li>Штраф за просрочку — 10 ₽/день</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--line)] py-4 text-center text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} LibraSpace — онлайн-библиотека
      </div>
    </footer>
  );
}
