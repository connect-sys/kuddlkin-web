/**
 * Mobile Detection Utility
 * Detects if user is on mobile device and handles redirects
 */

// Check if device is mobile
export const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Mobile detection regex
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
  
  // Check screen size (mobile typically < 768px)
  const isMobileScreen = window.innerWidth < 768;
  
  // Check user agent or screen size
  return mobileRegex.test(userAgent) || isMobileScreen;
};

// Check if tablet
export const isTablet = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const tabletRegex = /iPad|Android(?!.*Mobile)|Tablet/i;
  return tabletRegex.test(userAgent);
};

// Get current domain
export const getCurrentDomain = (): string => {
  return window.location.hostname;
};

// Check if currently on mobile subdomain
export const isMobileSubdomain = (): boolean => {
  return getCurrentDomain().startsWith('m.');
};

// Handle mobile redirect
export const handleMobileRedirect = (): void => {
  // DISABLED: Mobile subdomain redirect is currently disabled
  // All traffic stays on partner.kuddl.co with responsive design
  // To re-enable, uncomment the code below
  
  /*
  const currentDomain = getCurrentDomain();
  const isMobile = isMobileDevice();
  const onMobileSubdomain = isMobileSubdomain();
  
  // Production domains only
  const desktopDomain = 'partner.kuddl.co';
  const mobileDomain = 'm.kuddl.co';
  
  // Skip redirect for local development
  if (currentDomain.includes('localhost') || currentDomain.includes('127.0.0.1')) {
    return;
  }
  
  // Mobile user on desktop domain -> redirect to mobile
  if (isMobile && currentDomain === desktopDomain) {
    const mobileUrl = window.location.href.replace(desktopDomain, mobileDomain);
    window.location.href = mobileUrl;
    return;
  }
  
  // Desktop user on mobile domain -> redirect to desktop
  if (!isMobile && currentDomain === mobileDomain) {
    const desktopUrl = window.location.href.replace(mobileDomain, desktopDomain);
    window.location.href = desktopUrl;
    return;
  }
  */
};

// Initialize mobile detection
export const initMobileDetection = (): void => {
  // Check on page load
  handleMobileRedirect();
  
  // Check on resize (in case of device rotation or window resize)
  let resizeTimeout: NodeJS.Timeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      handleMobileRedirect();
    }, 250);
  });
};
