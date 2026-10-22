import { getSettings } from "@/lib/library";

export const metadata = { title: "О библиотеке" };

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl font-semibold">{settings.libraryName}</h1>
      <p className="mt-4 text-lg leading-relaxed text-[var(--ink-soft)]">
        Мы — цифровая библиотека с живым фондом: берёте книги онлайн, следите за сроками
        в личном кабинете, встаёте в очередь и оставляете отзывы после возврата.
      </p>

      <div className="mt-10 space-y-4">
        {[
          ["Срок выдачи", `${settings.loanDays} дней`],
          ["Лимит книг", `${settings.maxLoansPerUser} одновременно`],
          ["Продления", `до ${settings.maxRenewals} раз`],
          ["Штраф", `${settings.finePerDay} ₽ за день просрочки`],
          ["Бронь", `${settings.reservationHoldDays} дня на получение после уведомления`],
        ].map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-5 py-4"
          >
            <span className="text-[var(--muted)]">{k}</span>
            <span className="font-medium">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
