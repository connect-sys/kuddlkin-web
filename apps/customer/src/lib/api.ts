import {
  createApiClient,
  getServices as sharedGetServices,
  getServiceById as sharedGetServiceById,
  getCategories as sharedGetCategories,
  getCamps as sharedGetCamps,
  getPublicStats as sharedGetPublicStats,
  campToService,
  isCampLive,
  type ServiceFilters,
} from "@kuddlkin/api-client";
import type {
  AuthResponse,
  Category,
  Camp,
  Child,
  CustomerBooking,
  PublicStats,
  Service,
} from "@kuddlkin/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.kuddlkin.co";

export const TOKEN_KEY = "customer_token";

export const apiClient = createApiClient({
  baseURL: API_BASE_URL,
  tokenKey: TOKEN_KEY,
});

/* -------------------------------------------------------------------------- */
/*  Public data — delegates to @kuddlkin/api-client (shared with partner/admin) */
/* -------------------------------------------------------------------------- */

export type { ServiceFilters };
export { campToService, isCampLive };

export const getServices = (filters?: ServiceFilters): Promise<Service[]> =>
  sharedGetServices(apiClient, filters);

export const getServiceById = (id: string): Promise<Service | null> =>
  sharedGetServiceById(apiClient, id);

export const getCategories = (): Promise<Category[]> =>
  sharedGetCategories(apiClient);

export const getCamps = (): Promise<Camp[]> => sharedGetCamps(apiClient);

export const getPublicStats = (): Promise<PublicStats> =>
  sharedGetPublicStats(apiClient);

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
