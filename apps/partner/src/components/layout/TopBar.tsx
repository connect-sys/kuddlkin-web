import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, Bell, Search, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';

interface TopBarProps {
  title?: string;
  showSearch?: boolean;
  onMenuClick?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ title, showSearch = false, onMenuClick }) => {
  const { user, logout } = useAuth();
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleProfile = () => {
    if (user?.role === 'admin') {
      navigate('/admin/profile');
    } else {
      navigate('/profile');
    }
  };

  const handleSettings = () => {
    if (user?.role === 'admin') {
      navigate('/admin/settings');
    } else {
      navigate('/settings');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed top-0 right-0 left-0 lg:left-72 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Left side - Mobile Menu + Title + Search */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 overflow-hidden">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden p-1.5 sm:p-2 hover:bg-gray-100 rounded-xl"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </Button>
          
          {/* Page Title */}
          {title && (
            <div className="hidden sm:block truncate">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                {title}
              </h1>
            </div>
          )}
          
          {/* Search Bar */}
          {showSearch && (
            <div className="relative max-w-md flex-1 sm:ml-8 hidden md:block">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search services, bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-kuddl-orange/20 focus:border-kuddl-orange transition-all duration-200 text-sm"
              />
            </div>
          )}
        </div>

        {/* Right side - Actions and Profile */}
        <div className="flex items-center space-x-1 sm:space-x-3 ml-2">
          
          {/* Notifications */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative p-2 sm:p-3 hover:bg-gray-100 rounded-xl transition-colors"
              onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute 1 top-0 sm:-top-1 right-0 sm:-right-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium shadow-lg">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {/* Notification Dropdown */}
            {notificationDropdownOpen && (
              <div className="absolute right-[-60px] sm:right-0 mt-3 w-[280px] sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Mark all read
                    </button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-25 transition-colors ${
                          !notification.read ? 'bg-blue-25' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            !notification.read ? 'bg-blue-500' : 'bg-gray-300'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Button 
              variant="ghost" 
              className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 hover:bg-gray-100 rounded-xl transition-colors"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <Avatar className="w-8 h-8 sm:w-9 sm:h-9 ring-2 ring-kuddl-orange/20">
                {user?.profile_picture_url && (
                  <AvatarImage src={user.profile_picture_url} alt={user.name || 'User'} />
                )}
                <AvatarFallback className="bg-[#cf956d] text-white text-xs sm:text-sm font-semibold">
                  {user?.name ? getInitials(user.name) : (user as any)?.full_name ? getInitials((user as any).full_name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.name || (user as any)?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email === 'tech@tendernest.world' || user?.email === 'admin@kuddl.co' || user?.role === 'admin'
                    ? 'Admin'
                    : user?.role === 'service_worker'
                    ? 'Staff Member'
                    : 'Partner'}
                </p>
              </div>
              <ChevronDown className="hidden sm:block w-4 h-4 text-gray-500 transition-transform duration-200" />
            </Button>
            
            {/* Enhanced Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 sm:w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="px-4 py-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      {user?.profile_picture_url && (
                        <AvatarImage src={user.profile_picture_url} alt={user.name || 'User'} />
                      )}
                      <AvatarFallback className="bg-[#cf956d] text-white font-semibold">
                        {user?.name ? getInitials(user.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{user?.name || (user as any)?.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <div className="flex items-center mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-500">Online</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  {!(user?.email === 'tech@tendernest.world' || user?.email === 'admin@kuddl.co' || user?.role === 'admin') && (
                    <button
                      onClick={() => { handleProfile(); setDropdownOpen(false); }}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="mr-3 h-4 w-4 text-kuddl-orange" />
                      <span>View Profile</span>
                    </button>
                  )}
                  <button
                    onClick={() => { handleSettings(); setDropdownOpen(false); }}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="mr-3 h-4 w-4 text-kuddl-green" />
                    <span>Settings</span>
                  </button>
                  <hr className="my-2 border-gray-100" />
                  <button
                    onClick={() => { handleLogout(); setDropdownOpen(false); }}
                    className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
