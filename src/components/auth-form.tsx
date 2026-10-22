"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { loginAction, registerAction, type ActionState } from "@/lib/actions/auth";
import { Button } from "./ui/button";
import { Input, Label } from "./ui/input";

const initial: ActionState = { ok: false };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="you@mail.ru" />
      </div>
      <div>
        <Label htmlFor="password">Пароль</Label>
        <Input id="password" name="password" type="password" required placeholder="••••••••" />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Входим..." : "Войти"}
      </Button>
      <p className="text-center text-sm text-[var(--muted)]">
        Нет аккаунта?{" "}
        <Link href="/register" className="text-[var(--accent)] hover:underline">
          Зарегистрироваться
        </Link>
      </p>
      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3 text-xs text-[var(--muted)]">
        <p className="font-medium text-[var(--ink-soft)]">Демо-доступ:</p>
        <p>Читатель: reader@libraspace.ru / reader123</p>
        <p>Админ: admin@libraspace.ru / admin123</p>
      </div>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(registerAction, initial);

  useEffect(() => {
    if (state.ok) {
      toast.success("Регистрация успешна!");
      router.push("/cabinet");
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="name">Имя</Label>
        <Input id="name" name="name" required placeholder="Анна Иванова" />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-xs text-rose-600">{state.fieldErrors.name[0]}</p>
        )}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="you@mail.ru" />
      </div>
      <div>
        <Label htmlFor="phone">Телефон</Label>
        <Input id="phone" name="phone" type="tel" placeholder="+7 (900) 000-00-00" />
      </div>
      <div>
        <Label htmlFor="password">Пароль</Label>
        <Input id="password" name="password" type="password" required minLength={6} />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Создаём..." : "Создать аккаунт"}
      </Button>
      <p className="text-center text-sm text-[var(--muted)]">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-[var(--accent)] hover:underline">
          Войти
        </Link>
      </p>
    </form>
  );
}
