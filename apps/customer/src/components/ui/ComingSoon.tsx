"use client";

import { motion } from "framer-motion";
import { ButtonLink } from "@/components/ui/Button";

export function ComingSoon({
  emoji = "🚧",
  title,
  message,
}: {
  emoji?: string;
  title: string;
  message?: string;
}) {
  return (
    <section className="grid min-h-[80vh] place-items-center bg-sand-50 px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-md text-center"
      >
        <span className="inline-block text-7xl">{emoji}</span>
        <h1 className="mt-6 text-3xl font-black text-kuddl-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sand-700">
          {message ??
            "We're putting the finishing touches on this. Check back soon — something delightful is on the way!"}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Back home</ButtonLink>
          <ButtonLink href="/services" variant="outline">
            Explore experiences
          </ButtonLink>
        </div>
      </motion.div>
    </section>
  );
}
