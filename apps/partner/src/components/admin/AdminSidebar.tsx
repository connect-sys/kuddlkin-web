import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import kuddlIcon from '../../assets/images/kuddl-icon.svg';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calendar, 
  IndianRupee, 
  Settings, 
  LogOut,
  BarChart3,
  AlertTriangle,
  Newspaper,
  Briefcase
} from 'lucide-react';

interface AdminSidebarProps {
  onClose?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Partner Management', href: '/admin/users', icon: Users },
    { name: 'Service Management', href: '/admin/services', icon: Briefcase },
    { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Revenue', href: '/admin/revenue', icon: IndianRupee },
    { name: 'Content Management', href: '/admin/content', icon: Newspaper },
    { name: 'Reports', href: '/admin/reports', icon: AlertTriangle },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col w-64 h-screen bg-kuddl-cream shadow-xl border-r border-kuddl-orange/30">
      {/* Logo */}
      <div className="flex items-center justify-center h-20 px-6 border-b border-kuddl-orange/40 bg-white">
        <div className="flex items-center space-x-3">
          <img 
            src={kuddlIcon} 
            alt="Kuddl Icon" 
            className="w-10 h-10"
          />
          <div>
            <h1 className="text-lg font-bold text-kuddl-green">Kuddl Admin</h1>
            <p className="text-xs text-kuddl-orange font-medium">Control Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-kuddl-orange border-l-4 border-kuddl-orange shadow-sm bg-kuddl-green/10'
                  : 'text-gray-700 hover:bg-kuddl-cream/50 hover:text-kuddl-orange hover:shadow-sm'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-4 py-4 border-t border-kuddl-orange/40 bg-white">
        <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-kuddl-cream/50 hover:text-kuddl-orange transition-all duration-200 mb-2">
          <Settings className="w-5 h-5 mr-3" />
          Admin Settings
        </button>
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 hover:shadow-sm transition-all duration-200"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
