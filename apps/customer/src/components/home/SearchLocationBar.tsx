"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";

/**
 * Compact location + search bar that sits directly under the fixed header on the
 * home page. Mobile-first: stacks on small screens, inline on larger ones.
 */
export function SearchLocationBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [pincode, setPincode] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (/^\d{6}$/.test(pincode.trim())) params.set("pincode", pincode.trim());
    router.push(`/services?${params.toString()}`);
  };

  return (
    <section className="bg-kuddl-cream pt-20 sm:pt-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <form
          onSubmit={submit}
          className="flex flex-col gap-2 rounded-3xl border border-sand-200 bg-white p-2 kuddl-shadow sm:flex-row sm:items-stretch sm:rounded-full"
        >
          {/* Location */}
          <label className="flex items-center gap-2 rounded-2xl bg-sand-50 px-3 py-2.5 sm:w-40 sm:rounded-full">
            <MapPin className="h-5 w-5 shrink-0 text-primary-500" />
            <input
              value={pincode}
              onChange={(e) =>
                setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              inputMode="numeric"
              placeholder="Pincode"
              aria-label="Pincode"
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-sand-400"
            />
          </label>

          {/* Search */}
          <div className="flex flex-1 items-center gap-2 rounded-2xl bg-sand-50 px-3 py-2.5 sm:rounded-full">
            <Search className="h-5 w-5 shrink-0 text-sand-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search classes, camps, sitters…"
              aria-label="Search experiences"
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-sand-400"
            />
          </div>

          <button
            type="submit"
            className="rounded-2xl bg-primary-500 px-6 py-2.5 text-sm font-extrabold text-white transition-colors hover:bg-primary-600 sm:rounded-full"
          >
            Search
          </button>
        </form>
      </div>
    </section>
  );
}
