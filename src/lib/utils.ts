import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isPast, differenceInCalendarDays } from "date-fns";
import { ru } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "d MMMM yyyy", { locale: ru });
}

export function formatDateShort(date: Date | string) {
  return format(new Date(date), "dd.MM.yyyy", { locale: ru });
}

export function formatRelative(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ru });
}

export function daysUntil(date: Date | string) {
  return differenceInCalendarDays(new Date(date), new Date());
}

export function isOverdue(date: Date | string) {
  return isPast(new Date(date));
}

export function calcFine(dueDate: Date, finePerDay: number, returnedAt?: Date | null) {
  const end = returnedAt ? new Date(returnedAt) : new Date();
  const days = differenceInCalendarDays(end, new Date(dueDate));
  if (days <= 0) return 0;
  return Math.round(days * finePerDay * 100) / 100;
}

export const COVER_COLORS = [
  "#1B4332", "#2D6A4F", "#40916C", "#081C15",
  "#1D3557", "#457B9D", "#1B263B", "#0D1B2A",
  "#6D4C41", "#5D4037", "#4E342E", "#3E2723",
  "#7B2D26", "#9B2226", "#AE2012", "#BB3E03",
  "#3D405B", "#5C5470", "#2B2D42", "#212529",
  "#264653", "#2A9D8F", "#1A535C", "#0B525B",
];

export function pickCoverColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COVER_COLORS[Math.abs(hash) % COVER_COLORS.length];
}

export function statusLabel(status: string) {
  const map: Record<string, string> = {
    ACTIVE: "На руках",
    RETURNED: "Возвращена",
    OVERDUE: "Просрочена",
    LOST: "Утеряна",
    WAITING: "В очереди",
    READY: "Готова к выдаче",
    CANCELLED: "Отменена",
    FULFILLED: "Выполнена",
    EXPIRED: "Истекла",
    USER: "Читатель",
    ADMIN: "Администратор",
  };
  return map[status] ?? status;
}
