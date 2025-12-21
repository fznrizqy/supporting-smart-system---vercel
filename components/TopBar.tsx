import React, { useState, useRef, useEffect } from 'react';
import { Bell, Sun, Moon, LogOut, Check, X, Info, PlusCircle, Trash2, Edit2 } from 'lucide-react';
import { User, Theme, Notification } from '../types';
import { db } from '../db';

interface TopBarProps {
  currentUser: User;
  theme: Theme;
  toggleTheme: () => void;
  onLogout: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ currentUser, theme, toggleTheme, onLogout }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotes = async () => {
    try {
      const data = await db.notifications.toArray(20);
      setNotifications(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchNotes();
    const interval = setInterval(fetchNotes, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsNotificationsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead).map(n => ({ ...n, isRead: true }));
    if (unread.length > 0) {
      await db.notifications.bulkPut(unread);
      await fetchNotes();
    }
  };

  const markRead = async (id: number) => {
    await db.notifications.update(id, { isRead: true });
    await fetchNotes();
  };

  const deleteNotification = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await db.notifications.delete(id);
    await fetchNotes();
  };

  const getTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-end px-6 relative z-30">
      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="p-2 text-slate-500 hover:text-sky-600 rounded-full">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); if(!isNotificationsOpen) fetchNotes(); }} className="p-2 relative text-slate-500">
            <Bell size={20} />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                <h3 className="text-sm font-bold">Notifications</h3>
                <button onClick={markAllRead} className="text-xs text-sky-500">Mark all read</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">No updates</div>
                ) : (
                  <ul>
                    {notifications.map(note => (
                      <li key={note.id} onClick={() => note.id && !note.isRead && markRead(note.id)} className={`p-3 border-b dark:border-slate-800 relative cursor-pointer ${!note.isRead ? 'bg-sky-50/50 dark:bg-sky-900/10' : ''}`}>
                        <p className="text-sm font-bold">{note.title}</p>
                        <p className="text-xs text-slate-500">{note.message}</p>
                        <span className="text-[10px] text-slate-400">{getTimeAgo(note.timestamp)}</span>
                        <button onClick={(e) => note.id && deleteNotification(e, note.id)} className="absolute right-2 top-2 text-slate-300 hover:text-red-500"><X size={12} /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 border-l pl-4 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold">{currentUser.name}</p>
            <p className="text-xs text-slate-500">{currentUser.role}</p>
          </div>
          <img src={currentUser.avatar} className="w-8 h-8 rounded-full" />
          <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500"><LogOut size={18} /></button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;