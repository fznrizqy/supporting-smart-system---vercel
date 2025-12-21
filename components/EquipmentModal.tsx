
import React, { useState, useEffect, useRef } from 'react';
import { Equipment, EquipmentStatus, Division, User } from '../types';
import { X, Upload, Camera, Trash2, FileText, Maximize2, ChevronDown, Check, User as UserIcon, Calendar, History, Info } from 'lucide-react';
import ImageViewerModal from './ImageViewerModal';
import ConfirmationModal from './ConfirmationModal';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Equipment) => void;
  initialData?: Equipment | null;
  readOnly?: boolean;
  categories: string[];
  onAddCategory: (category: string) => void;
  users: User[];
}

const EquipmentModal: React.FC<EquipmentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  readOnly = false,
  categories,
  onAddCategory,
  users
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const [formData, setFormData] = useState<Partial<Equipment>>({
    status: EquipmentStatus.OK,
    division: Division.ASLT,
    category: categories[0] || 'General'
  });

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  
  // Category Search State
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryWrapperRef = useRef<HTMLDivElement>(null);

  // PIC Search State
  const [showPicDropdown, setShowPicDropdown] = useState(false);
  const picWrapperRef = useRef<HTMLDivElement>(null);

  // Fetch History only when modal is open and has an ID
  const assetId = initialData?.id;
  
  const historyData = useLiveQuery(async () => {
    if (!assetId || !isOpen) return null;

    // 1. Get Audit Logs
    // FIX: Using manual filtering as custom API does not support .where()
    const allLogs = await db.auditLogs.toArray(500);
    const logs = allLogs.filter((l: any) => l.targetId === assetId);
    
    // 2. Get Calendar Events
    // FIX: Using manual filtering as custom API does not support .where()
    const allEvents = await db.events.toArray();
    const events = allEvents.filter((e: any) => e.equipmentId === assetId);

    // 3. Normalize & Merge
    const normalizedLogs = logs.map((l: any) => ({
      id: `log-${l.id}`,
      type: 'log' as const,
      timestamp: l.timestamp,
      title: `${l.action} Action`,
      user: l.userName,
      details: l.details || l.action
    }));

    const normalizedEvents = events.map((e: any) => ({
      id: `event-${e.id}`,
      type: 'event' as const,
      timestamp: e.startDate,
      title: `${e.type} Schedule`,
      user: 'System', // Or createdBy lookup if available
      details: `${e.title}: ${e.description || ''}`
    }));

    // Sort descending
    return [...normalizedLogs, ...normalizedEvents].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  }, [assetId, isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ 
        status: EquipmentStatus.OK,
        division: Division.ASLT,
        category: categories[0] || 'General',
        location: '',
        calibrationMeasuringPoint: '',
        personInCharge: ''
      });
    }
    setActiveTab('details'); // Reset tab on open
  }, [initialData, isOpen, categories]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryWrapperRef.current && !categoryWrapperRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (picWrapperRef.current && !picWrapperRef.current.contains(event.target as Node)) {
        setShowPicDropdown(false);
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
    
    // Strict Validation for Person in Charge
    if (formData.personInCharge && formData.personInCharge.trim() !== '') {
       const isValidUser = users.some(u => u.name.toLowerCase() === formData.personInCharge?.toLowerCase());
       if (!isValidUser) {
         alert("Person in Charge must be selected from the list of registered users.");
         return;
       }
    }

    if (formData.id && formData.category && formData.brand && formData.division) {
      setIsSaveConfirmOpen(true);
    } else {
      alert("Please fill in all required fields (ID, Category, Brand, Division)");
    }
  };

  const handleConfirmSave = () => {
    if (formData.id && formData.category && formData.brand && formData.division) {
      // Check if category is new and add it if so
      if (!categories.includes(formData.category)) {
        onAddCategory(formData.category);
      }
      onSave(formData as Equipment);
      onClose();
    }
    setIsSaveConfirmOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'calibrationCert' | 'verificationCert') => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (file) {
      // Limit PDF size to 1MB to prevent LocalStorage quota issues
      if (file.size > 1024 * 1024) {
        alert("File is too large. Please upload a PDF smaller than 1MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) {
        alert("Image is too large. Please upload an image smaller than 800KB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to get display name for file
  const getFileName = (fileData: string | undefined) => {
    if (!fileData) return null;
    if (fileData.startsWith('data:')) return 'PDF Document Attached';
    return fileData; // Fallback for mock data strings
  };

  const filteredCategories = categories.filter(c => 
    c.toLowerCase().includes((formData.category || '').toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes((formData.personInCharge || '').toLowerCase())
  );

  const title = readOnly ? 'Asset Details' : (initialData ? 'Edit Asset' : 'Add New Asset');

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
        {/* Adjusted width to 70% on md screens */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-400 dark:border-slate-700 w-[95%] md:w-[70%] max-w-7xl flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 rounded-t-xl">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              {title}
              {readOnly && initialData && (
                 <span className={`text-xs px-2 py-0.5 rounded-full border ${initialData.status === EquipmentStatus.OK ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {initialData.status}
                 </span>
              )}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          {initialData && (
            <div className="flex border-b border-slate-200 dark:border-slate-700 px-6">
                <button 
                    onClick={() => setActiveTab('details')}
                    className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'details' ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                >
                    <Info size={16}/> Details
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'border-sky-500 text- sky-600 dark:text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                >
                    <History size={16}/> Lifecycle History
                </button>
            </div>
          )}

          <div className="p-6 overflow-y-auto">
            {activeTab === 'details' ? (
                <form id="equipment-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Image Upload/View Section */}
                <div className="md:col-span-2 flex justify-center mb-2">
                    <div className="relative group">
                    <div className="w-32 h-32 rounded-xl bg-slate-100 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden shadow-inner relative">
                        {formData.image ? (
                        <>
                            <img 
                            src={formData.image} 
                            alt="Preview" 
                            className={`w-full h-full object-cover transition-transform duration-300 ${readOnly ? 'cursor-zoom-in hover:scale-105' : ''}`}
                            onClick={() => readOnly && setIsImageModalOpen(true)}
                            />
                            {/* Zoom Hint Icon for ReadOnly mode */}
                            {readOnly && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <Maximize2 size={24} className="text-white drop-shadow-md" />
                            </div>
                            )}
                        </>
                        ) : (
                        <div className="text-center text-slate-400">
                            <Camera size={32} className="mx-auto mb-1 opacity-50"/>
                            <span className="text-xs">Add Photo</span>
                        </div>
                        )}
                    </div>
                    
                    {!readOnly && (
                        <>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl cursor-pointer z-10">
                            <span className="text-white text-xs font-medium flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                            <Upload size={12}/> {formData.image ? 'Change' : 'Upload'}
                            </span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                        
                        {formData.image && (
                            <button 
                            type="button"
                            onClick={() => setFormData({...formData, image: undefined})}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors z-20"
                            title="Remove photo"
                            >
                            <Trash2 size={12}/>
                            </button>
                        )}
                        </>
                    )}
                    </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Asset ID {readOnly ? '' : <span className="text-red-500">*</span>}</label>
                    <input 
                    type="text" 
                    value={formData.id || ''} 
                    onChange={e => setFormData({...formData, id: e.target.value})}
                    placeholder="e.g. LAB-001"
                    disabled={readOnly}
                    className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition-all ${readOnly ? 'opacity-75 cursor-default' : ''}`}
                    required={!readOnly}
                    />
                    {!readOnly && <p className="text-xs text-slate-500">Manual input, no prefix required.</p>}
                </div>

                {/* Searchable Category Field */}
                <div className="space-y-1 relative" ref={categoryWrapperRef}>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category {readOnly ? '' : <span className="text-red-500">*</span>}</label>
                    <div className="relative">
                    <input 
                        type="text" 
                        value={formData.category || ''} 
                        onChange={e => {
                        setFormData({...formData, category: e.target.value});
                        setShowCategoryDropdown(true);
                        }}
                        onFocus={() => !readOnly && setShowCategoryDropdown(true)}
                        placeholder="Select or type category..."
                        disabled={readOnly}
                        className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition-all ${readOnly ? 'opacity-75 cursor-default' : ''}`}
                        required={!readOnly}
                        autoComplete="off"
                    />
                    {!readOnly && (
                        <div 
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-sky-500"
                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        >
                        <ChevronDown size={16} />
                        </div>
                    )}
                    </div>

                    {/* Dropdown Menu */}
                    {showCategoryDropdown && !readOnly && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                        {filteredCategories.length > 0 ? (
                        filteredCategories.map(cat => (
                            <div 
                            key={cat}
                            className="px-4 py-2 hover:bg-sky-50 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-700 dark:text-slate-200 flex items-center justify-between group"
                            onClick={() => {
                                setFormData({...formData, category: cat});
                                setShowCategoryDropdown(false);
                            }}
                            >
                            <span>{cat}</span>
                            {formData.category === cat && <Check size={14} className="text-sky-500" />}
                            </div>
                        ))
                        ) : (
                        <div className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400 italic">
                            "{formData.category}" will be added as a new category.
                        </div>
                        )}
                    </div>
                    )}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Brand {readOnly ? '' : <span className="text-red-500">*</span>}</label>
                    <input 
                    type="text" 
                    value={formData.brand || ''} 
                    onChange={e => setFormData({...formData, brand: e.target.value})}
                    disabled={readOnly}
                    className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition-all ${readOnly ? 'opacity-75 cursor-default' : ''}`}
                    required={!readOnly}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Model</label>
                    <input 
                    type="text" 
                    value={formData.model || ''} 
                    onChange={e => setFormData({...formData, model: e.target.value})}
                    disabled={readOnly}
                    className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition-all ${readOnly ? 'opacity-75 cursor-default' : ''}`}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Serial Number</label>
                    <input 
                    type="text" 
                    value={formData.serialNumber || ''} 
                    onChange={e => setFormData({...formData, serialNumber: e.target.value})}
                    disabled={readOnly}
                    className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition-all ${readOnly ? 'opacity-75 cursor-default' : ''}`}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Installation Date</label>
                    <input 
                    type="date" 
                    value={formData.installationDate || ''} 
                    onChange={e => setFormData({...formData, installationDate: e.target.value})}
                    disabled={readOnly}
                    className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark] ${readOnly ? 'opacity-75 cursor-default' : ''}`}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Status</label>
                    <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value as EquipmentStatus})}
                    disabled={readOnly}
                    className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition-all ${readOnly ? 'opacity-75 cursor-default' : ''}`}
                    >
                    {Object.values(EquipmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Division {readOnly ? '' : <span className="text-red-500">*</span>}</label>
                    <select 
                    value={formData.division || Division.ASLT} 
                    onChange={e => setFormData({...formData, division: e.target.value as Division})}
                    disabled={readOnly}
                    className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition-all ${readOnly ? 'opacity-75 cursor-default' : ''}`}
                    >
                    {Object.values(Division).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                {/* Location Field */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Location</label>
                    <input 
                    type="text" 
                    value={formData.location || ''} 
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    disabled={readOnly}
                    placeholder="e.g. Room 204, Bench A"
                    className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition-all ${readOnly ? 'opacity-75 cursor-default' : ''}`}
                    />
                </div>

                {/* Calibration Measuring Point Field */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Calibration Measuring Point</label>
                    <input 
                    type="text" 
                    value={formData.calibrationMeasuringPoint || ''} 
                    onChange={e => setFormData({...formData, calibrationMeasuringPoint: e.target.value})}
                    disabled={readOnly}
                    placeholder="e.g. 100°C, 200°C"
                    className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition-all ${readOnly ? 'opacity-75 cursor-default' : ''}`}
                    />
                </div>

                {/* Person In Charge Field - Searchable Dropdown */}
                <div className="space-y-1 relative" ref={picWrapperRef}>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Person in Charge</label>
                    <div className="relative">
                    <input 
                        type="text" 
                        value={formData.personInCharge || ''} 
                        onChange={e => {
                        setFormData({...formData, personInCharge: e.target.value});
                        setShowPicDropdown(true);
                        }}
                        onFocus={() => !readOnly && setShowPicDropdown(true)}
                        disabled={readOnly}
                        placeholder="Select registered user..."
                        className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition-all ${readOnly ? 'opacity-75 cursor-default' : ''}`}
                        autoComplete="off"
                    />
                    {!readOnly && (
                        <div 
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-sky-500"
                        onClick={() => setShowPicDropdown(!showPicDropdown)}
                        >
                        <ChevronDown size={16} />
                        </div>
                    )}
                    </div>

                    {/* PIC Dropdown Menu */}
                    {showPicDropdown && !readOnly && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                        {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <div 
                            key={user.id}
                            className="px-4 py-2 hover:bg-sky-50 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2 group"
                            onClick={() => {
                                setFormData({...formData, personInCharge: user.name});
                                setShowPicDropdown(false);
                            }}
                            >
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                {user.avatar ? (
                                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                <UserIcon size={12} className="text-slate-400" />
                                )}
                            </div>
                            <span className="flex-1">{user.name}</span>
                            {formData.personInCharge === user.name && <Check size={14} className="text-sky-500" />}
                            </div>
                        ))
                        ) : (
                        <div className="px-4 py-2 text-xs text-red-500 dark:text-red-400 italic">
                            No registered user found. Please select from the list.
                        </div>
                        )}
                    </div>
                    )}
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Calibration Certificate (PDF)</label>
                    <div className="flex items-center gap-2">
                        <label className={`flex-1 ${readOnly ? '' : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800'} bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-3 text-center transition-colors group`}>
                        <span className="text-xs text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 flex items-center justify-center gap-2">
                            <Upload size={14}/> 
                            {getFileName(formData.calibrationCert) || (readOnly ? "No certificate attached" : "Upload PDF (Max 1MB)")}
                        </span>
                        {!readOnly && <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFileChange(e, 'calibrationCert')} />}
                        </label>
                        {formData.calibrationCert && (
                        <div className="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg" title="File Attached">
                            <FileText size={18} />
                        </div>
                        )}
                        {formData.calibrationCert && !readOnly && (
                            <button 
                            type="button" 
                            onClick={() => setFormData({...formData, calibrationCert: undefined})}
                            className="text-slate-400 hover:text-red-500 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                            <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                    </div>

                    <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Verification Certificate (PDF)</label>
                    <div className="flex items-center gap-2">
                        <label className={`flex-1 ${readOnly ? '' : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800'} bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-3 text-center transition-colors group`}>
                        <span className="text-xs text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 flex items-center justify-center gap-2">
                            <Upload size={14}/> 
                            {getFileName(formData.verificationCert) || (readOnly ? "No certificate attached" : "Upload PDF (Max 1MB)")}
                        </span>
                        {!readOnly && <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFileChange(e, 'verificationCert')} />}
                        </label>
                        {formData.verificationCert && (
                        <div className="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg" title="File Attached">
                            <FileText size={18} />
                        </div>
                        )}
                        {formData.verificationCert && !readOnly && (
                            <button 
                            type="button" 
                            onClick={() => setFormData({...formData, verificationCert: undefined})}
                            className="text-slate-400 hover:text-red-500 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                            <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                    </div>
                </div>

                </form>
            ) : (
                <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Asset Timeline</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Combined view of maintenance schedules and audit logs for {formData.id}</p>
                    </div>

                    {!historyData || historyData.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700">
                             <p className="text-slate-400 text-sm">No history recorded for this asset yet.</p>
                        </div>
                    ) : (
                        <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-8 pb-4">
                            {historyData.map((item) => (
                                <div key={item.id} className="relative pl-6">
                                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${item.type === 'log' ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                        <div>
                                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${item.type === 'log' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                                {item.title}
                                            </span>
                                            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                                                {item.details}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                <UserIcon size={12}/> {item.user}
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-400 font-mono whitespace-nowrap">
                                            {new Date(item.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {readOnly ? 'Close' : 'Cancel'}
            </button>
            {!readOnly && activeTab === 'details' && (
              <button 
                type="submit" 
                form="equipment-form"
                className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-sm shadow-sky-500/30 transition-all transform hover:scale-105"
              >
                {initialData ? 'Save Changes' : 'Create Asset'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Full Screen Image Viewer */}
      <ImageViewerModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={formData.image}
        title={formData.id ? `Asset ${formData.id}` : 'Equipment Photo'}
      />

      {/* Confirmation Modal for Save */}
      <ConfirmationModal
        isOpen={isSaveConfirmOpen}
        onClose={() => setIsSaveConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        title={initialData ? "Update Asset" : "Create New Asset"}
        message={initialData 
          ? `Are you sure you want to update the details for asset ${formData.id}?`
          : `Are you sure you want to create a new asset with ID ${formData.id}?`
        }
        confirmText={initialData ? "Save Changes" : "Create Asset"}
        isDanger={false}
      />
    </>
  );
};

export default EquipmentModal;
