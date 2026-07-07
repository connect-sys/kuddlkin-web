import React from 'react'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  change: string
  icon: LucideIcon
  color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning'
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color
}) => {
  const colorClasses = {
    primary: {
      bg: 'bg-kuddl-orange/10',
      text: 'text-kuddl-orange',
      border: 'border-kuddl-orange/30',
      iconBg: 'bg-kuddl-orange',
      iconText: 'text-white'
    },
    secondary: {
      bg: 'bg-kuddl-green/10',
      text: 'text-kuddl-green',
      border: 'border-kuddl-green/30',
      iconBg: 'bg-kuddl-green',
      iconText: 'text-white'
    },
    accent: {
      bg: 'bg-kuddl-cream/50',
      text: 'text-kuddl-orange',
      border: 'border-kuddl-orange/30',
      iconBg: 'bg-gradient-to-br from-kuddl-orange to-kuddl-green',
      iconText: 'text-white'
    },
    success: {
      bg: 'bg-kuddl-green/10',
      text: 'text-kuddl-green',
      border: 'border-kuddl-green/30',
      iconBg: 'bg-kuddl-green',
      iconText: 'text-white'
    },
    warning: {
      bg: 'bg-kuddl-orange/10',
      text: 'text-kuddl-orange',
      border: 'border-kuddl-orange/30',
      iconBg: 'bg-kuddl-orange',
      iconText: 'text-white'
    }
  }

  const isPositive = change.startsWith('+')
  const currentColors = colorClasses[color]

  return (
    <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 ${currentColors.border} p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden group`}>
      {/* Decorative background element */}
      <div className={`absolute top-0 right-0 w-20 h-20 ${currentColors.bg} rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300`}></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">{title}</p>
            <p className={`text-4xl font-bold ${currentColors.text} mb-3 group-hover:scale-105 transition-transform duration-200`}>
              {value}
            </p>
          </div>
          <div className={`p-4 rounded-2xl ${currentColors.iconBg} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
            <Icon className={`w-8 h-8 ${currentColors.iconText}`} />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-3 py-2 rounded-2xl transition-all duration-200 ${
              isPositive 
                ? 'bg-kuddl-green/20 text-kuddl-green' 
                : 'bg-red-100 text-red-600'
            }`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-bold">{change}</span>
            </div>
          </div>
          <span className="text-xs text-gray-500 font-medium">vs last month</span>
        </div>
      </div>
    </div>
  )
}

export default StatsCard
