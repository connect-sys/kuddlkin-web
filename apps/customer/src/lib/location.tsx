"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { getPincodes } from "@/lib/api";
import { haversineKm } from "@/lib/geo";

export interface UserLocation {
  label: string;
  lat: number;
  lng: number;
  pincode?: string;
}

interface LocationContextValue {
  location: UserLocation | null;
  setLocation: (l: UserLocation | null) => void;
  clear: () => void;
  detecting: boolean;
  /** Use the browser's GPS to set the location. */
  detect: () => void;
  /** Set the location from a 6-digit pincode; returns false if unknown. */
  setByPincode: (pincode: string) => boolean;
  /** Distance (km) from the saved location to a provider's pincode, or null. */
  distanceKmTo: (pincode?: string) => number | null;
  ready: boolean;
}

const Ctx = createContext<LocationContextValue | null>(null);
const STORAGE_KEY = "kuddl_location";

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLoc] = useState<UserLocation | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [ready, setReady] = useState(false);

  // Rehydrate from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLoc(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const setLocation = useCallback((l: UserLocation | null) => {
    setLoc(l);
    try {
      if (l) localStorage.setItem(STORAGE_KEY, JSON.stringify(l));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const clear = useCallback(() => setLocation(null), [setLocation]);

  // Pincode → coordinates map (fetched once, cached an hour).
  const { data: pincodes } = useQuery({
    queryKey: ["pincodes-geo"],
    queryFn: getPincodes,
    staleTime: 60 * 60 * 1000,
  });
  const coordMap = useMemo(() => {
    const m = new Map<string, { lat: number; lng: number; city?: string }>();
    for (const p of pincodes ?? []) {
      const lat = p.latitude != null ? Number(p.latitude) : NaN;
      const lng = p.longitude != null ? Number(p.longitude) : NaN;
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        m.set(String(p.pincode), { lat, lng, city: p.city });
      }
    }
    return m;
  }, [pincodes]);

  const setByPincode = useCallback(
    (pincode: string) => {
      const c = coordMap.get(String(pincode));
      if (!c) return false;
      setLocation({
        label: c.city ? `${c.city} · ${pincode}` : pincode,
        lat: c.lat,
        lng: c.lng,
        pincode,
      });
      return true;
    },
    [coordMap, setLocation]
  );

  const detect = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Find the nearest known pincode purely for a friendly label.
        let nearest: { pin: string; city?: string; d: number } | undefined;
        for (const [pin, c] of coordMap) {
          const d = haversineKm(latitude, longitude, c.lat, c.lng);
          if (!nearest || d < nearest.d) nearest = { pin, city: c.city, d };
        }
        setLocation({
          label: nearest
            ? `Near ${nearest.city ?? nearest.pin}`
            : "Current location",
          lat: latitude,
          lng: longitude,
          pincode: nearest?.pin,
        });
        setDetecting(false);
      },
      () => setDetecting(false),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, [coordMap, setLocation]);

  const distanceKmTo = useCallback(
    (pincode?: string) => {
      if (!location || !pincode) return null;
      const c = coordMap.get(String(pincode));
      if (!c) return null;
      return haversineKm(location.lat, location.lng, c.lat, c.lng);
    },
    [location, coordMap]
  );

  const value = useMemo(
    () => ({
      location,
      setLocation,
      clear,
      detecting,
      detect,
      setByPincode,
      distanceKmTo,
      ready,
    }),
    [location, setLocation, clear, detecting, detect, setByPincode, distanceKmTo, ready]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocation(): LocationContextValue {
  const c = useContext(Ctx);
  if (!c) throw new Error("useLocation must be used within <LocationProvider>");
  return c;
}
