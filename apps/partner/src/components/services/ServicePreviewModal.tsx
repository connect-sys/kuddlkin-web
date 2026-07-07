import React from 'react';
import { X, Clock, MapPin, Users, Calendar, Star, CheckCircle } from 'lucide-react';
import { CATEGORY_META, ServiceTypeCategory } from '../../api/serviceTypes';

interface ServicePreviewData {
  name: string;
  description: string;
  category: string;
  serviceType: string;
  price: number;
  pricingUnit: string;
  duration: number;
  deliveryMode: string;
  cancellationPolicy: string;
  images: string[];
  primaryImage?: string;
  ageGroups: string[];
  capacity: { min: number | null; max: number | null };
  whatsIncluded?: string;
  whatToBring?: string;
}

interface Props {
  service: ServicePreviewData;
  onClose: () => void;
}

const PRICING_UNIT_LABELS: Record<string, string> = {
  per_child_per_session: 'per child/session',
  per_session_flat: 'per session',
  per_hour: 'per hour',
  per_group_flat: 'per group',
  package_series: 'per package',
  per_person_per_hour: 'per person/hour'
};

const DELIVERY_MODE_LABELS: Record<string, string> = {
  at_venue: 'At Venue',
  at_home: 'At Home',
  online: 'Online',
  hybrid: 'Hybrid'
};

const ServicePreviewModal: React.FC<Props> = ({ service, onClose }) => {
  const categoryMeta = service.category ? CATEGORY_META[service.category as ServiceTypeCategory] : null;
  const displayImage = service.primaryImage || service.images[0] || '/placeholder-service.jpg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Preview</span>
            <span className="px-2 py-0.5 text-xs font-medium text-amber-700 bg-amber-100 rounded-full">
              How parents will see it
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Hero Image */}
          <div className="relative h-64 bg-gray-100">
            {displayImage && displayImage !== '/placeholder-service.jpg' ? (
              <img
                src={displayImage}
                alt={service.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-sm">No image uploaded yet</span>
              </div>
            )}
            {/* Category Badge */}
            {categoryMeta && (
              <div className="absolute top-4 left-4">
                <span
                  className="px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{ backgroundColor: categoryMeta.bg, color: categoryMeta.color }}
                >
                  Küddl {categoryMeta.label}
                </span>
              </div>
            )}
          </div>

          {/* Image Thumbnails */}
          {service.images.length > 1 && (
            <div className="flex gap-2 px-6 py-3 overflow-x-auto">
              {service.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${service.name} ${i + 1}`}
                  className={`w-16 h-16 rounded-lg object-cover flex-shrink-0 border-2 ${
                    img === displayImage ? 'border-[#578f82]' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Service Info */}
          <div className="px-6 py-5 space-y-5">
            {/* Title & Price */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {service.name || 'Untitled Service'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{service.serviceType}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold text-[#578f82]">
                  ₹{service.price.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {PRICING_UNIT_LABELS[service.pricingUnit] || service.pricingUnit}
                </p>
              </div>
            </div>

            {/* Quick Info Pills */}
            <div className="flex flex-wrap gap-2">
              {service.duration > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                  <Clock size={14} />
                  {service.duration} mins
                </span>
              )}
              {service.deliveryMode && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                  <MapPin size={14} />
                  {DELIVERY_MODE_LABELS[service.deliveryMode] || service.deliveryMode}
                </span>
              )}
              {(service.capacity.min || service.capacity.max) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                  <Users size={14} />
                  {service.capacity.min && service.capacity.max
                    ? `${service.capacity.min}-${service.capacity.max} kids`
                    : service.capacity.max
                    ? `Up to ${service.capacity.max} kids`
                    : `Min ${service.capacity.min} kids`}
                </span>
              )}
            </div>

            {/* Age Groups */}
            {service.ageGroups.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Suitable for</h4>
                <div className="flex flex-wrap gap-2">
                  {service.ageGroups.map((ag) => (
                    <span
                      key={ag}
                      className="px-2.5 py-1 bg-[#578f82]/10 text-[#578f82] rounded-full text-xs font-medium"
                    >
                      {ag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">About this service</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {service.description || 'No description provided yet.'}
              </p>
            </div>

            {/* What's Included */}
            {service.whatsIncluded && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">What's included</h4>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{service.whatsIncluded}</p>
                </div>
              </div>
            )}

            {/* What to Bring */}
            {service.whatToBring && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">What to bring</h4>
                <p className="text-sm text-gray-600">{service.whatToBring}</p>
              </div>
            )}

            {/* Cancellation Policy */}
            {service.cancellationPolicy && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Cancellation Policy</h4>
                <p className="text-sm text-gray-600 capitalize">{service.cancellationPolicy}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-6 py-4 bg-white border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 text-sm font-medium text-white bg-[#578f82] rounded-lg hover:bg-[#4a7c70] transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicePreviewModal;
