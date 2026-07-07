import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { getStringValue, getStatusColor } from '../../utils/dataUtils';

interface Column {
  key: string;
  label: string;
  type?: 'text' | 'status' | 'currency' | 'date' | 'number';
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  title?: string;
  columns: Column[];
  data: any[] | undefined | null;
  loading?: boolean;
  emptyMessage?: string;
  actions?: (row: any) => React.ReactNode;
}

const DataTable: React.FC<DataTableProps> = ({
  title,
  columns,
  data,
  loading = false,
  emptyMessage = "No data available",
  actions
}) => {
  const formatCellValue = (value: any, type: string = 'text'): React.ReactNode => {
    if (loading) return <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>;
    
    switch (type) {
      case 'status':
        const statusValue = getStringValue(value);
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
            {statusValue}
          </span>
        );
      case 'currency':
        return `₹${(value || 0).toLocaleString()}`;
      case 'date':
        return value ? new Date(value).toLocaleDateString() : 'N/A';
      case 'number':
        return (value || 0).toLocaleString();
      case 'text':
      default:
        return getStringValue(value);
    }
  };

  const renderLoadingRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <tr key={`loading-${index}`} className="border-b border-gray-200">
        {columns.map((column) => (
          <td key={column.key} className="px-6 py-4">
            <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
          </td>
        ))}
        {actions && (
          <td className="px-6 py-4">
            <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
          </td>
        )}
      </tr>
    ));
  };

  const renderEmptyState = () => (
    <tr>
      <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-500 font-medium">{emptyMessage}</p>
          <p className="text-gray-400 text-sm">Data will appear here when available</p>
        </div>
      </td>
    </tr>
  );

  return (
    <Card className="shadow-sm">
      {title && (
        <CardHeader className="pb-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
                {actions && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                renderLoadingRows()
              ) : !data || data.length === 0 ? (
                renderEmptyState()
              ) : (
                data.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {column.render
                          ? column.render(row[column.key], row)
                          : formatCellValue(row[column.key], column.type)
                        }
                      </td>
                    ))}
                    {actions && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {actions(row)}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataTable;
