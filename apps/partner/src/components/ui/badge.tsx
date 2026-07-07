import React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline'
}

export const Badge: React.FC<BadgeProps> = ({ 
  className = '', 
  variant = 'default', 
  ...props 
}) => {
  const variantClasses = {
    default: 'border-transparent bg-brand-orange text-white',
    secondary: 'border-transparent bg-brand-green text-white',
    outline: 'border-gray-300 text-gray-700'
  }
  
  return (
    <div 
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${variantClasses[variant]} ${className}`.trim()} 
      {...props} 
    />
  )
}
