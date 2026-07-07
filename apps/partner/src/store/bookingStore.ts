import { create } from 'zustand'
import { Booking } from '../types'

interface BookingState {
  bookings: Booking[]
  selectedBooking: Booking | null
  isLoading: boolean
  filters: {
    status?: string
    dateRange?: { start: string; end: string }
  }
  setBookings: (bookings: Booking[]) => void
  addBooking: (booking: Booking) => void
  updateBooking: (id: string, booking: Partial<Booking>) => void
  setSelectedBooking: (booking: Booking | null) => void
  setFilters: (filters: Partial<BookingState['filters']>) => void
  setLoading: (loading: boolean) => void
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  selectedBooking: null,
  isLoading: false,
  filters: {},
  setBookings: (bookings) => set({ bookings }),
  addBooking: (booking) => set((state) => ({ 
    bookings: [...state.bookings, booking] 
  })),
  updateBooking: (id, updatedBooking) => set((state) => ({
    bookings: state.bookings.map(booking => 
      booking.id === id ? { ...booking, ...updatedBooking } : booking
    )
  })),
  setSelectedBooking: (selectedBooking) => set({ selectedBooking }),
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  setLoading: (isLoading) => set({ isLoading }),
}))
