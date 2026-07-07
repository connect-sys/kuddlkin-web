import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, IndianRupee, Clock, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface Service {
  id: string;
  name: string;
  description: string;
  category_id: string;
  subcategory_id?: string;
  price_type: 'hourly' | 'fixed' | 'package';
  price: number;
  duration_minutes: number;
  status: 'active' | 'inactive' | 'draft' | 'submitted';
  category_name?: string;
  primary_image_url?: string;
}

interface AdminPartnerServicesTabProps {
  partnerId: string;
  partnerData?: any;
}

const AdminPartnerServicesTab: React.FC<AdminPartnerServicesTabProps> = ({ partnerId }) => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'submitted' | 'active'>('all');
  const [fetchError, setFetchError] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning' as 'warning' | 'danger' | 'success' | 'info'
  });

  useEffect(() => {
    fetchServices();
  }, [partnerId]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setFetchError(false);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/partners/${partnerId}/services`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      } else {
        console.error('Failed to fetch services, showing empty state');
        setServices([]);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = () => {
    // Navigate to new wizard with partner ID
    navigate(`/services/create?partnerId=${partnerId}`);
  };

  const handleEditService = (service: Service) => {
    // Open the same wizard used for creation, in edit mode.
    navigate(`/services/create?partnerId=${partnerId}&serviceId=${service.id}`, {
      state: { service },
    });
  };

  const handleDeleteService = (serviceId: string, serviceName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Service',
      message: `Are you sure you want to delete "${serviceName}"? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/admin/partners/${partnerId}/services/${serviceId}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }
          );

          if (response.ok) {
            toast.success('Service deleted successfully');
            fetchServices();
          } else {
            toast.error('Failed to delete service');
          }
        } catch (error) {
          console.error('Error deleting service:', error);
          toast.error('Error deleting service');
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#578f82]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="active">Active</option>
        </select>
        <Button onClick={handleAddService} className="bg-[#578f82] hover:bg-[#578f82]/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-800 mb-1">No services yet</h3>
          <p className="text-sm text-gray-500 mb-4">This partner hasn't added any services. You can add one for them.</p>
          <button
            onClick={handleAddService}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#578f82] text-white text-sm font-medium rounded-lg hover:bg-[#578f82]/90"
          >
            <Plus className="w-4 h-4" /> Add First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <div key={service.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              {service.primary_image_url && (
                <img
                  src={service.primary_image_url}
                  alt={service.name}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
              )}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{service.name}</h3>
                  <Badge
                    className={`${
                      service.status === 'active' ? 'bg-green-100 text-green-800' :
                      service.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {service.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    ₹{service.price}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {service.duration_minutes}min
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => navigate(`/manage/service/${service.id}`)}
                    className="flex-1 bg-[#578f82] hover:bg-[#578f82]/90 text-white"
                  >
                    Manage Batches
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditService(service)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteService(service.id, service.name)}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog.isOpen && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          onConfirm={confirmDialog.onConfirm}
          onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        />
      )}
    </div>
  );
};

export default AdminPartnerServicesTab;
