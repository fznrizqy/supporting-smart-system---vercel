import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { AuditLog } from '../types';
import { History, Search, Filter, ChevronLeft, ChevronRight, Activity, X, RefreshCw, Printer } from 'lucide-react';

const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const itemsPerPage = 15;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await db.auditLogs.toArray(500);
      setLogs(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const filteredLogs = logs.filter(log => {
    const matchesGlobal = searchTerm === '' || 
      log.targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    return matchesGlobal && matchesAction;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const currentLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div className="p-12 text-center text-slate-400">Loading Postgres Audit Trail...</div>;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-[calc(100vh-12rem)]">
      <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2"><History size={18} /> <span className="font-bold">{filteredLogs.length} Records</span></div>
        <div className="flex gap-2">
          <input type="text" placeholder="Search logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-3 py-1.5 text-sm rounded-lg border dark:bg-slate-900 dark:border-slate-600 outline-none" />
          <button onClick={fetchLogs} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><RefreshCw size={16}/></button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900 dark:text-slate-300 sticky top-0">
            <tr>
              <th className="px-6 py-3">Timestamp</th>
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Target</th>
              <th className="px-6 py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {currentLogs.map(log => (
              <tr key={log.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="px-6 py-4 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4"><span className="px-2 py-0.5 rounded text-[10px] font-bold border border-sky-200 bg-sky-50 text-sky-700">{log.action}</span></td>
                <td className="px-6 py-4 font-medium">{log.userName}</td>
                <td className="px-6 py-4">{log.targetName}</td>
                <td className="px-6 py-4 text-xs text-slate-500 whitespace-pre-wrap">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogViewer;