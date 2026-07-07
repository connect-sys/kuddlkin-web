import React from 'react';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';

const Reports = () => {
  const reports = [
    {
      id: 1,
      name: 'Monthly Revenue Report',
      description: 'Detailed revenue breakdown by month',
      lastGenerated: '2025-10-07',
      type: 'Financial'
    },
    {
      id: 2,
      name: 'Provider Performance Report',
      description: 'Performance metrics for all providers',
      lastGenerated: '2025-10-06',
      type: 'Performance'
    },
    {
      id: 3,
      name: 'Customer Satisfaction Report',
      description: 'Customer feedback and ratings analysis',
      lastGenerated: '2025-10-05',
      type: 'Customer'
    },
    {
      id: 4,
      name: 'Booking Analytics Report',
      description: 'Booking trends and patterns',
      lastGenerated: '2025-10-04',
      type: 'Analytics'
    }
  ];

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Reports</h1>
          <p className="text-gray-600">Generate and download system reports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-[#578f82] rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {report.type}
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{report.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{report.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Last generated:</span>
                <span>{report.lastGenerated}</span>
              </div>
              
              <button className="w-full bg-[#cf956d] text-white py-2 px-4 rounded-lg hover:bg-[#b8845f] transition-colors flex items-center justify-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Generate Report</span>
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[#578f82] rounded-lg text-white">
              <TrendingUp className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">₹1,24,500</div>
              <div className="text-sm opacity-90">Total Revenue</div>
            </div>
            <div className="text-center p-4 bg-[#578f82] rounded-lg text-white">
              <Calendar className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">156</div>
              <div className="text-sm opacity-90">Total Bookings</div>
            </div>
            <div className="text-center p-4 bg-[#578f82] rounded-lg text-white">
              <FileText className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">23</div>
              <div className="text-sm opacity-90">Active Providers</div>
            </div>
            <div className="text-center p-4 bg-[#578f82] rounded-lg text-white">
              <TrendingUp className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">4.8</div>
              <div className="text-sm opacity-90">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Reports;
