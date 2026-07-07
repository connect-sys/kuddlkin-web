"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, LogOut } from "lucide-react";
import { cn } from "@kuddlkin/utils";
import { useAuth, displayName } from "@/lib/auth";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/partners", label: "Partners", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const name = displayName(user);
  const role = user?.role === "admin" ? "Admin" : "Service worker";

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-sand-200 bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary-500 text-base font-black text-white">
          k
        </span>
        <div>
          <p className="text-sm font-black leading-none text-kuddl-ink">
            Kuddl Admin
          </p>
          <p className="text-[11px] font-semibold text-sand-500">Console</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors",
                active
                  ? "bg-primary-500 text-white"
                  : "text-sand-700 hover:bg-sand-100"
              )}
            >
              <Icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sand-200 p-4">
        <p className="truncate text-sm font-extrabold text-kuddl-ink">{name}</p>
        <p className="text-xs font-semibold text-sand-500">{role}</p>
        <button
          onClick={() => {
            logout();
            router.replace("/login");
          }}
          className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-adventure transition-colors hover:bg-red-50"
          style={{ color: "#FB5261" }}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
