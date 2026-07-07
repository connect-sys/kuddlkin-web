import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Calendar, MapPin, Users, IndianRupee, Tent } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface Camp {
  id: string;
  title: string;
  description: string;
  camp_type: string;
  start_date: string;
  end_date: string;
  price: number;
  total_slots: number;
  enrolled_count: number;
  city: string;
  location: string;
  age_min: number;
  age_max: number;
  status: 'active' | 'inactive' | 'draft';
  primary_image_url?: string;
}

interface AdminPartnerCampsTabProps {
  partnerId: string;
}

const AdminPartnerCampsTab: React.FC<AdminPartnerCampsTabProps> = ({ partnerId }) => {
  const navigate = useNavigate();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCamps();
  }, [partnerId]);

  const fetchCamps = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/partners/${partnerId}/camps`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCamps(data.camps || []);
      } else {
        console.error('Failed to fetch camps, showing empty state');
        setCamps([]);
      }
    } catch (error) {
      console.error('Error fetching camps:', error);
      setCamps([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (camp: Camp) => {
    // Open the wizard in camp edit mode.
    navigate(
      `/camps/create?partnerId=${partnerId}&campId=${camp.id}`,
      { state: { camp } }
    );
  };

  const handleDeleteCamp = async (campId: string, campTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${campTitle}"?`)) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/partners/${partnerId}/camps/${campId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        toast.success('Camp deleted successfully');
        fetchCamps();
      } else {
        toast.error('Failed to delete camp');
      }
    } catch (error) {
      console.error('Error deleting camp:', error);
      toast.error('Error deleting camp');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#578f82]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">Manage camps for this partner</p>
        <Button onClick={() => navigate(`/camps/create?partnerId=${partnerId}`)} className="bg-[#578f82] hover:bg-[#578f82]/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Camp
        </Button>
      </div>

      {/* Camps Grid */}
      {camps.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tent className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-800 mb-1">No camps yet</h3>
          <p className="text-sm text-gray-500 mb-4">This partner hasn't added any camps. You can add one for them.</p>
          <button
            onClick={() => navigate(`/camps/create?partnerId=${partnerId}`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#578f82] text-white text-sm font-medium rounded-lg hover:bg-[#578f82]/90"
          >
            <Plus className="w-4 h-4" /> Add First Camp
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {camps.map((camp) => (
            <div key={camp.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              {camp.primary_image_url && (
                <img
                  src={camp.primary_image_url}
                  alt={camp.title}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
              )}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{camp.title}</h3>
                  <Badge
                    className={`${
                      camp.status === 'active' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {camp.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{camp.description}</p>
                
                <div className="space-y-1 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(camp.start_date)} - {formatDate(camp.end_date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {camp.city}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Ages {camp.age_min}-{camp.age_max} • {camp.enrolled_count}/{camp.total_slots} enrolled
                  </div>
                  <div className="flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    ₹{camp.price?.toLocaleString()}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => navigate(`/manage/camp/${camp.id}`)}
                    className="flex-1 bg-[#578f82] hover:bg-[#578f82]/90 text-white"
                  >
                    Manage Batches
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(camp)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCamp(camp.id, camp.title)}
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
    </div>
  );
};

export default AdminPartnerCampsTab;
