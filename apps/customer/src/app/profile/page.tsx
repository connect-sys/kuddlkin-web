"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Baby, Heart, ArrowRight } from "lucide-react";
import { getCustomerBookings, getCustomerChildren } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { BookingCard } from "@/components/profile/BookingCard";
import { ButtonLink } from "@/components/ui/Button";

export default function ProfileOverview() {
  const { user } = useAuth();
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["customer-bookings"],
    queryFn: getCustomerBookings,
  });
  const { data: children = [] } = useQuery({
    queryKey: ["customer-children"],
    queryFn: getCustomerChildren,
  });

  const name = user?.name || user?.first_name || "there";
  const upcoming = bookings.filter((b) =>
    ["confirmed", "pending", "pending_payment"].includes(
      (b.status || "").toLowerCase()
    )
  );

  const stats = [
    { label: "Total bookings", value: bookings.length, icon: CalendarCheck, color: "#EF9855", soft: "#FFEDD6" },
    { label: "Children added", value: children.length, icon: Baby, color: "#267D71", soft: "#DAF0EC" },
    { label: "Upcoming", value: upcoming.length, icon: Heart, color: "#9895EE", soft: "#F3F2FC" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600 p-6 text-white kuddl-shadow sm:p-8">
        <h1 className="text-2xl font-black sm:text-3xl">Hi {name}! 👋</h1>
        <p className="mt-1 text-primary-50">
          Here’s everything happening with your little ones.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-3xl border border-sand-200 bg-white p-5 kuddl-shadow"
            >
              <div
                className="grid h-11 w-11 place-items-center rounded-2xl"
                style={{ background: s.soft }}
              >
                <Icon className="h-6 w-6" style={{ color: s.color }} />
              </div>
              <p className="mt-3 text-3xl font-black text-kuddl-ink">
                {s.value}
              </p>
              <p className="text-sm font-semibold text-sand-600">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-kuddl-ink">Recent bookings</h2>
          <Link
            href="/profile/bookings"
            className="inline-flex items-center gap-1 text-sm font-bold text-secondary-600"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {isLoading ? (
            [0, 1].map((i) => (
              <div key={i} className="skeleton h-28 rounded-3xl" />
            ))
          ) : bookings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-sand-300 bg-white p-10 text-center">
              <p className="text-4xl">🗓️</p>
              <p className="mt-3 font-bold text-kuddl-ink">No bookings yet</p>
              <p className="mt-1 text-sm text-sand-600">
                Discover joyful experiences for your little ones.
              </p>
              <ButtonLink href="/services" className="mt-5">
                Explore experiences
              </ButtonLink>
            </div>
          ) : (
            bookings.slice(0, 4).map((b) => <BookingCard key={b.id} booking={b} />)
          )}
        </div>
      </div>
    </div>
  );
}
