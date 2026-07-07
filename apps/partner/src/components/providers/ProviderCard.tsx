import React from 'react';
import { Eye, Edit, Trash2, Star, MapPin, Phone, Mail, Calendar } from 'lucide-react';
import { getDisplayImageUrl } from '../../utils/r2Utils';

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
  created_at?: string;
}

interface ProviderCardProps {
  provider: Provider;
  onView: (provider: Provider) => void;
  onEdit?: (provider: Provider) => void;
  onDelete?: (provider: Provider) => void;
  showActions?: boolean;
  compact?: boolean;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onView,
  onEdit,
  onDelete,
  showActions = true,
  compact = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'under review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
        {/* Profile Image */}
        <div className="relative">
          {provider.profile_image_url ? (
            <img
              src={getDisplayImageUrl(provider.profile_image_url)}
              alt={provider.name}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="24" fill="#578f82"/>
                    <circle cx="24" cy="18" r="6" fill="white"/>
                    <path d="M12 36c0-6.6 5.4-12 12-12s12 5.4 12 12" fill="white"/>
                  </svg>
                `)}`
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#578f82] flex items-center justify-center text-white font-semibold">
              {provider.name.charAt(0)}
            </div>
          )}
          
          {/* Completion Badge */}
          {provider.profileCompletionPercentage !== undefined && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center">
              <span className={`text-xs font-bold ${
                provider.profileCompletionPercentage >= 90 ? 'text-green-600' :
                provider.profileCompletionPercentage >= 70 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {provider.profileCompletionPercentage}%
              </span>
            </div>
          )}
        </div>

        {/* Provider Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{provider.name}</h3>
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(provider.status)}`}>
              {provider.status}
            </span>
          </div>
          <p className="text-xs text-gray-600 truncate">{provider.email}</p>
          <p className="text-xs text-gray-500">{provider.category}</p>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onView(provider)}
              className="p-2 text-gray-400 hover:text-[#578f82] rounded-lg hover:bg-gray-100 transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(provider)}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(provider)}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header with Profile */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start space-x-4">
          {/* Profile Image with Progress */}
          <div className="relative">
            <div className="relative w-16 h-16">
              {provider.profileCompletionPercentage !== undefined && (
                <svg className="w-16 h-16 transform -rotate-90 absolute" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={provider.profileCompletionPercentage >= 90 ? '#10b981' :
                           provider.profileCompletionPercentage >= 70 ? '#f59e0b' :
                           '#ef4444'}
                    strokeWidth="3"
                    strokeDasharray={`${provider.profileCompletionPercentage}, 100`}
                    className="transition-all duration-500"
                  />
                </svg>
              )}
              
              {provider.profile_image_url ? (
                <img
                  src={getDisplayImageUrl(provider.profile_image_url)}
                  alt={provider.name}
                  className="w-12 h-12 rounded-full object-cover absolute top-2 left-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="24" cy="24" r="24" fill="#578f82"/>
                        <circle cx="24" cy="18" r="6" fill="white"/>
                        <path d="M12 36c0-6.6 5.4-12 12-12s12 5.4 12 12" fill="white"/>
                      </svg>
                    `)}`
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#578f82] flex items-center justify-center text-white font-semibold absolute top-2 left-2">
                  {provider.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Provider Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                <p className="text-sm text-gray-600">{provider.category}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(provider.status)}`}>
                {provider.status}
              </span>
            </div>

            {/* Contact Info */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                <span className="truncate">{provider.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                <span>{provider.phone}</span>
              </div>
              {(provider.city || provider.state) && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{provider.city}, {provider.state}</span>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span>Joined {formatDate(provider.created_at || provider.joinedDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 bg-gray-50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm font-medium text-gray-900">{provider.totalBookings}</p>
            <p className="text-xs text-gray-600">Bookings</p>
          </div>
          <div>
            <div className="flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="text-sm font-medium text-gray-900">{provider.rating}</span>
            </div>
            <p className="text-xs text-gray-600">Rating</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">₹{provider.revenue.toLocaleString()}</p>
            <p className="text-xs text-gray-600">Revenue</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => onView(provider)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-[#578f82] hover:bg-[#578f82] hover:text-white rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(provider)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderCard;
