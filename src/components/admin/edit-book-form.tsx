"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { adminUpdateBook } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

type Book = {
  id: string;
  title: string;
  author: string;
  description: string;
  publishedYear: number;
  pages: number;
  totalCopies: number;
  publisher: string | null;
  location: string | null;
  categoryId: string;
};

export function AdminEditBookForm({
  book,
  categories,
}: {
  book: Book;
  categories: { id: string; name: string }[];
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <form
      className="grid gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        start(async () => {
          const res = await adminUpdateBook(book.id, formData);
          if (res.ok) {
            toast.success(res.message);
            router.refresh();
          } else toast.error(res.error);
        });
      }}
    >
      <div>
        <Label>Название</Label>
        <Input name="title" defaultValue={book.title} required />
      </div>
      <div>
        <Label>Автор</Label>
        <Input name="author" defaultValue={book.author} required />
      </div>
      <div>
        <Label>Год</Label>
        <Input name="publishedYear" type="number" defaultValue={book.publishedYear} />
      </div>
      <div>
        <Label>Страниц</Label>
        <Input name="pages" type="number" defaultValue={book.pages} />
      </div>
      <div>
        <Label>Экземпляров</Label>
        <Input name="totalCopies" type="number" defaultValue={book.totalCopies} />
      </div>
      <div>
        <Label>Жанр</Label>
        <Select name="categoryId" defaultValue={book.categoryId}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>Издательство</Label>
        <Input name="publisher" defaultValue={book.publisher ?? ""} />
      </div>
      <div>
        <Label>Полка</Label>
        <Input name="location" defaultValue={book.location ?? ""} />
      </div>
      <div className="md:col-span-2">
        <Label>Описание</Label>
        <Textarea name="description" defaultValue={book.description} />
      </div>
      <Button type="submit" disabled={pending}>
        Сохранить изменения
      </Button>
    </form>
  );
}
