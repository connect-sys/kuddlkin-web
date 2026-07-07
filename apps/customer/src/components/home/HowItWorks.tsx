"use client";

import { Search, CalendarCheck, Smile } from "lucide-react";
import { SectionHeading, Reveal } from "@/components/ui/Reveal";

const steps = [
  {
    icon: Search,
    title: "Discover",
    text: "Browse trusted, verified experiences near you — filter by world, age and pincode.",
    color: "#EF9855",
    soft: "#FFEDD6",
  },
  {
    icon: CalendarCheck,
    title: "Book in seconds",
    text: "Pick a slot, confirm with a quick OTP and pay securely. No back-and-forth.",
    color: "#267D71",
    soft: "#DAF0EC",
  },
  {
    icon: Smile,
    title: "Enjoy & relive",
    text: "Show up and have fun. Relive the joy with photos in your Happy Moments.",
    color: "#9895EE",
    soft: "#F3F2FC",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              Booking joy in <span className="text-gradient-brand">3 steps</span>
            </>
          }
          subtitle="From discovery to delight — Kuddl makes planning effortless for busy parents."
        />

        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.title} i={i}>
                <div className="relative h-full rounded-[2rem] border border-sand-200 bg-white p-7 kuddl-shadow">
                  <span className="absolute right-6 top-6 text-5xl font-black text-sand-100">
                    {i + 1}
                  </span>
                  <div
                    className="grid h-14 w-14 place-items-center rounded-2xl"
                    style={{ background: s.soft }}
                  >
                    <Icon className="h-7 w-7" style={{ color: s.color }} />
                  </div>
                  <h3 className="mt-5 text-xl font-black text-kuddl-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-sand-600">
                    {s.text}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
