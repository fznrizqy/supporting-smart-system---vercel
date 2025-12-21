
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { User, UserRole } from '../types';
import { Users, UserPlus, Trash2, X, Shield, Mail, Lock, Edit2, Camera } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

interface UserManagementProps {
  currentUser: User;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
  const users = useLiveQuery(() => db.users.toArray());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Confirmation state for editing/adding
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{ name: string; email: string; role: UserRole; password: string; avatar?: string }>({
    name: '',
    email: '',
    role: UserRole.Analyst,
    password: '',
    avatar: undefined
  });

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: UserRole.Analyst, password: '', avatar: undefined });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '', // Keep empty to indicate no change unless user types
      avatar: user.avatar
    });
    setIsModalOpen(true);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        alert("Image is too large. Please upload an image smaller than 500KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    // Validate Password for New Users
    if (!editingUser && !formData.password) {
      alert("Password is required for new users.");
      return;
    }

    // Trigger confirmation for both Add and Edit
    setIsSaveConfirmOpen(true);
  };

  const executeSaveUser = async () => {
    try {
      // Check for duplicate email
      // FIX: Using manual find as custom API does not support .where()
      const allUsers = await db.users.toArray();
      const existing = allUsers.find((u: User) => u.email === formData.email);
      // If found, ensure it's not the user we are currently editing
      if (existing && (!editingUser || existing.id !== editingUser.id)) {
        alert('A user with this email already exists.');
        setIsSaveConfirmOpen(false); 
        return;
      }

      // Determine avatar URL (Use uploaded base64, existing URL, or generate default)
      let avatarUrl = formData.avatar;
      if (!avatarUrl) {
         avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=0ea5e9&color=fff`;
      }

      if (editingUser) {
        // Update Existing User
        const updates: Partial<User> = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          avatar: avatarUrl
        };
        // Only update password if provided
        if (formData.password.trim()) {
          updates.password = formData.password;
        }
        await db.users.update(editingUser.id, updates);
      } else {
        // Create New User
        await db.users.add({
          id: crypto.randomUUID(),
          name: formData.name,
          email: formData.email,
          role: formData.role,
          avatar: avatarUrl,
          password: formData.password
        });
      }

      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', role: UserRole.Analyst, password: '', avatar: undefined });
    } catch (error) {
      console.error("Failed to save user", error);
      alert("Failed to save user.");
    } finally {
      setIsSaveConfirmOpen(false);
    }
  };

  const handleDeleteUser = async () => {
    if (deleteId) {
      await db.users.delete(deleteId);
      setDeleteId(null);
    }
  };

  if (!users) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
            <Users size={24} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">User Management</h3>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-indigo-500/20"
        >
          <UserPlus size={16} />
          Add User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-900 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 rounded-l-lg">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-none hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full bg-slate-200 object-cover" />
                    <span className="font-medium text-slate-900 dark:text-white">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    user.role === UserRole.Admin 
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{user.email}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => openEditModal(user)}
                      className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-700 rounded-md transition-colors"
                      title="Edit User"
                    >
                      <Edit2 size={16} />
                    </button>
                    
                    {user.id !== currentUser.id ? (
                      <button 
                        onClick={() => setDeleteId(user.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Remove User"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-300 italic px-1.5">Current</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit User Modal Overlay */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6 transform scale-100 transition-transform duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Avatar Upload */}
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 shadow-inner flex items-center justify-center">
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Users size={40} className="text-slate-300 dark:text-slate-500" />
                    )}
                  </div>
                  
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer z-10">
                    <Camera size={24} className="text-white drop-shadow-md" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>

                  {formData.avatar && (
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, avatar: undefined})}
                      className="absolute bottom-0 right-0 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors z-20 transform translate-x-1/4 translate-y-1/4"
                      title="Remove photo"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                  placeholder="e.g. Jane Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    placeholder="user@labnexus.com"
                  />
                </div>
              </div>

               <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <div className="relative">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input
                    type="password"
                    // Required only for new users
                    required={!editingUser}
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    placeholder={editingUser ? "Leave blank to keep current" : "••••••••"}
                  />
                </div>
                {editingUser && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Only enter a value if you wish to reset the password.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                <div className="relative">
                   <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <select
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white appearance-none"
                  >
                    {Object.values(UserRole).map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg shadow-sm shadow-indigo-500/20 transition-colors"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteUser}
        title="Remove User"
        message="Are you sure you want to remove this user? They will no longer be able to log in to the system."
        confirmText="Remove User"
        isDanger={true}
      />

      {/* Confirmation Modal for Add / Edit Save */}
      <ConfirmationModal
        isOpen={isSaveConfirmOpen}
        onClose={() => setIsSaveConfirmOpen(false)}
        onConfirm={executeSaveUser}
        title={editingUser ? "Update User" : "Create New User"}
        message={editingUser 
          ? `Are you sure you want to update the profile for ${formData.name}?`
          : `Are you sure you want to create a new user account for ${formData.name}?`
        }
        confirmText={editingUser ? "Save Changes" : "Create User"}
        isDanger={false}
      />
    </div>
  );
};

export default UserManagement;
