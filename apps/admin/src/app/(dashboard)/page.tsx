"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, Package, IndianRupee } from "lucide-react";
import { getDashboardStats } from "@/lib/api";
import { useAuth, displayName } from "@/lib/auth";
import { formatPrice } from "@kuddlkin/utils";

export default function DashboardHome() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const name = displayName(user);

  const cards = [
    {
      label: "Total partners",
      value: data?.totalPartners ?? 0,
      icon: Users,
      color: "#EF9855",
      soft: "#FFEDD6",
    },
    {
      label: "Active partners",
      value: data?.activePartners ?? 0,
      icon: UserCheck,
      color: "#267D71",
      soft: "#DAF0EC",
    },
    {
      label: "Total services",
      value: data?.totalServices ?? 0,
      icon: Package,
      color: "#9895EE",
      soft: "#F3F2FC",
    },
    {
      label: "Total revenue",
      value: formatPrice(data?.totalRevenue ?? 0),
      icon: IndianRupee,
      color: "#00B6AA",
      soft: "#E8F9F8",
      isText: true,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-kuddl-ink">Welcome, {name}</h1>
      <p className="mt-1 text-sand-600">
        Here&rsquo;s how the Kuddl platform is doing today.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="rounded-3xl border border-sand-200 bg-white p-5 kuddl-shadow"
            >
              <div
                className="grid h-11 w-11 place-items-center rounded-2xl"
                style={{ background: c.soft }}
              >
                <Icon className="h-6 w-6" style={{ color: c.color }} />
              </div>
              {isLoading ? (
                <div className="skeleton mt-4 h-8 w-16 rounded-full" />
              ) : (
                <p className="mt-3 text-3xl font-black text-kuddl-ink">
                  {c.isText ? c.value : Number(c.value).toLocaleString("en-IN")}
                </p>
              )}
              <p className="text-sm font-semibold text-sand-600">{c.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
