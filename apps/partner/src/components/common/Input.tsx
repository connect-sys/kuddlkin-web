import React, { forwardRef } from 'react'
import { LucideIcon } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon
  error?: string
  label?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  placeholder,
  disabled = false,
  required = false,
  className = '',
  icon: Icon,
  error,
  label,
  ...props
}, ref) => {
  const baseClasses = 'w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-kuddl-orange/50 focus:border-kuddl-orange transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm'
  const errorClasses = error ? 'border-red-300 focus:ring-red-500' : 'border-kuddl-orange/30'
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white/90'
  
  const inputClasses = `
    ${baseClasses}
    ${errorClasses}
    ${disabledClasses}
    ${Icon ? 'pl-12' : ''}
    ${className}
  `.trim()

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-kuddl-green mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-kuddl-green/60 w-5 h-5" />
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
