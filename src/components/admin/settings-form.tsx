"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { adminUpdateSettings } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type Settings = {
  libraryName: string;
  loanDays: number;
  maxLoansPerUser: number;
  maxRenewals: number;
  finePerDay: number;
  reservationHoldDays: number;
};

export function SettingsForm({ settings }: { settings: Settings }) {
  const [pending, start] = useTransition();

  return (
    <form
      className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        start(async () => {
          const res = await adminUpdateSettings(formData);
          if (res.ok) toast.success(res.message);
          else toast.error(res.error);
        });
      }}
    >
      <div>
        <Label>Название библиотеки</Label>
        <Input name="libraryName" defaultValue={settings.libraryName} />
      </div>
      <div>
        <Label>Срок выдачи (дней)</Label>
        <Input name="loanDays" type="number" defaultValue={settings.loanDays} />
      </div>
      <div>
        <Label>Макс. книг на руках</Label>
        <Input name="maxLoansPerUser" type="number" defaultValue={settings.maxLoansPerUser} />
      </div>
      <div>
        <Label>Макс. продлений</Label>
        <Input name="maxRenewals" type="number" defaultValue={settings.maxRenewals} />
      </div>
      <div>
        <Label>Штраф за день (₽)</Label>
        <Input name="finePerDay" type="number" step="0.01" defaultValue={settings.finePerDay} />
      </div>
      <div>
        <Label>Срок удержания брони (дней)</Label>
        <Input
          name="reservationHoldDays"
          type="number"
          defaultValue={settings.reservationHoldDays}
        />
      </div>
      <Button type="submit" disabled={pending}>
        Сохранить
      </Button>
    </form>
  );
}
