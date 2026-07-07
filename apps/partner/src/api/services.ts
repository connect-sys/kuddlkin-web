import { apiClient } from './client'

export interface Service {
  id: string
  provider_id: string
  category_id: string
  name: string
  description: string
  price_type: 'hourly' | 'daily' | 'fixed' | 'package'
  price: number
  duration_minutes?: number
  age_group_min?: number
  age_group_max?: number
  max_children: number
  special_requirements?: string
  cancellation_policy?: string
  images?: string[]
  features?: string[]
  status: 'active' | 'inactive' | 'draft'
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  icon_url?: string
  parent_id?: string
  sort_order: number
  is_active: number
  created_at: string
}

export const servicesApi = {
  // Get all services
  getServices: async (filters?: {
    category?: string
    provider?: string
    status?: string
    page?: number
    limit?: number
  }): Promise<{ services: Service[], pagination: any }> => {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.provider) params.append('provider', filters.provider)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const response = await apiClient.get(`/api/services?${params.toString()}`)
    return response.data.data
  },

  // Get service by ID
  getServiceById: async (id: string): Promise<Service> => {
    const response = await apiClient.get(`/api/services/${id}`)
    return response.data.data
  },

  // Create new service
  createService: async (serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> => {
    const response = await apiClient.post('/api/services', serviceData)
    console.log("service created",response.data.data)
    return response.data.data
  },

  // Update service
  updateService: async (id: string, serviceData: Partial<Service>): Promise<Service> => {
    const response = await apiClient.put(`/api/services/${id}`, serviceData)
    return response.data.data
  },

  // Delete service
  deleteService: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/services/${id}`)
  },

  // Get categories
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get('/api/categories')
    return response.data.data
  }
}
