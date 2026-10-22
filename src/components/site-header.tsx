import Link from "next/link";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import { BookOpen, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { Button } from "./ui/button";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)]/80 bg-[var(--bg)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/30 transition group-hover:scale-105">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-[var(--ink)]">
            Libra<span className="text-[var(--accent)]">Space</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            { href: "/catalog", label: "Каталог" },
            { href: "/about", label: "О библиотеке" },
            ...(session?.user
              ? [{ href: "/cabinet", label: "Кабинет" }]
              : []),
            ...(session?.user?.role === "ADMIN"
              ? [{ href: "/admin", label: "CRM" }]
              : []),
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--ink-soft)] transition hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <Link
                href="/cabinet"
                className="hidden items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-sm sm:flex"
              >
                <UserRound className="h-4 w-4 text-[var(--accent)]" />
                <span className="max-w-[120px] truncate">{session.user.name}</span>
              </Link>
              {session.user.role === "ADMIN" && (
                <Link href="/admin">
                  <Button variant="secondary" size="sm" className="hidden sm:inline-flex">
                    <LayoutDashboard className="h-4 w-4" />
                    CRM
                  </Button>
                </Link>
              )}
              <form action={logoutAction}>
                <Button type="submit" variant="ghost" size="sm" aria-label="Выйти">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Войти
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Регистрация</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
