import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  green: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20",
  amber: "bg-amber-500/15 text-amber-700 border-amber-500/20",
  rose: "bg-rose-500/15 text-rose-700 border-rose-500/20",
  blue: "bg-sky-500/15 text-sky-700 border-sky-500/20",
  slate: "bg-slate-500/15 text-slate-600 border-slate-500/20",
};

export function Badge({
  children,
  tone = "slate",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function loanTone(status: string): keyof typeof tones {
  switch (status) {
    case "ACTIVE":
    case "READY":
      return "green";
    case "OVERDUE":
    case "LOST":
      return "rose";
    case "WAITING":
      return "amber";
    case "RETURNED":
    case "FULFILLED":
      return "blue";
    default:
      return "slate";
  }
}
