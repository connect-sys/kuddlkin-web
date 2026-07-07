/**
 * Utility functions for handling dynamic data display
 */

export const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return value.toLocaleString();
};

export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '₹0';
  }
  return `₹${value.toLocaleString()}`;
};

export const formatPercentage = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0%';
  }
  return `${value.toFixed(1)}%`;
};

export const getArrayLength = (arr: any[] | undefined | null): number => {
  if (!arr || !Array.isArray(arr)) {
    return 0;
  }
  return arr.length;
};

export const getStringValue = (value: string | undefined | null): string => {
  if (!value || value.trim() === '') {
    return 'N/A';
  }
  return value;
};

export const getBooleanDisplay = (value: boolean | undefined | null): string => {
  if (value === undefined || value === null) {
    return 'No';
  }
  return value ? 'Yes' : 'No';
};

export const getStatusColor = (status: string | undefined | null): string => {
  if (!status) return 'bg-gray-100 text-gray-800';
  
  switch (status.toLowerCase()) {
    case 'active':
    case 'approved':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
    case 'cancelled':
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'inactive':
    case 'suspended':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};
