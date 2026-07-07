"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Compass, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Home", href: "/", icon: Home, match: (p: string) => p === "/" },
  {
    label: "Explore",
    href: "/services",
    icon: Compass,
    match: (p: string) => p.startsWith("/services"),
  },
  {
    label: "Moments",
    href: "/happy-moments",
    icon: Sparkles,
    match: (p: string) => p.startsWith("/happy-moments"),
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
    match: (p: string) => p.startsWith("/profile") || p.startsWith("/login"),
  },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 lg:hidden">
      <div className="glass mx-auto flex max-w-md items-center justify-around rounded-3xl border border-sand-200/70 px-2 py-1.5 kuddl-shadow-lg">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-1.5"
            >
              {active && (
                <motion.span
                  layoutId="tabPill"
                  className="absolute inset-x-2 inset-y-0 -z-10 rounded-2xl bg-primary-100"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  active ? "text-primary-600" : "text-sand-600"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-bold transition-colors",
                  active ? "text-primary-700" : "text-sand-600"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
