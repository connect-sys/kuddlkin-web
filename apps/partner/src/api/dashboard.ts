import { apiClient } from './client'

export interface DashboardStats {
  total_bookings: number
  completed_bookings: number
  pending_bookings: number
  confirmed_bookings: number
  total_earnings: number
}

export interface MonthlyEarning {
  month: string
  earnings: number
  bookings: number
}

export interface RecentBooking {
  id: string
  customer_first_name: string
  customer_last_name: string
  customer_image?: string
  service_name: string
  booking_date: string
  start_time: string
  end_time: string
  status: string
  total_amount: number
  created_at: string
}

export interface DashboardData {
  stats: DashboardStats
  monthlyEarnings: MonthlyEarning[]
  recentBookings: RecentBooking[]
}

export const dashboardApi = {
  // Get provider dashboard stats
  getDashboardStats: async (): Promise<DashboardData> => {
    const response = await apiClient.get('/api/providers/dashboard')
    return response.data.data
  },

  // Get earnings data
  getEarnings: async (period?: 'week' | 'month' | 'year'): Promise<any> => {
    const params = period ? `?period=${period}` : ''
    const response = await apiClient.get(`/api/earnings${params}`)
    return response.data.data
  }
}
