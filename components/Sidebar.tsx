import React from 'react';
import { LayoutDashboard, Database, Shield, Microscope, ChevronLeft, Menu, History, Calendar } from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, activeTab, setActiveTab, userRole }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'equipment', label: 'Equipment', icon: Database },
  ];

  if ([UserRole.Admin, UserRole.Supporting, UserRole.Manager, UserRole.Supervisor].includes(userRole)) {
    menuItems.push({ id: 'audit', label: 'Audit Trail', icon: History });
  }

  if (userRole === UserRole.Admin || userRole === UserRole.Supporting) {
    menuItems.push({ id: 'admin', label: 'Admin Settings', icon: Shield });
  }

  return (
    <div 
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } bg-brand-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out relative shadow-xl z-20`}
    >
      {/* Brand */}
      <div className="h-16 flex items-center justify-center border-b border-brand-800">
        <div className="flex items-center gap-3">
          <div className="bg-sky-500 p-2 rounded-lg text-white">
            <Microscope size={24} />
          </div>
          {isOpen && <span className="text-white font-bold text-xs tracking-tight">Supporting Smart System</span>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-2 px-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-200 group ${
              activeTab === item.id 
                ? 'bg-brand-800 text-sky-400 shadow-md border-l-4 border-sky-400' 
                : 'hover:bg-brand-800/50 hover:text-white'
            }`}
          >
            <item.icon size={20} className={activeTab === item.id ? 'text-sky-400' : 'group-hover:text-white'} />
            {isOpen && <span className="font-medium text-sm">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-20 bg-brand-700 text-white p-1 rounded-full shadow-lg hover:bg-sky-600 transition-colors"
      >
        {isOpen ? <ChevronLeft size={16} /> : <Menu size={16} />}
      </button>

      {/* Footer Info */}
      <div className="p-4 border-t border-brand-800 text-xs text-center text-brand-400">
        {isOpen ? (
          <div>
            <p>v1.0.0 Release</p>
            <p className="mt-1 opacity-70">© 2025 Supporting Division</p>
          </div>
        ) : (
          <span>v1.0</span>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
