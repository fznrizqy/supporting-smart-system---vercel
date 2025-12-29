
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, User as UserIcon, Building2, ClipboardList, Info, Trash2, Check, AlertCircle } from 'lucide-react';
import { JobRequest, JobRequestStatus, JobCategory, User, UserRole, Division } from '../types';
import { db } from '../db';
import ConfirmationModal from './ConfirmationModal';

interface JobRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: JobRequest) => void;
  currentUser: User;
  users: User[];
  initialData: JobRequest | null;
  isSupporting: boolean;
}

const JobRequestModal: React.FC<JobRequestModalProps> = ({ 
  isOpen, onClose, onSave, currentUser, users, initialData, isSupporting 
}) => {
  const [formData, setFormData] = useState<Partial<JobRequest>>({});
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: '',
        requestorId: currentUser.id,
        requestorName: currentUser.name,
        division: Division.ASLT,
        description: '',
        requestedAt: new Date().toISOString(),
        startDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assignedToId: '',
        status: JobRequestStatus.Requests,
        category: JobCategory.Maintenance
      });
    }
  }, [initialData, isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.assignedToId) {
      alert("Please fill in required fields: Title, Description, and Assigned To.");
      return;
    }
    onSave(formData as JobRequest);
  };

  const handleDelete = async () => {
    if (initialData?.id) {
      await db.jobRequests.delete(initialData.id);
      onClose();
      window.location.reload(); // Quick refresh
    }
  };

  const supportingUsers = users.filter(u => u.role === UserRole.Supporting || u.role === UserRole.Admin);
  const isRequestor = initialData?.requestorId === currentUser.id;
  const canEditMainFields = !initialData || isRequestor || isSupporting;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
           <h3 className="text-lg font-bold flex items-center gap-2">
             <ClipboardList className="text-sky-500" />
             {initialData ? 'Job Request Detail' : 'New Job Request'}
           </h3>
           <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={24}/></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Main Info */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Request Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  disabled={!canEditMainFields}
                  placeholder="e.g. Maintenance HPLC AP-1367"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Job Description</label>
                <textarea 
                  rows={4}
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  disabled={!canEditMainFields}
                  placeholder="Provide details about the requested work..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none"
                />
              </div>
            </div>

            {/* Column 1 */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Requestor</label>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg opacity-75">
                  <UserIcon size={16} className="text-slate-400" />
                  <span className="text-sm">{formData.requestorName}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Division</label>
                <select 
                  value={formData.division} 
                  onChange={e => setFormData({...formData, division: e.target.value})}
                  disabled={!canEditMainFields}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none"
                >
                  {Object.values(Division).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Category (Supporting Only)</label>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value as JobCategory})}
                  disabled={!isSupporting}
                  className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none ${!isSupporting ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {Object.values(JobCategory).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {!isSupporting && <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><Info size={10}/> To be determined by Supporting team</p>}
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Start Date</label>
                  <input 
                    type="date" 
                    value={formData.startDate} 
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    disabled={!canEditMainFields}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm outline-none [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Due Date</label>
                  <input 
                    type="date" 
                    value={formData.dueDate} 
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    disabled={!canEditMainFields}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm outline-none [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned To (Supporting)</label>
                <select 
                  value={formData.assignedToId} 
                  onChange={e => setFormData({...formData, assignedToId: e.target.value})}
                  disabled={!canEditMainFields}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none"
                  required
                >
                  <option value="">Select Support Staff...</option>
                  {supportingUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>

              {initialData && isSupporting && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(JobRequestStatus).map(s => (
                      <button 
                        key={s}
                        type="button"
                        onClick={() => setFormData({...formData, status: s})}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold border transition-all ${
                          formData.status === s 
                            ? 'bg-sky-500 text-white border-sky-600' 
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-sky-500'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        <div className="p-6 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
          <div>
            {initialData && (isSupporting || isRequestor) && (
              <button 
                type="button" 
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Trash2 size={18} /> Delete Request
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            {(canEditMainFields || isSupporting) && (
              <button 
                type="submit" 
                onClick={handleSubmit}
                className="px-6 py-2 text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2"
              >
                <Check size={18}/>
                {initialData ? 'Update Request' : 'Submit Request'}
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Cancel Job Request"
        message="Are you sure you want to remove this request? This cannot be undone."
        isDanger={true}
      />
    </div>,
    document.body
  );
};

export default JobRequestModal;
