import React, { useState, useRef } from 'react';
import { Upload, X, Camera, Image as ImageIcon, Loader2, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ServiceImageUploadProps {
  serviceId: string;
  existingImages?: string[];
  primaryImage?: string;
  onImagesUpdate: (images: string[], primaryImage?: string) => void;
  maxImages?: number;
  uploadEndpoint?: string;  // override upload URL (e.g. for camps)
}

const ServiceImageUpload: React.FC<ServiceImageUploadProps> = ({
  serviceId,
  existingImages = [],
  primaryImage,
  onImagesUpdate,
  maxImages = 5,
  uploadEndpoint,
}) => {
  // Use existingImages directly from props instead of local state
  const images = existingImages;
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    
    // Check if adding these files would exceed the limit
    if (images.length + fileArray.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate file types and sizes
    const validFiles = fileArray.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

      if (!isValidType) {
        toast.error(`${file.name}: Invalid file type. Only JPEG, PNG, and WebP are allowed.`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name}: File too large. Maximum 5MB allowed.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      uploadImages(validFiles);
    }
  };

  const uploadImages = async (files: File[]) => {
    setUploading(true);
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Please login to upload images');
      setUploading(false);
      return;
    }

    try {
      const uploadPromises = files.map(async (file, index) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('isPrimary', (images.length === 0 && index === 0).toString());

        // Use provided uploadEndpoint > service-specific endpoint > temp endpoint
        const uploadUrl = uploadEndpoint
          ? `${import.meta.env.VITE_API_BASE_URL}${uploadEndpoint}`
          : (serviceId && serviceId.trim() !== '')
            ? `${import.meta.env.VITE_API_BASE_URL}/api/services/${serviceId}/upload-image`
            : `${import.meta.env.VITE_API_BASE_URL}/api/temp/upload-image`;
        
        console.log('📤 Upload URL:', uploadUrl, 'serviceId:', serviceId);

        const response = await fetch(
          uploadUrl,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Upload failed');
        }

        return response.json();
      });

      const results = await Promise.all(uploadPromises);
      console.log('📷 Upload results:', results);
      
      const newImageUrls = results.map(result => {
        const url = result.data?.imageUrl || result.imageUrl;
        console.log('📷 Extracted URL:', url);
        return url;
      }).filter(url => url); // Filter out any undefined/null URLs
      
      console.log('📷 New image URLs:', newImageUrls);
      const updatedImages = [...images, ...newImageUrls];
      console.log('📷 Updated images array:', updatedImages);
      
      // Find the primary image from results
      const newPrimaryImage = results.find(result => result.data?.isPrimary || result.isPrimary)?.data?.imageUrl || 
                              results.find(result => result.data?.isPrimary || result.isPrimary)?.imageUrl || 
                              (updatedImages.length > 0 ? updatedImages[0] : primaryImage);

      console.log('📷 Calling onImagesUpdate with:', { updatedImages, newPrimaryImage });
      onImagesUpdate(updatedImages, newPrimaryImage);
      toast.success(`${files.length} image(s) uploaded successfully!`);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (imageUrl: string) => {
    try {
      // Call backend to delete image from R2
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
      
      const response = await fetch(`${API_BASE_URL}/api/temp/delete-image`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl })
      });

      if (!response.ok) {
        console.warn('Failed to delete image from R2, but continuing with UI removal');
      }
    } catch (error) {
      console.warn('Error deleting image from R2:', error);
      // Continue with UI removal even if R2 deletion fails
    }

    // Remove from UI regardless of R2 deletion result
    const updatedImages = images.filter(img => img !== imageUrl);
    
    // If removing the primary image, set the first remaining image as primary
    const newPrimaryImage = imageUrl === primaryImage 
      ? (updatedImages.length > 0 ? updatedImages[0] : undefined)
      : primaryImage;
    
    onImagesUpdate(updatedImages, newPrimaryImage);
    toast.success('Image removed');
  };

  const setPrimaryImage = (imageUrl: string) => {
    onImagesUpdate(images, imageUrl);
    toast.success('Primary image updated');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Service Images ({images.length}/{maxImages})
        </label>
        <span className="text-xs text-gray-500">
          Max 5MB per image • JPEG, PNG, WebP
        </span>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-[#578f82] bg-[#578f82]/5'
            : 'border-gray-300 hover:border-[#578f82]'
        } ${images.length >= maxImages ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={uploading || images.length >= maxImages}
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-[#578f82] animate-spin mb-2" />
            <p className="text-sm text-gray-600">Uploading images...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Camera className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              Drag and drop images here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[#578f82] hover:text-[#4a7c70] font-medium"
                disabled={images.length >= maxImages}
              >
                browse
              </button>
            </p>
            <p className="text-xs text-gray-500">
              {images.length >= maxImages ? 'Maximum images reached' : `${maxImages - images.length} more images allowed`}
            </p>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div key={imageUrl} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={imageUrl}
                  alt={`Service image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image Controls */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <div className="absolute top-2 right-2 flex gap-2 z-10">
                  {imageUrl !== primaryImage && (
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(imageUrl)}
                      className="p-1.5 bg-white/95 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg border border-gray-200"
                      title="Set as primary image"
                    >
                      <Star className="w-3.5 h-3.5 text-yellow-500" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(imageUrl)}
                    className="p-1.5 bg-red-500 hover:bg-red-600 rounded-full transition-all shadow-lg border border-red-600"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>

              {/* Primary Image Badge */}
              {imageUrl === primaryImage && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No images uploaded yet</p>
          <p className="text-xs">Add images to showcase your service</p>
        </div>
      )}
    </div>
  );
};

export default ServiceImageUpload;
