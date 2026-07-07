import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { formatNumber, formatCurrency, formatPercentage } from '../../utils/dataUtils';

interface StatsCardProps {
  title: string;
  value: number | string | undefined | null;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  type?: 'number' | 'currency' | 'percentage' | 'string';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'blue',
  type = 'number',
  trend,
  loading = false
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-[#578f82]',
          text: 'text-white',
          iconBg: 'bg-white/20'
        };
      case 'orange':
        return {
          bg: 'bg-[#cf956d]',
          text: 'text-white',
          iconBg: 'bg-white/20'
        };
      case 'purple':
        return {
          bg: 'bg-purple-500',
          text: 'text-white',
          iconBg: 'bg-white/20'
        };
      case 'red':
        return {
          bg: 'bg-red-500',
          text: 'text-white',
          iconBg: 'bg-white/20'
        };
      default:
        return {
          bg: 'bg-blue-500',
          text: 'text-white',
          iconBg: 'bg-white/20'
        };
    }
  };

  const formatValue = (val: number | string | undefined | null, type: string): string => {
    if (loading) return '...';
    
    switch (type) {
      case 'currency':
        return formatCurrency(val as number);
      case 'percentage':
        return formatPercentage(val as number);
      case 'number':
        return formatNumber(val as number);
      case 'string':
      default:
        return val?.toString() || '0';
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <Card className={`${colorClasses.bg} ${colorClasses.text} border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium opacity-90 mb-2">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold">
                {formatValue(value, type)}
              </p>
              {trend && (
                <span className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-200' : 'text-red-200'
                }`}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-full ${colorClasses.iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
