"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CalendarCheck,
  Baby,
  UserCog,
  LogOut,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn, initials } from "@/lib/utils";

const tabs = [
  { href: "/profile", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/profile/bookings", label: "My bookings", icon: CalendarCheck },
  { href: "/profile/children", label: "My children", icon: Baby },
  { href: "/profile/account", label: "Account", icon: UserCog },
];

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready, isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !isAuthenticated) router.replace("/login?redirect=/profile");
  }, [ready, isAuthenticated, router]);

  if (!ready || !isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const name = user?.name || user?.first_name || "there";

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-24 sm:px-6 lg:px-8 lg:pt-28">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-sand-200 bg-white p-5 kuddl-shadow">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary-100 text-lg font-black text-secondary-700">
                {initials(name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-black text-kuddl-ink">
                  {name}
                </p>
                <p className="truncate text-xs font-semibold text-sand-500">
                  {user?.phone ? `+91 ${user.phone}` : user?.email || "Welcome"}
                </p>
              </div>
            </div>

            <nav className="mt-5 space-y-1">
              {tabs.map((t) => {
                const active = t.exact
                  ? pathname === t.href
                  : pathname.startsWith(t.href);
                const Icon = t.icon;
                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    className={cn(
                      "relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-bold transition-colors",
                      active
                        ? "bg-primary-500 text-white"
                        : "text-sand-700 hover:bg-sand-100"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {t.label}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  logout();
                  router.replace("/");
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-bold text-adventure transition-colors hover:bg-adventure-soft"
              >
                <LogOut className="h-5 w-5" />
                Log out
              </button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
