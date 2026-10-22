"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Input, Select } from "./ui/input";

export function CatalogFilters({
  categories,
}: {
  categories: { id: string; name: string; slug: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    start(() => router.push(`/catalog?${next.toString()}`));
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      if (q !== (params.get("q") ?? "")) update("q", q);
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className={`grid gap-3 md:grid-cols-4 ${pending ? "opacity-70" : ""}`}>
      <div className="relative md:col-span-2">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
        <Input
          className="pl-10"
          placeholder="Поиск по названию, автору, ISBN..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <Select
        value={params.get("category") ?? ""}
        onChange={(e) => update("category", e.target.value)}
      >
        <option value="">Все жанры</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </Select>
      <Select
        value={params.get("availability") ?? ""}
        onChange={(e) => update("availability", e.target.value)}
      >
        <option value="">Любая доступность</option>
        <option value="available">Только доступные</option>
        <option value="unavailable">Только в очереди</option>
      </Select>
    </div>
  );
}
