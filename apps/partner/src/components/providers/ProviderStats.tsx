import React from 'react';
import { Users, TrendingUp, IndianRupee, Star } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && (
          <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-4 h-4 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`} />
            <span>{Math.abs(trend.value)}% from last month</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

interface ProviderStatsProps {
  stats: {
    totalProviders: number;
    activeProviders: number;
    pendingApprovals: number;
    totalRevenue: number;
    avgRating: number;
  };
  trends?: {
    providers?: { value: number; isPositive: boolean };
    revenue?: { value: number; isPositive: boolean };
    rating?: { value: number; isPositive: boolean };
  };
}

const ProviderStats: React.FC<ProviderStatsProps> = ({ stats, trends }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Providers"
        value={stats.totalProviders}
        icon={<Users className="w-6 h-6 text-blue-600" />}
        trend={trends?.providers}
        color="bg-blue-100"
      />
      
      <StatCard
        title="Active Providers"
        value={stats.activeProviders}
        icon={<Users className="w-6 h-6 text-green-600" />}
        color="bg-green-100"
      />
      
      <StatCard
        title="Pending Approvals"
        value={stats.pendingApprovals}
        icon={<Users className="w-6 h-6 text-yellow-600" />}
        color="bg-yellow-100"
      />
      
      <StatCard
        title="Total Revenue"
        value={`₹${stats.totalRevenue.toLocaleString()}`}
        icon={<IndianRupee className="w-6 h-6 text-purple-600" />}
        trend={trends?.revenue}
        color="bg-purple-100"
      />
    </div>
  );
};

export default ProviderStats;
