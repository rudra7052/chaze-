import { Wallet, TrendingUp, ShieldCheck, Flame, Trophy, ChevronRight, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { progressService, profileService } from '../lib/mockFirebase';
import { UserProgress, UserProfile } from '../types';
import { COURSES } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function Dashboard() {
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

  const stats = [
    { name: 'Total XP', value: progress.xp, icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { name: 'Learning Streak', value: `${progress.streak} Days`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { name: 'Lessons Done', value: progress.completedUnits.length, icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
    { name: 'Current Level', value: profile.level, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ];

  const chartData = [
    { day: 'Mon', xp: 400 },
    { day: 'Tue', xp: 300 },
    { day: 'Wed', xp: 600 },
    { day: 'Thu', xp: 800 },
    { day: 'Fri', xp: 500 },
    { day: 'Sat', xp: 900 },
    { day: 'Sun', xp: progress.xp % 1000 },
  ];

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile.displayName} 👋</h1>
          <p className="text-slate-400 mt-2">You're on a <span className="text-orange-400 font-bold">{progress.streak}-day streak!</span> Keep it up.</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-blue-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={stat.color} size={22} />
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.name}</p>
            <p className="text-2xl font-bold mt-1 text-white">{stat.value}</p>
            <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-white/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors"></div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Progress Chart */}
        <div className="lg:col-span-8 glass-panel p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="text-blue-500" size={20} />
              XP Progress
            </h3>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-semibold focus:ring-0">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }} 
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Area type="monotone" dataKey="xp" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Continue Learning */}
        <div className="lg:col-span-4 glass-panel p-8">
          <h3 className="text-lg font-bold mb-6">Course Status</h3>
          <div className="space-y-5">
            {Object.values(COURSES).map((course: any, i) => {
              const compCount = course.units.filter((u: any) => progress.completedUnits.includes(u.id)).length;
              const percent = (compCount / course.units.length) * 100;
              
              const colors = [
                'bg-indigo-500',
                'bg-blue-500 shadow-[0_0_10px_#3b82f6]',
                'bg-emerald-500'
              ];

              return (
                <Link to={`/subjects`} key={course.id} className="block group">
                  <div className="p-5 rounded-2xl stat-card hover:border-blue-500/30 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-sm text-slate-200">{course.title}</span>
                      <ChevronRight size={16} className="text-slate-500 group-hover:translate-x-1 group-hover:text-blue-400 transition-all" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-1000", colors[i % colors.length])} 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{compCount}/{course.units.length} Units</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
