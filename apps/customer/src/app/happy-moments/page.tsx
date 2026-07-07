"use client";

import { motion } from "framer-motion";
import { happyMomentImages } from "@/lib/happyMoments";

export default function HappyMomentsPage() {
  return (
    <div className="pb-24 pt-24 lg:pt-28">
      <section className="bg-primary-50 py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-block rounded-full bg-primary-100 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-primary-700">
            Happy moments
          </span>
          <h1 className="mt-4 text-3xl font-black text-kuddl-ink sm:text-4xl">
            Smiles from the Kuddl community
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sand-700">
            Real joy from parties, classes and camps — captured one happy moment
            at a time.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4 [&>*]:mb-3 sm:[&>*]:mb-4">
          {happyMomentImages.map((src, i) => (
            <motion.div
              key={src}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: (i % 4) * 0.05 }}
              className="group overflow-hidden rounded-3xl bg-sand-100 kuddl-shadow"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Happy moment ${i + 1}`}
                loading="lazy"
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
