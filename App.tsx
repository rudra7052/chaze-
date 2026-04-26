import { LayoutDashboard, BookOpen, TrendingUp, Calculator, BarChart3, User, LogOut, Search, MessageSquare, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from './useAuth';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './firebase';

// Helper for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getLoginErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: string }).code)
    : '';
  const message = error instanceof Error ? error.message : 'Please try again.';
  const host = window.location.hostname;
  const isRawIpHost = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(host);

  if (code === 'auth/unauthorized-domain') {
    if (isRawIpHost) {
      return `Google sign-in is not enabled for ${host}. Add an authorized hostname in Firebase Auth settings and open the site with that hostname instead of the raw IP.`;
    }

    return `Google sign-in is not enabled for ${host}. Add this host to Firebase Authentication > Settings > Authorized domains.`;
  }

  if (code === 'auth/popup-closed-by-user') {
    return 'The Google sign-in window was closed before the login finished.';
  }

  if (code === 'auth/popup-blocked') {
    return 'This browser blocked the Google sign-in popup. Use Guest Mode here, or open the app in Chrome or Safari for real Google login.';
  }

  if (code === 'auth/network-request-failed') {
    return 'The sign-in request could not reach Firebase. Check your internet connection and try again.';
  }

  return message;
}

// Pages
import Dashboard from './Dashboard';
import Subjects from './Subjects';
import LessonPage from './LessonPage';
import Simulators from './Simulators';
import ProgressPage from './ProgressPage';
import Profile from './Profile';
import FloatChat from './FloatChat';

export default function App() {
  const location = useLocation();
  const { user, profile, loading, startGuestMode } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const host = window.location.hostname;
  const isRawIpHost = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(host);
  const isLanHost = host !== 'localhost' && host !== '127.0.0.1';
  
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
      setLoginError(getLoginErrorMessage(error));
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1115] text-[#E2E8F0] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-[#0F1115] text-[#E2E8F0] flex items-center justify-center p-6">
        <div className="max-w-md w-full glass-panel p-10 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-white text-3xl mx-auto shadow-lg shadow-blue-500/20 mb-6">
            C
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Chaze X</h1>
          <p className="text-slate-400 mb-8">Sign in to save your account, or continue as a guest to explore the app right away.</p>
          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
          >
            {isLoggingIn ? 'Opening Google Sign-In...' : 'Sign in with Google'}
          </button>
          <button
            onClick={startGuestMode}
            className="w-full mt-3 py-4 bg-white/5 hover:bg-white/10 text-slate-200 rounded-xl font-bold transition-colors border border-white/10"
          >
            Continue as Guest
          </button>
          {loginError && (
            <p className="mt-4 text-sm text-rose-300 leading-relaxed">{loginError}</p>
          )}
          <p className="mt-4 text-xs text-slate-400 leading-relaxed">
            Guest mode keeps your profile, simulator activity, and progress in this browser so you can use the app without Google sign-in.
          </p>
          {isLanHost && (
            <p className="mt-4 text-xs text-amber-200/80 leading-relaxed">
              Accessing this app from another device may require this host to be added in Firebase Authentication authorized domains.
            </p>
          )}
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Subjects', icon: BookOpen, path: '/subjects' },
    { name: 'Simulators', icon: Calculator, path: '/simulators' },
    { name: 'Progress', icon: BarChart3, path: '/progress' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#E2E8F0] font-sans">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-white/5 bg-[#0F1115] p-6 overflow-y-auto z-50">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            C
          </div>
          <span className="text-xl font-bold tracking-tight text-white uppercase">Chaze X</span>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative",
                location.pathname === item.path 
                  ? "bg-blue-500/15 text-blue-400 border-r-4 border-blue-500" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={20} className={cn(
                "transition-transform duration-200 group-hover:scale-110",
                location.pathname === item.path ? "text-blue-400" : "text-slate-500"
              )} />
              <span className="font-semibold text-sm">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-8 p-4 glass-panel flex flex-col gap-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Account Progress</div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Level {profile?.level ?? 0}</span>
            <span className="text-blue-400 text-[10px] font-bold">{profile?.xp || 0} XP</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className={`bg-blue-500 h-full transition-all duration-1000`} style={{ width: `${Math.max(5, ((profile?.xp || 0) % 100))}%` }}></div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64 min-h-screen">
        <header className="h-20 border-b border-white/5 bg-[#0F1115]/80 backdrop-blur-md sticky top-0 z-40 px-10 flex items-center justify-between">
          <div className="flex items-center gap-4 bg-white/5 px-5 py-2.5 rounded-xl w-96 border border-white/5">
            <Search size={18} className="text-slate-500" />
            <input 
              type="text" 
              placeholder="Search concepts, tools..." 
              className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-300 placeholder:text-slate-600"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Badges Earned</div>
              <div className="flex gap-1 justify-end">
                {Array.from({ length: Math.max(1, profile?.badges?.length || 1) }).map((_, i) => (
                  <div key={i} className="w-1.5 h-4 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.4)]"></div>
                ))}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-blue-500 p-0.5 shadow-[0_0_15px_rgba(59,130,246,0.3)] bg-slate-800 flex items-center justify-center font-bold text-blue-400 overflow-hidden">
               {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/subjects" element={<Subjects />} />
                <Route path="/lesson/:id" element={<LessonPage />} />
                <Route path="/simulators" element={<Simulators />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <FloatChat />
    </div>
  );
}
