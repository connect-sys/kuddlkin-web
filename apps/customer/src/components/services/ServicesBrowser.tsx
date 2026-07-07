"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { getServices, getCamps, campToService } from "@/lib/api";
import type { Service } from "@/lib/types";
import { MODULES, getModule } from "@/lib/modules";
import {
  ServiceCard,
  ServiceCardSkeleton,
} from "@/components/services/ServiceCard";
import { ModuleIcon } from "@/components/ui/ModuleIcon";
import { cn } from "@/lib/utils";

const SORTS = [
  { key: "popular", label: "Most popular" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
] as const;

type SortKey = (typeof SORTS)[number]["key"];

export function ServicesBrowser() {
  const router = useRouter();
  const params = useSearchParams();

  const module = params.get("module") ?? "";
  const q = params.get("q") ?? "";
  const pincode = params.get("pincode") ?? "";

  const [search, setSearch] = useState(q);
  const [sort, setSort] = useState<SortKey>("popular");

  const activeModule = getModule(module);

  // Discover/camps mix in camp items; otherwise just services.
  const { data, isLoading } = useQuery({
    queryKey: ["services-browse", module, pincode],
    queryFn: async (): Promise<Service[]> => {
      const services = await getServices({
        module: module || undefined,
        pincode: pincode || undefined,
        limit: 48,
      });
      if (!module || module === "DISCOVER") {
        const camps = await getCamps();
        return [...services, ...camps.map(campToService)];
      }
      return services;
    },
  });

  const results = useMemo(() => {
    let list = data ?? [];
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name?.toLowerCase().includes(term) ||
          s.description?.toLowerCase().includes(term) ||
          s.category_name?.toLowerCase().includes(term)
      );
    }
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc")
      list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [data, search, sort]);

  const setModule = (m: string) => {
    const next = new URLSearchParams(params.toString());
    if (m) next.set("module", m);
    else next.delete("module");
    router.push(`/services?${next.toString()}`);
  };

  return (
    <div className="pb-24 pt-24 lg:pb-16 lg:pt-28">
      {/* Heading band */}
      <div
        className="bg-cream-grid"
        style={{ background: activeModule?.soft ?? undefined }}
      >
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black text-kuddl-ink sm:text-4xl"
          >
            {activeModule ? (
              <span
                className="inline-flex items-center gap-2.5"
                style={{ color: activeModule.color }}
              >
                <ModuleIcon module={activeModule} className="h-8 w-8" />
                {activeModule.label}
              </span>
            ) : (
              <>
                Explore <span className="text-gradient-brand">experiences</span>
              </>
            )}
          </motion.h1>
          <p className="mt-2 max-w-xl text-sand-700">
            {activeModule?.description ??
              "Discover trusted parties, classes, childcare and camps near you."}
            {pincode && (
              <span className="ml-1 font-bold">· Pincode {pincode}</span>
            )}
          </p>

          {/* Search */}
          <div className="mt-6 flex items-center gap-2 rounded-2xl bg-white/90 p-2 kuddl-shadow backdrop-blur">
            <Search className="ml-2 h-5 w-5 text-sand-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search experiences…"
              className="w-full bg-transparent py-2 text-sm font-medium outline-none placeholder:text-sand-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="grid h-8 w-8 place-items-center rounded-full text-sand-500 hover:bg-sand-100"
                aria-label="Clear"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-[68px] z-30 border-b border-sand-200 bg-kuddl-cream/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8 no-scrollbar">
          <button
            onClick={() => setModule("")}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors",
              !module
                ? "bg-kuddl-ink text-white"
                : "bg-white text-sand-700 hover:bg-sand-100"
            )}
          >
            All
          </button>
          {MODULES.map((m) => (
            <button
              key={m.key}
              onClick={() => setModule(m.upperKey)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-colors"
              style={{
                background: module === m.upperKey ? m.color : "#fff",
                color: module === m.upperKey ? "#fff" : "#807570",
              }}
            >
              <ModuleIcon module={m} className="h-5 w-5" />
              {m.label}
            </button>
          ))}

          <div className="ml-auto flex shrink-0 items-center gap-2 pl-2">
            <SlidersHorizontal className="h-4 w-4 text-sand-500" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-full border border-sand-200 bg-white px-3 py-2 text-sm font-bold text-kuddl-ink outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!isLoading && (
          <p className="mb-5 text-sm font-bold text-sand-600">
            {results.length} experience{results.length === 1 ? "" : "s"} found
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-sand-300 bg-white py-20 text-center">
            <p className="text-5xl">🔍</p>
            <h3 className="mt-4 text-xl font-black text-kuddl-ink">
              No experiences yet
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sand-600">
              We couldn’t find anything matching your filters. Try another world
              or clear your search.
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {results.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
              >
                <ServiceCard service={s} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
