import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Clock, Search, Filter, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { toast } from 'react-hot-toast';

interface Service {
  id: string;
  name: string;
  description: string;
  provider_id: string;
  provider_name?: string;
  provider_email?: string;
  category_id: string;
  category_name?: string;
  service_type_id?: string;
  price: number;
  price_type: string;
  duration_minutes: number;
  status: 'draft' | 'submitted' | 'active' | 'inactive' | 'rejected';
  image_urls?: string[];
  primary_image_url?: string;
  created_at: string;
  updated_at: string;
}

const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'active' | 'rejected'>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/services`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        // Normalize image_urls to always be an array
        const normalizedServices = (data.data || []).map((service: any) => ({
          ...service,
          image_urls: Array.isArray(service.image_urls) 
            ? service.image_urls 
            : (typeof service.image_urls === 'string' && service.image_urls.trim() !== '' 
                ? JSON.parse(service.image_urls) 
                : [])
        }));
        setServices(normalizedServices);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (serviceId: string) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/services/${serviceId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Service approved successfully!');
        fetchServices();
        setShowDetailModal(false);
      } else {
        toast.error(data.message || 'Failed to approve service');
      }
    } catch (error) {
      console.error('Error approving service:', error);
      toast.error('Failed to approve service');
    }
  };

  const handleReject = async (serviceId: string) => {
    const reason = prompt('Enter rejection reason (optional):');
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/services/${serviceId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Service rejected');
        fetchServices();
        setShowDetailModal(false);
      } else {
        toast.error(data.message || 'Failed to reject service');
      }
    } catch (error) {
      console.error('Error rejecting service:', error);
      toast.error('Failed to reject service');
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Service deleted successfully');
        fetchServices();
        setShowDetailModal(false);
      } else {
        toast.error(data.message || 'Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.provider_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      submitted: 'bg-amber-100 text-amber-700',
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-600',
      rejected: 'bg-red-100 text-red-700'
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kuddl-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
          <p className="text-gray-600 mt-1">Review and approve partner services</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'submitted', 'active', 'rejected'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status as typeof statusFilter)}
                className={statusFilter === status ? 'bg-kuddl-orange hover:bg-kuddl-orange/90' : ''}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-amber-50 p-3 rounded-lg">
            <p className="text-sm text-amber-700 font-medium">Pending Review</p>
            <p className="text-2xl font-bold text-amber-900">{services.filter(s => s.status === 'submitted').length}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-700 font-medium">Active</p>
            <p className="text-2xl font-bold text-green-900">{services.filter(s => s.status === 'active').length}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="text-sm text-red-700 font-medium">Rejected</p>
            <p className="text-2xl font-bold text-red-900">{services.filter(s => s.status === 'rejected').length}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700 font-medium">Total</p>
            <p className="text-2xl font-bold text-gray-900">{services.length}</p>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredServices.map((service) => (
              <tr key={service.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {service.primary_image_url && (
                      <img src={service.primary_image_url} alt={service.name} className="w-12 h-12 rounded-lg object-cover mr-3" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-500">{service.category_name || 'Uncategorized'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{service.provider_name || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{service.provider_email || ''}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">₹{service.price}</div>
                  <div className="text-sm text-gray-500">{service.price_type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={getStatusBadge(service.status)}>
                    {service.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(service.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedService(service);
                        setShowDetailModal(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {service.status === 'submitted' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(service.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 border-red-300"
                          onClick={() => handleReject(service.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No services found</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedService && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowDetailModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-3xl w-full p-6 z-10">
              <h2 className="text-2xl font-bold mb-4">{selectedService.name}</h2>
              
              {selectedService.primary_image_url && (
                <img src={selectedService.primary_image_url} alt={selectedService.name} className="w-full h-64 object-cover rounded-lg mb-4" />
              )}
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <label className="font-semibold text-gray-900">Description:</label>
                  <p className="text-gray-700 mt-1">{selectedService.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-gray-900">Price:</label>
                    <p className="text-gray-700">₹{selectedService.price} ({selectedService.price_type})</p>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-900">Duration:</label>
                    <p className="text-gray-700">{selectedService.duration_minutes} minutes</p>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-900">Category:</label>
                    <p className="text-gray-700">{selectedService.category_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-900">Service Type ID:</label>
                    <p className="text-gray-700">{selectedService.service_type_id || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-900">Provider:</label>
                    <p className="text-gray-700">{selectedService.provider_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-900">Provider Email:</label>
                    <p className="text-gray-700 text-sm">{selectedService.provider_email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-900">Status:</label>
                    <Badge className={getStatusBadge(selectedService.status)}>
                      {selectedService.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-900">Service ID:</label>
                    <p className="text-gray-700 text-sm font-mono">{selectedService.id}</p>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-gray-900">Created At:</label>
                  <p className="text-gray-700">{new Date(selectedService.created_at).toLocaleString()}</p>
                </div>

                <div>
                  <label className="font-semibold text-gray-900">Updated At:</label>
                  <p className="text-gray-700">{new Date(selectedService.updated_at).toLocaleString()}</p>
                </div>

                {selectedService.image_urls && Array.isArray(selectedService.image_urls) && selectedService.image_urls.length > 0 && (
                  <div>
                    <label className="font-semibold text-gray-900">All Images:</label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {selectedService.image_urls.map((url, index) => (
                        <img key={index} src={url} alt={`Service ${index + 1}`} className="w-full h-24 object-cover rounded" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-between gap-3">
                <Button 
                  variant="outline" 
                  className="text-red-600 hover:bg-red-50 border-red-300"
                  onClick={() => handleDelete(selectedService.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Service
                </Button>
                
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                    Close
                  </Button>
                  {selectedService.status === 'submitted' && (
                    <>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(selectedService.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 border-red-300"
                        onClick={() => handleReject(selectedService.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
