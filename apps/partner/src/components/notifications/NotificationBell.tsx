import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import NotificationCenter from './NotificationCenter';

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user?.id) {
      // Connect to notification service
      notificationService.connect(user.id, 'partner');
      
      // Load initial unread count
      loadUnreadCount();
      
      // Set up listeners
      const handleNewNotification = () => {
        setUnreadCount(prev => prev + 1);
      };

      const handleNotificationRead = () => {
        setUnreadCount(prev => Math.max(0, prev - 1));
      };

      const handleAllNotificationsRead = () => {
        setUnreadCount(0);
      };

      notificationService.on('new_notification', handleNewNotification);
      notificationService.on('notification_read', handleNotificationRead);
      notificationService.on('all_notifications_read', handleAllNotificationsRead);

      // Check connection status periodically
      const connectionCheck = setInterval(() => {
        setIsConnected(notificationService.isConnected());
      }, 5000);

      return () => {
        notificationService.off('new_notification', handleNewNotification);
        notificationService.off('notification_read', handleNotificationRead);
        notificationService.off('all_notifications_read', handleAllNotificationsRead);
        clearInterval(connectionCheck);
      };
    }
  }, [user?.id]);

  const loadUnreadCount = async () => {
    try {
      const data = await notificationService.getNotifications(1, 0, true);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleBellClick = () => {
    setShowNotifications(true);
  };

  return (
    <>
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:text-[#578f82] transition-colors rounded-lg hover:bg-gray-100"
        title="Notifications"
      >
        <Bell className="w-6 h-6" />
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* Connection status indicator */}
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
          isConnected ? 'bg-green-500' : 'bg-gray-400'
        }`} />
      </button>

      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
};

export default NotificationBell;
