import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createSessionManager, destroySessionManager, DEFAULT_SESSION_CONFIG } from '../utils/sessionManager';
import { useAuthStore } from '../store/authStore';

interface User {
  id: string;
  email?: string;
  phone: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  full_name?: string;
  role: 'admin' | 'partner' | 'customer' | 'provider' | 'service_worker';
  status?: string;
  phoneVerified?: boolean;
  partnerProfile?: any;
  profileComplete?: boolean;
  kyc_status?: 'pending' | 'verified' | 'rejected' | 'approved';
  profile_picture_url?: string;
  username?: string;
  provider_id?: string;
  permissions?: any[];
}

interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: string;
  businessName?: string;
  businessType?: string;
  city?: string;
  state?: string;
  pincode?: string;
  experience?: string;
  services?: string[];
  availability?: string;
  description?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  isFirstLogin: boolean;
  login: (emailOrUser: string | User, passwordOrToken?: string) => Promise<{ success: boolean; message: string; user?: any }>;
  signup: (userData: SignupData) => Promise<{ success: boolean; message: string; user?: any }>;
  sendOTP: (phoneNumber: string) => Promise<{ success: boolean; message: string; testMode?: boolean }>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<{ success: boolean; message: string; user?: any }>;
  logout: () => void;
  clearFirstLogin: () => void;
  refreshUser: () => Promise<void>;
  setWorkerSession: (workerUser: any, token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  
  // Get Zustand store functions
  const zustandLogout = useAuthStore((state) => state.logout);
  const zustandSetUser = useAuthStore((state) => state.setUser);
  const zustandSetToken = useAuthStore((state) => state.setToken);

  // API base URL - always use environment (absolute) so requests go directly to backend
  const API_BASE_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL);

  useEffect(() => {
    checkAuthStatus();
    
    return () => {
    };
  }, []);
  const checkAuthStatus = async () => {
    try {
      // Check for service worker session first
      const workerToken = localStorage.getItem('worker_token');
      const workerDataRaw = localStorage.getItem('worker_data');
      if (workerToken && workerDataRaw) {
        try {
          const workerData = JSON.parse(workerDataRaw);
          const workerUser = { ...workerData, role: 'service_worker' as const };
          setUser(workerUser);
          setIsAuthenticated(true);
          zustandSetUser(workerUser as any);
          zustandSetToken(workerToken);
          setIsLoading(false);
          return;
        } catch { /* fall through to normal auth */ }
      }

      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!token) {
        setIsLoading(false);
        return;
      }

      // Try to verify the current token
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Map admin role to partner for partner portal
        const mappedUser = {
          ...data.user,
          role: data.user.role === 'admin' ? 'partner' : data.user.role,
          // Admin users don't need profile completion
          profileComplete: data.user.role === 'admin' ? true : (data.user.profileComplete || false),
          // Map name field from either name or first_name/last_name
          name: data.user.name || (data.user.first_name && data.user.last_name ? `${data.user.first_name} ${data.user.last_name}`.trim() : data.user.first_name || 'User')
        };
        
        setUser(mappedUser);
        setIsAuthenticated(true);
      } else if (response.status === 401 && refreshToken) {
        // Token expired, try to refresh
        await refreshAuth();
      } else {
        // Token invalid, clear tokens
        clearAuthData();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        clearAuthData();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        // Get user info with new token
        const verifyResponse = await fetch(`${API_BASE_URL}/api/auth/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`
          }
        });

        if (verifyResponse.ok) {
          const userData = await verifyResponse.json();
          
          // Map admin role to partner for partner portal
          const mappedUser = {
            ...userData.user,
            role: userData.user.role === 'admin' ? 'partner' : userData.user.role,
            // Admin users don't need profile completion
            profileComplete: userData.user.role === 'admin' ? true : (userData.user.profileComplete || false),
            // Map name field from either name or first_name/last_name
            name: userData.user.name || (userData.user.first_name && userData.user.last_name ? `${userData.user.first_name} ${userData.user.last_name}`.trim() : userData.user.first_name || 'User')
          };
          
          setUser(mappedUser);
          setIsAuthenticated(true);
        } else {
          clearAuthData();
        }
      } else {
        clearAuthData();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuthData();
    }
  };

  const login = async (emailOrUser: string | User, passwordOrToken?: string) => {
    try {
      setIsLoading(true);
      
      // Check if this is OTP login (user object + token) or traditional login (email + password)
      if (typeof emailOrUser === 'object' && passwordOrToken) {
        // OTP login - user object and token provided
        const user = emailOrUser;
        const token = passwordOrToken;
        
        localStorage.setItem('token', token);
        localStorage.setItem('authToken', token); // For compatibility
        
        // Sync with Zustand store (cast to compatible type)
        zustandSetUser(user as any);
        zustandSetToken(token);
        
        setUser(user);
        setIsAuthenticated(true);
        setIsFirstLogin(false);
        
        // Initialize session manager
        createSessionManager({
          ...DEFAULT_SESSION_CONFIG,
          onTimeout: logout
        }).start();
        
        // Small delay to ensure state is fully propagated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return { success: true, message: 'Login successful', user };
      } else {
        // Traditional email/password login
        const email = emailOrUser as string;
        const password = passwordOrToken as string;
        
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('refreshToken', data.refreshToken);
          
          // Keep original role - admin users can access partner portal
          const mappedUser = {
            ...data.user,
            // Admin users don't need profile completion
            profileComplete: data.user.role === 'admin' ? true : (data.user.profileComplete || false),
            // Map name field from either name or first_name/last_name
            name: data.user.name || (data.user.first_name && data.user.last_name ? `${data.user.first_name} ${data.user.last_name}`.trim() : data.user.first_name || 'User')
          };
          
          // Sync with Zustand store
          zustandSetUser(mappedUser as any);
          zustandSetToken(data.token);
          
          setUser(mappedUser);
          setIsAuthenticated(true);
          // Don't set isFirstLogin on regular login - only during signup
          setIsFirstLogin(false);
          
          // Initialize session manager
          createSessionManager({
            ...DEFAULT_SESSION_CONFIG,
            onTimeout: logout
          }).start();
          
          // Small delay to ensure state is fully propagated
          await new Promise(resolve => setTimeout(resolve, 100));
          
          return { success: true, message: data.message, user: mappedUser };
        } else {
          // If partner login fails, try service worker login
          try {
            const workerResponse = await fetch(`${API_BASE_URL}/api/service-workers/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: email, phone: email, email: email, password })
            });
            
            const workerData = await workerResponse.json();
            
            if (workerResponse.ok && workerData.success) {
              const workerUser = workerData.worker || workerData.user;
              
              // Store worker token separately
              localStorage.setItem('worker_token', workerData.token);
              localStorage.setItem('worker_data', JSON.stringify(workerUser));
              
              // Return success with service_worker role
              return { 
                success: true, 
                message: 'Service worker login successful', 
                user: { ...workerUser, role: 'service_worker' } 
              };
            }
          } catch (workerError) {
            console.log('Service worker login also failed:', workerError);
          }
          
          return { success: false, message: data.message || 'Login failed' };
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData) => {
    try {
      setIsLoading(true);
      
      // Check if there are selected categories from landing page
      const selectedCategoriesData = localStorage.getItem('selectedCategories');
      let categoryData = null;
      if (selectedCategoriesData) {
        try {
          categoryData = JSON.parse(selectedCategoriesData);
        } catch (error) {
          console.warn('Failed to parse selected categories:', error);
        }
      }
      
      // Include category data in signup request
      const signupPayload = {
        ...userData,
        selectedCategories: categoryData
      };
      
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(signupPayload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        // Clear selected categories from localStorage after successful signup
        localStorage.removeItem('selectedCategories');
        
        // Sync with Zustand store
        zustandSetUser(data.user as any);
        zustandSetToken(data.token);
        
        setUser(data.user);
        setIsAuthenticated(true);
        setIsFirstLogin(true); // Set first login flag for profile completion
        
        return { success: true, message: data.message, user: data.user };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        // Try to notify server about logout (optional - don't fail if route doesn't exist)
        try {
          await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
          });
        } catch (logoutError) {
          console.log('Server logout endpoint not available, proceeding with client-side logout');
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Destroy session manager
      destroySessionManager();
      
      // Clear Zustand store (this will also clear localStorage)
      zustandLogout();

      // Clear worker session too
      localStorage.removeItem('worker_token');
      localStorage.removeItem('worker_data');
      
      // Clear local React state
      setUser(null);
      setIsAuthenticated(false);
      setIsFirstLogin(false);
    }
  };

  const clearAuthData = () => {
    // Clear Zustand store (this will also clear localStorage)
    zustandLogout();
    
    // Clear worker session too
    localStorage.removeItem('worker_token');
    localStorage.removeItem('worker_data');

    // Clear local React state
    setUser(null);
    setIsAuthenticated(false);
    setIsFirstLogin(false);
  };

  const sendOTP = async (phoneNumber: string) => {
    try {
      console.log('🔥 Sending OTP via backend to:', phoneNumber);
      
      const response = await fetch(`${API_BASE_URL}/api/otp/send-partner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        return {
          success: true,
          message: data.message,
          testMode: data.testMode || false
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to send OTP'
        };
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  };

  const verifyOTP = async (phoneNumber: string, otp: string) => {
    try {
      setIsLoading(true);

      console.log('🔥 Verifying OTP via backend:', otp);

      const response = await fetch(`${API_BASE_URL}/api/otp/verify-partner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber, otp })
      });

      const data = await response.json();
      console.log('✅ Backend OTP verification response:', data);

      if (response.ok && data.success) {
        // Store tokens
        localStorage.setItem('token', data.token);
        localStorage.setItem('authToken', data.token); // For compatibility
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }

        // Sync with Zustand store
        zustandSetUser(data.user as any);
        zustandSetToken(data.token);

        // Set user data
        setUser(data.user);
        setIsAuthenticated(true);

        // Check if this is a new user (incomplete profile)
        if (data.isNewUser || !data.user.profileComplete) {
          setIsFirstLogin(true);
        }

        // Save pre-selected categories to DB if user came from landing page selection
        try {
          const storedCats = localStorage.getItem('selectedCategories');
          if (storedCats) {
            const parsed = JSON.parse(storedCats);
            let service_categories = '';
            let specific_services = '';

            if (parsed.source === 'browse') {
              service_categories = (parsed.parentCategories || []).join(',');
              specific_services = (parsed.subcategories || []).join(',');
            } else {
              service_categories = parsed.mainCategory?.title || '';
              specific_services = (parsed.subcategories || []).join(',');
            }

            if (service_categories || specific_services) {
              await fetch(`${API_BASE_URL}/api/partner/profile`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${data.token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ service_categories, specific_services })
              });
            }
          }
        } catch (_) {
          // Non-critical: silently ignore category save errors
        }

        // Clear selected categories from localStorage after successful authentication
        localStorage.removeItem('selectedCategories');

        return { success: true, message: data.message, user: data.user };
      } else {
        return { success: false, message: data.message || 'Authentication failed' };
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Map admin role to partner for partner portal
          const mappedUser = {
            ...data.user,
            role: data.user.role === 'admin' ? 'partner' : data.user.role,
            profileComplete: data.user.role === 'admin' ? true : (data.user.profileComplete || false),
            profile_picture_url: data.user.profile_image_url || data.user.profile_picture_url || null,
            // Map name field from either name or first_name/last_name
            name: data.user.name || (data.user.first_name && data.user.last_name ? `${data.user.first_name} ${data.user.last_name}`.trim() : data.user.first_name || 'User')
          };
        setUser(mappedUser);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const clearFirstLogin = () => {
    setIsFirstLogin(false);
  };

  const setWorkerSession = (workerUser: any, token: string) => {
    const user = { ...workerUser, role: 'service_worker' as const };
    localStorage.setItem('worker_token', token);
    localStorage.setItem('worker_data', JSON.stringify(user));
    setUser(user);
    setIsAuthenticated(true);
    zustandSetUser(user as any);
    zustandSetToken(token);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isFirstLogin,
    login,
    logout,
    signup,
    sendOTP,
    verifyOTP,
    clearFirstLogin,
    refreshUser,
    setWorkerSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
