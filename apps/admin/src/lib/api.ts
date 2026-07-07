import { createApiClient } from "@kuddlkin/api-client";
import type { AdminAuthResponse, AdminDashboardStats, Partner } from "@kuddlkin/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.kuddlkin.co";

export const TOKEN_KEY = "kuddl_admin_token";

export const apiClient = createApiClient({
  baseURL: API_BASE_URL,
  tokenKey: TOKEN_KEY,
});

/* -------------------------------------------------------------------------- */
/*  Auth                                                                       */
/* -------------------------------------------------------------------------- */

/** Full admin login — shared /api/auth/login endpoint, admins are checked first. */
export async function adminLogin(
  email: string,
  password: string
): Promise<AdminAuthResponse> {
  const { data } = await apiClient.post("/api/auth/login", { email, password });
  return data;
}

/** Service-worker (staff) login — separate endpoint + JWT payload shape. */
export async function serviceWorkerLogin(
  identifier: string,
  password: string
): Promise<AdminAuthResponse> {
  const { data } = await apiClient.post("/api/service-workers/login", {
    username: identifier,
    phone: identifier,
    email: identifier,
    password,
  });
  return data;
}

/* -------------------------------------------------------------------------- */
/*  Dashboard                                                                  */
/* -------------------------------------------------------------------------- */

export async function getDashboardStats(): Promise<AdminDashboardStats> {
  const { data } = await apiClient.get("/api/admin/dashboard-stats");
  return (data?.data ?? {}) as AdminDashboardStats;
}

export async function getPartners(): Promise<Partner[]> {
  const { data } = await apiClient.get("/api/admin/partners");
  return (data?.data ?? data?.partners ?? []) as Partner[];
}
