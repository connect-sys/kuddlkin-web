import React, { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  onClose: () => void
}

const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for animation to complete
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-emerald-50 border-emerald-200',
      iconColor: 'text-emerald-600',
      titleColor: 'text-emerald-800',
      textColor: 'text-emerald-700'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50 border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      textColor: 'text-red-700'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-kuddl-orange/10 border-kuddl-orange/30',
      iconColor: 'text-kuddl-orange',
      titleColor: 'text-kuddl-orange',
      textColor: 'text-kuddl-orange/80'
    },
    info: {
      icon: Info,
      bgColor: 'bg-kuddl-green/10 border-kuddl-green/30',
      iconColor: 'text-kuddl-green',
      titleColor: 'text-kuddl-green',
      textColor: 'text-kuddl-green/80'
    }
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className={`
        ${config.bgColor} border rounded-xl shadow-lg backdrop-blur-sm p-4
        hover:shadow-xl transition-shadow duration-200
      `}>
        <div className="flex items-start">
          <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 mr-3 flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-bold ${config.titleColor} mb-1`}>
              {title}
            </h4>
            <p className={`text-sm ${config.textColor}`}>
              {message}
            </p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className={`ml-2 ${config.iconColor} hover:opacity-70 transition-opacity`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Notification
