"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Star, MapPin } from "lucide-react";
import { getCamps, campToService } from "@/lib/api";
import type { Service } from "@/lib/types";
import { serviceImage } from "@/lib/images";
import { formatPrice, cn } from "@/lib/utils";
import { getModule } from "@/lib/modules";

const discover = getModule("DISCOVER")!;

function CampMiniCard({ camp }: { camp: Service }) {
  const img = serviceImage(camp);
  return (
    <Link
      href={`/services/${camp.id}`}
      className="block w-44 shrink-0 overflow-hidden rounded-2xl border border-sand-200 bg-white transition-shadow duration-200 hover:shadow-lg sm:w-52"
    >
      <div className="relative aspect-[4/3] bg-sand-100">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={camp.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="grid h-full w-full place-items-center text-4xl"
            style={{ background: discover.soft }}
          >
            {discover.emoji}
          </div>
        )}
        <span
          className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-extrabold text-white"
          style={{ background: discover.color }}
        >
          Camp
        </span>
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 text-sm font-extrabold text-kuddl-ink">
          {camp.name}
        </h3>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-sm font-black text-primary-700">
            {camp.price ? formatPrice(camp.price) : "Free"}
          </span>
          {camp.city ? (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-sand-500">
              <MapPin className="h-3 w-3" />
              {camp.city}
            </span>
          ) : camp.provider?.average_rating ? (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-sand-500">
              <Star className="h-3 w-3 fill-primary-500 text-primary-500" />
              {Number(camp.provider.average_rating).toFixed(1)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function Row({
  camps,
  reverse,
}: {
  camps: Service[];
  reverse?: boolean;
}) {
  // Duplicate the list so the -50% translate loops seamlessly.
  const track = [...camps, ...camps];
  return (
    <div className="group relative overflow-hidden">
      <div
        className={cn(
          "flex w-max gap-4 group-hover:[animation-play-state:paused]",
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        )}
      >
        {track.map((camp, i) => (
          <CampMiniCard key={`${camp.id}-${i}`} camp={camp} />
        ))}
      </div>
    </div>
  );
}

export function HeroCampsMarquee() {
  const { data, isLoading } = useQuery({
    queryKey: ["camps", "hero-marquee"],
    queryFn: async () => (await getCamps()).map(campToService),
  });

  const camps = data ?? [];

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        {[0, 1].map((r) => (
          <div key={r} className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[164px] w-44 shrink-0 rounded-2xl sm:w-52 skeleton"
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (camps.length === 0) return null;

  // Ensure each row has enough cards to fill wide screens.
  const fill = (arr: Service[]) => {
    const out: Service[] = [];
    while (out.length < 6 && arr.length) out.push(...arr);
    return out;
  };

  const mid = Math.ceil(camps.length / 2);
  const rowA = fill(camps.length > 3 ? camps.slice(0, mid) : camps);
  const rowB = fill(camps.length > 3 ? camps.slice(mid) : [...camps].reverse());

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      <div className="space-y-4">
        <Row camps={rowA} />
        <Row camps={rowB} reverse />
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-sand-50 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-sand-50 to-transparent" />
    </div>
  );
}
