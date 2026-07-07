/**
 * API Utilities
 * Helper functions for API calls with cache busting
 */

/**
 * Add cache busting parameters to URL
 */
export const addCacheBuster = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_t=${Date.now()}&_r=${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create fetch options with no-cache headers
 */
export const createNoCacheOptions = (options: RequestInit = {}): RequestInit => {
  return {
    ...options,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...options.headers,
    },
  };
};
