import type { Service } from "./types";

const R2_BASE =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "https://prodassets.kuddl.co";

/** Normalise an image reference to an absolute URL. */
export function resolveImage(src?: string | null): string | null {
  if (!src) return null;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("data:")) return src;
  return `${R2_BASE}/${src.replace(/^\/+/, "")}`;
}

/** Best primary image for a service/camp card. */
export function serviceImage(s: Service): string | null {
  const candidate =
    s.primary_image_url ||
    s.primaryImage ||
    (Array.isArray(s.image_urls) && s.image_urls[0]) ||
    (Array.isArray(s.images) && s.images[0]) ||
    null;
  return resolveImage(candidate);
}

export function serviceImages(s: Service): string[] {
  const all = [
    ...(Array.isArray(s.image_urls) ? s.image_urls : []),
    ...(Array.isArray(s.images) ? s.images : []),
  ];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of all) {
    const url = resolveImage(raw);
    if (url && !seen.has(url)) {
      seen.add(url);
      out.push(url);
    }
  }
  return out;
}
