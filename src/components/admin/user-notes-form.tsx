"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { adminUpdateUserNotes } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";

export function UserNotesForm({ userId, notes }: { userId: string; notes: string }) {
  const [pending, start] = useTransition();

  return (
    <form
      className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const value = new FormData(e.currentTarget).get("notes");
        start(async () => {
          const res = await adminUpdateUserNotes(userId, String(value || ""));
          if (res.ok) toast.success(res.message);
          else toast.error(res.error);
        });
      }}
    >
      <Label>Заметки администратора</Label>
      <Textarea name="notes" defaultValue={notes} placeholder="Комментарии по клиенту..." />
      <Button type="submit" className="mt-3" size="sm" disabled={pending}>
        Сохранить заметки
      </Button>
    </form>
  );
}
