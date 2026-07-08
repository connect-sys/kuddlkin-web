"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/api";
import { MODULES, getModule } from "@/lib/modules";

/**
 * Horizontally-scrollable strip of categories, shown under the search bar.
 * Uses live categories from the API; falls back to the four Kuddl modules.
 */
export function CategoryStrip() {
  const { data } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const cats = data ?? [];

  const items = cats.length
    ? cats.map((c) => ({
        id: c.id,
        name: c.name,
        module: c.module,
        href: `/services?category=${encodeURIComponent(c.id)}`,
      }))
    : MODULES.map((m) => ({
        id: m.key,
        name: m.label,
        module: m.upperKey,
        href: `/services?module=${m.upperKey}`,
      }));

  return (
    <section className="bg-kuddl-cream pt-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-1">
          {items.map((it) => {
            const mod = getModule(it.module) ?? getModule(it.name);
            return (
              <Link
                key={it.id}
                href={it.href}
                className="flex shrink-0 flex-col items-center gap-1.5"
              >
                <span
                  className="grid h-14 w-14 place-items-center rounded-2xl text-2xl transition-transform duration-150 hover:scale-105 sm:h-16 sm:w-16"
                  style={{ background: mod?.soft ?? "#FFF4EC" }}
                >
                  {mod?.emoji ?? "🎨"}
                </span>
                <span className="max-w-[4.5rem] truncate text-center text-xs font-bold text-kuddl-ink">
                  {it.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
