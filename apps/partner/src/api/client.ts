import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token and cache busting
apiClient.interceptors.request.use(
  (config) => {
    // Check for token in both possible keys for compatibility
    const token = localStorage.getItem('authToken') || localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Debug logging for KYC requests
    if (config.url?.includes('/kyc/')) {
      console.log('🔧 [API Client] KYC Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        hasToken: !!token,
        headers: config.headers
      });
    }
    
    // Add cache busting headers
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    config.headers['Pragma'] = 'no-cache'
    config.headers['Expires'] = '0'
    
    // Add cache busting parameters for GET requests
    if (config.method?.toLowerCase() === 'get') {
      const separator = config.url?.includes('?') ? '&' : '?'
      config.url = `${config.url}${separator}_t=${Date.now()}&_r=${Math.random().toString(36).substr(2, 9)}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Debug logging for KYC responses
    if (response.config.url?.includes('/kyc/')) {
      console.log('✅ [API Client] KYC Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    // Debug logging for KYC errors
    if (error.config?.url?.includes('/kyc/')) {
      console.error('❌ [API Client] KYC Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        response: error.response?.data
      });
    }
    
    if (error.response?.status === 401) {
      // Remove both possible token keys
      localStorage.removeItem('authToken')
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
