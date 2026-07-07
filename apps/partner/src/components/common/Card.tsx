import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm hover:shadow-md',
    md: 'shadow-sm hover:shadow-md',
    lg: 'shadow-md hover:shadow-lg'
  }

  const classes = `
    bg-white/90 backdrop-blur-sm rounded-xl border border-kuddl-orange/10 transition-all duration-200
    ${paddingClasses[padding]}
    ${shadowClasses[shadow]}
    ${className}
  `.trim()

  return (
    <div className={classes}>
      {children}
    </div>
  )
}

export default Card
