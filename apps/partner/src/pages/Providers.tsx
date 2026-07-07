import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  ProviderHeader,
  ProviderFilters,
  ProviderStats,
  ProviderTable,
  ProviderDetailsModal
} from '../components/providers';
import { getCategories } from '../api/categories';

interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  services: string[];
  status: 'Active' | 'Pending' | 'Under Review' | 'Rejected' | 'Suspended' | 'approved' | 'pending';
  rating: number;
  totalBookings: number;
  revenue: number;
  joinedDate: string;
  city?: string;
  state?: string;
  profile_image_url?: string;
  profileCompletionPercentage?: number;
  profileComplete?: boolean;
  kyc_status?: string;
  created_at?: string;
  first_name?: string;
  last_name?: string;
}

const Providers: React.FC = () => {
  const { user, refreshUser } = useAuth();
  
  // State management
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [showProviderDetails, setShowProviderDetails] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [categories, setCategories] = useState<string[]>(['All Categories']);

  // Fetch providers and categories data
  useEffect(() => {
    fetchProviders();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      const categoryNames = data.map(c => c.name);
      setCategories(['All Categories', ...categoryNames]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback categories if API fails
      setCategories(['All Categories']);
    }
  };

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/partners`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Fetched providers:', data);
        
        // Map the data to match our Provider interface
        const mappedProviders: Provider[] = data.partners?.map((partner: any) => ({
          id: partner.id,
          name: `${partner.first_name || ''} ${partner.last_name || ''}`.trim() || partner.email?.split('@')[0] || 'Partner',
          email: partner.email,
          phone: partner.phone,
          category: partner.service_categories || 'Uncategorized',
          services: partner.specific_services ? partner.specific_services.split(',') : [],
          status: partner.kyc_status === 'verified' ? 'approved' : (partner.kyc_status || 'pending'),
          rating: 4.5, // Default rating
          totalBookings: 0, // Default bookings
          revenue: 0, // Default revenue
          joinedDate: partner.created_at,
          city: partner.city,
          state: partner.state,
          profile_image_url: partner.profile_image_url,
          profileCompletionPercentage: partner.profileCompletionPercentage || 0,
          profileComplete: partner.profileComplete,
          kyc_status: partner.kyc_status,
          created_at: partner.created_at,
          // Add individual name fields for better handling in modal
          first_name: partner.first_name,
          last_name: partner.last_name
        })) || [];

        setProviders(mappedProviders);
      } else {
        console.error('Failed to fetch providers');
        toast.error('Failed to load providers');
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error('Error loading providers');
    } finally {
      setLoading(false);
    }
  };

  // Filter providers based on search and category
  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.phone.includes(searchTerm);
    
    const matchesCategory = categoryFilter === 'All Categories' || 
                           provider.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Calculate statistics
  const stats = {
    totalProviders: providers.length,
    activeProviders: providers.filter(p => p.status === 'Active' || p.status === 'approved').length,
    pendingApprovals: providers.filter(p => p.status === 'Pending' || p.status === 'pending').length,
    totalRevenue: providers.reduce((sum, p) => sum + p.revenue, 0),
    avgRating: providers.length > 0 ? providers.reduce((sum, p) => sum + p.rating, 0) / providers.length : 0
  };

  // Event handlers
  const handleViewProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowProviderDetails(true);
  };

  const handleProviderUpdate = (updatedProvider: Provider) => {
    setProviders(prev => prev.map(p => 
      p.id === updatedProvider.id ? updatedProvider : p
    ));
    setSelectedProvider(updatedProvider);
  };


  const handleExport = () => {
    // Implement export functionality
    toast.success('Export functionality coming soon!');
  };

  const handleImport = () => {
    // Implement import functionality
    toast.success('Import functionality coming soon!');
  };

  const handleDeleteProvider = async (provider: Provider) => {
    if (!confirm(`Are you sure you want to delete ${provider.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/partners/${provider.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setProviders(prev => prev.filter(p => p.id !== provider.id));
        toast.success('Provider deleted successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete provider');
      }
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast.error('Failed to delete provider');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <ProviderHeader />

      {/* Statistics */}
      <ProviderStats stats={stats} />

      {/* Filters */}
      <ProviderFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={categories}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* Provider Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredProviders.length} of {providers.length} providers
        </p>
      </div>

      {/* Providers Table */}
      <ProviderTable
        providers={filteredProviders}
        onViewProvider={handleViewProvider}
        onDeleteProvider={handleDeleteProvider}
        loading={loading}
      />

      {/* Modals */}
      <ProviderDetailsModal
        isOpen={showProviderDetails}
        onClose={() => setShowProviderDetails(false)}
        provider={selectedProvider}
        onProviderUpdate={handleProviderUpdate}
      />
    </div>
  );
};

export default Providers;
