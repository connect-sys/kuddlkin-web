// Cloudflare R2 Asset Configuration
const CLOUDFLARE_R2_BASE_URL = 'https://assets.kuddl.com'; // Replace with your actual R2 public domain

export const ASSETS = {
  logos: {
    full: `${CLOUDFLARE_R2_BASE_URL}/logos/kuddl-logo-full.svg`,
    icon: `${CLOUDFLARE_R2_BASE_URL}/logos/kuddl-icon.svg`,
  },
  images: {
    placeholder: `${CLOUDFLARE_R2_BASE_URL}/images/placeholder.jpg`,
  }
};

// Fallback to local assets during development
export const LOCAL_ASSETS = {
  logos: {
    full: '/src/assets/images/kuddl-logo-full.svg',
    icon: '/src/assets/images/kuddl-icon.svg',
  }
};

// Use environment variable to determine asset source
export const getAssetUrl = (assetPath: keyof typeof ASSETS.logos) => {
  const useCloudflare = import.meta.env.PROD;
  return useCloudflare ? ASSETS.logos[assetPath] : LOCAL_ASSETS.logos[assetPath];
};
