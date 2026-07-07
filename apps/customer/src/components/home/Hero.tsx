"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, MapPin, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { ModuleIcon } from "@/components/ui/ModuleIcon";
import { MODULES } from "@/lib/modules";
import { HeroCampsMarquee } from "@/components/home/HeroCampsMarquee";

export function Hero() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [pincode, setPincode] = useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (/^\d{6}$/.test(pincode.trim())) params.set("pincode", pincode.trim());
    router.push(`/services?${params.toString()}`);
  };

  return (
    <section className="bg-sand-50 pb-14 pt-28 sm:pt-32 lg:pb-20 lg:pt-36">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Left — copy + search */}
        <div className="min-w-0 max-w-xl">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-primary-700 kuddl-shadow"
          >
            <Sparkles className="h-4 w-4" />
            10,000+ happy families across India
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-5 text-balance text-4xl font-black leading-[1.08] text-kuddl-ink sm:text-5xl lg:text-6xl"
          >
            Joyful experiences for{" "}
            <span className="text-primary-500">every child</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-5 max-w-md text-lg leading-relaxed text-sand-700"
          >
            Parties, classes, trusted childcare and camps — discover and book the
            best for your little ones, all in one place.
          </motion.p>

          {/* Search */}
          <motion.form
            onSubmit={onSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-7 flex flex-col gap-2 rounded-3xl bg-white p-2 kuddl-shadow sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search className="h-5 w-5 shrink-0 text-sand-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Try ‘birthday party’ or ‘swimming’"
                className="w-full bg-transparent py-3 text-sm font-medium text-kuddl-ink outline-none placeholder:text-sand-500"
              />
            </div>
            <div className="flex items-center gap-2 border-t border-sand-200 px-3 sm:border-l sm:border-t-0">
              <MapPin className="h-5 w-5 shrink-0 text-sand-500" />
              <input
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                inputMode="numeric"
                maxLength={6}
                placeholder="Pincode"
                className="w-28 bg-transparent py-3 text-sm font-medium text-kuddl-ink outline-none placeholder:text-sand-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-2xl bg-primary-500 px-6 py-3 text-sm font-extrabold text-white transition-colors hover:bg-primary-600"
            >
              Search
            </button>
          </motion.form>

          {/* Module quick links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 flex flex-wrap gap-2"
          >
            {MODULES.map((m) => (
              <ButtonLink
                key={m.key}
                href={`/services?module=${m.upperKey}`}
                variant="white"
                size="sm"
                className="!font-bold"
                style={{ color: m.color }}
              >
                <ModuleIcon module={m} className="h-5 w-5" />
                {m.label}
              </ButtonLink>
            ))}
          </motion.div>
        </div>

        {/* Right — featured camps, two rows scrolling in opposite directions */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="w-full min-w-0 max-w-full"
        >
          <HeroCampsMarquee />
        </motion.div>
      </div>
    </section>
  );
}
