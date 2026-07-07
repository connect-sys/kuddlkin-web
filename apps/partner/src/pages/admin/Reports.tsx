import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar,
  Filter,
  Search,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  IndianRupee,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const Reports: React.FC = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchReports();
  }, [selectedReport, dateRange]);

  const fetchReports = async () => {
    try {
      const response = await fetch(`/api/admin/reports?type=${selectedReport}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    { id: 'overview', name: 'Platform Overview', icon: BarChart3 },
    { id: 'revenue', name: 'Revenue Report', icon: IndianRupee },
    { id: 'users', name: 'User Analytics', icon: Users },
    { id: 'performance', name: 'Performance Report', icon: TrendingUp },
    { id: 'issues', name: 'Issues & Complaints', icon: AlertTriangle }
  ];

  const generateReport = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          type, 
          dateRange: dateRange.start && dateRange.end ? dateRange : null 
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
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
            <h1 className="text-xl font-semibold">Reports</h1>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-kuddl-green">Reports & Analytics</h1>
              <p className="text-gray-600">Generate and download platform reports</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="border border-kuddl-orange/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-kuddl-orange/50 focus:border-kuddl-orange"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="border border-kuddl-orange/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-kuddl-orange/50 focus:border-kuddl-orange"
              />
            </div>
          </div>

          {/* Report Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {reportTypes.map((report) => {
              const IconComponent = report.icon;
              return (
                <div
                  key={report.id}
                  className={`bg-white rounded-xl shadow-md border p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedReport === report.id 
                      ? 'border-kuddl-orange ring-2 ring-kuddl-orange/20' 
                      : 'border-kuddl-orange/30'
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <IconComponent className={`w-8 h-8 ${selectedReport === report.id ? 'text-kuddl-orange' : 'text-kuddl-green'}`} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        generateReport(report.id);
                      }}
                      className="text-kuddl-green hover:text-kuddl-green/80"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.name}</h3>
                  <p className="text-sm text-gray-600">
                    Generate detailed {report.name.toLowerCase()} with insights and metrics
                  </p>
                </div>
              );
            })}
          </div>

          {/* Report Preview */}
          <div className="bg-white rounded-xl shadow-md border border-kuddl-orange/30 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {reportTypes.find(r => r.id === selectedReport)?.name} Preview
              </h3>
              <button
                onClick={() => generateReport(selectedReport)}
                className="bg-kuddl-green text-white px-4 py-2 rounded-lg hover:bg-kuddl-green/90 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>

            {/* Report Content Based on Type */}
            {selectedReport === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-kuddl-cream/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-xl font-bold text-kuddl-green">2,456</p>
                    </div>
                    <Users className="w-6 h-6 text-kuddl-green" />
                  </div>
                </div>
                <div className="bg-kuddl-cream/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-xl font-bold text-kuddl-orange">₹4.2L</p>
                    </div>
                    <IndianRupee className="w-6 h-6 text-kuddl-orange" />
                  </div>
                </div>
                <div className="bg-kuddl-cream/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Partners</p>
                      <p className="text-xl font-bold text-kuddl-green">156</p>
                    </div>
                    <Users className="w-6 h-6 text-kuddl-green" />
                  </div>
                </div>
                <div className="bg-kuddl-cream/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Bookings</p>
                      <p className="text-xl font-bold text-kuddl-orange">1,234</p>
                    </div>
                    <Calendar className="w-6 h-6 text-kuddl-orange" />
                  </div>
                </div>
              </div>
            )}

            {selectedReport === 'revenue' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-kuddl-cream/30 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Gross Revenue</p>
                    <p className="text-2xl font-bold text-kuddl-green">₹4.2L</p>
                    <p className="text-sm text-green-600">+18% from last month</p>
                  </div>
                  <div className="bg-kuddl-cream/30 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Commission Earned</p>
                    <p className="text-2xl font-bold text-kuddl-orange">₹42K</p>
                    <p className="text-sm text-green-600">+12% from last month</p>
                  </div>
                  <div className="bg-kuddl-cream/30 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Net Profit</p>
                    <p className="text-2xl font-bold text-kuddl-green">₹38K</p>
                    <p className="text-sm text-green-600">+15% from last month</p>
                  </div>
                </div>
              </div>
            )}

            {selectedReport === 'users' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-kuddl-cream/30 rounded-lg p-4">
                    <p className="text-sm text-gray-600">New Users This Month</p>
                    <p className="text-2xl font-bold text-kuddl-green">234</p>
                    <p className="text-sm text-green-600">+25% growth</p>
                  </div>
                  <div className="bg-kuddl-cream/30 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-kuddl-orange">1,890</p>
                    <p className="text-sm text-green-600">77% retention rate</p>
                  </div>
                </div>
              </div>
            )}

            {/* Chart Placeholder */}
            <div className="h-64 bg-kuddl-cream/30 rounded-lg flex items-center justify-center mt-6">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-kuddl-green mx-auto mb-2" />
                <p className="text-kuddl-green font-medium">
                  {reportTypes.find(r => r.id === selectedReport)?.name} chart will be displayed here
                </p>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Reports;
