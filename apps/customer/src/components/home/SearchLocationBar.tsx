"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, LocateFixed, Loader2, X } from "lucide-react";
import { useLocation } from "@/lib/location";

/**
 * Location picker + search, directly under the fixed header on the home page.
 * - "Detect" uses the browser GPS; a pincode can also be typed.
 * - The chosen location is remembered (localStorage) and drives distance badges.
 */
export function SearchLocationBar() {
  const router = useRouter();
  const { location, setByPincode, detect, detecting, clear } = useLocation();
  const [q, setQ] = useState("");
  const [pincode, setPincode] = useState("");
  const [pinError, setPinError] = useState(false);

  const applyPincode = () => {
    if (!/^\d{6}$/.test(pincode)) return;
    const ok = setByPincode(pincode);
    setPinError(!ok);
    if (ok) setPincode("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    const pin = location?.pincode || (/^\d{6}$/.test(pincode) ? pincode : "");
    if (pin) params.set("pincode", pin);
    router.push(`/services?${params.toString()}`);
  };

  return (
    <section className="bg-kuddl-cream pt-20 sm:pt-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Current location row */}
        <div className="mb-2 flex items-center gap-2">
          <button
            type="button"
            onClick={detect}
            disabled={detecting}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1.5 text-xs font-bold text-primary-700 transition-colors hover:bg-primary-200 disabled:opacity-60"
          >
            {detecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="h-4 w-4" />
            )}
            {detecting ? "Locating…" : "Use my location"}
          </button>
          {location && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-kuddl-ink kuddl-shadow">
              <MapPin className="h-3.5 w-3.5 text-secondary-500" />
              {location.label}
              <button
                type="button"
                aria-label="Clear location"
                onClick={clear}
                className="ml-0.5 text-sand-400 hover:text-sand-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
        </div>

        <form
          onSubmit={submit}
          className="flex flex-col gap-2 rounded-3xl border border-sand-200 bg-white p-2 kuddl-shadow sm:flex-row sm:items-stretch sm:rounded-full"
        >
          {/* Pincode */}
          <label className="flex items-center gap-2 rounded-2xl bg-sand-50 px-3 py-2.5 sm:w-44 sm:rounded-full">
            <MapPin className="h-5 w-5 shrink-0 text-primary-500" />
            <input
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
                setPinError(false);
              }}
              onBlur={applyPincode}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyPincode();
                }
              }}
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
        {pinError && (
          <p className="mt-1.5 px-2 text-xs font-semibold text-secondary-600">
            We don’t serve that pincode yet — try another.
          </p>
        )}
      </div>
    </section>
  );
}
