import axios from "axios";
import type {
  AuthResponse,
  Camp,
  Category,
  PublicStats,
  Service,
} from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.kuddlkin.co";

export const TOKEN_KEY = "customer_token";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach the customer JWT (browser only).
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* -------------------------------------------------------------------------- */
/*  Services                                                                   */
/* -------------------------------------------------------------------------- */

export interface ServiceFilters {
  category?: string; // category_id
  module?: string; // ADVENTURE | BLOOM | CARE | DISCOVER
  pincode?: string;
  page?: number;
  limit?: number;
}

export async function getServices(
  filters: ServiceFilters = {}
): Promise<Service[]> {
  const params = new URLSearchParams();
  if (filters.category) params.append("category", filters.category);
  if (filters.module) params.append("module", filters.module);
  if (filters.pincode) params.append("pincode", filters.pincode);
  params.append("page", String(filters.page ?? 1));
  params.append("limit", String(filters.limit ?? 24));

  try {
    const { data } = await apiClient.get(
      `/api/public/services-all?${params.toString()}`
    );
    let list: Service[] = Array.isArray(data?.data) ? data.data : [];
    // The backend currently ignores the `module` param, so filter client-side
    // on category_module to keep the module tabs meaningful.
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

export async function getServiceById(id: string): Promise<Service | null> {
  try {
    if (id.startsWith("camp_")) {
      const { data } = await apiClient.get(`/api/camps/${id}`);
      const c: Camp = data.camp;
      return campToService(c);
    }
    const { data } = await apiClient.get(`/api/public/services/${id}`);
    if (data?.success && data?.data) return data.data as Service;
  } catch {
    /* fall through to list lookup */
  }

  // The detail endpoint gates on verification; fall back to the open list
  // endpoint (same data source the catalog uses) and match by id.
  try {
    const all = await getServices({ limit: 200 });
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
    categoryName: c.camp_type?.replace(/_/g, " ") || "Camp",
    categoryModule: "DISCOVER",
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
    provider_id: c.provider_id,
    features: c.features || [],
    images: c.image_urls || [],
    image_urls: c.image_urls || [],
    primary_image_url: c.primary_image_url,
    provider: {
      id: undefined,
      businessName: c.business_name || c.provider_name || "Camp Provider",
      name: c.provider_name || "Provider",
      average_rating: c.average_rating || 4.6,
      city: c.city,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Categories                                                                 */
/* -------------------------------------------------------------------------- */

export async function getCategories(): Promise<Category[]> {
  try {
    const { data } = await apiClient.get("/api/categories");
    return (data?.data ?? []) as Category[];
  } catch (err) {
    console.error("getCategories failed", err);
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/*  Camps                                                                      */
/* -------------------------------------------------------------------------- */

/** A camp is shown only if it's active and hasn't already ended. */
export function isCampLive(c: Camp): boolean {
  if (c.status && c.status !== "active") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (c.end_date) {
    const end = new Date(c.end_date);
    if (!Number.isNaN(end.getTime()) && end < today) return false;
  }
  return true;
}

export async function getCamps(): Promise<Camp[]> {
  try {
    const { data } = await apiClient.get("/api/camps");
    const list = data?.camps ?? data?.data ?? [];
    const camps: Camp[] = Array.isArray(list) ? list : [];
    return camps.filter(isCampLive);
  } catch (err) {
    console.error("getCamps failed", err);
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/*  Public stats                                                               */
/* -------------------------------------------------------------------------- */

export async function getPublicStats(): Promise<PublicStats> {
  try {
    const { data } = await apiClient.get("/api/public/stats");
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

/* -------------------------------------------------------------------------- */
/*  Auth (phone OTP)                                                           */
/* -------------------------------------------------------------------------- */

export async function sendOtp(phoneNumber: string): Promise<{
  success: boolean;
  message?: string;
  expiresIn?: number;
  otp?: string;
}> {
  const { data } = await apiClient.post("/api/otp/send", { phoneNumber });
  return data;
}

export async function verifyOtp(
  phoneNumber: string,
  otp: string
): Promise<AuthResponse> {
  const { data } = await apiClient.post("/api/otp/verify", { phoneNumber, otp });
  return data;
}

export async function googleAuth(payload: {
  googleId: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
}): Promise<AuthResponse> {
  const { data } = await apiClient.post("/api/auth/google", payload);
  return data;
}

/* -------------------------------------------------------------------------- */
/*  Contact                                                                    */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*  Bookings                                                                   */
/* -------------------------------------------------------------------------- */

export interface BookingChild {
  name: string;
  age: number | string;
  gender?: string;
}

export interface CreateBookingPayload {
  serviceId: string;
  providerId: string;
  selectedDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  parentDetails: { fullName: string; email?: string; phone: string };
  children: BookingChild[];
  specialInstructions?: string;
  totalAmount: number;
  paymentStatus?: string;
}

export interface CreateBookingResult {
  success: boolean;
  message?: string;
  bookingId?: string;
  booking?: {
    id?: string;
    booking_id?: string;
    totalAmount?: number;
    total_amount?: number;
    status?: string;
    invoice_id?: string;
    invoice_qr_url?: string;
  };
}

export async function createBooking(
  payload: CreateBookingPayload
): Promise<CreateBookingResult> {
  const { data } = await apiClient.post("/api/bookings", {
    ...payload,
    paymentStatus: payload.paymentStatus ?? "pending",
  });
  return data;
}

export interface BookCampPayload {
  camp_id: string;
  child_id?: string | null;
  child_name: string;
  child_age: number | string;
  selected_start_date: string;
  selected_end_date: string;
  special_requirements?: string;
  payment_status?: string;
}

/** Camps are booked through a dedicated endpoint (auth required). */
export async function bookCamp(
  payload: BookCampPayload
): Promise<CreateBookingResult> {
  const { data } = await apiClient.post("/api/camps/book", {
    ...payload,
    payment_status: payload.payment_status ?? "pending",
  });
  return data;
}

/* -------------------------------------------------------------------------- */
/*  Customer area (auth required)                                              */
/* -------------------------------------------------------------------------- */

export interface CustomerBooking {
  id: string;
  service_id?: string;
  service_name?: string;
  provider_name?: string;
  business_name?: string;
  child_name?: string;
  selected_date?: string;
  start_time?: string;
  end_time?: string;
  total_amount?: number;
  status?: string;
  payment_status?: string;
  created_at?: string;
  primary_image_url?: string;
  invoice_id?: string;
  invoice_qr_url?: string;
  is_camp?: boolean;
  [key: string]: unknown;
}

export interface Child {
  id: string;
  name: string;
  nickname?: string;
  age?: number | string;
  gender?: string;
  date_of_birth?: string;
  allergies?: string;
  special_needs?: string;
  notes?: string;
  profile_picture?: string;
  profilePicture?: string;
  [key: string]: unknown;
}

/** Camp bookings, normalised to the shared CustomerBooking shape. */
async function getCampBookings(): Promise<CustomerBooking[]> {
  try {
    const { data } = await apiClient.get("/api/my-camp-bookings");
    const list = (data?.bookings ?? []) as Record<string, unknown>[];
    return list.map((b) => ({
      id: String(b.id ?? b.booking_id ?? ""),
      service_id: String(b.camp_id ?? ""),
      service_name: String(b.camp_title ?? "Camp"),
      child_name: b.child_name as string | undefined,
      selected_date: (b.selected_start_date ?? b.camp_start) as string,
      start_time: (b.schedule_time ?? b.schedule_start_time) as string,
      total_amount: Number(b.total_amount ?? 0),
      status: String(b.booking_status ?? "confirmed"),
      payment_status: b.payment_status as string | undefined,
      created_at: b.created_at as string,
      primary_image_url: b.primary_image_url as string | undefined,
      invoice_id: b.invoice_id as string | undefined,
      invoice_qr_url: b.invoice_qr_url as string | undefined,
      is_camp: true,
    }));
  } catch (err) {
    console.error("getCampBookings failed", err);
    return [];
  }
}

async function getServiceBookings(): Promise<CustomerBooking[]> {
  try {
    const { data } = await apiClient.get("/api/customer/bookings");
    const list = (data?.bookings ?? data?.data ?? []) as CustomerBooking[];
    return list.map((b) => ({ ...b, is_camp: false }));
  } catch (err) {
    console.error("getServiceBookings failed", err);
    return [];
  }
}

/** All of a customer's bookings — service + camp — newest first. */
export async function getCustomerBookings(): Promise<CustomerBooking[]> {
  const [services, camps] = await Promise.all([
    getServiceBookings(),
    getCampBookings(),
  ]);
  return [...services, ...camps].sort((a, b) =>
    String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""))
  );
}

export async function getCustomerChildren(): Promise<Child[]> {
  try {
    const { data } = await apiClient.get("/api/customer/children");
    return (data?.data ?? data?.children ?? []) as Child[];
  } catch (err) {
    console.error("getCustomerChildren failed", err);
    return [];
  }
}

export interface AddChildPayload {
  name: string;
  nickname?: string;
  gender?: string;
  dateOfBirth?: string;
  age?: number | string;
  allergies?: string;
  specialNeeds?: string;
  notes?: string;
  profilePicture?: string;
}

export async function addCustomerChild(
  payload: AddChildPayload
): Promise<{ success: boolean; message?: string }> {
  // Backend stores DOB; derive a rough one from age when only age is supplied.
  let dateOfBirth = payload.dateOfBirth;
  if (!dateOfBirth && payload.age) {
    const yr = new Date().getFullYear() - Number(payload.age);
    dateOfBirth = `${yr}-01-01`;
  }
  const { data } = await apiClient.post("/api/customer/children", {
    ...payload,
    dateOfBirth,
  });
  return data;
}

export async function submitContact(payload: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<{ success: boolean; message?: string }> {
  const { data } = await apiClient.post("/api/contact/submit", payload);
  return data;
}
