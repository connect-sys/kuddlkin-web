import { apiClient } from './client'
import { Booking, PaginatedResponse } from '../types'

export const bookingsApi = {
  getBookings: async (params?: {
    providerId?: string
    status?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Booking>> => {
    const response = await apiClient.get('/api/provider/bookings', { params })
    return response.data
  },

  getBooking: async (id: string): Promise<Booking> => {
    const response = await apiClient.get(`/api/bookings/${id}`)
    return response.data
  },

  updateBooking: async (id: string, bookingData: Partial<Booking>): Promise<Booking> => {
    const response = await apiClient.put(`/api/bookings/${id}`, bookingData)
    return response.data
  },

  confirmBooking: async (id: string): Promise<Booking> => {
    const response = await apiClient.post(`/api/bookings/${id}/confirm`)
    return response.data
  },

  cancelBooking: async (id: string, reason?: string): Promise<Booking> => {
    const response = await apiClient.post(`/api/bookings/${id}/cancel`, { reason })
    return response.data
  },

  completeBooking: async (id: string): Promise<Booking> => {
    const response = await apiClient.post(`/api/bookings/${id}/complete`)
    return response.data
  },

  checkAvailability: async (providerId: string, date: string, duration: number): Promise<boolean> => {
    const response = await apiClient.get('/api/bookings/availability', {
      params: { providerId, date, duration }
    })
    return response.data.available
  }
}
