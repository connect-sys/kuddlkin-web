import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  TrendingUp, 
  Download,
  Calendar,
  Filter,
  CreditCard,
  Wallet,
  PieChart,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const Revenue: React.FC = () => {
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    commissionEarned: 0,
    pendingPayouts: 0,
    totalBookings: 0,
    transactions: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchRevenueData();
  }, [timeRange]);

  const fetchRevenueData = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/revenue?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRevenueData(data);
      } else {
        console.error('Failed to fetch revenue data:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4 flex-1">
            <h1 className="text-xl font-semibold">Revenue Management</h1>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-kuddl-green">Revenue Management</h1>
              <p className="text-gray-600">Track platform revenue and financial metrics</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-kuddl-orange/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-kuddl-orange/50 focus:border-kuddl-orange"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button className="bg-kuddl-green text-white px-4 py-2 rounded-lg hover:bg-kuddl-green/90 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Revenue Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md border border-kuddl-orange/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-kuddl-green">₹{revenueData.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{revenueData.totalBookings} bookings</p>
                </div>
                <IndianRupee className="w-8 h-8 text-kuddl-green" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-kuddl-orange/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Commission Earned</p>
                  <p className="text-2xl font-bold text-kuddl-orange">₹{revenueData.commissionEarned.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">10% commission</p>
                </div>
                <Wallet className="w-8 h-8 text-kuddl-orange" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-kuddl-orange/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Payouts</p>
                  <p className="text-2xl font-bold text-yellow-600">₹{revenueData.pendingPayouts.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">To be processed</p>
                </div>
                <CreditCard className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-kuddl-orange/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-kuddl-green">{revenueData.totalBookings}</p>
                  <p className="text-sm text-gray-500">All time</p>
                </div>
                <TrendingUp className="w-8 h-8 text-kuddl-green" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Trend */}
            <div className="bg-white rounded-xl shadow-md border border-kuddl-orange/30 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-kuddl-green" />
                Revenue Trend
              </h3>
              <div className="h-64 flex items-center justify-center bg-kuddl-cream/30 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-kuddl-green mx-auto mb-2" />
                  <p className="text-kuddl-green font-medium">Revenue trend chart will be displayed here</p>
                </div>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-white rounded-xl shadow-md border border-kuddl-orange/30 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-kuddl-orange" />
                Revenue Breakdown
              </h3>
              <div className="h-64 flex items-center justify-center bg-kuddl-cream/30 rounded-lg">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-kuddl-orange mx-auto mb-2" />
                  <p className="text-kuddl-orange font-medium">Revenue breakdown chart will be displayed here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-md border border-kuddl-orange/30 overflow-hidden">
            <div className="px-6 py-4 border-b border-kuddl-orange/30">
              <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-kuddl-cream/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {revenueData.transactions.length > 0 ? revenueData.transactions.map((transaction: any) => (
                    <tr key={transaction.id} className="hover:bg-kuddl-cream/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{transaction.id.slice(-6)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.partnerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.serviceName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">₹{transaction.amount.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-kuddl-orange">₹{transaction.commission.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-green-600 bg-green-100">
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Revenue;
