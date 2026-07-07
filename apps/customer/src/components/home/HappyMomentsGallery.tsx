"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Camera } from "lucide-react";
import { happyMomentImages } from "@/lib/happyMoments";
import { SectionHeading, Reveal } from "@/components/ui/Reveal";

export function HappyMomentsGallery() {
  const preview = happyMomentImages.slice(0, 6);
  if (preview.length === 0) return null;

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Happy moments"
          title={
            <>
              Smiles we’ve helped <span className="text-primary-500">create</span>
            </>
          }
          subtitle="A peek into the joy from parties, classes and camps across the Kuddl community."
        />

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6 lg:[grid-auto-rows:11rem]">
          {preview.map((src, i) => (
            <Reveal
              key={src}
              i={i}
              className={
                // make a couple of tiles larger for a playful collage feel
                i === 0
                  ? "col-span-2 row-span-2 lg:col-span-2 lg:row-span-2"
                  : i === 3
                    ? "lg:col-span-2"
                    : ""
              }
            >
              <div className="group relative h-full min-h-[8rem] overflow-hidden rounded-3xl bg-sand-100 kuddl-shadow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Happy moment ${i + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/happy-moments"
            className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-extrabold text-white transition-colors hover:bg-primary-600"
          >
            <Camera className="h-4 w-4" />
            See all moments
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
