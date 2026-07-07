import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar, Clock, Users, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import CalendarBookingModal from '../modals/CalendarBookingModal';

interface BookingEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    status: 'confirmed' | 'pending' | 'cancelled';
    customerId?: string;
    serviceType?: string;
    occupancy: number;
    maxCapacity: number;
  };
}

interface PartnerBookingCalendarProps {
  view?: 'month' | 'week' | 'day';
  height?: string | number;
  showHeader?: boolean;
  selectable?: boolean;
  onDateSelect?: (selectInfo: any) => void;
  onEventClick?: (clickInfo: any) => void;
}

const PartnerBookingCalendar: React.FC<PartnerBookingCalendarProps> = ({
  view = 'week',
  height = 'auto',
  showHeader = true,
  selectable = false,
  onDateSelect,
  onEventClick
}) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [availabilityData, setAvailabilityData] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    if (user?.id) {
      loadBookingsAndAvailability();
    }
  }, [user?.id]);

  // Add a refresh function that can be called manually
  const refreshBookings = () => {
    if (user?.id) {
      loadBookingsAndAvailability();
    }
  };

  const loadBookingsAndAvailability = async () => {
    try {
      setLoading(true);
      
      // Load availability data from localStorage (since API isn't working)
      const savedAvailability = localStorage.getItem(`availability_${user?.id}`);
      if (savedAvailability) {
        setAvailabilityData(JSON.parse(savedAvailability));
      }

      // Fetch bookings from dedicated calendar endpoint
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/dashboard/partner/calendar-bookings?providerId=${user?.id}`;
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.data) {
            const bookings = data.data.bookings || [];
            
            if (bookings.length > 0) {
              // Transform booking data to calendar events
              const calendarEvents = bookings.map((booking: any) => {
                // Create start and end datetime from booking data
                const startDateTime = new Date(`${booking.booking_date}T${booking.start_time}:00`);
                const endDateTime = new Date(`${booking.booking_date}T${booking.end_time}:00`);

                // Determine capacity based on service type
                const maxCapacity = getServiceCapacity(booking.service_name);
                const occupancy = 1; // Current booking occupancy

                return {
                  id: booking.id,
                  title: `${booking.service_name} - ${booking.customer_name}`,
                  start: startDateTime.toISOString(),
                  end: endDateTime.toISOString(),
                  backgroundColor: getEventColor(booking.status, occupancy, maxCapacity),
                  borderColor: getEventColor(booking.status, occupancy, maxCapacity),
                  extendedProps: {
                    status: booking.status,
                    customerId: booking.parent_id,
                    customerName: booking.customer_name,
                    customerPhone: booking.customer_phone,
                    serviceType: booking.service_name,
                    totalAmount: booking.total_amount,
                    paymentStatus: booking.payment_status,
                    specialRequests: booking.special_requests,
                    occupancy: occupancy,
                    maxCapacity: maxCapacity,
                    bookingData: booking // Store full booking data for modal
                  }
                };
              });

              setEvents(calendarEvents);
            } else {
              // No bookings - show empty calendar
              setEvents([]);
            }
          } else {
            throw new Error('API returned unsuccessful response');
          }
        } else {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (apiError: any) {
        console.error('Failed to load calendar bookings:', apiError);
        setEvents([]);
        
        // Only show error toast for network failures
        if (!apiError?.message?.includes('HTTP')) {
          toast.error('Unable to load calendar data. Please refresh the page.');
        }
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };


  const getServiceCapacity = (serviceName: string) => {
    if (!serviceName) return 10;
    
    const service = serviceName.toLowerCase();
    if (service.includes('party') || service.includes('magic')) return 20;
    if (service.includes('art') || service.includes('craft')) return 12;
    if (service.includes('dance') || service.includes('music')) return 15;
    if (service.includes('care') || service.includes('babysit')) return 3;
    if (service.includes('bloom') || service.includes('education')) return 8;
    
    return 10; // Default capacity
  };

  const getEventColor = (status: string, occupancy: number, maxCapacity: number) => {
    if (status === 'cancelled') return '#ef4444'; // Red
    if (status === 'pending') return '#f59e0b'; // Yellow
    
    // Color based on occupancy
    const occupancyRate = occupancy / maxCapacity;
    if (occupancyRate >= 1) return '#dc2626'; // Full - Red
    if (occupancyRate >= 0.8) return '#ea580c'; // Almost full - Orange
    if (occupancyRate >= 0.5) return '#578f82'; // Half full - Primary green
    return '#10b981'; // Low occupancy - Green
  };

  const handleDateSelect = (selectInfo: any) => {
    const now = new Date();
    
    // Prevent selection in the past
    if (selectInfo.start < now) {
      toast.error('Cannot create bookings in the past');
      return;
    }
    
    // Check if it's within working hours
    if (availabilityData && availabilityData.partnerType === 'solo') {
      const dayOfWeek = selectInfo.start.getDay();
      const workingHour = availabilityData.workingHours?.find((wh: any) => wh.dayOfWeek === dayOfWeek);
      
      if (!workingHour || !workingHour.isAvailable) {
        toast.error('You are not available on this day');
        return;
      }
      
      const selectedHour = selectInfo.start.getHours();
      const startHour = parseInt(workingHour.startTime.split(':')[0]);
      const endHour = parseInt(workingHour.endTime.split(':')[0]);
      
      if (selectedHour < startHour || selectedHour >= endHour) {
        toast.error('Selected time is outside your working hours');
        return;
      }
    }
    
    if (onDateSelect) {
      onDateSelect(selectInfo);
    }
  };

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    
    if (onEventClick) {
      onEventClick(clickInfo);
    } else {
      // Show booking details modal instead of alert
      const bookingDetails = {
        id: event.id,
        title: event.title,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        extendedProps: event.extendedProps
      };
      
      setSelectedBooking(bookingDetails);
      setShowBookingModal(true);
    }
  };

  const getInitialView = () => {
    switch (view) {
      case 'month': return 'dayGridMonth';
      case 'day': return 'timeGridDay';
      default: return 'timeGridWeek';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="mt-6 grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white sm:rounded-lg shadow-sm border border-gray-100 sm:border-gray-200 p-3 sm:p-6 w-full">
      {showHeader && (
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-3 sm:mb-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#578f82]" />
              Booking Calendar
            </h3>
            <button
              onClick={refreshBookings}
              disabled={loading}
              className="flex items-center justify-center space-x-2 px-3 py-1.5 sm:py-1 text-sm bg-[#578f82] text-white rounded-lg sm:rounded-md hover:bg-[#4a7c70] disabled:opacity-50 w-full sm:w-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center space-x-1 sm:space-x-2 w-[45%] sm:w-auto">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded flex-shrink-0"></div>
              <span className="truncate">Available</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 w-[45%] sm:w-auto">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#578f82] rounded flex-shrink-0"></div>
              <span className="truncate">Half Full</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 w-[45%] sm:w-auto">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-orange-500 rounded flex-shrink-0"></div>
              <span className="truncate">Almost Full</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 w-[45%] sm:w-auto">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded flex-shrink-0"></div>
              <span className="truncate">Full/Cancel</span>
            </div>
          </div>
        </div>
      )}

      <div className="calendar-container w-full overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={getInitialView()}
          headerToolbar={showHeader ? {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          } : false}
          height={height}
          events={events}
          selectable={selectable}
          selectMirror={true}
          editable={false}
          select={handleDateSelect}
          eventClick={handleEventClick}
          selectConstraint={{
            start: '06:00',
            end: '22:00'
          }}
          businessHours={availabilityData?.partnerType === 'solo' ? 
            availabilityData.workingHours?.filter((wh: any) => wh.isAvailable).map((wh: any) => ({
              daysOfWeek: [wh.dayOfWeek],
              startTime: wh.startTime,
              endTime: wh.endTime
            })) : {
              daysOfWeek: [1, 2, 3, 4, 5, 6],
              startTime: '09:00',
              endTime: '18:00'
            }
          }
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          slotDuration="00:30:00"
          snapDuration="00:15:00"
          allDaySlot={false}
          nowIndicator={true}
          selectOverlap={false}
          eventOverlap={false}
          selectAllow={(selectInfo) => {
            // Prevent selection in the past
            const now = new Date();
            return selectInfo.start >= now;
          }}
          eventClassNames={(arg) => {
            const props = arg.event.extendedProps;
            const occupancyRate = props.occupancy / props.maxCapacity;
            
            return [
              'cursor-pointer',
              'transition-all',
              'hover:shadow-md',
              occupancyRate >= 1 ? 'opacity-90' : 'opacity-100'
            ];
          }}
          dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }}
          validRange={{
            start: new Date().toISOString().split('T')[0] // Disable past dates
          }}
        />
      </div>

      {/* Booking Details Modal */}
      <CalendarBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        booking={selectedBooking}
      />
    </div>
  );
};

export default PartnerBookingCalendar;
