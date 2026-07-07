import React, { useState, useEffect } from 'react'
import { Clock, User, MapPin } from 'lucide-react'
import { bookingsApi } from '../../api/bookings'
import { Booking } from '../../types'
import { toast } from 'react-hot-toast'

const BookingsList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingsApi.getBookings({ limit: 5 })
        if (response && response.data) {
          setBookings(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch bookings:', error)
        // Fallback to empty list or handle error silently for dashboard widget
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatTime = (timeString: string) => {
    // Assuming timeString is like "14:00" or similar
    return timeString
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recent bookings found.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">
                {booking.customer ? `${booking.customer.first_name} ${booking.customer.last_name}` : 'Guest Customer'}
              </h4>
              <p className="text-sm text-gray-500">{booking.service?.name || 'Service'}</p>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {booking.start_time} • {formatDate(booking.booking_date)}
                </div>
                {booking.customer?.city && (
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    {booking.customer.city}
                  </div>
                )}
              </div>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
            {booking.status}
          </span>
        </div>
      ))}
      
      <div className="text-center pt-4">
        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          View all bookings
        </button>
      </div>
    </div>
  )
}

export default BookingsList
