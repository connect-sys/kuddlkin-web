import React from 'react'
import { LucideIcon } from 'lucide-react'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: LucideIcon
  className?: string
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  className = ''
}) => {
  const baseClasses = 'group inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
  
  const variantClasses = {
    primary: 'text-white focus:ring-kuddl-orange/50',
    secondary: 'text-white focus:ring-kuddl-green/50',
    outline: 'border-2 border-kuddl-orange text-kuddl-orange bg-white hover:bg-kuddl-cream/50 focus:ring-kuddl-orange/50',
    danger: 'text-white focus:ring-red-500'
  }

  const getVariantStyle = (variant: string) => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: '#cf956d' }
      case 'secondary':
        return { backgroundColor: '#578f82' }
      case 'danger':
        return { backgroundColor: '#ef4444' }
      default:
        return {}
    }
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  const disabledClasses = 'opacity-50 cursor-not-allowed'
  
  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabled || loading ? disabledClasses : ''}
    ${className}
  `.trim()

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      style={getVariantStyle(variant)}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
      ) : Icon ? (
        <Icon className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
      ) : null}
      {children}
    </button>
  )
}

export default Button
