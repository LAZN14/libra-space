"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Users,
  Activity,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard },
  { href: "/admin/books", label: "Книги", icon: BookOpen },
  { href: "/admin/users", label: "Читатели", icon: Users },
  { href: "/admin/loans", label: "Выдачи", icon: ClipboardList },
  { href: "/admin/activity", label: "Активность", icon: Activity },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-[var(--line)] bg-[var(--surface)] lg:w-64 lg:border-b-0 lg:border-r lg:min-h-screen">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-[#04140d]">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-lg font-semibold leading-none">Libra CRM</p>
          <p className="text-xs text-[var(--muted)]">Админ-панель</p>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
        {links.map((l) => {
          const active = pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm transition",
                active
                  ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              )}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden p-4 lg:block">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
        >
          <ArrowLeft className="h-4 w-4" />
          На сайт
        </Link>
      </div>
    </aside>
  );
}
