import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Image as ImageIcon, X } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import { Service } from '../../types'
import { getCategories, ServiceCategory } from '../../api/categories'
import { toast } from 'react-hot-toast'

const serviceSchema = z.object({
  title: z.string().min(2, 'Service title must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  pricingModel: z.enum(['hourly', 'daily', 'fixed', 'package']),
  price: z.number().min(0, 'Price cannot be negative'),
  duration: z.number().optional(),
})

type ServiceFormData = z.infer<typeof serviceSchema>

interface ServiceFormProps {
  service?: Partial<Service> | null
  onSubmit: (data: ServiceFormData) => void
  onCancel: () => void
}

const ServiceForm: React.FC<ServiceFormProps> = ({ service, onSubmit, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: service?.name || '',
      description: service?.description || '',
      category: service?.category_id || '',
      pricingModel: service?.price_type || 'hourly',
      price: service?.price || 0,
      duration: service?.duration_minutes || 60,
    }
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        toast.error('Failed to load categories')
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const pricingModel = watch('pricingModel')

  const handleFormSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true)
    try {
      // await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      onSubmit(data)
    } catch (error) {
      console.error('Error submitting service:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input
            label="Service Title"
            {...register('title')}
            error={errors.title?.message}
            placeholder="e.g., Professional Home Cleaning"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            {...register('category')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={loadingCategories}
          >
            <option value="">{loadingCategories ? 'Loading...' : 'Select a category'}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pricing Model <span className="text-red-500">*</span>
          </label>
          <select
            {...register('pricingModel')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="hourly">Hourly Rate</option>
            <option value="fixed">Fixed Price</option>
            <option value="package">Package Deal</option>
          </select>
        </div>

        <div>
          <Input
            label="Price (₹)"
            type="number"
            {...register('price', { valueAsNumber: true })}
            error={errors.price?.message}
            placeholder="Enter price"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            {pricingModel === 'hourly' && 'Price per hour'}
            {pricingModel === 'fixed' && 'One-time fixed price'}
            {pricingModel === 'package' && 'Package price'}
          </p>
        </div>

        <div>
          <Input
            label="Duration (minutes)"
            type="number"
            {...register('duration', { valueAsNumber: true })}
            error={errors.duration?.message}
            placeholder="60"
          />
          <p className="mt-1 text-xs text-gray-500">
            Estimated time to complete the service
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Description <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Describe your service in detail, including what's included, your experience, and any special features..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isSubmitting}
        >
          {service ? 'Update Service' : 'Create Service'}
        </Button>
      </div>
    </form>
  )
}

export default ServiceForm
