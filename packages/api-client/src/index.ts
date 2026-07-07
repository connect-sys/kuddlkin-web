import axios, { type AxiosInstance } from "axios";
import type { Camp, Category, PublicStats, Service } from "@kuddlkin/types";

export interface ApiClientOptions {
  baseURL: string;
  /** localStorage key holding the bearer token. Omit to skip auth injection. */
  tokenKey?: string;
  timeout?: number;
}

/**
 * Shared axios factory. Each app supplies its own env-derived base URL and
 * token storage key so this stays framework-agnostic (Next.js / Vite alike).
 */
export function createApiClient(opts: ApiClientOptions): AxiosInstance {
  const client = axios.create({
    baseURL: opts.baseURL,
    timeout: opts.timeout ?? 15000,
    headers: { "Content-Type": "application/json" },
  });

  if (opts.tokenKey) {
    client.interceptors.request.use((config) => {
      if (typeof window !== "undefined") {
        const token = window.localStorage.getItem(opts.tokenKey!);
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  return client;
}

/* -------------------------------------------------------------------------- */
/*  Public data — shared across customer / partner / admin.                   */
/*  These encode real backend quirks discovered the hard way (see comments)   */
/*  so every app benefits from the fix instead of re-learning it.             */
/* -------------------------------------------------------------------------- */

export interface ServiceFilters {
  category?: string;
  module?: string;
  pincode?: string;
  page?: number;
  limit?: number;
}

export async function getServices(
  client: AxiosInstance,
  filters: ServiceFilters = {}
): Promise<Service[]> {
  const params = new URLSearchParams();
  if (filters.category) params.append("category", filters.category);
  if (filters.pincode) params.append("pincode", filters.pincode);
  params.append("page", String(filters.page ?? 1));
  params.append("limit", String(filters.limit ?? 24));

  try {
    const { data } = await client.get(
      `/api/public/services-all?${params.toString()}`
    );
    let list: Service[] = Array.isArray(data?.data) ? data.data : [];
    // The backend ignores the `module` query param — filter client-side on
    // category_module so module tabs stay meaningful across every app.
    if (filters.module) {
      const m = filters.module.toUpperCase();
      list = list.filter(
        (s) => (s.category_module ?? s.categoryModule)?.toUpperCase() === m
      );
    }
    return list;
  } catch (err) {
    console.error("getServices failed", err);
    return [];
  }
}

export async function getServiceById(
  client: AxiosInstance,
  id: string
): Promise<Service | null> {
  try {
    if (id.startsWith("camp_")) {
      const { data } = await client.get(`/api/camps/${id}`);
      if (data?.camp) return campToService(data.camp);
    }
    const { data } = await client.get(`/api/public/services/${id}`);
    if (data?.success && data?.data) return data.data as Service;
  } catch {
    /* fall through to list lookup */
  }

  // /api/public/services/:id gates on partner verification and 404s for many
  // live services — fall back to the open list endpoint and match by id.
  try {
    const all = await getServices(client, { limit: 200 });
    return all.find((s) => s.id === id) ?? null;
  } catch (err) {
    console.error("getServiceById fallback failed", err);
    return null;
  }
}

export function campToService(c: Camp): Service {
  return {
    id: c.id,
    name: c.title || c.name || "Camp",
    description: c.description,
    category: "cat_discover",
    category_name: c.camp_type?.replace(/_/g, " ") || "Camp",
    category_module: "DISCOVER",
    provider_id: c.provider_id,
    price: c.price,
    price_type: "camp",
    priceType: "camp",
    duration_days: c.duration_days,
    start_date: c.start_date,
    end_date: c.end_date,
    schedule_time: c.schedule_time,
    schedule_start_time: c.schedule_start_time,
    schedule_end_time: c.schedule_end_time,
    schedule_days: c.schedule_days,
    age_group_min: c.age_min,
    age_group_max: c.age_max,
    max_children: c.max_members,
    city: c.city,
    item_type: "camp",
    features: c.features || [],
    images: c.image_urls || [],
    image_urls: c.image_urls || [],
    primary_image_url: c.primary_image_url,
    provider: {
      businessName: c.business_name || c.provider_name || "Camp Provider",
      name: c.provider_name || "Provider",
      average_rating: c.average_rating || 4.6,
      city: c.city,
    },
  };
}

export async function getCategories(client: AxiosInstance): Promise<Category[]> {
  try {
    const { data } = await client.get("/api/categories");
    return (data?.data ?? []) as Category[];
  } catch (err) {
    console.error("getCategories failed", err);
    return [];
  }
}

/** A camp is shown only if it's active and hasn't already ended — never
 * hidden just because it "started" (rolling-enrollment camps always have a
 * past start_date by design). */
export function isCampLive(c: Camp): boolean {
  if (c.status && c.status !== "active") return false;
  if (!c.end_date) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(c.end_date);
  return Number.isNaN(end.getTime()) || end >= today;
}

export async function getCamps(client: AxiosInstance): Promise<Camp[]> {
  try {
    const { data } = await client.get("/api/camps");
    const list = data?.camps ?? data?.data ?? [];
    const camps: Camp[] = Array.isArray(list) ? list : [];
    return camps.filter(isCampLive);
  } catch (err) {
    console.error("getCamps failed", err);
    return [];
  }
}

export async function getPublicStats(client: AxiosInstance): Promise<PublicStats> {
  try {
    const { data } = await client.get("/api/public/stats");
    // API shape: { stats: { activeProviders: { value }, totalServices: {...}, ... } }
    const s = data?.stats ?? {};
    const val = (k: string) => Number(s?.[k]?.value ?? 0);
    return {
      total_providers: val("activeProviders"),
      total_services: val("totalServices") + val("activeCamps"),
      total_bookings: val("totalBookings"),
      total_camps: val("activeCamps"),
    };
  } catch (err) {
    console.error("getPublicStats failed", err);
    return {};
  }
}
