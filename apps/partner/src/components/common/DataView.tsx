import React, { useState } from 'react';
import { Grid, List, Search, Filter, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface Column {
  key: string;
  label: string;
  type?: 'text' | 'status' | 'currency' | 'date' | 'number' | 'image';
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

interface DataViewProps {
  title?: string;
  columns: Column[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  actions?: (row: any) => React.ReactNode;
  searchable?: boolean;
  filterable?: boolean;
  defaultView?: 'grid' | 'list';
  gridColumns?: number;
  onRowClick?: (row: any) => void;
}

type ViewMode = 'grid' | 'list';
type SortDirection = 'asc' | 'desc' | null;

const DataView: React.FC<DataViewProps> = ({
  title,
  columns,
  data = [],
  loading = false,
  emptyMessage = "No data available",
  actions,
  searchable = true,
  filterable = false,
  defaultView = 'list',
  gridColumns = 3,
  onRowClick
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Filter and search data
  const filteredData = data.filter(row => {
    // Search filter
    if (searchTerm) {
      const searchMatch = columns.some(col => {
        const value = row[col.key];
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
      if (!searchMatch) return false;
    }

    // Column filters
    for (const [key, filterValue] of Object.entries(filters)) {
      if (filterValue && row[key] !== filterValue) {
        return false;
      }
    }

    return true;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn || !sortDirection) return 0;
    
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(prev => 
        prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
      );
      if (sortDirection === 'desc') {
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const formatCellValue = (value: any, type: string = 'text'): React.ReactNode => {
    if (value === null || value === undefined) return '-';

    switch (type) {
      case 'currency':
        return `₹${Number(value).toLocaleString()}`;
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'number':
        return Number(value).toLocaleString();
      case 'status':
        return (
          <Badge variant={getStatusVariant(value)} className="text-xs">
            {value}
          </Badge>
        );
      case 'image':
        return value ? (
          <img src={value} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-500">N/A</span>
          </div>
        );
      default:
        return value?.toString() || '-';
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "outline" => {
    const statusLower = status?.toLowerCase();
    if (statusLower?.includes('active') || statusLower?.includes('completed') || statusLower?.includes('paid')) {
      return 'default';
    }
    if (statusLower?.includes('pending') || statusLower?.includes('processing')) {
      return 'secondary';
    }
    return 'outline';
  };

  const getUniqueFilterValues = (columnKey: string) => {
    const values = data.map(row => row[columnKey]).filter(Boolean);
    return [...new Set(values)];
  };

  if (loading) {
    return (
      <Card>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {(title || searchable || filterable) && (
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            {title && <CardTitle>{title}</CardTitle>}
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              {/* Search */}
              {searchable && (
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              )}

              {/* Filters */}
              {filterable && (
                <div className="flex space-x-2">
                  {columns.filter(col => col.filterable).map(col => (
                    <div key={col.key} className="relative">
                      <select
                        value={filters[col.key] || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, [col.key]: e.target.value }))}
                        className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All {col.label}</option>
                        {getUniqueFilterValues(col.key).map(value => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  ))}
                </div>
              )}

              {/* View Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none border-0"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none border-0"
                >
                  <Grid className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent>
        {sortedData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        ) : viewMode === 'list' ? (
          // List View (Table)
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {columns.map(col => (
                    <th
                      key={col.key}
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                      }`}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{col.label}</span>
                        {col.sortable && sortColumn === col.key && (
                          <span className="text-blue-500">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                  {actions && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.map((row, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map(col => (
                      <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm">
                        {col.render ? col.render(row[col.key], row) : formatCellValue(row[col.key], col.type)}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {actions(row)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Grid View (Cards)
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${gridColumns} gap-4`}>
            {sortedData.map((row, index) => (
              <Card
                key={index}
                className={`hover:shadow-md transition-shadow ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {columns.slice(0, 4).map(col => (
                      <div key={col.key} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">{col.label}:</span>
                        <span className="text-sm">
                          {col.render ? col.render(row[col.key], row) : formatCellValue(row[col.key], col.type)}
                        </span>
                      </div>
                    ))}
                    {actions && (
                      <div className="pt-2 border-t border-gray-200">
                        {actions(row)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataView;
