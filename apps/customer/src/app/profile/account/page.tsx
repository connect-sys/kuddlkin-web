"use client";

import { useRouter } from "next/navigation";
import { User, Phone, Mail, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { initials } from "@/lib/utils";

export default function Account() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const name = user?.name || user?.first_name || "Kuddl parent";

  const rows = [
    { icon: User, label: "Name", value: name },
    {
      icon: Phone,
      label: "Mobile",
      value: user?.phone || user?.phoneNumber ? `+91 ${user?.phone || user?.phoneNumber}` : "—",
    },
    { icon: Mail, label: "Email", value: user?.email || "—" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-kuddl-ink sm:text-3xl">Account</h1>

      <div className="mt-5 rounded-3xl border border-sand-200 bg-white p-6 kuddl-shadow">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-secondary-100 text-xl font-black text-secondary-700">
            {initials(name)}
          </span>
          <div>
            <p className="text-lg font-black text-kuddl-ink">{name}</p>
            <p className="inline-flex items-center gap-1 text-xs font-bold text-secondary-600">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified account
            </p>
          </div>
        </div>

        <dl className="mt-6 divide-y divide-sand-100">
          {rows.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.label} className="flex items-center gap-3 py-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-sand-100">
                  <Icon className="h-5 w-5 text-sand-600" />
                </span>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-sand-500">
                    {r.label}
                  </dt>
                  <dd className="font-bold text-kuddl-ink">{r.value}</dd>
                </div>
              </div>
            );
          })}
        </dl>
      </div>

      <button
        onClick={() => {
          logout();
          router.replace("/");
        }}
        className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-adventure/30 px-5 py-3 text-sm font-extrabold text-adventure transition-colors hover:bg-adventure-soft"
      >
        <LogOut className="h-4 w-4" /> Log out
      </button>
    </div>
  );
}
