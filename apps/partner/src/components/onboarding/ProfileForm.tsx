import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../common/Button'
import Input from '../common/Input'
import { getCategories, ServiceCategory } from '../../api/categories'
import { toast } from 'react-hot-toast'

const profileSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  category: z.string().min(1, 'Please select a category'),
  subcategory: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  address: z.string().min(5, 'Please provide a valid address'),
  phone: z.string().min(10, 'Please provide a valid phone number'),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  onComplete: () => void
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  })

  const selectedCategoryId = watch('category')
  const selectedCategory = categories.find(c => c.id === selectedCategoryId)

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

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    try {
      // In a real app, you would send this data to the backend
      // For now we just simulate it or if there is an API, call it.
      // Assuming parent component handles actual submission or we just verify it works.
      console.log('Profile data:', data)
      
      // If we need to update profile via API here:
      // await updateProfile(data); 
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onComplete()
    } catch (error) {
      console.error('Error submitting profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            label="Business Name"
            {...register('businessName')}
            error={errors.businessName?.message}
            placeholder="Enter your business name"
            required
          />
        </div>

        <div>
          <Input
            label="Phone Number"
            {...register('phone')}
            error={errors.phone?.message}
            placeholder="+91 9876543210"
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

        {selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategory
            </label>
            <select
              {...register('subcategory')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select a subcategory</option>
              {selectedCategory.subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Description <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Describe your services, experience, and what makes you unique..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Address <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('address')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Enter your business address or service area..."
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          loading={isSubmitting}
          className="px-8"
        >
          Continue to KYC
        </Button>
      </div>
    </form>
  )
}

export default ProfileForm
