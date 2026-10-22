import { cn } from "@/lib/utils";

export function BookCover({
  title,
  author,
  color,
  className,
  size = "md",
}: {
  title: string;
  author: string;
  color: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "w-16 h-24 text-[8px]",
    md: "w-28 h-40 text-[10px]",
    lg: "w-40 h-56 text-xs",
  };

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-r-md rounded-l-sm shadow-lg",
        sizes[size],
        className
      )}
      style={{
        background: `linear-gradient(145deg, ${color} 0%, ${color}cc 55%, ${color}99 100%)`,
      }}
    >
      <div className="absolute inset-y-0 left-0 w-1.5 bg-black/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_45%)]" />
      <div className="relative flex h-full flex-col justify-between p-2.5 text-white">
        <p className="font-display font-semibold leading-tight line-clamp-4 drop-shadow-sm">
          {title}
        </p>
        <p className="opacity-80 line-clamp-2 leading-tight">{author}</p>
      </div>
    </div>
  );
}
