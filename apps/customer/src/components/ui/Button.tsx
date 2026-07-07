"use client";

import Link from "next/link";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "white";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 font-extrabold rounded-full transition-colors select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300/50 disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary-500 text-white kuddl-shadow hover:bg-primary-600",
  secondary:
    "bg-secondary-500 text-white kuddl-shadow hover:bg-secondary-600",
  ghost: "bg-transparent text-kuddl-ink hover:bg-sand-200",
  outline:
    "bg-white/70 text-kuddl-ink border-2 border-sand-300 hover:border-primary-400 hover:text-primary-700",
  white: "bg-white text-primary-700 kuddl-shadow hover:bg-primary-50",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-4 py-2",
  md: "text-[15px] px-6 py-3",
  lg: "text-base px-8 py-4",
};

const MotionLink = motion.create(Link);

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & HTMLMotionProps<"button">) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & { href: string } & Omit<
    HTMLMotionProps<"a">,
    "href"
  >) {
  return (
    <MotionLink
      href={href}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </MotionLink>
  );
}
