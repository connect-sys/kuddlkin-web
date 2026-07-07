// Shared domain types, modelled on the kuddl-backend public API responses.

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
