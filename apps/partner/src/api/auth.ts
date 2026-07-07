import { apiClient } from './client'
import { AuthResponse, User } from '../types'

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/login', { email, password })
    return response.data
  },

  register: async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string
    role: 'provider' | 'customer'
  }): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/register', userData)
    return response.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout')
    localStorage.removeItem('authToken')
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/refresh')
    return response.data
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/api/auth/forgot-password', { email })
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await apiClient.post('/api/auth/reset-password', { token, password })
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/api/auth/profile')
    return response.data
  },

  verifyToken: async (): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/verify')
    return response.data
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/api/auth/change-password', { currentPassword, newPassword })
  },

  // OTP Authentication
  sendOTP: async (phoneNumber: string): Promise<{ success: boolean; message: string; expiresIn?: number; otp?: string }> => {
    const response = await apiClient.post('/api/otp/send', { phoneNumber })
    return response.data
  },

  verifyOTP: async (phoneNumber: string, otp: string): Promise<AuthResponse & { isNewUser?: boolean }> => {
    const response = await apiClient.post('/api/otp/verify-partner', { phoneNumber, otp })
    return response.data
  }
}
