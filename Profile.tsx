import { useState, useEffect } from 'react';
import { firebaseService } from './firebaseService';
import { useAuth } from './useAuth';
import { User, Mail, Shield, Camera, Edit2, LogOut } from 'lucide-react';

export default function Profile() {
  const { user, profile, isDemoUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      if (user) {
        const prog = await firebaseService.getUserProgress(user.uid);
        setProgressData(prog);
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (!profile || !user || loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const totalXP = profile.xp || 0;

  const level = profile.level !== undefined ? 'Level ' + profile.level : 'Level 0';
  const badges = profile.badges || [];
  const streak = profile.lastActive ? 1 : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white">Account Settings</h1>
        <p className="text-slate-400 mt-2">Manage your profile and learning preferences.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-panel p-10 text-center relative overflow-hidden">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="w-32 h-32 rounded-full bg-blue-600/10 flex items-center justify-center text-5xl text-blue-400 font-black border-4 border-white/5 shadow-2xl relative z-10">
                {profile.name ? profile.name.charAt(0) : 'U'}
              </div>
              <button className="absolute bottom-1 right-1 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white border-4 border-[#0F1115] hover:scale-110 active:scale-90 transition-transform z-20 shadow-lg">
                <Camera size={16} />
              </button>
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl -z-0"></div>
            </div>
            <h2 className="text-2xl font-bold text-white leading-none">{profile.name}</h2>
            <p className="text-sm text-slate-500 mt-3 font-semibold uppercase tracking-widest">{level} Learner</p>
            
            <div className="mt-10 pt-10 border-t border-white/5 flex justify-between">
              <div className="text-center px-2">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">XP</p>
                <p className="text-lg font-black text-blue-400">{totalXP}</p>
              </div>
              <div className="text-center px-2 border-x border-white/5 flex-1 mx-2">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Streak</p>
                <p className="text-lg font-black text-orange-400">{streak}d</p>
              </div>
              <div className="text-center px-2">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Badges</p>
                <p className="text-lg font-black text-emerald-400">{badges.length}</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => void logout()}
            className="w-full flex items-center justify-center gap-3 py-5 px-6 rounded-[24px] bg-white/5 border border-white/5 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all font-bold group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            {isDemoUser ? 'Exit Demo Mode' : 'Sign Out'}
          </button>
        </div>

        <div className="lg:col-span-8 space-y-10">
          <div className="glass-panel p-10">
             <div className="flex items-center justify-between mb-10">
               <h3 className="text-xl font-bold text-white">Profile Identity</h3>
               <button className="text-blue-400 flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-blue-300">
                 <Edit2 size={16} />
                 Edit Profile
               </button>
             </div>

             <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Full Identity</label>
                    <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 group focus-within:border-blue-500/50 transition-all">
                      <User size={20} className="text-slate-500 group-focus-within:text-blue-400" />
                      <span className="font-bold text-slate-200">{profile.name}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Encrypted Email</label>
                    <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 group">
                      <Mail size={20} className="text-slate-500" />
                      <span className="font-bold text-slate-500 truncate">{user.email}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Academy Rank</label>
                    <div className="p-6 bg-gradient-to-r from-blue-600/20 to-transparent border border-blue-500/20 rounded-3xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Shield size={24} />
                      </div>
                      <div>
                        <span className="text-xl font-black text-blue-400 uppercase tracking-tighter">{level}</span>
                        <p className="text-[10px] font-black text-blue-300 opacity-60">Verified Member</p>
                      </div>
                    </div>
                  </div>
             </div>
          </div>

          <div className="glass-panel p-10 border-blue-500/20 bg-blue-500/[0.02]">
             <h3 className="text-xl font-bold mb-4 text-white">Advanced Security</h3>
             <p className="text-sm text-slate-500 mb-8 leading-relaxed">Your account architecture is hardened with Firebase Enterprise Zero-Trust protocols.</p>
             <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 hover:text-white transition-all">
               Change Access Key
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
