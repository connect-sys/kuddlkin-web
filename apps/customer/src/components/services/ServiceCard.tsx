"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star, MapPin, Clock, Users } from "lucide-react";
import type { Service } from "@/lib/types";
import { serviceImage } from "@/lib/images";
import { formatPrice, priceLabel, cn } from "@/lib/utils";
import { getModule } from "@/lib/modules";

export function ServiceCard({
  service,
  className,
}: {
  service: Service;
  className?: string;
}) {
  const img = serviceImage(service);
  const mod =
    getModule(service.category_module) ??
    getModule(service.categoryModule) ??
    getModule(service.category_name);
  const rating = service.provider?.average_rating;
  const city = service.city || service.provider?.city;
  const priceType = service.priceType || service.price_type;
  const ageMin = service.age_group_min;
  const ageMax = service.age_group_max;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={cn("group h-full", className)}
    >
      <Link
        href={`/services/${service.id}`}
        className="flex h-full flex-col overflow-hidden rounded-3xl border border-sand-200 bg-white kuddl-shadow"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-sand-100">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={service.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="grid h-full w-full place-items-center text-5xl"
              style={{ background: mod?.soft ?? "#f8f5f0" }}
            >
              {mod?.emoji ?? "🧸"}
            </div>
          )}

          {mod && (
            <span
              className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-extrabold text-white shadow"
              style={{ background: mod.color }}
            >
              {mod.label}
            </span>
          )}
          {rating ? (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-extrabold text-kuddl-ink shadow">
              <Star className="h-3.5 w-3.5 fill-primary-500 text-primary-500" />
              {Number(rating).toFixed(1)}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-1 text-lg font-extrabold text-kuddl-ink">
            {service.name}
          </h3>
          <p className="mt-1 line-clamp-2 flex-1 text-sm leading-relaxed text-sand-600">
            {service.description || "A wonderful experience for your little one."}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-sand-600">
            {city && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {city}
              </span>
            )}
            {(ageMin != null || ageMax != null) && (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {ageMin ?? 0}–{ageMax ?? 12} yrs
              </span>
            )}
            {service.duration_days ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {service.duration_days} days
              </span>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-sand-100 pt-3">
            <p className="text-xl font-black text-primary-700">
              {formatPrice(service.price)}
              <span className="text-xs font-bold text-sand-500">
                {priceLabel(priceType)}
              </span>
            </p>
            <span className="rounded-full bg-primary-100 px-3 py-1.5 text-xs font-extrabold text-primary-700 transition-colors group-hover:bg-primary-500 group-hover:text-white">
              View
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-sand-200 bg-white">
      <div className="skeleton aspect-[4/3] w-full" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-5 w-2/3 rounded-full" />
        <div className="skeleton h-4 w-full rounded-full" />
        <div className="skeleton h-4 w-1/2 rounded-full" />
        <div className="skeleton mt-4 h-7 w-24 rounded-full" />
      </div>
    </div>
  );
}
