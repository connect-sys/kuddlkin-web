/**
 * Step 1: Basic Details
 * Service name, description, category, images
 */

import React, { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ServiceFormData, StepValidation } from '../../../types/service-wizard';
import { ServiceType, CATEGORY_META } from '../../../api/serviceTypes';
import { CAMP_TYPES, CAMP_CATEGORY_ID, CAMP_SUBCATEGORY_ID } from '../../../config/archetypes';

interface BasicDetailsStepProps {
  data?: ServiceFormData;
  validation: StepValidation;
  onChange: (data: ServiceFormData) => void;
  providerId: string;
  entityType?: 'service' | 'camp';
}

export const BasicDetailsStep: React.FC<BasicDetailsStepProps> = ({
  data,
  validation,
  onChange,
  providerId,
  entityType = 'service',
}) => {
  const isCamp = entityType === 'camp';
  const [localData, setLocalData] = useState<ServiceFormData>(
    data || {
      name: '',
      description: '',
      category_id: '',
      cover_image_url: '',
      gallery_images: [],
      tags: [],
    }
  );

  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(null);
  const [partnerSubcategories, setPartnerSubcategories] = useState<ServiceType[]>([]);
  const [partnerCategory, setPartnerCategory] = useState('');
  const [partnerLocation, setPartnerLocation] = useState('');
  const [loadingPartnerData, setLoadingPartnerData] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Camp mode: the "subcategory" dropdown lists camp types, not the partner's services.
  useEffect(() => {
    if (!isCamp) return;
    setPartnerSubcategories(
      CAMP_TYPES.map((t) => ({
        id: t.value,
        label: t.label,
        category: 'discover' as const,
      }))
    );
    setPartnerCategory('Discover · Camps & Holiday Programmes');
    setLoadingPartnerData(false);
  }, [isCamp]);

  // Fetch partner's profile data (subcategories, category, location)
  useEffect(() => {
    if (isCamp) return;
    const fetchPartnerData = async () => {
      try {
        setLoadingPartnerData(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/partner/profile?providerId=${providerId}`,
          { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
        );
        if (!response.ok) return;

        const json = await response.json();
        const profile = json.data || json.user || json.provider || json.partner || json;

        // Parse comma-separated specific_services
        let services: string[] = [];
        if (typeof profile.specific_services === 'string') {
          services = profile.specific_services.split(',').map((s: string) => s.trim()).filter(Boolean);
        } else if (Array.isArray(profile.specific_services || profile.specificServices)) {
          services = profile.specific_services || profile.specificServices;
        }

        // Parse comma-separated service_categories
        let cats: string[] = [];
        if (typeof profile.service_categories === 'string') {
          cats = profile.service_categories.split(',').map((s: string) => s.trim()).filter(Boolean);
        } else if (Array.isArray(profile.service_categories || profile.primaryCategories)) {
          cats = profile.service_categories || profile.primaryCategories || [];
        }

        const validCats = ['adventure', 'bloom', 'care', 'discover'];
        const primaryCat = cats.length > 0
          ? (validCats.includes(cats[0].toLowerCase()) ? cats[0].toLowerCase() : 'discover')
          : 'discover';

        const serviceTypes: ServiceType[] = services.map((svc: string, i: number) => ({
          id: `service-${i}`,
          label: svc,
          category: primaryCat as 'adventure' | 'bloom' | 'care' | 'discover',
        }));

        setPartnerSubcategories(serviceTypes);
        setPartnerCategory(cats.join(', '));

        // Build location string
        const loc = [profile.city, profile.state, profile.pincode]
          .filter(Boolean).join(', ');
        setPartnerLocation(loc);
      } catch (error) {
        console.error('Error fetching partner data:', error);
      } finally {
        setLoadingPartnerData(false);
      }
    };
    fetchPartnerData();
  }, [providerId, isCamp]);

  // Restore the selected subcategory from saved data when the list loads
  // (e.g. after navigating back to this step)
  useEffect(() => {
    if (selectedServiceType || partnerSubcategories.length === 0) return;
    // Camp mode keys off camp_type; service mode keys off subcategory_id.
    const savedKey = isCamp ? localData.camp_type : localData.subcategory_id;
    if (savedKey) {
      const match = partnerSubcategories.find((s) => s.id === savedKey);
      if (match) setSelectedServiceType(match);
    }
  }, [partnerSubcategories, localData.subcategory_id, localData.camp_type, isCamp]);

  const handleChange = (field: keyof ServiceFormData, value: any) => {
    const updated = { ...localData, [field]: value };
    setLocalData(updated);
    onChange(updated);
  };

  const uploadOne = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/temp/upload-image`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: fd,
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Image upload failed');
    }
    return data.data?.imageUrl || data.imageUrl;
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'cover' | 'gallery'
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const input = e.target;

    setUploading(true);
    try {
      if (type === 'cover') {
        const url = await uploadOne(files[0]);
        handleChange('cover_image_url', url);
      } else {
        const currentGallery = localData.gallery_images || [];
        const remainingSlots = 8 - currentGallery.length;
        const filesToAdd = Array.from(files).slice(0, Math.min(remainingSlots, 5));
        const urls = await Promise.all(filesToAdd.map(uploadOne));
        handleChange('gallery_images', [...currentGallery, ...urls]);
      }
      toast.success('Image uploaded');
    } catch (err) {
      console.error('Image upload failed:', err);
      toast.error(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploading(false);
      input.value = '';
    }
  };

  const removeGalleryImage = (index: number) => {
    const updated = [...(localData.gallery_images || [])];
    updated.splice(index, 1);
    handleChange('gallery_images', updated);
  };

  const charCount = localData.description.length;
  const minChars = 50;
  const maxChars = 2000;
  const isDescriptionValid = charCount >= minChars && charCount <= maxChars;

  return (
    <div className="space-y-3">

      {/* Subcategory / Camp Type Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {isCamp ? 'Camp Type' : 'Service Subcategory'} <span className="text-red-500">*</span>
        </label>

        {loadingPartnerData ? (
          <div className="flex items-center gap-2 py-2.5 px-3 border border-gray-200 rounded-lg bg-gray-50">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#578F82]"></div>
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        ) : partnerSubcategories.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2.5">
            <p className="text-sm text-yellow-800">No services found in partner profile. Please complete the partner profile first.</p>
          </div>
        ) : (
          <select
            value={selectedServiceType?.id || ''}
            onChange={(e) => {
              const svc = partnerSubcategories.find(s => s.id === e.target.value) || null;
              setSelectedServiceType(svc);
              // Camps always belong to Discover › Camps & Holiday Programmes;
              // the dropdown only picks the camp_type. Services derive their
              // category/subcategory from the chosen partner service.
              const updated: ServiceFormData = isCamp
                ? {
                    ...localData,
                    camp_type: svc ? svc.id : '',
                    category_id: CAMP_CATEGORY_ID,
                    subcategory_id: CAMP_SUBCATEGORY_ID,
                    subcategory_label: 'Camps & Holiday Programmes',
                  }
                : {
                    ...localData,
                    category_id: svc ? svc.category : '',
                    subcategory_id: svc ? svc.id : '',
                    subcategory_label: svc ? svc.label : '',
                  };
              setLocalData(updated);
              onChange(updated);
            }}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578F82] focus:border-transparent bg-white text-sm"
          >
            <option value="">{isCamp ? '-- Select a camp type --' : '-- Select a subcategory --'}</option>
            {partnerSubcategories.map((svc) => (
              <option key={svc.id} value={svc.id}>{svc.label}</option>
            ))}
          </select>
        )}

        {/* Auto-filled info badges */}
        {selectedServiceType && (
          <div className="flex flex-wrap gap-2 mt-2">
            {partnerCategory && (
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                style={{
                  backgroundColor: CATEGORY_META[selectedServiceType.category as keyof typeof CATEGORY_META]?.bg,
                  color: CATEGORY_META[selectedServiceType.category as keyof typeof CATEGORY_META]?.color,
                  borderColor: CATEGORY_META[selectedServiceType.category as keyof typeof CATEGORY_META]?.color,
                }}
              >
                Category: {partnerCategory}
              </span>
            )}
            {partnerLocation && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                📍 {partnerLocation}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Name + Description side by side on wide, stacked on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Service Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={localData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => onChange(localData)}
            placeholder="e.g., Summer Art Camp, Piano Lessons"
            maxLength={80}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578F82] focus:border-transparent text-sm"
          />
          <p className="text-xs text-gray-400 mt-0.5">{localData.name.length}/80</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Tags <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="outdoor, creative, beginner-friendly"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578F82] focus:border-transparent text-sm"
            onBlur={(e) => {
              const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
              handleChange('tags', tags);
            }}
          />
          <p className="text-xs text-gray-400 mt-0.5">Comma-separated</p>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={localData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          onBlur={() => onChange(localData)}
          placeholder="Describe your service — what makes it unique, what participants will learn..."
          rows={3}
          maxLength={2000}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578F82] focus:border-transparent resize-none text-sm"
        />
        <p className={`text-xs mt-0.5 ${isDescriptionValid ? 'text-gray-400' : 'text-red-500'}`}>
          {charCount < minChars ? `${minChars - charCount} more characters needed` : `${charCount}/${maxChars}`}
        </p>
      </div>


      {/* Cover Image + Gallery side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Cover Image */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Cover Image <span className="text-red-500">*</span>
            <span className="text-gray-400 font-normal ml-1">(1200×675px, max 5MB)</span>
          </label>
          {localData.cover_image_url ? (
            <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
              <img src={localData.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
              <button
                onClick={() => handleChange('cover_image_url', '')}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#578F82] transition-colors">
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#578F82] mb-1"></div>
                  <span className="text-xs text-gray-500">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Click to upload</span>
                </>
              )}
              <input type="file" accept="image/*" disabled={uploading} onChange={(e) => handleImageUpload(e, 'cover')} className="hidden" />
            </label>
          )}
        </div>

        {/* Gallery Images */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Gallery <span className="text-gray-400 font-normal">(optional, up to 8)</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(localData.gallery_images || []).map((url, index) => (
              <div key={index} className="relative aspect-square rounded overflow-hidden border border-gray-200">
                <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeGalleryImage(index)}
                  className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
            {(localData.gallery_images?.length || 0) < 8 && (
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-[#578F82] transition-colors flex flex-col items-center justify-center">
                {uploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#578F82]"></div>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-[10px] text-gray-400 mt-0.5">Add</span>
                  </>
                )}
                <input type="file" accept="image/*" multiple disabled={uploading} onChange={(e) => handleImageUpload(e, 'gallery')} className="hidden" />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
