import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';

interface ProfileImagePreviewProps {
  file: File | null;
  onError?: () => void;
}

const ProfileImagePreview: React.FC<ProfileImagePreviewProps> = ({ file, onError }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!file) {
      setImageUrl(null);
      setError(false);
      return;
    }

    console.log('ProfileImagePreview: Processing file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      imageUrl: (file as any).imageUrl,
      profilePictureUrl: (file as any).profilePictureUrl,
      isVerified: (file as any).isVerified
    });

    // Check if file has custom image properties (from blink capture)
    const customImageUrl = (file as any).imageUrl || (file as any).profilePictureUrl;
    if (customImageUrl) {
      console.log('Using custom image URL:', customImageUrl);
      setImageUrl(customImageUrl);
      setError(false);
      return;
    }

    // Create blob URL for regular file uploads
    try {
      const blobUrl = URL.createObjectURL(file);
      console.log('Created blob URL:', blobUrl);
      setImageUrl(blobUrl);
      setError(false);

      // Cleanup function
      return () => {
        URL.revokeObjectURL(blobUrl);
      };
    } catch (err) {
      console.error('Error creating blob URL:', err);
      setError(true);
      onError?.();
    }
  }, [file, onError]);

  if (error || !imageUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-100">
        <Camera className="w-8 h-8" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt="Profile"
      className="w-full h-full object-cover"
      onError={() => {
        console.warn('Image failed to load:', imageUrl);
        setError(true);
        onError?.();
      }}
      onLoad={() => {
        console.log('Image loaded successfully:', imageUrl);
      }}
    />
  );
};

export default ProfileImagePreview;
