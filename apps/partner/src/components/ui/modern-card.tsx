import React from 'react';
import { cn } from '../../lib/utils';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  gradient?: boolean;
  hover?: boolean;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  className,
  title,
  subtitle,
  icon,
  action,
  gradient = false,
  hover = true,
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-200",
        hover && "hover:shadow-lg hover:shadow-kuddl-orange/5 hover:-translate-y-1",
        gradient && "bg-gradient-to-br from-white to-kuddl-cream/30",
        className
      )}
    >
      {(title || subtitle || icon || action) && (
        <div className="flex items-center justify-between p-6 border-b border-gray-50">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="w-10 h-10 bg-gradient-to-br from-kuddl-orange to-kuddl-green rounded-xl flex items-center justify-center shadow-sm">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  className,
}) => {
  const changeColors = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  };

  return (
    <ModernCard
      className={cn("p-6", className)}
      hover={true}
      gradient={true}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={cn(
              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2",
              changeColors[changeType]
            )}>
              {change}
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-kuddl-orange to-kuddl-green rounded-xl flex items-center justify-center shadow-lg">
          {icon}
        </div>
      </div>
    </ModernCard>
  );
};

export default ModernCard;
