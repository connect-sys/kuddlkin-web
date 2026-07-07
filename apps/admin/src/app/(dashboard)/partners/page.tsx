"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { getPartners } from "@/lib/api";

export default function PartnersPage() {
  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["admin-partners"],
    queryFn: getPartners,
  });

  return (
    <div>
      <h1 className="text-2xl font-black text-kuddl-ink">Partners</h1>
      <p className="mt-1 text-sand-600">
        Every provider registered on the Kuddl platform.
      </p>

      <div className="mt-6 overflow-hidden rounded-3xl border border-sand-200 bg-white kuddl-shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-sand-50 text-xs font-bold uppercase tracking-wide text-sand-600">
            <tr>
              <th className="px-5 py-3">Business</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">City</th>
              <th className="px-5 py-3">KYC</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-5 py-4" colSpan={5}>
                    <div className="skeleton h-5 w-full rounded-full" />
                  </td>
                </tr>
              ))
            ) : partners.length === 0 ? (
              <tr>
                <td className="px-5 py-10 text-center text-sand-500" colSpan={5}>
                  No partners found.
                </td>
              </tr>
            ) : (
              partners.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3.5 font-bold text-kuddl-ink">
                    {p.business_name || p.name || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-sand-700">
                    {p.email || p.phone || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-sand-700">{p.city || "—"}</td>
                  <td className="px-5 py-3.5">
                    {p.kyc_status === "verified" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary-100 px-2.5 py-1 text-xs font-extrabold text-secondary-700">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-xs font-extrabold text-primary-700">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        {p.kyc_status || "Pending"}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${
                        p.is_active
                          ? "bg-secondary-100 text-secondary-700"
                          : "bg-sand-200 text-sand-600"
                      }`}
                    >
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
