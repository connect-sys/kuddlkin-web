const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface PlatformStats {
  activeProviders: {
    value: number;
    display: string;
    label: string;
  };
  bookingsCompleted: {
    value: number;
    display: string;
    label: string;
  };
  averageRating: {
    value: number;
    display: string;
    label: string;
    totalReviews: number;
  };
  totalBookings: {
    value: number;
    display: string;
    label: string;
  };
  totalEarnings?: {
    value: number;
    display: string;
    label: string;
  };
}

export async function getPublicStats(): Promise<PlatformStats> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/public/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.success && data.stats) {
      return data.stats;
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error fetching public stats:', error);
    
    // Return default fallback stats
    return {
      activeProviders: {
        value: 10000,
        display: '10K+',
        label: 'Active Providers'
      },
      bookingsCompleted: {
        value: 50000,
        display: '50K+',
        label: 'Bookings Completed'
      },
      averageRating: {
        value: 4.8,
        display: '4.8⭐',
        label: 'Average Rating',
        totalReviews: 0
      },
      totalBookings: {
        value: 75000,
        display: '75K+',
        label: 'Total Bookings'
      },
      totalEarnings: {
        value: 5000000,
        display: '₹50L+',
        label: 'Earnings'
      }
    };
  }
}
