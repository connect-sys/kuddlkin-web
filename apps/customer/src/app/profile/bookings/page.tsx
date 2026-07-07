"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCustomerBookings } from "@/lib/api";
import { BookingCard } from "@/components/profile/BookingCard";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const filters = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
] as const;

export default function MyBookings() {
  const [filter, setFilter] = useState<string>("all");
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["customer-bookings"],
    queryFn: getCustomerBookings,
  });

  const filtered = bookings.filter((b) => {
    const s = (b.status || "").toLowerCase();
    if (filter === "all") return true;
    if (filter === "upcoming")
      return ["confirmed", "pending", "pending_payment"].includes(s);
    if (filter === "completed") return s === "completed";
    if (filter === "cancelled") return ["cancelled", "rejected"].includes(s);
    return true;
  });

  return (
    <div>
      <h1 className="text-2xl font-black text-kuddl-ink sm:text-3xl">
        My bookings
      </h1>

      <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors",
              filter === f.key
                ? "bg-kuddl-ink text-white"
                : "bg-white text-sand-700 hover:bg-sand-100"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {isLoading ? (
          [0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-28 rounded-3xl" />
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-sand-300 bg-white p-12 text-center">
            <p className="text-5xl">🗓️</p>
            <p className="mt-4 text-lg font-black text-kuddl-ink">
              Nothing here yet
            </p>
            <p className="mt-1 text-sm text-sand-600">
              When you book experiences, they’ll show up here.
            </p>
            <ButtonLink href="/services" className="mt-5">
              Explore experiences
            </ButtonLink>
          </div>
        ) : (
          filtered.map((b) => <BookingCard key={b.id} booking={b} />)
        )}
      </div>
    </div>
  );
}
