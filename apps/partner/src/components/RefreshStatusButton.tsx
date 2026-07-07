import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const RefreshStatusButton: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { refreshUser, user } = useAuth();

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
      toast.success('Status refreshed successfully!');
      
      // Force a page reload to ensure all components get updated data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Failed to refresh status:', error);
      toast.error('Failed to refresh status. Please try logging out and back in.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Only show for partners who might need status refresh
  if (user?.role === 'admin') {
    return null;
  }

  return (
    <Button
      onClick={handleRefreshStatus}
      disabled={isRefreshing}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
    </Button>
  );
};

export default RefreshStatusButton;
