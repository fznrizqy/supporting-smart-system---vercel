
import React, { useState, useEffect } from 'react';
import { JobRequest, JobRequestStatus, User, UserRole, JobCategory } from '../types';
import { db } from '../db';
import { Plus, MoreHorizontal, Eye, Clock, MessageSquare, ChevronDown, Filter, Search, Loader2 } from 'lucide-react';
import JobRequestModal from './JobRequestModal';

interface JobRequestBoardProps {
  currentUser: User;
  users: User[];
}

const JobRequestBoard: React.FC<JobRequestBoardProps> = ({ currentUser, users }) => {
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<JobRequest | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await db.jobRequests.toArray();
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch job requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAddRequest = () => {
    setEditingRequest(null);
    setIsModalOpen(true);
  };

  const handleEditRequest = (req: JobRequest) => {
    setEditingRequest(req);
    setIsModalOpen(true);
  };

  const handleSave = async (data: JobRequest) => {
    if (data.id) {
      await db.jobRequests.put(data);
    } else {
      await db.jobRequests.add(data);
    }
    await fetchRequests();
    setIsModalOpen(false);
  };

  const columns = [
    { title: 'Requests', status: JobRequestStatus.Requests, color: 'bg-yellow-500' },
    { title: 'On Progress', status: JobRequestStatus.OnProgress, color: 'bg-blue-500' },
    { title: 'Finished', status: JobRequestStatus.Finished, color: 'bg-green-500' },
    { title: 'Rejected', status: JobRequestStatus.Rejected, color: 'bg-red-500' },
  ];

  const canCreate = [UserRole.Admin, UserRole.Chemist, UserRole.Manager, UserRole.Supervisor].includes(currentUser.role);
  const isSupporting = [UserRole.Admin, UserRole.Supporting].includes(currentUser.role);

  if (loading && requests.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-sky-500" size={32} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
             Supporting's Request Jobdesk
             <ChevronDown size={16} />
           </h2>
        </div>
        <div className="flex items-center gap-2">
           <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Filter size={18}/></button>
           <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Search size={18}/></button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-4 h-full min-w-max">
          {columns.map((col) => (
            <div key={col.status} className="w-80 bg-slate-100 dark:bg-slate-900/50 rounded-xl flex flex-col h-full border border-slate-200 dark:border-slate-800">
              <div className="p-4 flex items-center justify-between">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  {col.title}
                  <span className="text-xs bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                    {requests.filter(r => r.status === col.status).length}
                  </span>
                </h3>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><MoreHorizontal size={18}/></button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 space-y-3 pb-4 custom-scrollbar">
                {requests.filter(r => r.status === col.status).map((req) => (
                  <div 
                    key={req.id} 
                    onClick={() => handleEditRequest(req)}
                    className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-500 transition-all cursor-pointer group animate-in fade-in"
                  >
                    <div className={`w-8 h-1 rounded-full mb-3 ${
                      req.category === JobCategory.Maintenance ? 'bg-yellow-400' : 
                      req.category === JobCategory.Troubleshooting ? 'bg-blue-400' : 'bg-purple-400'
                    }`}></div>
                    
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-white mb-2 leading-tight">
                      {req.title}
                    </h4>

                    <div className="flex items-center gap-4 text-[10px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1"><Eye size={12} /></div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} className={new Date(req.dueDate) < new Date() && col.status !== JobRequestStatus.Finished ? 'text-red-500' : ''} />
                        {new Date(req.dueDate).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                      </div>
                      <div className="flex items-center gap-1"><MessageSquare size={12} /> 1</div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="text-[10px] bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800 truncate max-w-[120px]">
                        {req.division}
                      </div>
                      <div className="flex -space-x-2">
                        {users.find(u => u.id === req.assignedToId) && (
                          <img 
                            src={users.find(u => u.id === req.assignedToId)?.avatar} 
                            className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 object-cover" 
                            title={`Assigned to ${users.find(u => u.id === req.assignedToId)?.name}`}
                          />
                        )}
                        <img 
                          src={users.find(u => u.id === req.requestorId)?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.requestorName)}&background=0ea5e9&color=fff`} 
                          className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 object-cover"
                          title={`Requested by ${req.requestorName}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {col.status === JobRequestStatus.Requests && canCreate && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleAddRequest(); }}
                    className="w-full py-2 flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Plus size={16} /> Add a card
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <JobRequestModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        currentUser={currentUser}
        users={users}
        initialData={editingRequest}
        isSupporting={isSupporting}
      />
    </div>
  );
};

export default JobRequestBoard;
