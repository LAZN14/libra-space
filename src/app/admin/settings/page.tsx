import { getSettings } from "@/lib/library";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata = { title: "Настройки · CRM" };

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Настройки библиотеки</h1>
      <p className="mt-1 text-[var(--muted)]">Правила выдачи, штрафы и лимиты</p>
      <div className="mt-8 max-w-xl">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
