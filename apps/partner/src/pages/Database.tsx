import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Database as DatabaseIcon, RefreshCw, Trash2, Download, Upload } from 'lucide-react';
import { getCategories } from '../api/categories';

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

const Database = () => {
  const [loading, setLoading] = useState(false);
  const [lastReset, setLastReset] = useState('2025-10-07 19:30:00');
  const [stats, setStats] = useState({
    categories: 0,
    pincodes: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch categories count
      const categories = await getCategories();
      
      // Fetch pincodes count (if endpoint exists, otherwise mock or skip)
      // For now we'll just update categories since we have the API
      setStats(prev => ({
        ...prev,
        categories: categories.length
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleResetDatabase = async () => {
    if (!confirm('Are you sure you want to reset the database? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/reset-db`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert('Database reset successfully!');
        setLastReset(new Date().toLocaleString());
        fetchStats(); // Refresh stats after reset
      } else {
        alert('Failed to reset database');
      }
    } catch (error) {
      console.error('Error resetting database:', error);
      alert('Error resetting database');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanProviders = async () => {
    if (!confirm('Are you sure you want to clean the providers table?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/clean-providers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Providers table cleaned successfully!');
      } else {
        alert('Failed to clean providers table');
      }
    } catch (error) {
      console.error('Error cleaning providers:', error);
      alert('Error cleaning providers table');
    } finally {
      setLoading(false);
    }
  };

  const tables = [
    { name: 'admins', records: 1, size: '2.1 KB' },
    { name: 'providers', records: 0, size: '0 KB' },
    { name: 'services', records: 0, size: '0 KB' },
    { name: 'bookings', records: 0, size: '0 KB' },
    { name: 'categories', records: stats.categories, size: '1.2 KB' },
    { name: 'pincodes', records: 50, size: '8.5 KB' },
  ];

  return (
    <DashboardLayout title="Database Management">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Database Management</h1>
          <p className="text-gray-600">Manage database operations and maintenance</p>
        </div>

        {/* Database Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="w-12 h-12 bg-[#578f82] rounded-lg flex items-center justify-center mb-4">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Reset Database</h3>
            <p className="text-sm text-gray-600 mb-4">Reset entire database to initial state</p>
            <button
              onClick={handleResetDatabase}
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Database'}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="w-12 h-12 bg-[#578f82] rounded-lg flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Clean Providers</h3>
            <p className="text-sm text-gray-600 mb-4">Remove all providers from database</p>
            <button
              onClick={handleCleanProviders}
              disabled={loading}
              className="w-full bg-[#cf956d] text-white py-2 px-4 rounded-lg hover:bg-[#b8845f] transition-colors disabled:opacity-50"
            >
              {loading ? 'Cleaning...' : 'Clean Providers'}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="w-12 h-12 bg-[#578f82] rounded-lg flex items-center justify-center mb-4">
              <Download className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Export Data</h3>
            <p className="text-sm text-gray-600 mb-4">Download database backup</p>
            <button className="w-full bg-[#cf956d] text-white py-2 px-4 rounded-lg hover:bg-[#b8845f] transition-colors">
              Export Backup
            </button>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Database Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Connection Status</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Connected to Cloudflare D1</span>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Last Reset</h3>
              <p className="text-sm text-gray-600">{lastReset}</p>
            </div>
          </div>
        </div>

        {/* Tables Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Tables Overview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tables.map((table) => (
                  <tr key={table.name}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DatabaseIcon className="w-5 h-5 text-[#578f82] mr-3" />
                        <span className="text-sm font-medium text-gray-900">{table.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {table.records.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {table.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Database;
