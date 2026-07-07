/**
 * Mobile Layout Component
 * App-like mobile interface for m.kuddl.co
 */

import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Wallet, 
  User, 
  Menu,
  Bell,
  ChevronLeft,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const MobileLayout = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/') setActiveTab('home');
    else if (path === '/bookings') setActiveTab('bookings');
    else if (path === '/earnings') setActiveTab('earnings');
    else if (path === '/profile') setActiveTab('profile');
  }, [location]);

  const handleTabClick = (tab: string, path: string) => {
    setActiveTab(tab);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Hide bottom nav on login page
  if (location.pathname === '/login') {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Back button or Menu */}
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full active:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <img 
              src="/assets/logo.svg" 
              alt="Kuddl" 
              className="h-8 w-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="font-bold text-xl text-teal-600">Kuddl Partner</span>
          </div>

          {/* Notifications */}
          <button className="p-2 -mr-2 rounded-full active:bg-gray-100 relative">
            <Bell className="w-6 h-6 text-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation - App Style */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb">
        <div className="flex items-center justify-around h-16">
          <NavButton 
            icon={<Home className="w-6 h-6" />}
            label="Home"
            isActive={activeTab === 'home'}
            onClick={() => handleTabClick('home', '/dashboard')}
          />
          <NavButton 
            icon={<Calendar className="w-6 h-6" />}
            label="Bookings"
            isActive={activeTab === 'bookings'}
            onClick={() => handleTabClick('bookings', '/bookings')}
          />
          <NavButton 
            icon={<Wallet className="w-6 h-6" />}
            label="Earnings"
            isActive={activeTab === 'earnings'}
            onClick={() => handleTabClick('earnings', '/earnings')}
          />
          <NavButton 
            icon={<User className="w-6 h-6" />}
            label="Profile"
            isActive={activeTab === 'profile'}
            onClick={() => handleTabClick('profile', '/profile')}
          />
        </div>
      </nav>
    </div>
  );
};

// Nav Button Component
interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavButton = ({ icon, label, isActive, onClick }: NavButtonProps) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
      isActive ? 'text-teal-600' : 'text-gray-400'
    }`}
  >
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

export default MobileLayout;
