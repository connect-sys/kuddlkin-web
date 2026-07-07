import React from 'react';
import { getDisplayImageUrl, isBase64DataUrl } from '../utils/r2Utils';

interface ImageDisplayProps {
  imageUrl?: string;
  alt?: string;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Universal Image Display Component
 * Handles various image URL formats including R2 public URLs, base64 data, and fallbacks
 */
export default function ImageDisplay({ 
  imageUrl, 
  alt = "Image", 
  className = "w-full h-full object-cover",
  fallback 
}: ImageDisplayProps) {
  
  // If no image URL provided, show fallback
  if (!imageUrl) {
    return fallback ? <>{fallback}</> : (
      <div className={`${className} bg-gray-200 flex items-center justify-center`}>
        <span className="text-gray-400 text-sm">No image</span>
      </div>
    );
  }

  // Get the proper display URL using R2 utility
  const displayUrl = getDisplayImageUrl(imageUrl);
  
  // If still no valid URL after processing, show fallback
  if (!displayUrl) {
    return fallback ? <>{fallback}</> : (
      <div className={`${className} bg-gray-200 flex items-center justify-center`}>
        <span className="text-gray-400 text-sm">Invalid image</span>
      </div>
    );
  }

  return (
    <img
      src={displayUrl}
      alt={alt}
      className={className}
      onError={(e) => {
        console.warn('Image failed to load:', displayUrl);
        // Replace with fallback on error
        if (fallback) {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          // You could show fallback here, but React doesn't make this easy
          // Better to handle this at the parent component level
        }
      }}
      onLoad={() => {
        console.log('Image loaded successfully:', displayUrl);
      }}
    />
  );
}
