"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { adminCreateBook } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

export function AdminBookForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <details className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
      <summary className="cursor-pointer font-display text-lg font-semibold">
        + Добавить книгу
      </summary>
      <form
        className="mt-4 grid gap-4 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          start(async () => {
            const res = await adminCreateBook(formData);
            if (res.ok) {
              toast.success(res.message);
              (e.target as HTMLFormElement).reset();
              router.refresh();
            } else toast.error(res.error);
          });
        }}
      >
        <div>
          <Label>Название</Label>
          <Input name="title" required />
        </div>
        <div>
          <Label>Автор</Label>
          <Input name="author" required />
        </div>
        <div>
          <Label>ISBN</Label>
          <Input name="isbn" required />
        </div>
        <div>
          <Label>Жанр</Label>
          <Select name="categoryId" required defaultValue={categories[0]?.id}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Год</Label>
          <Input name="publishedYear" type="number" defaultValue={2020} required />
        </div>
        <div>
          <Label>Страниц</Label>
          <Input name="pages" type="number" defaultValue={300} required />
        </div>
        <div>
          <Label>Экземпляров</Label>
          <Input name="totalCopies" type="number" defaultValue={1} required />
        </div>
        <div>
          <Label>Издательство</Label>
          <Input name="publisher" />
        </div>
        <div className="md:col-span-2">
          <Label>Описание</Label>
          <Textarea name="description" required minLength={10} />
        </div>
        <div>
          <Label>Полка / локация</Label>
          <Input name="location" placeholder="Зал A-101" />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={pending}>
            {pending ? "Сохраняем..." : "Добавить"}
          </Button>
        </div>
      </form>
    </details>
  );
}
