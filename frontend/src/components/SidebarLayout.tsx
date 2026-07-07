import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Upload, MessageSquare, LayoutDashboard, Settings, Bell, BarChart2 } from 'lucide-react';

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <div className="flex h-screen bg-[#f4f2eb] font-sans">
      {/* Sidebar */}
      <div className="w-20 lg:w-64 bg-[#2a5c48] text-white flex flex-col items-center lg:items-start py-6 shadow-2xl z-10 transition-all duration-300">
        
        {/* Logo */}
        <div className="w-full px-4 lg:px-6 flex items-center justify-center lg:justify-start mb-10">
          <div className="bg-[#10b981] p-2 rounded-lg flex-shrink-0">
            <BarChart2 size={24} className="text-white" />
          </div>
          <span className="ml-3 font-bold text-xl hidden lg:block tracking-wide">DataChat</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 w-full space-y-4 px-3">
          <NavItem to="/" icon={<Upload size={20} />} label="Datasets" active={isActive('/') && !location.pathname.includes('/chat') && !location.pathname.includes('/dashboard')} />
          <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active={location.pathname.includes('/dashboard')} />
          <NavItem to="/chat" icon={<MessageSquare size={20} />} label="AI Chat" active={location.pathname.includes('/chat')} />
        </nav>

        {/* Bottom Icons */}
        <div className="w-full space-y-4 px-3 mt-auto pb-4">
          <NavItem to="#" icon={<Bell size={20} />} label="Notifications" active={false} />
          <NavItem to="#" icon={<Settings size={20} />} label="Settings" active={false} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-[#f4f2eb]">
        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center justify-center lg:justify-start px-3 py-3 lg:px-4 rounded-xl transition-all duration-200 group ${
        active 
        ? 'bg-[#3b735c] text-white shadow-inner' 
        : 'text-gray-300 hover:bg-[#326751] hover:text-white'
      }`}
    >
      <div className={`${active ? 'text-[#10b981]' : 'group-hover:text-[#10b981] transition-colors'}`}>
        {icon}
      </div>
      <span className="ml-4 font-medium hidden lg:block">{label}</span>
    </Link>
  );
}
