"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity, getSettings } from "@/lib/library";
import { calcFine, pickCoverColor } from "@/lib/utils";
import { LoanStatus } from "@prisma/client";
import type { LoanActionResult } from "./loans";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session.user;
}

const bookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  isbn: z.string().min(5),
  description: z.string().min(10),
  publishedYear: z.coerce.number().int().min(1).max(2100),
  pages: z.coerce.number().int().min(1),
  totalCopies: z.coerce.number().int().min(1),
  categoryId: z.string().min(1),
  publisher: z.string().optional(),
  location: z.string().optional(),
  language: z.string().optional(),
});

export async function adminCreateBook(formData: FormData): Promise<LoanActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Нет доступа" };

  const parsed = bookSchema.safeParse({
    title: formData.get("title"),
    author: formData.get("author"),
    isbn: formData.get("isbn"),
    description: formData.get("description"),
    publishedYear: formData.get("publishedYear"),
    pages: formData.get("pages"),
    totalCopies: formData.get("totalCopies"),
    categoryId: formData.get("categoryId"),
    publisher: formData.get("publisher") || undefined,
    location: formData.get("location") || undefined,
    language: formData.get("language") || "ru",
  });

  if (!parsed.success) {
    return { ok: false, error: "Проверьте поля формы" };
  }

  const exists = await prisma.book.findUnique({ where: { isbn: parsed.data.isbn } });
  if (exists) return { ok: false, error: "Книга с таким ISBN уже есть" };

  const book = await prisma.book.create({
    data: {
      ...parsed.data,
      availableCopies: parsed.data.totalCopies,
      coverColor: pickCoverColor(parsed.data.title),
      publisher: parsed.data.publisher ?? null,
      location: parsed.data.location ?? null,
      language: parsed.data.language ?? "ru",
    },
  });

  await logActivity("CREATE_BOOK", "Book", {
    userId: admin.id,
    entityId: book.id,
    details: `Добавлена книга «${book.title}»`,
  });

  revalidatePath("/admin/books");
  revalidatePath("/catalog");
  return { ok: true, message: "Книга добавлена" };
}

export async function adminUpdateBook(
  bookId: string,
  formData: FormData
): Promise<LoanActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Нет доступа" };

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) return { ok: false, error: "Книга не найдена" };

  const totalCopies = Number(formData.get("totalCopies") || book.totalCopies);
  const loaned = book.totalCopies - book.availableCopies;
  if (totalCopies < loaned) {
    return { ok: false, error: `Нельзя уменьшить ниже ${loaned} (уже выдано)` };
  }

  const availableCopies = totalCopies - loaned;

  await prisma.book.update({
    where: { id: bookId },
    data: {
      title: String(formData.get("title") || book.title),
      author: String(formData.get("author") || book.author),
      description: String(formData.get("description") || book.description),
      publishedYear: Number(formData.get("publishedYear") || book.publishedYear),
      pages: Number(formData.get("pages") || book.pages),
      totalCopies,
      availableCopies,
      publisher: String(formData.get("publisher") || "") || null,
      location: String(formData.get("location") || "") || null,
      categoryId: String(formData.get("categoryId") || book.categoryId),
    },
  });

  revalidatePath("/admin/books");
  revalidatePath(`/books/${bookId}`);
  return { ok: true, message: "Книга обновлена" };
}

export async function adminToggleUser(userId: string): Promise<LoanActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Нет доступа" };
  if (admin.id === userId) return { ok: false, error: "Нельзя заблокировать себя" };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, error: "Пользователь не найден" };

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });

  await logActivity(user.isActive ? "BLOCK_USER" : "UNBLOCK_USER", "User", {
    userId: admin.id,
    entityId: userId,
    details: `${user.isActive ? "Блокировка" : "Разблокировка"}: ${user.name}`,
  });

  revalidatePath("/admin/users");
  return { ok: true, message: user.isActive ? "Пользователь заблокирован" : "Пользователь разблокирован" };
}

export async function adminForceReturn(loanId: string): Promise<LoanActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Нет доступа" };

  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: { book: true },
  });
  if (!loan || loan.status === LoanStatus.RETURNED) {
    return { ok: false, error: "Выдача не найдена или уже закрыта" };
  }

  const settings = await getSettings();
  const returnedAt = new Date();
  const fine = calcFine(loan.dueDate, settings.finePerDay, returnedAt);

  await prisma.$transaction([
    prisma.loan.update({
      where: { id: loanId },
      data: { status: LoanStatus.RETURNED, returnedAt, fineAmount: fine },
    }),
    prisma.book.update({
      where: { id: loan.bookId },
      data: { availableCopies: { increment: 1 } },
    }),
  ]);

  await logActivity("ADMIN_RETURN", "Loan", {
    userId: admin.id,
    entityId: loanId,
    details: `Админ закрыл выдачу «${loan.book.title}»`,
  });

  revalidatePath("/admin/loans");
  revalidatePath("/admin");
  return { ok: true, message: "Выдача закрыта" };
}

export async function adminUpdateSettings(formData: FormData): Promise<LoanActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Нет доступа" };

  await prisma.librarySettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      loanDays: Number(formData.get("loanDays") || 14),
      maxLoansPerUser: Number(formData.get("maxLoansPerUser") || 5),
      maxRenewals: Number(formData.get("maxRenewals") || 2),
      finePerDay: Number(formData.get("finePerDay") || 10),
      reservationHoldDays: Number(formData.get("reservationHoldDays") || 3),
      libraryName: String(formData.get("libraryName") || "LibraSpace"),
    },
    update: {
      loanDays: Number(formData.get("loanDays") || 14),
      maxLoansPerUser: Number(formData.get("maxLoansPerUser") || 5),
      maxRenewals: Number(formData.get("maxRenewals") || 2),
      finePerDay: Number(formData.get("finePerDay") || 10),
      reservationHoldDays: Number(formData.get("reservationHoldDays") || 3),
      libraryName: String(formData.get("libraryName") || "LibraSpace"),
    },
  });

  revalidatePath("/admin/settings");
  return { ok: true, message: "Настройки сохранены" };
}

export async function adminUpdateUserNotes(
  userId: string,
  notes: string
): Promise<LoanActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Нет доступа" };

  await prisma.user.update({ where: { id: userId }, data: { notes } });
  revalidatePath(`/admin/users/${userId}`);
  return { ok: true, message: "Заметки сохранены" };
}
