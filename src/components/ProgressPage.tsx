import { useState, useEffect } from 'react';
import { progressService, profileService } from '../lib/mockFirebase';
import { UserProgress, UserProfile } from '../types';
import { COURSES, BADGES, LEVELS } from '../constants';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Star, Target, Zap, Award } from 'lucide-react';

export default function ProgressPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadData() {
      const prog = await progressService.getProgress('user-123');
      const prof = await profileService.getProfile('user-123');
      setProgress(prog);
      setProfile(prof);
    }
    loadData();
  }, []);

  if (!progress || !profile) return <div>Loading...</div>;

  const currentLevel = [...LEVELS].reverse().find(l => progress.xp >= l.minXp) || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1] || null;
  const progressToNext = nextLevel ? ((progress.xp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp)) * 100 : 100;

  const subjectProgress = Object.values(COURSES).map((course: any) => ({
    name: course.title,
    completed: course.units.filter((u: any) => progress.completedUnits.includes(u.id)).length,
    total: course.units.length,
    color: course.id === 'budget' ? '#10b981' : course.id === 'investment' ? '#3b82f6' : '#f59e0b'
  }));

  return (
    <div className="space-y-12 pb-20">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white">Your Progress</h1>
        <p className="text-slate-400 mt-2">Track your journey to financial literacy.</p>
      </header>

      {/* Level & XP Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[40px] p-10 text-white shadow-2xl shadow-blue-900/40 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-blue-400/20 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            <div>
              <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.3em]">Current Status</p>
              <h2 className="text-6xl font-black mt-3 tracking-tighter">{currentLevel.name}</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs font-black tracking-widest uppercase opacity-80">{progress.xp} / {nextLevel ? nextLevel.minXp : 'MAX'} XP</span>
                <span className="text-xs font-black tracking-widest uppercase text-blue-200">{nextLevel ? `${nextLevel.minXp - progress.xp} XP to ${nextLevel.name}` : 'Supreme Master'}</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-md border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-300 to-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                />
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-5 grid grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 flex flex-col items-center text-center">
              <Zap className="text-orange-400 mb-3" size={28} />
              <p className="text-4xl font-black">{progress.streak}</p>
              <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mt-2">Day Streak</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 flex flex-col items-center text-center">
              <Trophy className="text-yellow-400 mb-3" size={28} />
              <p className="text-4xl font-black">{profile.badges.length}</p>
              <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mt-2">Badges</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Course Completion Chart */}
        <div className="glass-panel p-8">
          <h3 className="text-xl font-bold mb-10 flex items-center gap-3">
            <Target className="text-blue-500" size={24} />
            Subject Mastery
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectProgress} layout="vertical" margin={{ left: 0, right: 60 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" hide domain={[0, 5]} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={140} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="completed" radius={[0, 10, 10, 0]} barSize={20}>
                  {subjectProgress.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Badges Collection */}
        <div className="glass-panel p-8">
          <h3 className="text-xl font-bold mb-10 flex items-center gap-3">
            <Award className="text-orange-500" size={24} />
            Hall of Fame
          </h3>
          <div className="grid grid-cols-3 gap-y-10 gap-x-6">
            {BADGES.map((badge) => {
              const earned = profile.badges.includes(badge.id);
              return (
                <div key={badge.id} className="flex flex-col items-center gap-4 group">
                  <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all duration-700 relative",
                    earned 
                      ? "bg-blue-500/10 border-blue-400 text-blue-400 scale-105 shadow-[0_0_20px_rgba(59,130,246,0.2)]" 
                      : "bg-white/5 border-white/5 text-slate-700 grayscale grayscale-[50%] opacity-30"
                  )}>
                    <Star size={32} fill={earned ? "currentColor" : "none"} className={cn(earned && "animate-pulse")} />
                    {earned && <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping opacity-20" />}
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] text-center px-2",
                    earned ? "text-blue-300" : "text-slate-600"
                  )}>
                    {badge.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
