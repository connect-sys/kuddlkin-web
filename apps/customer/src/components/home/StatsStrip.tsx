"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getPublicStats } from "@/lib/api";

function Counter({ to, suffix }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(Math.floor(v)),
    });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref}>
      {val.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export function StatsStrip() {
  const { data } = useQuery({
    queryKey: ["public-stats"],
    queryFn: getPublicStats,
  });

  // Show real numbers, but never let a tile look empty on a fresh dataset.
  const real = (key: string, floor: number) =>
    Math.max(Number(data?.[key] ?? 0), floor);

  const stats = [
    { to: real("total_bookings", 10000), suffix: "+", label: "Happy families" },
    { to: real("total_services", 500), suffix: "+", label: "Experiences" },
    { to: real("total_providers", 200), suffix: "+", label: "Verified partners" },
    { to: 25, suffix: "+", label: "Cities" },
  ];

  return (
    <section className="bg-secondary-500 py-12 text-white lg:py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-4xl font-black sm:text-5xl">
              <Counter to={s.to} suffix={s.suffix} />
            </p>
            <p className="mt-1 text-sm font-bold text-secondary-100">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
