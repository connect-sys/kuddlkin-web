import { create } from 'zustand'
import { Provider, Service } from '../types'

interface ProviderState {
  provider: Provider | null
  services: Service[]
  isLoading: boolean
  setProvider: (provider: Provider) => void
  setServices: (services: Service[]) => void
  addService: (service: Service) => void
  updateService: (id: string, service: Partial<Service>) => void
  removeService: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const useProviderStore = create<ProviderState>((set) => ({
  provider: null,
  services: [],
  isLoading: false,
  setProvider: (provider) => set({ provider }),
  setServices: (services) => set({ services }),
  addService: (service) => set((state) => ({ 
    services: [...state.services, service] 
  })),
  updateService: (id, updatedService) => set((state) => ({
    services: state.services.map(service => 
      service.id === id ? { ...service, ...updatedService } : service
    )
  })),
  removeService: (id) => set((state) => ({
    services: state.services.filter(service => service.id !== id)
  })),
  setLoading: (isLoading) => set({ isLoading }),
}))
