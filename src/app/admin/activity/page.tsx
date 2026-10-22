import { prisma } from "@/lib/prisma";
import { formatDate, formatRelative } from "@/lib/utils";

export const metadata = { title: "Активность · CRM" };

export default async function AdminActivityPage() {
  const logs = await prisma.activityLog.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Лента активности</h1>
      <p className="mt-1 text-[var(--muted)]">Последние 100 событий системы</p>

      <div className="mt-8 space-y-3">
        {logs.map((log) => (
          <div
            key={log.id}
            className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-5 py-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-[var(--accent)]">{log.action}</p>
              <p className="text-xs text-[var(--muted)]" title={formatDate(log.createdAt)}>
                {formatRelative(log.createdAt)}
              </p>
            </div>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              {log.details ?? `${log.entity}${log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}`}
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">
              {log.user?.name ?? "Система"}
              {log.user?.email ? ` · ${log.user.email}` : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
