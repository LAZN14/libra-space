"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getSettings,
  getUserActiveLoanCount,
  logActivity,
  syncOverdueLoans,
} from "@/lib/library";
import { calcFine } from "@/lib/utils";
import { LoanStatus } from "@prisma/client";

export type LoanActionResult = { ok: boolean; error?: string; message?: string };

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function borrowBook(bookId: string): Promise<LoanActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Войдите, чтобы взять книгу" };

  await syncOverdueLoans();
  const settings = await getSettings();

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.isActive) return { ok: false, error: "Аккаунт заблокирован" };

  const overdueCount = await prisma.loan.count({
    where: { userId: user.id, status: LoanStatus.OVERDUE },
  });
  if (overdueCount > 0) {
    return { ok: false, error: "Сначала верните просроченные книги" };
  }

  const activeCount = await getUserActiveLoanCount(user.id);
  if (activeCount >= settings.maxLoansPerUser) {
    return { ok: false, error: `Лимит: не больше ${settings.maxLoansPerUser} книг одновременно` };
  }

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) return { ok: false, error: "Книга не найдена" };

  const alreadyHas = await prisma.loan.findFirst({
    where: {
      userId: user.id,
      bookId,
      status: { in: [LoanStatus.ACTIVE, LoanStatus.OVERDUE] },
    },
  });
  if (alreadyHas) return { ok: false, error: "Эта книга уже у вас на руках" };

  if (book.availableCopies <= 0) {
    return { ok: false, error: "Нет свободных экземпляров. Можно встать в очередь." };
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + settings.loanDays);

  await prisma.$transaction([
    prisma.loan.create({
      data: {
        userId: user.id,
        bookId,
        dueDate,
        status: LoanStatus.ACTIVE,
      },
    }),
    prisma.book.update({
      where: { id: bookId },
      data: { availableCopies: { decrement: 1 } },
    }),
  ]);

  await logActivity("BORROW", "Loan", {
    userId: user.id,
    entityId: bookId,
    details: `Взята книга «${book.title}» до ${dueDate.toLocaleDateString("ru-RU")}`,
  });

  revalidatePath("/catalog");
  revalidatePath(`/books/${bookId}`);
  revalidatePath("/cabinet");
  revalidatePath("/admin");

  return { ok: true, message: `Книга выдана до ${dueDate.toLocaleDateString("ru-RU")}` };
}

export async function returnBook(loanId: string): Promise<LoanActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Требуется вход" };

  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: { book: true },
  });

  if (!loan) return { ok: false, error: "Выдача не найдена" };
  if (loan.userId !== user.id && user.role !== "ADMIN") {
    return { ok: false, error: "Нет доступа" };
  }
  if (loan.status === LoanStatus.RETURNED) {
    return { ok: false, error: "Книга уже возвращена" };
  }

  const settings = await getSettings();
  const returnedAt = new Date();
  const fine = calcFine(loan.dueDate, settings.finePerDay, returnedAt);

  await prisma.$transaction([
    prisma.loan.update({
      where: { id: loanId },
      data: {
        status: LoanStatus.RETURNED,
        returnedAt,
        fineAmount: fine,
      },
    }),
    prisma.book.update({
      where: { id: loan.bookId },
      data: { availableCopies: { increment: 1 } },
    }),
  ]);

  // Promote next reservation
  const nextReservation = await prisma.reservation.findFirst({
    where: { bookId: loan.bookId, status: "WAITING" },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  if (nextReservation) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + settings.reservationHoldDays);
    await prisma.reservation.update({
      where: { id: nextReservation.id },
      data: { status: "READY", expiresAt, notifiedAt: new Date() },
    });
  }

  await logActivity("RETURN", "Loan", {
    userId: loan.userId,
    entityId: loanId,
    details: `Возвращена «${loan.book.title}»${fine > 0 ? `, штраф ${fine} ₽` : ""}`,
  });

  revalidatePath("/cabinet");
  revalidatePath("/admin");
  revalidatePath(`/books/${loan.bookId}`);

  return {
    ok: true,
    message: fine > 0 ? `Книга возвращена. Штраф: ${fine} ₽` : "Книга успешно возвращена",
  };
}

export async function renewLoan(loanId: string): Promise<LoanActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Требуется вход" };

  const settings = await getSettings();
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: { book: true },
  });

  if (!loan || loan.userId !== user.id) return { ok: false, error: "Выдача не найдена" };
  if (loan.status !== LoanStatus.ACTIVE) {
    return { ok: false, error: "Продлить можно только активную выдачу" };
  }
  if (loan.renewedCount >= settings.maxRenewals) {
    return { ok: false, error: `Достигнут лимит продлений (${settings.maxRenewals})` };
  }

  const waiting = await prisma.reservation.count({
    where: { bookId: loan.bookId, status: "WAITING" },
  });
  if (waiting > 0) {
    return { ok: false, error: "Нельзя продлить: есть очередь на эту книгу" };
  }

  const newDue = new Date(loan.dueDate);
  newDue.setDate(newDue.getDate() + settings.loanDays);

  await prisma.loan.update({
    where: { id: loanId },
    data: { dueDate: newDue, renewedCount: { increment: 1 } },
  });

  await logActivity("RENEW", "Loan", {
    userId: user.id,
    entityId: loanId,
    details: `Продлена «${loan.book.title}» до ${newDue.toLocaleDateString("ru-RU")}`,
  });

  revalidatePath("/cabinet");
  revalidatePath("/admin");

  return { ok: true, message: `Срок продлён до ${newDue.toLocaleDateString("ru-RU")}` };
}

export async function reserveBook(bookId: string): Promise<LoanActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Войдите, чтобы встать в очередь" };

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) return { ok: false, error: "Книга не найдена" };
  if (book.availableCopies > 0) {
    return { ok: false, error: "Есть свободные экземпляры — можно взять сразу" };
  }

  const existing = await prisma.reservation.findFirst({
    where: {
      userId: user.id,
      bookId,
      status: { in: ["WAITING", "READY"] },
    },
  });
  if (existing) return { ok: false, error: "Вы уже в очереди на эту книгу" };

  const activeLoan = await prisma.loan.findFirst({
    where: {
      userId: user.id,
      bookId,
      status: { in: [LoanStatus.ACTIVE, LoanStatus.OVERDUE] },
    },
  });
  if (activeLoan) return { ok: false, error: "Книга уже у вас" };

  const last = await prisma.reservation.findFirst({
    where: { bookId, status: "WAITING" },
    orderBy: { position: "desc" },
  });

  await prisma.reservation.create({
    data: {
      userId: user.id,
      bookId,
      position: (last?.position ?? 0) + 1,
      status: "WAITING",
    },
  });

  await logActivity("RESERVE", "Reservation", {
    userId: user.id,
    entityId: bookId,
    details: `Очередь на «${book.title}»`,
  });

  revalidatePath(`/books/${bookId}`);
  revalidatePath("/cabinet");

  return { ok: true, message: "Вы встали в очередь" };
}

export async function cancelReservation(reservationId: string): Promise<LoanActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Требуется вход" };

  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation || reservation.userId !== user.id) {
    return { ok: false, error: "Бронь не найдена" };
  }

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/cabinet");
  return { ok: true, message: "Бронь отменена" };
}

export async function addReview(
  bookId: string,
  rating: number,
  comment?: string
): Promise<LoanActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Войдите, чтобы оставить отзыв" };
  if (rating < 1 || rating > 5) return { ok: false, error: "Оценка от 1 до 5" };

  const borrowed = await prisma.loan.findFirst({
    where: { userId: user.id, bookId, status: LoanStatus.RETURNED },
  });
  if (!borrowed) {
    return { ok: false, error: "Отзыв можно оставить после возврата книги" };
  }

  await prisma.review.upsert({
    where: { userId_bookId: { userId: user.id, bookId } },
    create: { userId: user.id, bookId, rating, comment },
    update: { rating, comment },
  });

  revalidatePath(`/books/${bookId}`);
  return { ok: true, message: "Отзыв сохранён" };
}
