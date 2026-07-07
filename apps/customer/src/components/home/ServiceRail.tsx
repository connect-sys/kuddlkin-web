"use client";

import { useRef } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import type { Service } from "@/lib/types";
import {
  ServiceCard,
  ServiceCardSkeleton,
} from "@/components/services/ServiceCard";
import { Reveal } from "@/components/ui/Reveal";

interface ServiceRailProps {
  title: React.ReactNode;
  subtitle?: string;
  queryKey: unknown[];
  fetcher: () => Promise<Service[]>;
  viewAllHref?: string;
  /** background tint for the section */
  tint?: string;
  /** hide the whole section when the API returns nothing */
  hideWhenEmpty?: boolean;
}

export function ServiceRail({
  title,
  subtitle,
  queryKey,
  fetcher,
  viewAllHref = "/services",
  tint = "transparent",
  hideWhenEmpty = true,
}: ServiceRailProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useQuery({ queryKey, queryFn: fetcher });

  const scroll = (dir: 1 | -1) => {
    scroller.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  const items = data ?? [];
  if (!isLoading && hideWhenEmpty && items.length === 0) return null;

  return (
    <section className="py-12 lg:py-16" style={{ background: tint }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <Reveal>
            <div>
              <h2 className="text-2xl font-black text-kuddl-ink sm:text-3xl">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1 text-sm text-sand-600 sm:text-base">
                  {subtitle}
                </p>
              )}
            </div>
          </Reveal>
          <div className="flex items-center gap-2">
            <Link
              href={viewAllHref}
              className="hidden items-center gap-1 rounded-full bg-sand-100 px-4 py-2 text-sm font-bold text-kuddl-ink transition-colors hover:bg-primary-100 hover:text-primary-700 sm:inline-flex"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => scroll(-1)}
              aria-label="Scroll left"
              className="grid h-10 w-10 place-items-center rounded-full border border-sand-200 bg-white text-kuddl-ink transition-colors hover:bg-sand-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll(1)}
              aria-label="Scroll right"
              className="grid h-10 w-10 place-items-center rounded-full border border-sand-200 bg-white text-kuddl-ink transition-colors hover:bg-sand-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={scroller}
          className="no-scrollbar mt-7 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-[31%] xl:w-[23.5%]"
                >
                  <ServiceCardSkeleton />
                </div>
              ))
            : items.map((s) => (
                <div
                  key={s.id}
                  className="w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-[31%] xl:w-[23.5%]"
                >
                  <ServiceCard service={s} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
