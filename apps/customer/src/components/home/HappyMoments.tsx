"use client";

import { Star } from "lucide-react";
import { SectionHeading, Reveal } from "@/components/ui/Reveal";

const reviews = [
  {
    name: "Ananya R.",
    city: "Bengaluru",
    text: "Booked a backyard magic show in minutes. The kids were spellbound — easiest party I've ever planned!",
  },
  {
    name: "Vikram S.",
    city: "Mumbai",
    text: "Found a wonderful, verified nanny through Kuddl Care. The OTP check-in gave us real peace of mind.",
  },
  {
    name: "Priya M.",
    city: "Hyderabad",
    text: "My daughter's swimming classes through Bloom have been brilliant. Transparent pricing, lovely coaches.",
  },
  {
    name: "Rahul & Neha",
    city: "Pune",
    text: "The summer camp under Discover was the highlight of the holidays. We'll be back every year!",
  },
];

export function HappyMoments() {
  return (
    <section className="bg-primary-50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title={
            <>
              Loved by <span className="text-secondary-600">families</span>{" "}
              everywhere
            </>
          }
          subtitle="Real smiles from real parents and little ones across the country."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {reviews.map((r, i) => (
            <Reveal key={r.name} i={i}>
              <div className="h-full rounded-3xl border border-sand-200 bg-white p-6 kuddl-shadow">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star
                      key={k}
                      className="h-4 w-4 fill-primary-500 text-primary-500"
                    />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-sand-700">
                  “{r.text}”
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary-100 text-sm font-black text-secondary-700">
                    {r.name[0]}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-kuddl-ink">
                      {r.name}
                    </p>
                    <p className="text-xs font-semibold text-sand-500">
                      {r.city}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
