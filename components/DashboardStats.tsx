import React from 'react';
import { Equipment, EquipmentStatus, User } from '../types';
import { AlertCircle, CheckCircle, Clock, Archive, PauseCircle } from 'lucide-react';

interface DashboardStatsProps {
  equipment: Equipment[];
  currentUser: User;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ equipment, currentUser }) => {
  
  // Calculate stats
  const total = equipment.length;
  const operational = equipment.filter(e => e.status === EquipmentStatus.OK).length;
  // Maintenance Due: Calibration or Verification only
  const maintenanceDue = equipment.filter(e => e.status === EquipmentStatus.Calibration || e.status === EquipmentStatus.Verification).length;
  // Critical Issues: Service only
  const criticalIssues = equipment.filter(e => e.status === EquipmentStatus.Service).length;
  // Unused: Unused status only
  const unused = equipment.filter(e => e.status === EquipmentStatus.Unused).length;

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome <span className="text-indigo-600 dark:text-indigo-400">{currentUser.name}</span> to Supporting Smart System!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Here is your daily overview of the laboratory equipment status.
          </p>
        </div>
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-indigo-50 dark:from-indigo-900/10 to-transparent pointer-events-none"></div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Assets */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="p-3 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-lg">
            <Archive size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Assets</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{total}</p>
          </div>
        </div>

        {/* Operational */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Operational</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{operational}</p>
          </div>
        </div>

        {/* Maintenance Due */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">In QC</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{maintenanceDue}</p>
          </div>
        </div>

        {/* Critical Issues */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">In Service</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{criticalIssues}</p>
          </div>
        </div>

        {/* Unused */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg">
            <PauseCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Unused</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{unused}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardStats;