import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Indian Rupees, e.g. 1499 -> "₹1,499". */
export function formatPrice(value?: number | string | null): string {
  const n = typeof value === "string" ? parseFloat(value) : value ?? 0;
  if (!n || Number.isNaN(n)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Suffix a price with its billing cadence. */
export function priceLabel(type?: string | null): string {
  switch (type) {
    case "hourly":
      return "/hr";
    case "daily":
      return "/day";
    case "package":
      return " package";
    case "camp":
      return " /camp";
    default:
      return "";
  }
}

export interface FeatureView {
  chips: string[];
  details: { label: string; value: string }[];
}

/**
 * Service/camp `features` can be a string[], or (for camps) an array holding a
 * structured variant object. Normalise both into plain string chips + readable
 * detail rows so we never render a raw object as a React child.
 */
export function parseFeatures(raw: unknown): FeatureView {
  const chips: string[] = [];
  const details: { label: string; value: string }[] = [];
  const items = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object"
      ? [raw]
      : [];

  const labelMap: Record<string, string> = {
    instructor: "Instructor",
    mode: "Mode",
    what_to_bring: "What to bring",
    variant_name: "Variant",
    subcategory_label: "Category",
    cancellation_policy: "Cancellation policy",
  };

  for (const f of items) {
    if (typeof f === "string") {
      if (f.trim()) chips.push(f.trim());
    } else if (f && typeof f === "object") {
      for (const [key, label] of Object.entries(labelMap)) {
        const v = (f as Record<string, unknown>)[key];
        if (typeof v === "string" && v.trim()) {
          details.push({ label, value: v.trim() });
        }
      }
    }
  }
  return { chips, details };
}

export function initials(name?: string): string {
  if (!name) return "K";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}
