// Shared domain types, modelled on the kuddl-backend public API responses.
// Consumed by @kuddlkin/customer, @kuddlkin/partner and @kuddlkin/admin.

export interface ServiceProvider {
  id?: string;
  businessName?: string;
  business_name?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  profileImage?: string;
  profile_image_url?: string;
  profile_picture?: string;
  location?: string;
  city?: string;
  state?: string;
  average_rating?: number;
  experience_years?: number;
}

export interface Service {
  id: string;
  provider_id?: string;
  category_id?: string;
  category?: string;
  category_name?: string;
  categoryName?: string;
  category_module?: string;
  categoryModule?: string;
  subcategory?: string;
  subcategory_id?: string;
  name: string;
  description?: string;
  price_type?: "hourly" | "daily" | "fixed" | "package" | "camp";
  priceType?: "hourly" | "daily" | "fixed" | "package" | "camp";
  price: number;
  duration_minutes?: number;
  duration?: number;
  duration_days?: number;
  age_group_min?: number;
  age_group_max?: number;
  max_children?: number;
  special_requirements?: string;
  cancellation_policy?: string;
  images?: string[];
  image_urls?: string[];
  primaryImage?: string;
  primary_image_url?: string;
  features?: string[] | unknown;
  available_pincodes?: string[];
  status?: string;
  city?: string;
  item_type?: string;
  start_date?: string;
  end_date?: string;
  schedule_time?: string;
  schedule_start_time?: string;
  schedule_end_time?: string;
  schedule_days?: string;
  provider?: ServiceProvider;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  module: string;
  icon?: string;
  sort_order?: number;
  is_active?: number;
  service_count?: number;
}

export interface Camp {
  id: string;
  provider_id?: string;
  title?: string;
  name?: string;
  description?: string;
  camp_type?: string;
  price: number;
  price_type?: string;
  duration_days?: number;
  start_date?: string;
  end_date?: string;
  schedule_time?: string;
  schedule_start_time?: string;
  schedule_end_time?: string;
  schedule_days?: string;
  status?: string;
  age_min?: number;
  age_max?: number;
  max_members?: number;
  city?: string;
  provider_name?: string;
  business_name?: string;
  average_rating?: number;
  image_urls?: string[];
  primary_image_url?: string;
  features?: string[];
}

export interface PublicStats {
  total_providers?: number;
  total_services?: number;
  total_bookings?: number;
  total_families?: number;
  happy_families?: number;
  cities?: number;
  [key: string]: number | string | undefined;
}

export interface CustomerUser {
  id: string;
  phone?: string;
  phoneNumber?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  profile_image_url?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: CustomerUser;
  message?: string;
  isNewUser?: boolean;
}

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

/* -------------------------------------------------------------------------- */
/*  Admin / partner / service-worker domain                                   */
/* -------------------------------------------------------------------------- */

export type AdminRole = "admin" | "service_worker";

export interface AdminUser {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  role: "admin";
}

export interface ServiceWorkerPermission {
  permission_type: string;
  resource_id?: string;
  can_view?: number | boolean;
  can_edit?: number | boolean;
  can_delete?: number | boolean;
}

export interface ServiceWorkerUser {
  id: string;
  username?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role: "service_worker";
  provider_id?: string;
  provider_name?: string;
  permissions?: ServiceWorkerPermission[];
}

export interface AdminAuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  refreshToken?: string;
  user?: AdminUser | ServiceWorkerUser;
}

export interface AdminDashboardStats {
  totalPartners?: number;
  activePartners?: number;
  totalServices?: number;
  totalRevenue?: number;
  [key: string]: number | undefined;
}

export interface Partner {
  id: string;
  business_name?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  kyc_status?: string;
  is_active?: number | boolean;
  average_rating?: number;
  created_at?: string;
}
