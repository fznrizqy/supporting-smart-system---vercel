
import React, { useState } from 'react';
import { Microscope, ArrowRight, Lock, Mail, Loader2, Sun, Moon, User as UserIcon, CheckCircle } from 'lucide-react';
import { User, Theme, UserRole } from '../types';
import { db } from '../db';

interface LoginPageProps {
  onLogin: (user: User) => void;
  theme: Theme;
  toggleTheme: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, theme, toggleTheme }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      if (isRegistering) {
        // --- Registration Logic ---
        if (!name.trim()) throw new Error("Full name is required.");
        if (!email.trim()) throw new Error("Email is required.");
        if (!password) throw new Error("Password is required.");

        // Check if email exists
        // FIX: Using manual find as custom API does not support .where()
        const allUsers = await db.users.toArray();
        const existingUser = allUsers.find((u: User) => u.email === email.trim());
        if (existingUser) {
          throw new Error('This email is already registered. Please sign in.');
        }

        // Create new user (Default to Analyst)
        const newUser: User = {
          id: crypto.randomUUID(),
          name: name.trim(),
          email: email.trim(),
          password: password,
          role: UserRole.Analyst,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=0ea5e9&color=fff`
        };

        await db.users.add(newUser);
        
        // Successful Registration: Switch to login mode
        setIsRegistering(false);
        setSuccessMessage('Registration successful! Please sign in to continue.');
        setPassword(''); // Clear password so they have to type it again
        setName(''); 

      } else {
        // --- Login Logic ---
        // FIX: Using manual find as custom API does not support .where()
        const allUsers = await db.users.toArray();
        const user = allUsers.find((u: User) => u.email === email.trim());

        if (user) {
          // Verify Password
          if (user.password && user.password === password) {
            onLogin(user);
          } else if (!user.password && password === '1234') {
            // Fallback for legacy data without passwords
            onLogin(user);
          } else {
             throw new Error('Invalid credentials');
          }
        } else {
          throw new Error('User not found. Please check your email or register.');
        }
      }

    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccessMessage('');
    setPassword(''); // Clear password for security
  };

  return (
    <div className="min-h-screen bg-brand-50 dark:bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-300">
      
      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg hover:scale-105 transition-all z-20"
        title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-sky-400/20 dark:bg-sky-900/20 blur-[120px] transition-colors duration-500"></div>
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 dark:bg-indigo-900/20 blur-[100px] transition-colors duration-500"></div>
      </div>

      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-300 flex flex-col">
        <div className="p-8 flex-1">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-sky-500/30">
              <Microscope size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Supporting Smart System</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {isRegistering ? 'Create your account' : 'Sign in to your account'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            
            {/* Name Field - Only for Registration */}
            {isRegistering && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2 fade-in">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                    placeholder="e.g. John Doe"
                    required={isRegistering}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400 text-sm text-center flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-1">
                <CheckCircle size={16} />
                {successMessage}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-sky-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>{isRegistering ? 'Creating Account...' : 'Signing in...'}</span>
                </>
              ) : (
                <>
                  <span>{isRegistering ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-200 dark:border-slate-700 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
                {isRegistering ? "Already have an account? " : "Don't have an account? "}
                <button 
                  onClick={toggleMode}
                  className="font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                >
                  {isRegistering ? "Sign In" : "Register"}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
