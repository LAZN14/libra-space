"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import {
  borrowBook,
  returnBook,
  renewLoan,
  reserveBook,
  cancelReservation,
} from "@/lib/actions/loans";

export function BorrowButton({ bookId, disabled }: { bookId: string; disabled?: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <Button
      disabled={disabled || pending}
      onClick={() =>
        start(async () => {
          const res = await borrowBook(bookId);
          if (res.ok) {
            toast.success(res.message);
            router.refresh();
          } else toast.error(res.error);
        })
      }
    >
      {pending ? "Оформляем..." : "Взять книгу"}
    </Button>
  );
}

export function ReserveButton({ bookId }: { bookId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await reserveBook(bookId);
          if (res.ok) {
            toast.success(res.message);
            router.refresh();
          } else toast.error(res.error);
        })
      }
    >
      {pending ? "..." : "Встать в очередь"}
    </Button>
  );
}

export function ReturnButton({ loanId }: { loanId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await returnBook(loanId);
          if (res.ok) {
            toast.success(res.message);
            router.refresh();
          } else toast.error(res.error);
        })
      }
    >
      Вернуть
    </Button>
  );
}

export function RenewButton({ loanId }: { loanId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await renewLoan(loanId);
          if (res.ok) {
            toast.success(res.message);
            router.refresh();
          } else toast.error(res.error);
        })
      }
    >
      Продлить
    </Button>
  );
}

export function CancelReservationButton({ reservationId }: { reservationId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await cancelReservation(reservationId);
          if (res.ok) {
            toast.success(res.message);
            router.refresh();
          } else toast.error(res.error);
        })
      }
    >
      Отменить
    </Button>
  );
}
