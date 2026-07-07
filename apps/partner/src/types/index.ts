export interface User {
  id: string
  email: string
  phone: string
  first_name: string
  last_name: string
  role: 'provider' | 'customer' | 'admin'
  status: 'active' | 'inactive' | 'suspended'
  email_verified: number
  phone_verified: number
  profile_image_url?: string
  date_of_birth?: string
  gender?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  last_login_at?: string
  created_at: string
  updated_at: string
  name?: string // Computed field
}

export interface Provider {
  id: string
  user_id: string
  business_name?: string
  description?: string
  experience_years: number
  languages?: string[]
  service_area?: string[]
  kyc_status: 'pending' | 'verified' | 'rejected'
  verification_level: number
  verification_documents?: string[]
  average_rating: number
  total_bookings: number
  total_reviews: number
  commission_rate: number
  is_featured: number
  is_active: number
  response_time_minutes: number
  instant_booking_enabled: number
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  provider_id: string
  category_id: string
  category_name?: string
  name: string
  description?: string
  price_type: 'hourly' | 'daily' | 'fixed' | 'package'
  price: number
  duration_minutes?: number
  age_group_min?: number
  age_group_max?: number
  max_children: number
  special_requirements?: string
  cancellation_policy?: string
  images?: string[]
  features?: string[]
  status: 'active' | 'inactive' | 'draft'
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  service_id: string
  customer_id: string
  provider_id: string
  booking_date: string
  start_time: string
  end_time: string
  duration_minutes: number
  number_of_children: number
  children_ages?: number[]
  special_requests?: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rejected'
  total_amount: number
  platform_fee: number
  provider_amount: number
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed'
  payment_id?: string
  refund_amount: number
  cancellation_reason?: string
  cancelled_by?: string
  cancelled_at?: string
  confirmed_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
  customer?: User
  service?: Service
}

export interface Payment {
  id: string
  bookingId: string
  amount: number
  paymentGateway?: string
  transactionId?: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  createdAt: string
}

export interface Review {
  id: string
  bookingId: string
  providerId: string
  customerId: string
  rating: number
  comment?: string
  createdAt: string
  customer?: User
  booking?: Booking
}

export interface AuthResponse {
  user: User
  token: string
  success?: boolean
  message?: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
