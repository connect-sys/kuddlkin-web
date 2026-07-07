"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const variants: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** stagger index */
  i?: number;
  as?: "div" | "section" | "li" | "span";
}

export function Reveal({ children, className, i = 0, as = "div" }: RevealProps) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      custom={i}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={cn(className)}
    >
      {children}
    </MotionTag>
  );
}

/** Eyebrow + title + optional subtitle block used above sections. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      {eyebrow && (
        <Reveal>
          <span className="inline-block rounded-full bg-primary-100 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-primary-700">
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal i={1}>
        <h2 className="mt-4 text-3xl font-black leading-tight text-kuddl-ink sm:text-4xl md:text-[2.7rem]">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal i={2}>
          <p className="mt-4 text-base leading-relaxed text-sand-700 sm:text-lg">
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
