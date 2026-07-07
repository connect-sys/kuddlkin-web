import React, { useState } from 'react';
import DynamicSidebar from './DynamicSidebar';
import TopBar from './TopBar';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  showSearch?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, showSearch = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <DynamicSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <TopBar 
          title={title || 'Dashboard'} 
          showSearch={showSearch} 
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        {/* Page content - scrollable with modern styling */}
        <div className="flex-1 overflow-y-auto pt-16 sm:pt-20 lg:pt-24 bg-[#faf8f5]">
          <div className="p-0 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-full">
            <div className="space-y-0 sm:space-y-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
