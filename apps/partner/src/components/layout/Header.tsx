import React from 'react'
import { Bell, Search, User } from 'lucide-react'
import Logo from '../common/Logo'

interface HeaderProps {
  title: string
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-white shadow-md border-b border-kuddl-orange/40">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-6">
          <Logo size="md" showText={true} />
          <div className="h-8 w-px bg-kuddl-orange/50"></div>
          <h1 className="text-2xl font-bold text-kuddl-green">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-kuddl-green/60 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-kuddl-orange/30 rounded-xl focus:ring-2 focus:ring-kuddl-orange/50 focus:border-kuddl-orange bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-3 text-kuddl-green hover:text-kuddl-orange hover:bg-kuddl-cream/50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-kuddl-orange ring-2 ring-white animate-pulse"></span>
          </button>

          {/* Profile */}
          <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border border-kuddl-orange/40 hover:shadow-lg transition-all duration-200">
            <div className="w-9 h-9 bg-kuddl-green rounded-full flex items-center justify-center shadow-sm">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900">John Doe</p>
              <p className="text-xs text-kuddl-green font-medium">Service Provider</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
