import React from 'react'
import { IndianRupee } from 'lucide-react'

interface PricingInputProps {
  value: number
  onChange: (value: number) => void
  pricingModel: 'hourly' | 'fixed' | 'package'
  error?: string
}

const PricingInput: React.FC<PricingInputProps> = ({
  value,
  onChange,
  pricingModel,
  error
}) => {
  const getLabel = () => {
    switch (pricingModel) {
      case 'hourly':
        return 'Hourly Rate (₹)'
      case 'fixed':
        return 'Fixed Price (₹)'
      case 'package':
        return 'Package Price (₹)'
      default:
        return 'Price (₹)'
    }
  }

  const getPlaceholder = () => {
    switch (pricingModel) {
      case 'hourly':
        return 'e.g., 500'
      case 'fixed':
        return 'e.g., 2000'
      case 'package':
        return 'e.g., 5000'
      default:
        return 'Enter price'
    }
  }

  const getHelpText = () => {
    switch (pricingModel) {
      case 'hourly':
        return 'Amount you charge per hour of work'
      case 'fixed':
        return 'One-time price for the entire service'
      case 'package':
        return 'Price for a bundled package of services'
      default:
        return ''
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {getLabel()} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder={getPlaceholder()}
          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
          min="0"
          step="1"
        />
      </div>
      {getHelpText() && (
        <p className="mt-1 text-xs text-gray-500">{getHelpText()}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default PricingInput
