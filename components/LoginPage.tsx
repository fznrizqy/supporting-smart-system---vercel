import React, { useState } from 'react';
import { Microscope, ArrowRight, Lock, Mail, Loader2, Sun, Moon, User as UserIcon, CheckCircle, ShieldCheck, Fingerprint } from 'lucide-react';
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
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isRegistering) {
        if (!name.trim()) throw new Error("Corporate identity requires full legal name.");
        if (!email.trim() || !email.includes('@')) throw new Error("A valid corporate email address is required.");
        if (password.length < 4) throw new Error("Security policy: Password must be at least 4 characters.");

        const allUsers = await db.users.toArray();
        const existingUser = allUsers.find((u: User) => u.email === email.trim());
        if (existingUser) {
          throw new Error('Identity already exists. Please Sign-in.');
        }

        const newUser: User = {
          id: crypto.randomUUID(),
          name: name.trim(),
          email: email.trim(),
          password: password,
          role: UserRole.Analyst,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=0ea5e9&color=fff`
        };

        await db.users.add(newUser);
        setIsRegistering(false);
        setSuccessMessage('Corporate profile provisioned. Please authenticate.');
        setPassword('');
        setName(''); 
      } else {
        const allUsers = await db.users.toArray();
        const user = allUsers.find((u: User) => u.email === email.trim());

        if (user) {
          if (user.password === password || (!user.password && password === 'admin')) {
            // Log the login timestamp in a real app
            onLogin(user);
          } else {
             throw new Error('Authentication failed. Check credentials or contact IT.');
          }
        } else {
          throw new Error('Authorized user not found in the laboratory directory.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Identity verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
      
      {/* Visual Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-500/5 skew-x-12 transform origin-top"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-indigo-500/5 -skew-x-12 transform origin-bottom"></div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Left Side: Branding & Info */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-brand-900 dark:bg-slate-950 text-white relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="bg-sky-500 p-2.5 rounded-xl shadow-lg shadow-sky-500/40">
                <Microscope size={28} />
              </div>
              <span className="text-xl font-bold tracking-tight">Supporting Smart System <span className="text-sky-400 font-light">App</span></span>
            </div>
            
            <h2 className="text-4xl font-extrabold leading-tight mb-6">
              All-in-one.<br />
              <span className="text-sky-400">Smart App.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Organizing made better.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <ShieldCheck size={16} className="text-emerald-400" />
                </div>
                Secure and Reliable
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Fingerprint size={16} className="text-sky-400" />
                </div>
                Multi-User ready
              </div>
            </div>
          </div>

          <div className="relative z-10 text-xs text-slate-500 mt-12">
            © 2025 Supporting Smart System. All Rights Reserved.
          </div>

          {/* Abstract circle in background */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-10">
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {isRegistering ? 'Register User' : 'User Sign-in'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Please enter your credentials to access the app.
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all text-sm"
                    placeholder="E.g. Dr. Jordan Smith"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all text-sm"
                  placeholder="name@siglaboratory.co.id"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg text-red-600 dark:text-red-400 text-xs text-center font-medium animate-in fade-in">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 text-xs text-center font-medium flex items-center justify-center gap-2 animate-in fade-in">
                <CheckCircle size={14} />
                {successMessage}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-slate-900 dark:bg-sky-500 hover:bg-slate-800 dark:hover:bg-sky-600 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-6 group"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>{isRegistering ? 'Register' : 'Sign In'}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccessMessage(''); }}
              className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-sky-500 transition-colors"
            >
              {isRegistering ? 'Click here to Sign-in' : 'Click here to Register'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;