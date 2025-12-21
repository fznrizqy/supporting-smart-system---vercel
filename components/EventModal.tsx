import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar as CalendarIcon, Clock, Trash2, ChevronDown, User, AlertCircle } from 'lucide-react';
import { CalendarEvent, EventType, Equipment, User as UserType } from '../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (id: number) => void;
  initialEvent?: Partial<CalendarEvent>;
  selectedDate?: Date;
  equipmentList: Equipment[];
  currentUserId: string;
  readOnly?: boolean;
  users?: UserType[];
}

const EventModal: React.FC<EventModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  initialEvent, 
  selectedDate, 
  equipmentList,
  currentUserId,
  readOnly = false,
  users = []
}) => {
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    type: EventType.Maintenance,
    equipmentId: '',
    startDate: '',
    endDate: ''
  });

  // State for searchable dropdown
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const assetDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialEvent && initialEvent.id !== undefined) {
      setFormData({
        ...initialEvent,
        startDate: initialEvent.startDate || '',
        endDate: initialEvent.endDate || ''
      });
    } else if (selectedDate) {
      // Default to selected date 09:00 - 10:00
      const start = new Date(selectedDate);
      start.setHours(9, 0, 0, 0);
      
      const end = new Date(selectedDate);
      end.setHours(10, 0, 0, 0);

      // Adjust for timezone offset for input[type="datetime-local"]
      const toLocalISO = (d: Date) => {
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().slice(0, 16);
      };

      setFormData({
        title: '',
        description: '',
        type: EventType.Maintenance,
        equipmentId: '',
        startDate: toLocalISO(start),
        endDate: toLocalISO(end)
      });
    }
  }, [initialEvent, selectedDate, isOpen]);

  // Click outside handler for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (assetDropdownRef.current && !assetDropdownRef.current.contains(event.target as Node)) {
        setShowAssetDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;

    if (formData.title && formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        alert("End time must be after start time");
        return;
      }

      onSave({
        ...formData,
        createdBy: formData.createdBy || currentUserId
      } as CalendarEvent);
      onClose();
    }
  };

  const handleDeleteClick = () => {
    if (onDelete && initialEvent?.id !== undefined) {
        onDelete(initialEvent.id);
    }
  };

  // Filter equipment list based on input
  const filteredEquipment = equipmentList.filter(eq => 
    eq.id.toLowerCase().includes((formData.equipmentId || '').toLowerCase())
  );

  // Helper to find creator name
  const creatorName = formData.createdBy 
    ? users.find(u => u.id === formData.createdBy)?.name || "Unknown User"
    : "System";

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {readOnly ? 'Event Details' : 'Add Event'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          {/* Created By Display (Read Only Mode) */}
          {readOnly && (
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
               <div className="p-1.5 bg-slate-200 dark:bg-slate-600 rounded-full">
                 <User size={14} />
               </div>
               <span>Created by: <span className="font-semibold text-slate-700 dark:text-slate-200">{creatorName}</span></span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Event Title</label>
            <input
              type="text"
              required
              disabled={readOnly}
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none dark:text-white ${readOnly ? 'opacity-75 cursor-default' : ''}`}
              placeholder="e.g. Weekly Maintenance"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Event Type</label>
              <select
                value={formData.type}
                disabled={readOnly}
                onChange={e => setFormData({...formData, type: e.target.value as EventType})}
                className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none dark:text-white ${readOnly ? 'opacity-75 cursor-default pointer-events-none' : ''}`}
              >
                {Object.values(EventType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            {/* Searchable Equipment Dropdown */}
            <div className="relative" ref={assetDropdownRef}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Related Asset (Optional)</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.equipmentId || ''}
                  disabled={readOnly}
                  onChange={e => {
                    setFormData({...formData, equipmentId: e.target.value});
                    setShowAssetDropdown(true);
                  }}
                  onFocus={() => !readOnly && setShowAssetDropdown(true)}
                  className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none dark:text-white ${readOnly ? 'opacity-75 cursor-default' : ''}`}
                  placeholder={readOnly ? "No asset linked" : "Search ID..."}
                  autoComplete="off"
                />
                
                {!readOnly && (formData.equipmentId ? (
                   <button
                    type="button"
                    onClick={() => setFormData({...formData, equipmentId: ''})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                   >
                     <X size={14} />
                   </button>
                ) : (
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                ))}
              </div>

              {showAssetDropdown && !readOnly && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                  {filteredEquipment.length > 0 ? (
                    filteredEquipment.map(eq => (
                      <div 
                        key={eq.id}
                        className="px-3 py-2 hover:bg-sky-50 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-700 dark:text-slate-200 font-mono"
                        onClick={() => {
                          setFormData({...formData, equipmentId: eq.id});
                          setShowAssetDropdown(false);
                        }}
                      >
                        {eq.id}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 italic">
                      No matching IDs found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
              <input
                type="datetime-local"
                required
                disabled={readOnly}
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
                className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-2 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none dark:text-white [color-scheme:light] dark:[color-scheme:dark] ${readOnly ? 'opacity-75 cursor-default' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Time</label>
              <input
                type="datetime-local"
                required
                disabled={readOnly}
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
                className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-2 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none dark:text-white [color-scheme:light] dark:[color-scheme:dark] ${readOnly ? 'opacity-75 cursor-default' : ''}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              disabled={readOnly}
              value={formData.description || ''}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none dark:text-white resize-none ${readOnly ? 'opacity-75 cursor-default' : ''}`}
              placeholder="Additional details..."
            />
          </div>
        </form>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
          {readOnly && onDelete && initialEvent?.id !== undefined ? (
             <button
              type="button"
              onClick={handleDeleteClick}
              className="text-white bg-red-500 hover:bg-red-600 shadow-sm shadow-red-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} /> Delete Event
            </button>
          ) : (
            <div></div>
          )}
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Close
            </button>
            {!readOnly && (
              <button
                type="submit"
                onClick={handleSubmit} // Bind submit logic here since form is separate
                className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-sm transition-colors"
              >
                Save Event
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EventModal;