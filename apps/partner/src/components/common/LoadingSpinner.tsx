import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'white'
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const colorClasses = {
    primary: 'border-kuddl-orange border-t-transparent',
    secondary: 'border-kuddl-green border-t-transparent',
    white: 'border-white border-t-transparent'
  }

  return (
    <div className={`inline-block ${sizeClasses[size]} ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          border-2 rounded-full animate-spin
          ${colorClasses[color]}
        `}
      />
    </div>
  )
}

export default LoadingSpinner
