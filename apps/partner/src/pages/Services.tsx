import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, Search, Filter, Star, Clock, IndianRupee, Users, MapPin, Phone, Mail, Calendar, CheckCircle, XCircle, AlertCircle, Package, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getCategories, ServiceCategory, ServiceSubcategory, ServiceField, getServiceCategoryById, getSubcategoryById } from '../api/categories'
import { ModernCard } from '../components/ui/modern-card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import ServiceImageUpload from '../components/services/ServiceImageUpload'
import AddServiceForm from '../components/services/AddServiceForm'
import { useAuth } from '../contexts/AuthContext'
import { CustomDropdown } from '../components/ui/CustomDropdown'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

interface Service {
  id: string
  name: string
  description: string
  service_type_id?: string
  category_id: string
  subcategory_id?: string
  price_type: 'hourly' | 'fixed' | 'package'
  price: number
  duration_minutes: number
  features: any
  special_requirements: string
  cancellation_policy: string
  status: 'active' | 'inactive' | 'draft' | 'submitted'
  created_at: string
  updated_at: string
  available_pincodes: string
  category_name?: string
  images?: string[]
  image_urls?: string[]
  primary_image_url?: string
  primaryImage?: string
  // Legacy properties for backward compatibility
  title?: string
  pricingModel?: 'hourly' | 'fixed' | 'package'
  duration?: number
  requirements?: string
  cancellationPolicy?: string
  category?: string
}

const Services: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [services, setServices] = useState<Service[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null)
  const [dynamicFormData, setDynamicFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [partnerPincodes, setPartnerPincodes] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'submitted' | 'active'>('all')
  const [currentServiceId, setCurrentServiceId] = useState<string | null>(null)
  const [serviceImages, setServiceImages] = useState<string[]>([])
  const [servicePrimaryImage, setServicePrimaryImage] = useState<string | undefined>()
  const [viewingService, setViewingService] = useState<Service | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [databaseCategories, setDatabaseCategories] = useState<ServiceCategory[]>([])
  const [filteredCategories, setFilteredCategories] = useState<ServiceCategory[]>([])
  const [providerProfile, setProviderProfile] = useState<any>(null)
  // Removed providerId state - backend extracts from JWT token
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning' as 'warning' | 'danger' | 'success' | 'info'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [basicFormData, setBasicFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    pricingModel: 'hourly' as 'hourly' | 'fixed' | 'package',
    price: '',
    duration: '',
    features: '',
    requirements: '',
    cancellationPolicy: '',
    serviceImages: [] as string[]
  })
  const [imagePreview, setImagePreview] = useState<string[]>([])

  useEffect(() => {
    fetchServices()
    fetchDatabaseCategories()
    fetchProviderProfile() // This now loads pincodes internally
  }, [])

  // Filter categories when both database categories and provider profile are loaded
  useEffect(() => {
    if (databaseCategories.length > 0 && providerProfile) {
      filterCategoriesBasedOnProfile(providerProfile)
    }
  }, [databaseCategories, providerProfile])

  // Removed fetchProviderId - backend extracts provider ID from JWT token

  const loadPartnerPincodes = async () => {
    try {
      if (user && (user as any).serviceable_pincodes) {
        const pincodesData = (user as any).serviceable_pincodes;
        let pincodes;
        
        // Handle both CSV string and JSON array formats
        if (typeof pincodesData === 'string') {
          // Try JSON parse first (for legacy data)
          try {
            pincodes = JSON.parse(pincodesData);
          } catch {
            // If JSON parse fails, treat as CSV string
            pincodes = pincodesData.split(',').map((p: string) => p.trim()).filter(Boolean);
          }
        } else {
          pincodes = pincodesData;
        }
        
        setPartnerPincodes(Array.isArray(pincodes) ? pincodes : [pincodes])
        console.log('✅ Loaded partner pincodes:', pincodes)
      } else {
        console.log('⚠️ No serviceable pincodes found in user context')
        setPartnerPincodes([]) // Empty array instead of default
      }
    } catch (error) {
      console.error('❌ Error loading partner pincodes:', error)
      setPartnerPincodes([]) // Empty array instead of default
    }
  }

  const fetchDatabaseCategories = async () => {
    try {
      const categories = await getCategories()
      setDatabaseCategories(categories)
      console.log('✅ Loaded database categories:', categories.length)
    } catch (error) {
      console.error('❌ Error fetching database categories:', error)
      // Fallback to empty array if fetch fails
      setDatabaseCategories([])
    }
  }

  const fetchProviderProfile = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken')
      if (!token) {
        console.log('⚠️ No token found for provider profile')
        return
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/partner/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      
      if (result.success && result.data) {
        setProviderProfile(result.data)
        console.log('✅ Loaded provider profile:', result.data)
        
        // Load serviceable pincodes from profile
        if (result.data.serviceable_pincodes) {
          const pincodesData = result.data.serviceable_pincodes;
          let pincodes;
          
          // Handle both CSV string and JSON array formats
          if (typeof pincodesData === 'string') {
            try {
              pincodes = JSON.parse(pincodesData);
            } catch {
              // If JSON parse fails, treat as CSV string
              pincodes = pincodesData.split(',').map((p: string) => p.trim()).filter(Boolean);
            }
          } else {
            pincodes = pincodesData;
          }
          
          setPartnerPincodes(Array.isArray(pincodes) ? pincodes : [pincodes])
          console.log('✅ Loaded serviceable pincodes from profile:', pincodes)
        }
        
        // Filter categories based on provider's selected categories
        filterCategoriesBasedOnProfile(result.data)
      } else {
        console.log('❌ Failed to load provider profile')
      }
    } catch (error) {
      console.error('❌ Error fetching provider profile:', error)
    }
  }

  const filterCategoriesBasedOnProfile = (profile: any) => {
    if (!profile.service_categories || databaseCategories.length === 0) {
      setFilteredCategories(databaseCategories)
      return
    }

    // Get provider's selected category names
    const providerCategories = profile.service_categories.split(',').map((cat: string) => cat.trim())
    console.log('🔍 Provider selected categories:', providerCategories)

    // Filter database categories to only include those the provider selected
    const filtered = databaseCategories.filter(category => 
      providerCategories.includes(category.name)
    )

    setFilteredCategories(filtered)
    console.log('✅ Filtered categories based on profile:', filtered.length, 'out of', databaseCategories.length)
  }

  // Helper function to get maximum experience from provider profile
  const getMaxExperienceFromProfile = () => {
    if (!providerProfile?.experience_years) return 50 // Default max if no profile data
    
    const experienceYears = parseInt(providerProfile.experience_years.toString())
    return isNaN(experienceYears) ? 50 : Math.max(experienceYears, 1) // At least 1 year, max their experience
  }

  const fetchServices = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken')
      if (!token) {
        setServices([])
        return
      }

      // Fetch only services for the current provider
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/services/my-services`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Raw services data from backend:', data)
        
        if (data.success) {
          const transformedServices: Service[] = data.data.map((service: any) => {
            console.log('🔍 Raw service data:', service)
            console.log('🔍 Processing service:', service.id, {
              primary_image_url: service.primary_image_url,
              image_urls: service.image_urls,
              name: service.name,
              description: service.description,
              price: service.price
            })
            return {
            id: service.id,
            name: service.name,
            title: service.name,
            description: service.description || '',
            service_type_id: service.service_type_id || '',
            category_id: service.category_id,
            subcategory_id: service.subcategory_id,
            category: service.category_name || 'General',
            category_name: service.category_name,
            subcategory: service.subcategory || '',
            price_type: service.price_type as 'hourly' | 'fixed' | 'package',
            pricingModel: service.price_type as 'hourly' | 'fixed' | 'package',
            price: service.price,
            duration_minutes: service.duration_minutes || 60,
            duration: service.duration_minutes || 60,
            features: service.features ? (typeof service.features === 'string' ? JSON.parse(service.features) : service.features) : {},
            special_requirements: service.special_requirements || '',
            requirements: service.special_requirements || '',
            cancellation_policy: service.cancellation_policy || '',
            cancellationPolicy: service.cancellation_policy || '',
            available_pincodes: service.available_pincodes || '[]',
            image_urls: service.image_urls ? (typeof service.image_urls === 'string' ? JSON.parse(service.image_urls) : service.image_urls) : [],
            primary_image_url: service.primary_image_url || null,
            status: service.status as 'active' | 'inactive' | 'draft' | 'submitted',
            created_at: service.created_at,
            updated_at: service.updated_at
          }
          })
          
          setServices(transformedServices)
        } else {
          setServices([])
        }
      } else {
        setServices([])
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    // First try to find in filtered categories, then fall back to database categories
    const category = getServiceCategoryById(filteredCategories, categoryId) || 
                    getServiceCategoryById(databaseCategories, categoryId)
    setSelectedCategory(category || null)
    setSelectedSubcategory(null)
    setDynamicFormData({})
    setBasicFormData(prev => ({ ...prev, category: categoryId, subcategory: '' }))
  }

  const handleSubcategoryChange = (subcategoryId: string) => {
    if (!selectedCategory) return
    
    const subcategory = selectedCategory.subcategories.find(sub => sub.id === subcategoryId)
    setSelectedSubcategory(subcategory || null)
    setDynamicFormData({})
    setBasicFormData(prev => ({ ...prev, subcategory: subcategoryId }))
  }

  const handleDynamicFieldChange = (fieldName: string, value: any) => {
    setDynamicFormData(prev => ({ ...prev, [fieldName]: value }))
  }

  const handleBasicFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setBasicFormData(prev => ({ ...prev, [name]: value }))
  }

  const renderDynamicField = (field: ServiceField) => {
    const value = dynamicFormData[field.name] || ''

    // Apply experience validation for experience-related fields
    const isExperienceField = field.name.toLowerCase().includes('experience') || 
                             field.name.toLowerCase().includes('years') ||
                             field.label.toLowerCase().includes('experience') ||
                             field.label.toLowerCase().includes('years')
    
    const maxExperience = getMaxExperienceFromProfile()

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
              {isExperienceField && providerProfile && (
                <span className="text-xs text-gray-500 ml-2">
                  (Max: {maxExperience} years based on your profile)
                </span>
              )}
            </label>
            <Input
              type={field.type}
              value={value}
              onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              min={field.validation?.min}
              max={isExperienceField ? Math.min(field.validation?.max || maxExperience, maxExperience) : field.validation?.max}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#578f82] focus:border-[#578f82] transition-all duration-200"
            />
          </div>
        )

      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#578f82] focus:border-[#578f82] transition-all duration-200 resize-none"
            />
          </div>
        )

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <CustomDropdown
              value={value}
              onChange={(val) => handleDynamicFieldChange(field.name, val)}
              options={(field.options || []).map(option => ({
                value: option,
                label: option
              }))}
              placeholder={`Select ${field.label}`}
              required={field.required}
            />
          </div>
        )

      case 'multiselect':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
              {field.options?.map(option => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={Array.isArray(value) ? value.includes(option) : false}
                    onChange={(e) => {
                      const currentValue = Array.isArray(value) ? value : []
                      if (e.target.checked) {
                        handleDynamicFieldChange(field.name, [...currentValue, option])
                      } else {
                        handleDynamicFieldChange(field.name, currentValue.filter(v => v !== option))
                      }
                    }}
                    className="rounded-md border-gray-300 text-[#578f82] focus:ring-[#578f82] w-4 h-4 transition-all duration-200"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 'checkbox':
        return (
          <div key={field.name} className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-[#578f82] transition-all duration-200 group">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => handleDynamicFieldChange(field.name, e.target.checked)}
                className="rounded-md border-gray-300 text-[#578f82] focus:ring-[#578f82] w-4 h-4 transition-all duration-200"
              />
              <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </span>
            </label>
          </div>
        )

      default:
        return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if images are still uploading
    if (uploadingImages) {
      toast.error('Please wait for images to finish uploading')
      return
    }
    
    if (!selectedCategory || !selectedSubcategory) {
      toast.error('Please select a category and subcategory')
      return
    }


    setSubmitting(true)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken')
      if (!token) {
        toast.error('Please login to create services')
        return
      }

      // Get provider ID from localStorage auth-storage
      let providerId = null
      try {
        const authStorage = localStorage.getItem('auth-storage')
        if (authStorage) {
          const authData = JSON.parse(authStorage)
          providerId = authData?.state?.user?.id
          console.log('👤 Provider ID from auth-storage:', providerId)
        }
      } catch (error) {
        console.error('❌ Error parsing auth-storage:', error)
      }

      if (!providerId) {
        toast.error('Provider ID not found. Please login again.')
        return
      }

      // Helper function to clean and validate values
      const cleanValue = (value: any) => {
        if (value === null || value === undefined || value === '') return null
        if (Array.isArray(value) && value.length === 0) return null
        if (typeof value === 'string' && value.trim() === '') return null
        return value
      }

      // Helper function to safely parse numbers
      const safeParseNumber = (value: any, defaultValue: number = 0) => {
        if (value === null || value === undefined || value === '') return defaultValue
        const parsed = typeof value === 'string' ? parseFloat(value) : Number(value)
        return isNaN(parsed) ? defaultValue : parsed
      }

      // Debug: Log form data for troubleshooting
      console.log('🔍 Service Creation Debug:', {
        basicFormData,
        dynamicFormData,
        selectedCategory: selectedCategory?.name,
        selectedSubcategory: selectedSubcategory?.name,
        availableFields: selectedSubcategory?.fields?.map(f => ({ name: f.name, label: f.label, required: f.required })) || []
      })

      // Handle pricing based on pricing model and dynamic fields
      let price = 0
      // Tracks whether the partner explicitly entered a price. A value of 0 is
      // valid (free service), so we can't rely on `price > 0` to know one was set.
      let priceProvided = false
      let duration_minutes = safeParseNumber(basicFormData.duration, 60)
      // First, try to get price from basic form data
      if (basicFormData.price && basicFormData.price.trim() !== '') {
        price = safeParseNumber(basicFormData.price)
        priceProvided = true
        console.log('💰 Using basic price:', price)
      }

      // If no basic price was entered, check dynamic form data for pricing fields
      if (!priceProvided) {
        console.log('💰 Basic price invalid, checking dynamic fields...')
        
        // Check dynamic form data for pricing fields - prioritise by pricing model
        if (basicFormData.pricingModel === 'hourly' && dynamicFormData.hourly_rate) {
          price = safeParseNumber(dynamicFormData.hourly_rate)
          console.log('💰 Using hourly rate:', price)
        } else if ((basicFormData.pricingModel === 'package' || basicFormData.pricingModel === 'fixed') && dynamicFormData.package_rate) {
          price = safeParseNumber(dynamicFormData.package_rate)
          console.log('💰 Using package rate:', price)
        } else if (dynamicFormData.daily_rate) {
          price = safeParseNumber(dynamicFormData.daily_rate)
          console.log('💰 Using daily rate:', price)
        } else if (dynamicFormData.monthly_rate) {
          price = safeParseNumber(dynamicFormData.monthly_rate)
          console.log('💰 Using monthly rate:', price)
        } else if (dynamicFormData.nightly_rate) {
          price = safeParseNumber(dynamicFormData.nightly_rate)
          console.log('💰 Using nightly rate:', price)
        } else if (dynamicFormData.session_rate) {
          price = safeParseNumber(dynamicFormData.session_rate)
          console.log('💰 Using session rate:', price)
        } else if (dynamicFormData.hourly_rate) {
          // Fallback to hourly_rate even if pricing model doesn't match
          price = safeParseNumber(dynamicFormData.hourly_rate)
          console.log('💰 Using fallback hourly rate:', price)
        }
      }

      // Final validation. A price of 0 is allowed (free service) as long as one
      // was explicitly entered; only block when nothing was provided.
      if (!priceProvided && price <= 0) {
        console.log('💰 No valid price found anywhere')
        
        // Check if any price field exists in dynamic form data
        const priceFields = ['hourly_rate', 'daily_rate', 'monthly_rate', 'nightly_rate', 'package_rate', 'session_rate']
        const availablePriceFields = priceFields.filter(field => 
          selectedSubcategory?.fields?.some(f => f.name === field && f.required) || false
        )
        
        if (availablePriceFields.length > 0) {
          const missingFields = availablePriceFields.filter(field => 
            !dynamicFormData[field] || safeParseNumber(dynamicFormData[field]) <= 0
          )
          
          if (missingFields.length > 0) {
            const fieldLabels = missingFields.map(field => {
              const fieldDef = selectedSubcategory?.fields?.find(f => f.name === field)
              return fieldDef?.label || field
            })
            toast.error(`Please enter a valid price for: ${fieldLabels.join(', ')}`)
            return
          }
        } else {
          // Check if basic price field is empty
          if (!basicFormData.price || basicFormData.price.trim() === '') {
            toast.error('Please enter a price for your service')
          } else {
            toast.error('Please enter a valid price (must be greater than 0)')
          }
          return
        }
      }

      console.log('💰 Final price used:', price)

      // Build core service data with all required fields
      const coreServiceData: any = {
        name: basicFormData.title.trim(),
        description: basicFormData.description.trim(),
        category_id: selectedCategory.id,
        subcategory_id: basicFormData.subcategory || null,
        provider_id: providerId, // Add provider ID from localStorage
        price_type: basicFormData.pricingModel,
        price: price,
        duration_minutes: duration_minutes
      }

      // Add optional fields only if they have values
      const optionalFields: any = {}
      
      if (cleanValue(basicFormData.requirements)) {
        optionalFields.special_requirements = basicFormData.requirements.trim()
      }
      
      if (cleanValue(basicFormData.cancellationPolicy)) {
        optionalFields.cancellation_policy = basicFormData.cancellationPolicy.trim()
      }

      // Process dynamic form data - only include non-empty values
      const cleanedDynamicData: any = {}
      Object.entries(dynamicFormData).forEach(([key, value]) => {
        const cleanedValue = cleanValue(value)
        if (cleanedValue !== null) {
          // Skip pricing fields as they're handled above
          if (!['hourly_rate', 'package_rate', 'daily_rate', 'monthly_rate', 'nightly_rate'].includes(key)) {
            cleanedDynamicData[key] = cleanedValue
          }
        }
      })

      // Combine features
      const allFeatures: any = {}
      if (cleanValue(basicFormData.features)) {
        allFeatures.basic_features = basicFormData.features.split('\n').filter(f => f.trim())
      }
      
      // Add cleaned dynamic data to features
      Object.assign(allFeatures, cleanedDynamicData)

      // Build final service data with provider_id from auth-storage
      const serviceData = {
        ...coreServiceData,
        ...optionalFields,
        features: Object.keys(allFeatures).length > 0 ? allFeatures : {},
        available_pincodes: partnerPincodes,
        image_urls: basicFormData.serviceImages || [],
        primary_image_url: basicFormData.serviceImages.length > 0 ? basicFormData.serviceImages[0] : null
      }
      
      console.log('🚀 Creating service with data:', {
        providerId: providerId,
        partnerPincodes: partnerPincodes,
        serviceData: serviceData
      })

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/services`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serviceData)
      })

      if (response.ok) {
        const responseData = await response.json()
        const serviceId = responseData.serviceId || responseData.data?.id || responseData.id
        
        // If there are uploaded images, move them to the service folder
        if (serviceId && basicFormData.serviceImages.length > 0) {
          console.log('🔄 Moving temp images to service folder...')
          try {
            const moveResponse = await fetch(
              `${import.meta.env.VITE_API_BASE_URL}/api/services/${serviceId}/move-temp-images`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  tempImageUrls: basicFormData.serviceImages
                })
              }
            )
            
            if (moveResponse.ok) {
              const moveData = await moveResponse.json()
              console.log('✅ Images moved successfully:', moveData.data)
              toast.success('Service created with images successfully!')
            } else {
              console.error('❌ Failed to move images')
              toast.success('Service created successfully, but some images may not be properly organized')
            }
          } catch (error) {
            console.error('❌ Error moving images:', error)
            toast.success('Service created successfully, but some images may not be properly organized')
          }
        } else {
          toast.success('Service created successfully!')
        }
        
        setShowForm(false)
        setSelectedCategory(null)
        setSelectedSubcategory(null)
        setDynamicFormData({})
        setBasicFormData({
          title: '',
          description: '',
          category: '',
          subcategory: '',
          pricingModel: 'hourly' as 'hourly' | 'fixed' | 'package',
          price: '',
          duration: '',
          features: '',
          requirements: '',
          cancellationPolicy: '',
          serviceImages: []
        })
        setImagePreview([])
        setCurrentServiceId(null)
        setServiceImages([])
        setServicePrimaryImage(undefined)
        fetchServices()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to create service')
      }
    } catch (error) {
      console.error('Error creating service:', error)
      toast.error('Failed to create service')
    } finally {
      setSubmitting(false)
    }
  }

  // Image handling functions
  const handleImagesUpdate = (images: string[], primaryImage?: string) => {
    setServiceImages(images)
    setServicePrimaryImage(primaryImage)
  }

  const uploadServiceImages = async (serviceId: string, imageFiles: string[]) => {
    const token = localStorage.getItem('token')
    if (!token || imageFiles.length === 0) return

    try {
      const uploadPromises = imageFiles.map(async (imageDataUrl, index) => {
        // Convert data URL to File object
        const response = await fetch(imageDataUrl)
        const blob = await response.blob()
        const file = new File([blob], `image_${index}.jpg`, { type: 'image/jpeg' })

        const formData = new FormData()
        formData.append('image', file)
        formData.append('isPrimary', (index === 0).toString())

        const uploadResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/services/${serviceId}/upload-image`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          }
        )

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.message || 'Upload failed')
        }

        return uploadResponse.json()
      })

      await Promise.all(uploadPromises)
      toast.success('Images uploaded successfully!')
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error('Some images failed to upload')
    }
  }

  const finishServiceCreation = () => {
    setShowForm(false)
    setSelectedCategory(null)
    setSelectedSubcategory(null)
    setDynamicFormData({})
    setBasicFormData({
      title: '',
      description: '',
      category: '',
      subcategory: '',
      pricingModel: 'hourly' as 'hourly' | 'fixed' | 'package',
      price: '',
      duration: '',
      features: '',
      requirements: '',
      cancellationPolicy: '',
      serviceImages: []
    })
    setImagePreview([])
    setCurrentServiceId(null)
    setServiceImages([])
    setServicePrimaryImage(undefined)
    fetchServices()
    toast.success('Service creation completed!')
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Please login to upload images')
      return
    }

    // Check if we have too many images
    if (imagePreview.length + files.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    const fileArray = Array.from(files)
    
    // Validate files
    const validFiles = fileArray.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)
      const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB

      if (!isValidType) {
        toast.error(`${file.name}: Invalid file type. Only JPEG, PNG, and WebP are allowed.`)
        return false
      }
      if (!isValidSize) {
        toast.error(`${file.name}: File too large. Maximum 5MB allowed.`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    try {
      setUploadingImages(true)
      toast.loading('Uploading images...', { id: 'image-upload' })

      const uploadPromises = validFiles.map(async (file, index) => {
        const formData = new FormData()
        formData.append('image', file)
        formData.append('isPrimary', (imagePreview.length === 0 && index === 0).toString())

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/temp/upload-image`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Upload failed')
        }

        const result = await response.json()
        return {
          url: result.data.imageUrl,
          isPrimary: result.data.isPrimary,
          tempPath: result.data.tempPath
        }
      })

      const uploadResults = await Promise.all(uploadPromises)
      
      // Update previews and form data with uploaded URLs
      const newImageUrls = uploadResults.map(result => result.url)
      setImagePreview(prev => [...prev, ...newImageUrls])
      setBasicFormData(prev => ({
        ...prev,
        serviceImages: [...prev.serviceImages, ...newImageUrls]
      }))

      toast.success(`${validFiles.length} image(s) uploaded successfully!`, { id: 'image-upload' })

    } catch (error) {
      console.error('Image upload error:', error)
      toast.error('Failed to upload some images', { id: 'image-upload' })
    } finally {
      setUploadingImages(false)
    }

    // Clear the input
    event.target.value = ''
  }

  const removeImage = async (index: number) => {
    const imageToRemove = imagePreview[index];
    
    if (imageToRemove) {
      try {
        // Call backend to delete image from R2
        const token = localStorage.getItem('token');
        const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
        
        const response = await fetch(`${API_BASE_URL}/api/temp/delete-image`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ imageUrl: imageToRemove })
        });

        if (!response.ok) {
          console.warn('Failed to delete image from R2, but continuing with UI removal');
        }
      } catch (error) {
        console.warn('Error deleting image from R2:', error);
        // Continue with UI removal even if R2 deletion fails
      }
    }

    // Remove from UI regardless of R2 deletion result
    setImagePreview(prev => prev.filter((_, i) => i !== index))
    setBasicFormData(prev => ({
      ...prev,
      serviceImages: prev.serviceImages.filter((_, i) => i !== index)
    }))
  }

  const handleViewService = (service: Service) => {
    setViewingService(service)
    setCurrentImageIndex(0) // Reset image slider to first image
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    
    // Prepare service images array from the service data
    const existingImages: string[] = []
    if (service.primary_image_url) {
      existingImages.push(service.primary_image_url)
    }
    if (service.image_urls && Array.isArray(service.image_urls)) {
      service.image_urls.forEach(url => {
        if (url && url !== service.primary_image_url) {
          existingImages.push(url)
        }
      })
    }
    
    setBasicFormData({
      title: service.name || service.title || '',
      description: service.description,
      category: service.category_id || service.category || '',
      subcategory: service.subcategory_id || '',
      pricingModel: service.price_type || service.pricingModel || 'hourly',
      price: service.price.toString(),
      duration: (service.duration_minutes || service.duration || 60).toString(),
      features: Array.isArray(service.features) ? service.features.join('\n') : (typeof service.features === 'string' ? service.features : ''),
      requirements: service.special_requirements || service.requirements || '',
      cancellationPolicy: service.cancellation_policy || service.cancellationPolicy || '',
      serviceImages: existingImages
    })
    
    // Set the selected category and subcategory for the form to show all fields
    const categoryId = service.category_id || service.category || ''
    const subcategoryId = service.subcategory_id || ''
    
    // Find and set the selected category
    const foundCategory = getServiceCategoryById(databaseCategories, categoryId)
    if (foundCategory) {
      setSelectedCategory(foundCategory)
      
      // Find and set the selected subcategory
      const foundSubcategory = foundCategory.subcategories.find((sub: ServiceSubcategory) => sub.id === subcategoryId)
      if (foundSubcategory) {
        setSelectedSubcategory(foundSubcategory)
        
        // Populate dynamic form data from service features
        if (service.features) {
          let featuresData = service.features
          // If features is a string, try to parse it as JSON
          if (typeof service.features === 'string') {
            try {
              featuresData = JSON.parse(service.features)
            } catch (e) {
              console.warn('Failed to parse service features as JSON:', e)
              featuresData = {}
            }
          }
          if (typeof featuresData === 'object' && featuresData !== null) {
            setDynamicFormData(featuresData)
          }
        }
      } else {
        // If no specific subcategory, set the first one as default
        const defaultSubcategory = foundCategory.subcategories[0] || null
        setSelectedSubcategory(defaultSubcategory)
        
        // Also update the form data to reflect the default subcategory
        if (defaultSubcategory) {
          setBasicFormData(prev => ({
            ...prev,
            subcategory: defaultSubcategory.id
          }))
          
          // Populate dynamic form data from service features
          if (service.features) {
            let featuresData = service.features
            // If features is a string, try to parse it as JSON
            if (typeof service.features === 'string') {
              try {
                featuresData = JSON.parse(service.features)
              } catch (e) {
                console.warn('Failed to parse service features as JSON:', e)
                featuresData = {}
              }
            }
            if (typeof featuresData === 'object' && featuresData !== null) {
              setDynamicFormData(featuresData)
            }
          }
        }
      }
    }
    
    // Also set the image preview state and form data
    setImagePreview(existingImages)
    
    // Update the form data with existing images
    setBasicFormData(prev => ({
      ...prev,
      serviceImages: existingImages
    }))
    
    setShowForm(true)
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken')
      if (!token) {
        toast.error('Please login to delete services')
        return
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        toast.success('Service deleted successfully!')
        fetchServices() // Refresh the list
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to delete service')
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      toast.error('Failed to delete service')
    }
  }

  const handleSubmitForReview = (serviceId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Submit for Review',
      message: 'Submit this service for review? Once submitted, you cannot edit it until reviewed.',
      type: 'warning',
      onConfirm: async () => {
        setIsSubmitting(true)
        try {
          const token = localStorage.getItem('token') || localStorage.getItem('authToken')
          if (!token) {
            toast.error('Please login to submit services')
            setConfirmDialog(prev => ({ ...prev, isOpen: false }))
            setIsSubmitting(false)
            return
          }

          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/services/${serviceId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'submitted' })
          })

          const result = await response.json()
          
          if (response.ok && result.success) {
            toast.success('Service submitted for review!')
            fetchServices() // Refresh the list
            setConfirmDialog(prev => ({ ...prev, isOpen: false }))
          } else {
            toast.error(result.message || 'Failed to submit service')
          }
        } catch (error) {
          console.error('Error submitting service:', error)
          toast.error('Failed to submit service')
        } finally {
          setIsSubmitting(false)
        }
      }
    })
  }

  // Filter and search functions
  const STATUS_SORT_ORDER: Record<string, number> = { draft: 0, submitted: 1, active: 2, inactive: 3 }
  const filteredServices = services.filter(service => {
    const serviceName = service.name || service.title || ''
    const matchesSearch = serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase())

    // Status filter
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter

    // Improved category matching logic
    if (!categoryFilter) return matchesSearch && matchesStatus

    const serviceCategory = service.category_id || service.category || service.category_name || ''
    const matchesCategory = serviceCategory === categoryFilter ||
                           service.category_name === categoryFilter ||
                           service.category === categoryFilter

    return matchesSearch && matchesCategory && matchesStatus
  }).sort((a, b) => {
    const ao = STATUS_SORT_ORDER[a.status] ?? 99
    const bo = STATUS_SORT_ORDER[b.status] ?? 99
    if (ao !== bo) return ao - bo
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })

  // Create available categories with proper counts
  const availableCategories = filteredCategories.length > 0
    ? filteredCategories.map(cat => {
        const count = services.filter(service => 
          service.category_id === cat.id || 
          service.category === cat.name || 
          service.category_name === cat.name
        ).length
        return { id: cat.id, name: cat.name, count }
      })
    : [...new Set(services.map(service => service.category_name || service.category || service.category_id).filter(Boolean))]
        .map(cat => {
          const count = services.filter(service => 
            service.category_name === cat || 
            service.category === cat || 
            service.category_id === cat
          ).length
          return { id: cat, name: cat, count }
        })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#578f82]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
          <p className="text-gray-600">Manage your service offerings</p>
        </div>
        <Button
          onClick={() => navigate('/services/create')}
          className="bg-[#578f82] hover:bg-[#4a7c70] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 bg-white p-2 rounded-lg shadow">
        {[
          { value: 'all', label: 'All', count: services.length },
          { value: 'draft', label: 'Drafts', count: services.filter(s => s.status === 'draft').length },
          { value: 'submitted', label: 'Pending Review', count: services.filter(s => s.status === 'submitted').length },
          { value: 'active', label: 'Live', count: services.filter(s => s.status === 'active').length }
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value as typeof statusFilter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? 'bg-[#578f82] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label} {tab.count > 0 && <span className="ml-1 opacity-75">({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-10 pr-10 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#578f82] focus:border-[#578f82] bg-white hover:border-gray-300 transition-all duration-200 appearance-none cursor-pointer text-gray-900 font-medium"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23578f82' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundSize: '1rem',
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <option value="" className="text-gray-500">All Categories</option>
            {availableCategories.map((category: any) => (
              <option key={typeof category === 'string' ? category : category.id} value={typeof category === 'string' ? category : category.id} className="text-gray-900 py-2">
                {typeof category === 'string' ? category : `${category.name} (${category.count})`}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-500 flex items-center">
          Showing {filteredServices.length} of {services.length} services
        </div>
      </div>

      {/* Services Table */}
      {filteredServices.length === 0 ? (
        services.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
            <p className="text-gray-500 mb-4">Create your first service to get started</p>
            <Button
              onClick={() => navigate('/services/create')}
              className="bg-[#578f82] hover:bg-[#4a7c70] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Service
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <Button
              onClick={() => {
                setSearchTerm('')
                setCategoryFilter('')
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {service.primary_image_url ? (
                          <img 
                            src={service.primary_image_url} 
                            alt={service.name || service.title}
                            className="w-10 h-10 rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/40?text=No+Image'
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{service.name || service.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary" className="text-xs">
                        {service.category_name || service.category || service.category_id}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{service.price} {(service.price_type || service.pricingModel) === 'hourly' ? '/hour' : (service.price_type || service.pricingModel) === 'fixed' ? '' : '/package'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={service.status === 'active' ? 'default' : 'secondary'}
                        className={
                          service.status === 'active' ? 'bg-green-100 text-green-800' :
                          service.status === 'submitted' ? 'bg-amber-100 text-amber-800' :
                          service.status === 'draft' ? 'bg-teal-100 text-teal-700 border-teal-200' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {service.status === 'submitted' ? 'Pending Review' : 
                         service.status === 'active' ? 'Live' :
                         service.status === 'draft' ? 'Draft' : service.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {service.status === 'draft' && (
                          <Button 
                            variant="default" 
                            size="sm"
                            className="bg-[#578f82] hover:bg-[#4a7c70] text-white"
                            onClick={() => handleSubmitForReview(service.id)}
                            title="Submit for Review"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Submit
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewService(service)}
                          title="View Service"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/manage/service/${service.id}`)}
                          title="Manage batches"
                          className="bg-[#578f82] hover:bg-[#578f82]/90 text-white"
                        >
                          Manage Batches
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/services/create?serviceId=${service.id}`, { state: { service } })}
                          title="Edit Service"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteService(service.id)}
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300 min-h-[36rem]">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-[#578f82] to-[#4a7c70] px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {editingService ? 'Edit Service' : 'Add New Service'}
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    {editingService ? 'Update your service details' : 'Fill in the details to create your service'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                  className="text-white hover:bg-white/20 rounded-full h-10 w-10 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-100px)] h-[100vh]">

              <AddServiceForm
                initialData={editingService}
                partnerProfile={{
                  serviceTypeIds: (providerProfile?.service_types || '')
                    .split(',')
                    .map((s: string) => s.trim())
                    .filter(Boolean),
                  ageGroups: (providerProfile?.age_groups || '')
                    .split(',')
                    .map((s: string) => s.trim())
                    .filter(Boolean)
                }}
                partnerPincodes={partnerPincodes}
                onClose={() => {
                  setShowForm(false);
                  setEditingService(null);
                }}
                onCreated={() => {
                  setShowForm(false);
                  setEditingService(null);
                  fetchServices();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* View Service Modal */}
      {viewingService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-[#578f82] to-[#4a7c70] px-4 sm:px-8 py-4 sm:py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg flex-shrink-0">
                    <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-2xl font-bold text-white truncate">Service Details</h2>
                    <p className="text-white/80 text-xs sm:text-sm mt-0.5 truncate">{viewingService.name || viewingService.title}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingService(null)}
                  className="text-white hover:bg-white/20 rounded-full h-10 w-10 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* Service Images Gallery - Slider */}
                {(viewingService.primary_image_url || (viewingService.image_urls && viewingService.image_urls.length > 0)) && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-sm">
                        <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[#578f82]" />
                      </div>
                      <label className="text-xs sm:text-sm font-semibold text-gray-900">Service Images</label>
                    </div>
                    
                    {(() => {
                      // Collect all images
                      const allImages = []
                      if (viewingService.primary_image_url) {
                        allImages.push(viewingService.primary_image_url)
                      }
                      if (viewingService.image_urls && Array.isArray(viewingService.image_urls)) {
                        viewingService.image_urls.forEach(url => {
                          if (url && url !== viewingService.primary_image_url) {
                            allImages.push(url)
                          }
                        })
                      }
                      
                      return (
                        <div className="relative">
                          {/* Main Image Display */}
                          <div className="relative aspect-video bg-white rounded-lg overflow-hidden shadow-sm">
                            <img
                              src={allImages[currentImageIndex]}
                              alt={`Service image ${currentImageIndex + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/api/placeholder/400/300'
                              }}
                            />
                            
                            {/* Navigation Arrows */}
                            {allImages.length > 1 && (
                              <>
                                <button
                                  onClick={() => setCurrentImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1)}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setCurrentImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            
                            {/* Image Counter */}
                            {allImages.length > 1 && (
                              <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                                {currentImageIndex + 1} / {allImages.length}
                              </div>
                            )}
                          </div>
                          
                          {/* Thumbnail Navigation */}
                          {allImages.length > 1 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                              {allImages.map((image, index) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentImageIndex(index)}
                                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                                    index === currentImageIndex 
                                      ? 'border-[#578f82]' 
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <img
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = '/api/placeholder/64/64'
                                    }}
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* Description Card */}
                <div className="bg-gray-50 rounded-xl p-3 sm:p-5 border border-gray-200">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-gray-100 rounded-lg mt-0.5 flex-shrink-0">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Description</label>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{viewingService.description}</p>
                    </div>
                  </div>
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {/* Category Card */}
                  <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-[#578f82]" />
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Category</label>
                    </div>
                    <Badge variant="secondary" className="bg-[#578f82]/10 text-[#578f82] border-[#578f82]/20">
                      {viewingService.category_name || viewingService.category || viewingService.category_id}
                    </Badge>
                  </div>

                  {/* Status Card */}
                  <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className={`w-4 h-4 ${
                        viewingService.status === 'active' ? 'text-green-600' : 'text-gray-600'
                      }`} />
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Status</label>
                    </div>
                    <Badge 
                      variant={viewingService.status === 'active' ? 'default' : 'secondary'}
                      className={
                        viewingService.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                        viewingService.status === 'submitted' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        viewingService.status === 'draft' ? 'bg-teal-100 text-teal-700 border-teal-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }
                    >
                      {viewingService.status === 'submitted' ? 'Pending Review' : 
                       viewingService.status === 'active' ? 'Live' :
                       viewingService.status === 'draft' ? 'Draft' : viewingService.status}
                    </Badge>
                  </div>
                </div>

                {/* Price & Duration Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {/* Price Card */}
                  <div className="bg-[#578f82]/5 rounded-xl p-3 sm:p-4 border border-[#578f82]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-[#578f82] text-lg font-bold">₹</div>
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Price</label>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{viewingService.price}
                      <span className="text-sm font-normal text-gray-600 ml-2">
                        {(viewingService.price_type || viewingService.pricingModel) === 'hourly' ? '/hour' : (viewingService.price_type || viewingService.pricingModel) === 'fixed' ? '' : '/package'}
                      </span>
                    </p>
                  </div>

                  {/* Duration Card */}
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Duration</label>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {viewingService.duration_minutes || viewingService.duration}
                      <span className="text-sm font-normal text-gray-600 ml-2">minutes</span>
                    </p>
                  </div>
                </div>

                {/* Serviceable Areas Card */}
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-[#578f82]" />
                    <label className="text-sm font-semibold text-gray-900">Serviceable Areas</label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {partnerPincodes.map((pincode, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100">
                        {pincode}
                      </Badge>
                    ))}
                  </div>
                </div>

                {viewingService.features && (
                  <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-5 h-5 text-[#578f82]" />
                      <label className="text-sm font-semibold text-gray-900">Features & Details</label>
                    </div>
                    <div className="text-gray-700">
                      {(() => {
                        let featuresData = viewingService.features
                        
                        // Parse if it's a string
                        if (typeof featuresData === 'string') {
                          try {
                            featuresData = JSON.parse(featuresData)
                          } catch (e) {
                            return <p>{featuresData}</p>
                          }
                        }
                        
                        // Handle array
                        if (Array.isArray(featuresData)) {
                          return (
                            <ul className="space-y-2">
                              {featuresData.map((feature, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 text-[#578f82] mt-0.5 flex-shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          )
                        }
                        
                        // Handle object
                        if (typeof featuresData === 'object' && featuresData !== null) {
                          return (
                            <div className="space-y-3">
                              {Object.entries(featuresData).map(([key, value]) => {
                                // Format the key to be readable
                                const formattedKey = key
                                  .split('_')
                                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                  .join(' ')
                                
                                // Format the value
                                let formattedValue
                                if (Array.isArray(value)) {
                                  formattedValue = value.join(', ')
                                } else if (typeof value === 'object') {
                                  formattedValue = JSON.stringify(value)
                                } else {
                                  formattedValue = String(value)
                                }
                                
                                return (
                                  <div key={key} className="flex items-start gap-2">
                                    <div className="min-w-0 flex-1">
                                      <span className="text-sm font-semibold text-gray-900">{formattedKey}:</span>
                                      <span className="text-sm text-gray-700 ml-2">{formattedValue}</span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )
                        }
                        
                        return <p>{String(featuresData)}</p>
                      })()}
                    </div>
                  </div>
                )}

                {(viewingService.special_requirements || viewingService.requirements) && (
                  <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-200">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <label className="text-sm font-semibold text-gray-900">Special Requirements</label>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{viewingService.special_requirements || viewingService.requirements}</p>
                  </div>
                )}

                {(viewingService.cancellation_policy || viewingService.cancellationPolicy) && (
                  <div className="bg-red-50/50 rounded-xl p-5 border border-red-200">
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <label className="text-sm font-semibold text-gray-900">Cancellation Policy</label>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{viewingService.cancellation_policy || viewingService.cancellationPolicy}</p>
                  </div>
                )}

                {/* Timestamps Card */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Created</label>
                      </div>
                      <p className="text-sm text-gray-900 font-medium">{new Date(viewingService.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Last Updated</label>
                      </div>
                      <p className="text-sm text-gray-900 font-medium">{new Date(viewingService.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-8 py-3 sm:py-4 bg-gray-50 border-t-2 border-gray-100 flex justify-end">
              <Button
                onClick={() => setViewingService(null)}
                className="px-6 py-2.5 bg-gradient-to-r from-[#578f82] to-[#4a7c70] hover:from-[#4a7c70] hover:to-[#3d6a5f] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText="OK"
        cancelText="Cancel"
        isLoading={isSubmitting}
      />
    </div>
  )
}

export default Services
