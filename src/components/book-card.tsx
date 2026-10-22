"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookCover } from "./book-cover";
import { Badge } from "./ui/badge";

type BookCardProps = {
  id: string;
  title: string;
  author: string;
  coverColor: string;
  categoryName: string;
  availableCopies: number;
  totalCopies: number;
  publishedYear: number;
  index?: number;
};

export function BookCard({
  id,
  title,
  author,
  coverColor,
  categoryName,
  availableCopies,
  totalCopies,
  publishedYear,
  index = 0,
}: BookCardProps) {
  const available = availableCopies > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.4) }}
    >
      <Link
        href={`/books/${id}`}
        className="group flex gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/80 p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/40 hover:shadow-xl hover:shadow-[var(--accent)]/5"
      >
        <BookCover title={title} author={author} color={coverColor} size="md" />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge tone="slate">{categoryName}</Badge>
            <Badge tone={available ? "green" : "amber"}>
              {available ? `Доступно ${availableCopies}/${totalCopies}` : "Очередь"}
            </Badge>
          </div>
          <h3 className="font-display text-lg font-semibold leading-snug text-[var(--ink)] transition group-hover:text-[var(--accent)] line-clamp-2">
            {title}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{author}</p>
          <p className="mt-auto pt-3 text-xs text-[var(--muted)]">{publishedYear} г.</p>
        </div>
      </Link>
    </motion.div>
  );
}
