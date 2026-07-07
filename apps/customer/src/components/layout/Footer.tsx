import Link from "next/link";
import { Send, AtSign, Globe, Heart } from "lucide-react";
import { MODULES } from "@/lib/modules";
import { ModuleIcon } from "@/components/ui/ModuleIcon";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "All experiences", href: "/services" },
      { label: "Camps & workshops", href: "/services?module=DISCOVER" },
      { label: "Happy moments", href: "/happy-moments" },
      { label: "Become a partner", href: "/careers" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
      { label: "Support", href: "/support" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Terms & conditions", href: "/terms-and-conditions" },
      { label: "Cookie policy", href: "/cookie-policy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-10 overflow-hidden bg-secondary-700 text-secondary-50">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-secondary-600/60 blur-2xl"
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-16 sm:px-6 md:pb-16 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <div className="inline-flex rounded-2xl bg-white px-4 py-2.5 kuddl-shadow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo.svg" alt="Kuddl" className="h-9 w-auto" />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-secondary-100">
              Joyful, trusted experiences for every child — parties, classes,
              childcare and camps, all in one playful place built for families.
            </p>
            <div className="mt-5 flex gap-3">
              {[AtSign, Send, Globe].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-primary-500"
                  aria-label="Social link"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-black uppercase tracking-wider text-white">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-secondary-100 transition-colors hover:text-primary-300"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-2 border-t border-white/10 pt-6 text-center text-sm text-secondary-100">
          {MODULES.map((m) => (
            <span
              key={m.key}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <ModuleIcon module={m} className="h-4 w-4" />
              {m.label}
            </span>
          ))}
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-secondary-200">
          © {new Date().getFullYear()} Kuddl. Made with
          <Heart className="h-3.5 w-3.5 fill-primary-400 text-primary-400" /> for
          families.
        </p>
      </div>
    </footer>
  );
}
