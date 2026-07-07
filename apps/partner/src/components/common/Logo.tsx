import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} relative`}>
        {/* Background Circle with Gradient */}
        <div className="absolute inset-0 rounded-2xl shadow-lg transform -rotate-3 hover:-rotate-6 transition-transform duration-300 bg-kuddl-green/20"></div>
        
        {/* Main Logo Container */}
        <div className="relative w-full h-full bg-kuddl-green rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          {/* Stylized 'K' */}
          <div className="text-white font-bold relative" style={{ fontSize: size === 'xl' ? '2rem' : size === 'lg' ? '1.5rem' : size === 'md' ? '1.25rem' : '1rem' }}>
            <span className="relative z-10 font-extrabold tracking-tight">k</span>
            {/* Decorative dots */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-kuddl-cream rounded-full opacity-90"></div>
            <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-kuddl-cream rounded-full opacity-70"></div>
          </div>
        </div>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex items-center">
          <span className={`font-bold ${textSizeClasses[size]} tracking-tight text-kuddl-green`}>
            kuddl
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
