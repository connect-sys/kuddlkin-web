"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Star,
  MapPin,
  Users,
  Clock,
  Calendar,
  ShieldCheck,
  ChevronLeft,
  Check,
  Heart,
} from "lucide-react";
import { getServiceById } from "@/lib/api";
import { serviceImages } from "@/lib/images";
import { formatPrice, priceLabel, initials, parseFeatures } from "@/lib/utils";
import { getModule } from "@/lib/modules";
import { ButtonLink } from "@/components/ui/Button";

export function ServiceDetail() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [active, setActive] = useState(0);

  const { data: service, isLoading } = useQuery({
    queryKey: ["service", serviceId],
    queryFn: () => getServiceById(serviceId),
    enabled: !!serviceId,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <div className="skeleton aspect-[16/9] w-full rounded-3xl" />
        <div className="mt-6 space-y-3">
          <div className="skeleton h-8 w-2/3 rounded-full" />
          <div className="skeleton h-4 w-full rounded-full" />
          <div className="skeleton h-4 w-1/2 rounded-full" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-4 text-center">
        <div>
          <p className="text-6xl">🧸</p>
          <h1 className="mt-4 text-2xl font-black text-kuddl-ink">
            Experience not found
          </h1>
          <p className="mt-2 text-sand-600">
            It may have ended or moved. Let’s find you another adventure.
          </p>
          <ButtonLink href="/services" className="mt-6">
            Browse experiences
          </ButtonLink>
        </div>
      </div>
    );
  }

  const images = serviceImages(service);
  const mod =
    getModule(service.category_module) ??
    getModule(service.categoryModule) ??
    getModule(service.category_name);
  const provider = service.provider;
  const { chips: featureChips, details: featureDetails } = parseFeatures(
    service.features
  );
  const priceType = service.priceType || service.price_type;

  return (
    <div className="pb-32 pt-24 lg:pt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/services"
          className="inline-flex items-center gap-1 text-sm font-bold text-sand-600 hover:text-primary-700"
        >
          <ChevronLeft className="h-4 w-4" /> Back to explore
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* Gallery + content */}
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-sand-100 kuddl-shadow"
            >
              {images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[active]}
                  alt={service.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="grid h-full w-full place-items-center text-8xl"
                  style={{ background: mod?.soft ?? "#f8f5f0" }}
                >
                  {mod?.emoji ?? "🎨"}
                </div>
              )}
              {mod && (
                <span
                  className="absolute left-4 top-4 rounded-full px-3 py-1.5 text-sm font-extrabold text-white shadow"
                  style={{ background: mod.color }}
                >
                  {mod.label}
                </span>
              )}
            </motion.div>

            {images.length > 1 && (
              <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                      i === active ? "border-primary-500" : "border-transparent"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <h1 className="mt-7 text-3xl font-black text-kuddl-ink sm:text-4xl">
              {service.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-sand-700">
              {provider?.average_rating ? (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary-500 text-primary-500" />
                  {Number(provider.average_rating).toFixed(1)} rating
                </span>
              ) : null}
              {(service.city || provider?.city) && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {service.city || provider?.city}
                </span>
              )}
              {(service.age_group_min != null ||
                service.age_group_max != null) && (
                <span className="inline-flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Ages {service.age_group_min ?? 0}–{service.age_group_max ?? 12}
                </span>
              )}
              {service.duration_days ? (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {service.duration_days} days
                </span>
              ) : null}
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-xl font-black text-kuddl-ink">
                About this experience
              </h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-sand-700">
                {service.description ||
                  "A delightful, safe and memorable experience thoughtfully designed for your child. Get in touch to learn more about what's included."}
              </p>
            </div>

            {/* Features (string highlights) */}
            {featureChips.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-black text-kuddl-ink">
                  What’s included
                </h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {featureChips.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 rounded-2xl bg-white p-3 text-sm font-semibold text-sand-700 kuddl-shadow"
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary-100">
                        <Check className="h-3.5 w-3.5 text-secondary-600" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Structured details (e.g. camp variant: instructor, mode…) */}
            {featureDetails.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-black text-kuddl-ink">
                  Good to know
                </h2>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {featureDetails.map((d, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-sand-200 bg-white p-4 kuddl-shadow"
                    >
                      <dt className="text-xs font-bold uppercase tracking-wide text-sand-500">
                        {d.label}
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-kuddl-ink">
                        {d.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Provider */}
            {provider && (
              <div className="mt-8 flex items-center gap-4 rounded-3xl border border-sand-200 bg-white p-5 kuddl-shadow">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary-100 text-lg font-black text-secondary-700">
                  {initials(provider.businessName || provider.name)}
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-sand-500">
                    Hosted by
                  </p>
                  <p className="text-lg font-black text-kuddl-ink">
                    {provider.businessName || provider.name || "Kuddl Partner"}
                  </p>
                  <p className="inline-flex items-center gap-1 text-xs font-bold text-secondary-600">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified partner
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sticky booking card */}
          <div className="lg:relative">
            <div className="lg:sticky lg:top-28">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-sand-200 bg-white p-6 kuddl-shadow-lg"
              >
                <p className="text-sm font-bold text-sand-500">Starting from</p>
                <p className="text-4xl font-black text-primary-700">
                  {formatPrice(service.price)}
                  <span className="text-base font-bold text-sand-500">
                    {priceLabel(priceType)}
                  </span>
                </p>

                <div className="mt-5 space-y-2 text-sm font-semibold text-sand-700">
                  {service.start_date && (
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary-500" />
                      Starts{" "}
                      {new Date(service.start_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  {service.max_children ? (
                    <p className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary-500" />
                      Up to {service.max_children} children
                    </p>
                  ) : null}
                  <p className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-secondary-500" />
                    Secure payment · Free cancellation*
                  </p>
                </div>

                <ButtonLink
                  href={`/booking/${service.id}`}
                  size="lg"
                  className="mt-6 w-full"
                >
                  Book now
                </ButtonLink>
                <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border-2 border-sand-200 py-3 text-sm font-extrabold text-kuddl-ink transition-colors hover:border-primary-300 hover:text-primary-700">
                  <Heart className="h-4 w-4" /> Save to wishlist
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky booking bar */}
      <div className="fixed inset-x-0 bottom-[68px] z-40 border-t border-sand-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-sand-500">From</p>
            <p className="text-xl font-black text-primary-700">
              {formatPrice(service.price)}
              <span className="text-xs font-bold text-sand-500">
                {priceLabel(priceType)}
              </span>
            </p>
          </div>
          <ButtonLink href={`/booking/${service.id}`} className="flex-1 max-w-[60%]">
            Book now
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
