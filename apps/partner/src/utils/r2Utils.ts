/**
 * R2 Storage Utilities
 * Handles public access to R2 stored documents and images
 */

// Get the public R2 URL from environment variables
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

/**
 * Convert R2 internal path to public URL
 * @param filePath - The internal R2 file path (e.g., "partners/email@domain.com/profile_123456.jpg")
 * @returns Public URL to access the file
 */
export function getPublicR2Url(filePath: string): string {
  if (!filePath) return '';
  
  // Remove leading slash if present
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  
  // Construct full public URL
  return `${R2_PUBLIC_URL}/${cleanPath}`;
}

/**
 * Extract file path from various URL formats
 * @param url - Could be a full URL, R2 path, or file key
 * @returns Clean file path for R2 access
 */
export function extractR2Path(url: string): string {
  if (!url) return '';
  
  // If it's already a public R2 URL, extract the path
  if (url.includes('r2.cloudflarestorage.com')) {
    const parts = url.split('/kuddl-storage/');
    return parts[1] || '';
  }
  
  // If it's a backend API URL, extract the file key and decode it
  if (url.includes('/api/documents/view/')) {
    const parts = url.split('/api/documents/view/');
    const encodedPath = parts[1] || '';
    // Decode URL encoding (e.g., %2F becomes /)
    return decodeURIComponent(encodedPath);
  }
  
  // If it's already a path, return as is
  return url;
}

/**
 * Check if a URL is a base64 data URL
 * @param url - URL to check
 * @returns True if it's a base64 data URL
 */
export function isBase64DataUrl(url: string): boolean {
  return url.startsWith('data:image/');
}

/**
 * Get display URL for images - handles various formats
 * @param imageUrl - Original image URL/path
 * @returns URL that can be used in img src
 */
export function getDisplayImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';
  
  // If it's base64 data, use directly
  if (isBase64DataUrl(imageUrl)) {
    return imageUrl;
  }
  
  // If it's already a public R2 URL, use directly
  if (imageUrl.includes('r2.cloudflarestorage.com')) {
    return imageUrl;
  }
  
  // Extract path and convert to public R2 URL (preferred over backend API)
  const filePath = extractR2Path(imageUrl);
  if (filePath) {
    const publicUrl = getPublicR2Url(filePath);
    console.log(' Converting to R2 public URL:', imageUrl, '->', publicUrl);
    return publicUrl;
  }
  
  // Fallback: return original URL if no conversion possible
  return imageUrl;
}

/**
 * Get document download URL
 * @param documentPath - Document path in R2
 * @returns Public download URL
 */
export function getDocumentUrl(documentPath: string): string {
  return getPublicR2Url(documentPath);
}
