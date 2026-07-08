/** Great-circle distance between two lat/lng points, in kilometres. */
export function haversineKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): number {
  const R = 6371; // Earth radius (km)
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

/** Human-friendly distance label. */
export function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  if (km < 10) return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
}

/** Pull the primary 6-digit pincode from a service or camp object. */
export function itemPincode(item: Record<string, unknown> | null | undefined): string | undefined {
  if (!item) return undefined;
  const is6 = (v: unknown) => typeof v === "string" || typeof v === "number"
    ? /^\d{6}$/.test(String(v))
    : false;

  const provider = item.provider as Record<string, unknown> | undefined;
  const direct = item.pincode ?? provider?.pincode;
  if (is6(direct)) return String(direct);

  const ap = item.available_pincodes;
  if (Array.isArray(ap) && is6(ap[0])) return String(ap[0]);
  if (typeof ap === "string") {
    try {
      const arr = JSON.parse(ap);
      if (Array.isArray(arr) && is6(arr[0])) return String(arr[0]);
    } catch {
      /* not JSON */
    }
    if (is6(ap)) return ap;
  }
  return undefined;
}
