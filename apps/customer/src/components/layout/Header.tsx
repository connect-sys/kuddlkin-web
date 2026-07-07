"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, User, Search } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { MODULES } from "@/lib/modules";
import { useAuth } from "@/lib/auth";
import { ButtonLink } from "@/components/ui/Button";
import { ModuleIcon } from "@/components/ui/ModuleIcon";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const solid = scrolled || !isHome || open;

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid
          ? "glass border-b border-sand-200/70 py-2.5"
          : "bg-transparent py-4"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center" aria-label="Kuddl home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo.svg"
            alt="Kuddl"
            className="h-9 w-auto transition-transform duration-200 hover:scale-[1.03] sm:h-10"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          <Link
            href="/services"
            className="rounded-full px-4 py-2 text-sm font-bold text-sand-800 transition-colors hover:bg-primary-100 hover:text-primary-700"
          >
            Explore
          </Link>
          {MODULES.map((m) => (
            <Link
              key={m.key}
              href={`/services?module=${m.upperKey}`}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold text-sand-800 transition-colors hover:bg-primary-100 hover:text-primary-700"
            >
              <ModuleIcon module={m} className="h-5 w-5" />
              {m.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/services"
            aria-label="Search services"
            className="hidden h-10 w-10 place-items-center rounded-full text-sand-700 transition-colors hover:bg-sand-200 sm:grid"
          >
            <Search className="h-5 w-5" />
          </Link>

          {isAuthenticated ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-full bg-secondary-500 py-1.5 pl-1.5 pr-4 text-white kuddl-shadow"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/25 text-sm font-black">
                {initials(user?.name || user?.first_name)}
              </span>
              <span className="hidden text-sm font-bold sm:block">Profile</span>
            </Link>
          ) : (
            <ButtonLink
              href="/login"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <User className="h-4 w-4" />
              Sign in
            </ButtonLink>
          )}

          {/* Mobile toggle */}
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full bg-sand-200 text-kuddl-ink lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden lg:hidden"
          >
            <div className="mx-auto max-w-7xl space-y-1 px-4 pb-5 pt-3">
              <Link
                href="/services"
                className="block rounded-2xl bg-sand-100 px-4 py-3 font-bold text-kuddl-ink"
              >
                Explore all
              </Link>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {MODULES.map((m) => (
                  <Link
                    key={m.key}
                    href={`/services?module=${m.upperKey}`}
                    className="flex items-center gap-2 rounded-2xl px-4 py-3 font-bold"
                    style={{ background: m.soft, color: m.color }}
                  >
                    <ModuleIcon module={m} className="h-5 w-5" />
                    {m.label}
                  </Link>
                ))}
              </div>
              {!isAuthenticated && (
                <ButtonLink href="/login" className="mt-2 w-full">
                  <User className="h-4 w-4" /> Sign in
                </ButtonLink>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
