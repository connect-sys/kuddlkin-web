import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Star, 
  User, 
  Settings, 
  LogOut,
  Wrench,
  IndianRupee,
  BarChart3,
  Users,
  FileText,
  Shield,
  Database,
  Globe,
  AlertTriangle,
  Lock,
  Clock,
  Briefcase,
  Newspaper,
  TrendingUp,
  UserCheck,
  Tent
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import kuddlLogoFull from '../../assets/images/kuddl-logo-full.svg';

const DynamicSidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Determine roles
  const isAdmin = user?.email === 'tech@tendernest.world' || user?.email === 'admin@kuddl.co' || user?.role === 'admin';
  const isServiceWorker = user?.role === 'service_worker';
  
  // Check if partner is verified by admin
  const isPartnerVerified = user?.kyc_status === 'verified' || user?.kyc_status === 'approved';
  const profileComplete = user?.profileComplete || false;

  // Service worker: read permissions from stored worker_data
  const workerPermissions: Record<string, any> = (() => {
    try {
      const d = localStorage.getItem('worker_data');
      const w = d ? JSON.parse(d) : null;
      const perms: Record<string, any> = {};
      (w?.permissions || []).forEach((p: any) => { perms[p.permission_type] = p; });
      return perms;
    } catch { return {}; }
  })();
  const workerCanView = (key: string) =>
    workerPermissions['all']?.can_view || workerPermissions[key]?.can_view;

  // Admin navigation items
  const adminNavItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Partner Management', href: '/admin/users', icon: Users },
    { name: 'Service Management', href: '/admin/services', icon: Briefcase },
    { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
    { name: 'Revenue', href: '/admin/revenue', icon: IndianRupee },
    { name: 'Content Management', href: '/admin/content', icon: Newspaper },
    { name: 'Job Applications', href: '/admin/job-applications', icon: UserCheck },
    { name: 'Reports', href: '/admin/reports', icon: AlertTriangle },
  ];

  // Partner navigation items
  const partnerNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Services', href: '/services', icon: Wrench },
    { name: 'Service Workers', href: '/service-workers', icon: UserCheck },
    { name: 'Camps', href: '/camps', icon: Tent },
    { name: 'Bookings', href: '/bookings', icon: Calendar },
    { name: 'Availability', href: '/availability', icon: Clock },
    { name: 'Reviews', href: '/reviews', icon: Star },
    { name: 'Earnings', href: '/earnings', icon: IndianRupee },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // Service worker: same nav as partner but filtered by permissions
  const workerNavItems = [
    { name: 'Dashboard', href: '/worker/dashboard', icon: LayoutDashboard, permKey: null },
    { name: 'Bookings', href: '/bookings', icon: Calendar, permKey: 'bookings' },
    { name: 'Camps', href: '/camps', icon: Tent, permKey: 'camps' },
    { name: 'My Services', href: '/services', icon: Wrench, permKey: 'services' },
    { name: 'Reviews', href: '/reviews', icon: Star, permKey: 'reviews' },
    { name: 'Availability', href: '/availability', icon: Clock, permKey: 'availability' },
  ];

  const navItems = isAdmin ? adminNavItems : isServiceWorker ? workerNavItems : partnerNavItems;

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="w-72 bg-[#578f82] text-white flex flex-col h-screen shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <Link to="/" className="flex justify-center hover:opacity-80 transition-opacity">
          <div className="bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
            <img 
              src={kuddlLogoFull} 
              alt="Kuddl" 
              className="h-10 w-auto"
            />
          </div>
        </Link>
      </div>

      {/* Navigation */}
      {/* Admin Approval Warning — only for unverified partners, not service workers */}
      {!isAdmin && !isServiceWorker && !isPartnerVerified && (
        <div className="p-4 border-b border-white/20">
          <div className="bg-orange-500/20 border border-orange-400/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-orange-200">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Pending Admin Approval</span>
            </div>
            <p className="text-xs text-orange-300 mt-1">
              {profileComplete 
                ? 'Your profile is under review. You\'ll get full access once verified by admin.' 
                : 'Complete your profile to get verified by admin for full access.'}
            </p>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          // Partner: disabled if not verified (workers are never disabled)
          const isPartnerDisabled = !isAdmin && !isServiceWorker && !isPartnerVerified && item.href !== '/dashboard' && item.href !== '/profile';
          const isDisabled = isPartnerDisabled;
          
          if (isDisabled) {
            return (
              <div
                key={item.name}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white/40 cursor-not-allowed"
              >
                <Lock className="w-5 h-5 text-white/40" />
                <span className="font-medium">{item.name}</span>
                <div className="ml-auto">
                  <Lock className="w-3.5 h-3.5 text-white/30" />
                </div>
              </div>
            );
          }
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group hover:scale-105 hover:shadow-lg ${
                active
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm scale-105'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
              <span className="font-medium">{item.name}</span>
              {active && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Role Badge */}
      <div className="p-4 border-t border-white/20">
        <div className={`px-4 py-2 rounded-lg text-center ${
          isAdmin 
            ? 'bg-red-500/20 border border-red-400/30'
            : isServiceWorker
            ? 'bg-indigo-500/20 border border-indigo-400/30'
            : 'bg-blue-500/20 border border-blue-400/30'
        }`}>
          <div className="flex items-center justify-center space-x-2">
            {isAdmin ? (
              <Shield className="w-4 h-4 text-red-300" />
            ) : isServiceWorker ? (
              <UserCheck className="w-4 h-4 text-indigo-300" />
            ) : (
              <User className="w-4 h-4 text-blue-300" />
            )}
            <span className="text-sm font-medium">
              {isAdmin ? 'Administrator' : isServiceWorker ? 'Staff Member' : 'Service Provider'}
            </span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-white/20">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-white/80 hover:bg-red-500/20 hover:text-white hover:scale-105 hover:shadow-lg transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 text-white/70 group-hover:text-red-300" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default DynamicSidebar;
