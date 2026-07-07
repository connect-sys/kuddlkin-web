import { apiClient } from './client'
import { Provider, Service, ApiResponse, PaginatedResponse } from '../types'

export const providersApi = {
  // Provider management
  createProvider: async (providerData: Partial<Provider>): Promise<Provider> => {
    const response = await apiClient.post('/api/providers', providerData)
    return response.data
  },

  getProvider: async (id: string): Promise<Provider> => {
    const response = await apiClient.get(`/api/providers/${id}`)
    return response.data
  },

  updateProvider: async (id: string, providerData: Partial<Provider>): Promise<Provider> => {
    const response = await apiClient.put(`/api/providers/${id}`, providerData)
    return response.data
  },

  deleteProvider: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/providers/${id}`)
  },

  uploadKYC: async (id: string, file: File): Promise<Provider> => {
    const formData = new FormData()
    formData.append('kycDocument', file)
    const response = await apiClient.post(`/api/providers/${id}/kyc`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Service management
  createService: async (serviceData: Partial<Service>): Promise<Service> => {
    const response = await apiClient.post('/api/providers/services', serviceData)
    return response.data
  },

  getServices: async (providerId?: string): Promise<PaginatedResponse<Service>> => {
    const params = providerId ? { providerId } : {}
    const response = await apiClient.get('/api/providers/services', { params })
    return response.data
  },

  updateService: async (id: string, serviceData: Partial<Service>): Promise<Service> => {
    const response = await apiClient.put(`/api/providers/services/${id}`, serviceData)
    return response.data
  },

  deleteService: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/providers/services/${id}`)
  }
}
