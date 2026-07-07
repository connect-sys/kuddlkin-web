import React from 'react'
import { Edit, Trash2, MoreVertical, Clock, IndianRupee } from 'lucide-react'
import { Service } from '../../types'

interface ServiceCardProps {
  service: Service
  onEdit: () => void
  onDelete?: () => void
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onEdit, onDelete }) => {
  const getPricingText = () => {
    switch (service.price_type) {
      case 'hourly':
        return `₹${service.price}/hour`
      case 'daily':
        return `₹${service.price}/day`
      case 'fixed':
        return `₹${service.price} fixed`
      case 'package':
        return `₹${service.price}/package`
      default:
        return `₹${service.price}`
    }
  }

  const getDurationText = () => {
    if (!service.duration_minutes) return null
    const hours = Math.floor(service.duration_minutes / 60)
    const minutes = service.duration_minutes % 60
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${minutes}m`
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {service.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{service.category_name || service.category_id}</p>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              service.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {service.status}
            </span>
          </div>
          <div className="relative">
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {service.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {service.description}
          </p>
        )}

        {/* Pricing and Duration */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <IndianRupee className="w-4 h-4 mr-1" />
            <span className="font-medium text-gray-900">{getPricingText()}</span>
          </div>
          {service.duration_minutes && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              <span>{getDurationText()}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ServiceCard
