import React, { useState, useEffect } from 'react';
import { Equipment, EquipmentStatus, UserRole, Division } from '../types';
import { STATUS_COLORS } from '../constants';
import { Edit2, Trash2, FileText, Download, Filter, Plus, Eye, X, ChevronDown, ChevronUp, RefreshCw, Image as ImageIcon, ChevronLeft, ChevronRight, QrCode } from 'lucide-react';
import PDFViewerModal from './PDFViewerModal';

interface EquipmentTableProps {
  equipment: Equipment[];
  onView: (item: Equipment) => void;
  onEdit: (item: Equipment) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onGenerateQR: (item: Equipment) => void; // New Prop
  userRole: UserRole;
  categories: string[];
}

const ITEMS_PER_PAGE = 10;

const EquipmentTable: React.FC<EquipmentTableProps> = ({ equipment, onView, onEdit, onDelete, onAdd, onGenerateQR, userRole, categories }) => {
  // Filter Visibility State
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Filter States
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterDivision, setFilterDivision] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterSerial, setFilterSerial] = useState('');
  const [filterLocation, setFilterLocation] = useState(''); // New Location Filter
  
  // Global Search
  const [searchTerm, setSearchTerm] = useState('');

  // PDF Viewer State
  const [pdfViewer, setPdfViewer] = useState<{
    isOpen: boolean;
    title: string;
    url: string | null;
  }>({
    isOpen: false,
    title: '',
    url: null
  });

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterDivision, filterCategory, filterBrand, filterModel, filterSerial, filterLocation, searchTerm]);

  // Derived filtered data
  const filteredEquipment = equipment.filter(item => {
    // 1. Specific Filters
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    const matchesDivision = filterDivision === 'All' || item.division === filterDivision;
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    
    // Helper to safely lowercase strings, handling undefined/null
    const itemBrand = (item.brand || '').toLowerCase();
    const itemModel = (item.model || '').toLowerCase();
    const itemSerial = (item.serialNumber || '').toLowerCase();
    const itemCategory = (item.category || '').toLowerCase();
    const itemId = (item.id || '').toLowerCase();
    const itemLocation = (item.location || '').toLowerCase();
    const itemPIC = (item.personInCharge || '').toLowerCase();
    const itemPoint = (item.calibrationMeasuringPoint || '').toLowerCase();

    const filterBrandLower = (filterBrand || '').toLowerCase();
    const filterModelLower = (filterModel || '').toLowerCase();
    const filterSerialLower = (filterSerial || '').toLowerCase();
    const filterLocationLower = (filterLocation || '').toLowerCase();
    const searchTermLower = (searchTerm || '').toLowerCase();

    const matchesBrand = itemBrand.includes(filterBrandLower);
    const matchesModel = itemModel.includes(filterModelLower);
    const matchesSerial = itemSerial.includes(filterSerialLower);
    const matchesLocation = filterLocation === '' || itemLocation.includes(filterLocationLower);

    // 2. Global Search (Checks multiple fields including the hidden 'location')
    const matchesSearch = searchTerm === '' || 
                          itemCategory.includes(searchTermLower) || 
                          itemId.includes(searchTermLower) ||
                          itemBrand.includes(searchTermLower) ||
                          itemModel.includes(searchTermLower) ||
                          itemSerial.includes(searchTermLower) ||
                          itemLocation.includes(searchTermLower) ||
                          itemPIC.includes(searchTermLower) ||
                          itemPoint.includes(searchTermLower);

    return matchesStatus && matchesDivision && matchesCategory && matchesBrand && matchesModel && matchesSerial && matchesLocation && matchesSearch;
  });

  const clearFilters = () => {
    setFilterStatus('All');
    setFilterDivision('All');
    setFilterCategory('All');
    setFilterBrand('');
    setFilterModel('');
    setFilterSerial('');
    setFilterLocation('');
    setSearchTerm('');
  };

  const activeFiltersCount = [
    filterStatus !== 'All',
    filterDivision !== 'All',
    filterCategory !== 'All',
    filterBrand !== '',
    filterModel !== '',
    filterSerial !== '',
    filterLocation !== ''
  ].filter(Boolean).length;

  // Pagination Logic
  const totalPages = Math.ceil(filteredEquipment.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredEquipment.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Permissions: Only Admin and Supporting can edit or delete
  const canEdit = userRole === UserRole.Admin || userRole === UserRole.Supporting;
  const canDelete = userRole === UserRole.Admin || userRole === UserRole.Supporting;

  const handleViewPdf = (url: string | undefined, title: string) => {
    if (url) {
      setPdfViewer({
        isOpen: true,
        title,
        url
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full transition-all duration-300">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <h2 className="text-lg font-bold text-slate-800 dark:text-white">Assets</h2>
           <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-xs font-mono">{filteredEquipment.length}</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Filter Group */}
          <div className="flex items-center">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors border ${
                isFilterOpen || activeFiltersCount > 0
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700'
              }`}
            >
              <Filter size={16} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                  {activeFiltersCount}
                </span>
              )}
              {isFilterOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            {activeFiltersCount > 0 && (
              <button 
                onClick={clearFilters}
                className="ml-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Reset all filters"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Quick Search */}
          <div className="relative flex-1 sm:w-64">
             <input 
              type="text" 
              placeholder="Quick search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block p-2 pr-8"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          {canEdit && (
            <button 
              onClick={onAdd}
              className="bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors whitespace-nowrap"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Asset</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Filter Panel */}
      {isFilterOpen && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</label>
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 p-2 focus:ring-2 focus:ring-sky-500 outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Division</label>
            <select 
              value={filterDivision}
              onChange={(e) => setFilterDivision(e.target.value)}
              className="w-full text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 p-2 focus:ring-2 focus:ring-sky-500 outline-none"
            >
              <option value="All">All Divisions</option>
              {Object.values(Division).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</label>
             <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 p-2 focus:ring-2 focus:ring-sky-500 outline-none"
            >
              <option value="All">All Statuses</option>
              {Object.values(EquipmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Brand</label>
             <input 
              type="text" 
              placeholder="Filter by brand..."
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="w-full text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 p-2 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

           <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Model</label>
             <input 
              type="text" 
              placeholder="Filter by model..."
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value)}
              className="w-full text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 p-2 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

           <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Serial No.</label>
             <input 
              type="text" 
              placeholder="Filter by S/N..."
              value={filterSerial}
              onChange={(e) => setFilterSerial(e.target.value)}
              className="w-full text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 p-2 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          {/* New Location Filter */}
          <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</label>
             <input 
              type="text" 
              placeholder="Filter by location..."
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 p-2 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <div className="col-span-full flex justify-end pt-2 border-t border-slate-200 dark:border-slate-700">
            <button 
              onClick={clearFilters}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded transition-colors"
            >
              <RefreshCw size={14} />
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-900 dark:text-slate-300 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3 w-16">Image</th>
              <th scope="col" className="px-6 py-3">ID / Category</th>
              <th scope="col" className="px-6 py-3">Brand / Model</th>
              <th scope="col" className="px-6 py-3">Serial No.</th>
              <th scope="col" className="px-6 py-3">Division</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Certificates</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <Filter size={24} className="text-slate-300" />
                    <p>No equipment found matching the current filters.</p>
                    <button onClick={clearFilters} className="text-sky-500 hover:underline text-xs mt-1">Clear all filters</button>
                  </div>
                </td>
              </tr>
            ) : (
              currentData.map((item) => (
                <tr key={item.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={20} className="text-slate-300 dark:text-slate-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    <div className="flex flex-col">
                      <span className="font-mono text-sky-600 dark:text-sky-400 text-xs">{item.id}</span>
                      <span>{item.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-slate-800 dark:text-slate-200">{item.brand}</span>
                      <span className="text-xs">{item.model}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {item.serialNumber}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                      {item.division}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 items-start">
                      {item.calibrationCert && (
                        <button 
                          onClick={() => handleViewPdf(item.calibrationCert, `${item.id} - Calibration Certificate`)}
                          title="View Calibration Cert" 
                          className="flex items-center gap-1.5 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 transition-colors group"
                        >
                          <FileText size={14} className="text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400" />
                          <span className="text-xs font-medium">Calibration</span>
                        </button>
                      )}
                      {item.verificationCert && (
                        <button 
                          onClick={() => handleViewPdf(item.verificationCert, `${item.id} - Verification Certificate`)}
                          title="View Verification Cert" 
                          className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors group"
                        >
                          <FileText size={14} className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                          <span className="text-xs font-medium">Verification</span>
                        </button>
                      )}
                      {!item.calibrationCert && !item.verificationCert && <span className="text-xs text-slate-300">-</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => onGenerateQR(item)} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-md transition-colors" title="Generate QR Code">
                        <QrCode size={16} />
                      </button>
                      <button onClick={() => onView(item)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-600 rounded-md transition-colors" title="View Details">
                        <Eye size={16} />
                      </button>
                      {canEdit && (
                        <button onClick={() => onEdit(item)} className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-600 rounded-md transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => onDelete(item.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-600 rounded-md transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      )}
                      {!canEdit && !canDelete && <span className="text-xs text-slate-400 ml-2"></span>}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + ITEMS_PER_PAGE, filteredEquipment.length)}</span> of <span className="font-medium">{filteredEquipment.length}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      <PDFViewerModal 
        isOpen={pdfViewer.isOpen}
        title={pdfViewer.title}
        fileUrl={pdfViewer.url}
        onClose={() => setPdfViewer(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default EquipmentTable;