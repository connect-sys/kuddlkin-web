import React, { useMemo, useState, useEffect } from 'react'
import { FileText, CheckCircle2, Clock, AlertTriangle, Search, Calendar, MoreHorizontal, IndianRupee, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

type PaymentStatus = 'paid' | 'pending' | 'failed'

interface EarningRow {
  id: string
  customer_name: string
  booking_id: string
  service_name: string
  booking_date: string
  completed_at: string
  total_amount: number
  provider_amount: number
  platform_fee: number
  payment_status: PaymentStatus
  payment_method?: string
}

const Earnings: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'all' | PaymentStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [earnings, setEarnings] = useState<EarningRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEarnings()
  }, [user])

  useEffect(() => {
    if (user && (startDate || endDate)) {
      fetchEarnings()
    }
  }, [startDate, endDate, user])

  const fetchEarnings = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const token = localStorage.getItem('token') || localStorage.getItem('authToken')
      
      // Build query parameters
      const params = new URLSearchParams({
        providerId: user.id,
        status: 'completed'
      })
      
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/earnings/partner?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setEarnings(data.data.earnings || [])
      } else {
        console.error('Failed to fetch earnings:', data.message)
      }
    } catch (error) {
      console.error('Error fetching earnings:', error)
    } finally {
      setLoading(false)
    }
  }

  const totals = useMemo(() => {
    const calculateSum = (earnings: EarningRow[], field: 'total_amount' | 'provider_amount') => 
      earnings.reduce((sum, earning) => sum + earning[field], 0)
    
    const paidEarnings = earnings.filter(e => e.payment_status === 'paid')
    const pendingEarnings = earnings.filter(e => e.payment_status === 'pending')
    const failedEarnings = earnings.filter(e => e.payment_status === 'failed')
    
    return {
      total: { 
        count: earnings.length, 
        grossAmount: calculateSum(earnings, 'total_amount'),
        netAmount: calculateSum(earnings, 'provider_amount')
      },
      paid: { 
        count: paidEarnings.length, 
        grossAmount: calculateSum(paidEarnings, 'total_amount'),
        netAmount: calculateSum(paidEarnings, 'provider_amount')
      },
      pending: { 
        count: pendingEarnings.length, 
        grossAmount: calculateSum(pendingEarnings, 'total_amount'),
        netAmount: calculateSum(pendingEarnings, 'provider_amount')
      },
      failed: { 
        count: failedEarnings.length, 
        grossAmount: calculateSum(failedEarnings, 'total_amount'),
        netAmount: calculateSum(failedEarnings, 'provider_amount')
      },
    }
  }, [earnings])

  const filteredData = useMemo(() => {
    return earnings.filter(earning => {
      const matchesTab = activeTab === 'all' || earning.payment_status === activeTab
      const matchesSearch = earning.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           earning.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           earning.booking_id.toLowerCase().includes(searchQuery.toLowerCase())
      
      let matchesDateRange = true
      if (startDate && endDate) {
        const earningDate = new Date(earning.booking_date)
        const start = new Date(startDate)
        const end = new Date(endDate)
        matchesDateRange = earningDate >= start && earningDate <= end
      }
      
      return matchesTab && matchesSearch && matchesDateRange
    })
  }, [earnings, activeTab, searchQuery, startDate, endDate])

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#578f82]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-600">Track your earnings and payment history</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">₹{totals.paid.netAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{totals.paid.count} transactions</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <IndianRupee className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">₹{totals.pending.netAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{totals.pending.count} transactions</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Platform Fees</p>
              <p className="text-2xl font-bold text-gray-900">₹{(totals.paid.grossAmount - totals.paid.netAmount).toLocaleString()}</p>
              <p className="text-xs text-gray-500">5% of gross earnings</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gross Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{totals.paid.grossAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Before platform fees</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search earnings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent text-sm"
                placeholder="Start date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent text-sm"
                placeholder="End date"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center sm:justify-end">
            {(['all', 'paid', 'pending', 'failed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-[#578f82] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Earnings Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No earnings found</h3>
            <p className="text-gray-500">
              {searchQuery || startDate || endDate ? 'Try adjusting your filters' : 'Your earnings will appear here once you complete paid bookings'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer & Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gross Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((earning) => (
                  <tr key={earning.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {earning.customer_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {earning.service_name}
                        </div>
                        <div className="text-xs text-gray-400">
                          ID: {earning.booking_id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(earning.booking_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {earning.payment_method || 'Online'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{earning.total_amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-red-600">
                        -₹{earning.platform_fee.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        ₹{earning.provider_amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(earning.payment_status)}`}>
                        {getStatusIcon(earning.payment_status)}
                        <span className="ml-1 capitalize">{earning.payment_status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-gray-400 hover:text-gray-600 p-1 rounded">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Earnings
