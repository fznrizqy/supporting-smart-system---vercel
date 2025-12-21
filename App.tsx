import React, { useState, useEffect, useRef } from 'react';
import { HashRouter } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import EquipmentTable from './components/EquipmentTable';
import DashboardStats from './components/DashboardStats';
import EquipmentModal from './components/EquipmentModal';
import ConfirmationModal from './components/ConfirmationModal';
import AIAssistant from './components/AIAssistant';
import LoginPage from './components/LoginPage';
import UserManagement from './components/UserManagement';
import AuditLogViewer from './components/AuditLogViewer';
import ScheduleCalendar from './components/ScheduleCalendar';
import AssetLabelModal from './components/AssetLabelModal';
import { Equipment, User, UserRole, Theme, EquipmentStatus, Category, Division } from './types';
import { MOCK_USERS } from './constants';
import { Sparkles, Database, RefreshCw, AlertTriangle, Upload, Download, HardDrive, Loader2, Save } from 'lucide-react';
import { db } from './db';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
  const [theme, setTheme] = useState<Theme>('light');
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [userList, setUserList] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrItem, setQrItem] = useState<Equipment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const refreshData = async () => {
    try {
      const items = await db.equipment.toArray();
      const catSettings = await db.settings.get('categories');
      const users = await db.users.toArray();
      setEquipmentList(items);
      setCategories(catSettings ? catSettings.values : Object.values(Category));
      setUserList(users);
    } catch (err) {
      console.error("Data refresh failed", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        await db.init();
        await refreshData();
      } catch (error) {
        console.error("Failed to load database:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, []);

  const logAction = async (action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESET' | 'IMPORT', targetId: string, targetName: string, details?: string) => {
    try {
      await db.auditLogs.add({
        action, targetId, targetName,
        userId: currentUser.id, userName: currentUser.name,
        timestamp: new Date().toISOString(), details
      });

      let title = ''; let message = ''; let type: 'create' | 'update' | 'delete' | 'system' = 'system';
      switch(action) {
          case 'CREATE': title = 'New Asset Added'; message = `${currentUser.name} added ${targetName}`; type = 'create'; break;
          case 'UPDATE': title = 'Asset Updated'; message = `${currentUser.name} updated ${targetName}`; type = 'update'; break;
          case 'DELETE': title = 'Asset Deleted'; message = `${currentUser.name} deleted ${targetName}`; type = 'delete'; break;
          case 'IMPORT': title = 'Bulk Import'; message = `Imported equipment data.`; type = 'create'; break;
          case 'RESET': title = 'System Reset'; message = 'Database reset to factory defaults.'; type = 'system'; break;
      }
      await db.notifications.add({ title, message, timestamp: new Date().toISOString(), isRead: false, type });
    } catch (error) { console.error("Failed to log action:", error); }
  };

  const handleLogin = (user: User) => { setIsAuthenticated(true); setCurrentUser(user); };
  const handleLogout = () => { setIsAuthenticated(false); setActiveTab('dashboard'); };
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleAddCategory = async (newCat: string) => {
    if (!categories.includes(newCat) && newCat.trim() !== "") {
      const newCats = [...categories, newCat];
      setCategories(newCats);
      await db.settings.put({ id: 'categories', values: newCats });
    }
  };

  const handleSaveEquipment = async (data: Equipment) => {
    try {
      if (modalMode === 'edit' && editingItem) {
        await db.equipment.put(data);
        await logAction('UPDATE', data.id, `${data.brand} ${data.model}`);
      } else {
        await db.equipment.add(data);
        await logAction('CREATE', data.id, `${data.brand} ${data.model}`);
      }
      await refreshData();
    } catch (error) { alert("Error saving data. ID might already exist."); }
  };

  const executeDeleteEquipment = async () => {
    if (itemToDelete) {
      const item = equipmentList.find(e => e.id === itemToDelete);
      await db.equipment.delete(itemToDelete);
      if (item) await logAction('DELETE', item.id, `${item.brand} ${item.model}`);
      await refreshData();
      setItemToDelete(null);
    }
  };

  const executeResetDatabase = async () => {
    await db.reset();
    await refreshData();
    setIsResetModalOpen(false);
  };

  if (!isAuthenticated) return <LoginPage onLogin={handleLogin} theme={theme} toggleTheme={toggleTheme} />;
  if (isLoadingData) return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden bg-brand-50 dark:bg-slate-950">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} userRole={currentUser.role} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar currentUser={currentUser} theme={theme} toggleTheme={toggleTheme} onLogout={handleLogout} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth relative">
            <button onClick={() => setIsAIOpen(!isAIOpen)} className="fixed bottom-6 right-6 z-30 bg-sky-500 text-white p-3 rounded-full shadow-lg"><Sparkles /></button>
            <div className="max-w-7xl mx-auto space-y-6">
              {activeTab === 'dashboard' && <DashboardStats equipment={equipmentList} currentUser={currentUser} />}
              {activeTab === 'schedule' && <ScheduleCalendar equipmentList={equipmentList} currentUser={currentUser} users={userList} onLogAction={logAction} />}
              {activeTab === 'equipment' && <EquipmentTable equipment={equipmentList} onEdit={(i) => { setEditingItem(i); setModalMode('edit'); setIsModalOpen(true); }} onView={(i) => { setEditingItem(i); setModalMode('view'); setIsModalOpen(true); }} onDelete={(id) => { setItemToDelete(id); setIsDeleteModalOpen(true); }} onAdd={() => { setEditingItem(null); setModalMode('create'); setIsModalOpen(true); }} onGenerateQR={(i) => { setQrItem(i); setIsQRModalOpen(true); }} userRole={currentUser.role} categories={categories} />}
              {activeTab === 'audit' && <AuditLogViewer />}
              {activeTab === 'admin' && (
                <div className="space-y-6">
                  <UserManagement currentUser={currentUser} />
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold mb-4">Vercel Postgres Control</h3>
                    <button onClick={() => setIsResetModalOpen(true)} className="px-4 py-2 bg-red-500 text-white rounded-lg">Reset Database</button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
        <EquipmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveEquipment} initialData={editingItem} readOnly={modalMode === 'view'} categories={categories} onAddCategory={handleAddCategory} users={userList} />
        <AssetLabelModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} equipment={qrItem} />
        <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={executeDeleteEquipment} title="Delete Asset" message="Confirm deletion?" />
        <ConfirmationModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} onConfirm={executeResetDatabase} title="Wipe Database" message="Confirm full reset? All Postgres data will be lost." />
        <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} equipment={equipmentList} userRole={currentUser.role} />
      </div>
    </HashRouter>
  );
};

export default App;