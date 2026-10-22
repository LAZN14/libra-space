import { LoginForm } from "@/components/auth-form";

export const metadata = { title: "Вход" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)]/90 p-8 shadow-xl shadow-[var(--accent)]/5">
        <h1 className="font-display text-3xl font-semibold">Вход</h1>
        <p className="mt-2 mb-6 text-sm text-[var(--muted)]">
          Войдите в аккаунт читателя или администратора
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
