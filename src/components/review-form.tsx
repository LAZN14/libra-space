"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { addReview } from "@/lib/actions/loans";
import { Button } from "./ui/button";
import { Textarea } from "./ui/input";

export function ReviewForm({ bookId }: { bookId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
      <p className="mb-2 text-sm font-medium">Ваша оценка</p>
      <div className="mb-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`text-xl ${n <= rating ? "text-amber-500" : "text-[var(--line)]"}`}
          >
            ★
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Поделитесь впечатлениями..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button
        className="mt-3"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await addReview(bookId, rating, comment || undefined);
            if (res.ok) {
              toast.success(res.message);
              setComment("");
              router.refresh();
            } else toast.error(res.error);
          })
        }
      >
        Отправить отзыв
      </Button>
    </div>
  );
}
