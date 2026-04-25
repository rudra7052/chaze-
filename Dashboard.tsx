import { Wallet, TrendingUp, ShieldCheck, Flame, Trophy, ChevronRight, BarChart3, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { firebaseService } from './firebaseService';
import { api, LessonData } from './api';
import { useAuth } from './useAuth';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState<LessonData[]>([]);
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (user && profile) {
        try {
          const fetchedLessons = await api.getLessons();
          setCourses(fetchedLessons);
          const sims = await firebaseService.getSimulationResults(user.uid);
          setSimulations(sims);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
    }
    loadData();
  }, [user, profile]);

  if (loading || !profile) return (
    <div className="flex items-center justify-center p-20">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // Aggregate user progress from new profile system
  const totalXP = profile.xp || 0;
  const allCompletedModulesIds = profile.completedLessons || [];
  const totalCompletedModules = allCompletedModulesIds.length;
  
  // Calculate level based on XP
  const level = profile.level !== undefined ? 'Level ' + profile.level : 'Level 0';

  // Calculate Financial Health Score
  let savingsRatioScore = 0;
  let spendingControlScore = 0;
  let investmentScore = 0;
  
  const budgetSim = simulations.find(s => s.type === 'budget');
  if (budgetSim && budgetSim.inputData) {
     const { income, needs, wants, savings } = budgetSim.inputData;
     if (income > 0) {
       const savingsRatio = savings / income;
       savingsRatioScore = Math.min(40, (savingsRatio / 0.20) * 40);
       
       const needsRatio = needs / income;
       const wantsRatio = wants / income;
       
       let control = 0;
       if (needsRatio <= 0.5) control += 15;
       else control += Math.max(0, 15 - ((needsRatio - 0.5) / 0.1) * 15);
       
       if (wantsRatio <= 0.3) control += 15;
       else control += Math.max(0, 15 - ((wantsRatio - 0.3) / 0.1) * 15);
       
       spendingControlScore = control;
     }
  }
  
  const investSim = simulations.find(s => s.type === 'investment');
  if (investSim) {
     investmentScore = 30;
  } else if (savingsRatioScore > 0) {
     investmentScore = 10; 
  }

  const hasSims = budgetSim || investSim;
  const healthScore = hasSims ? Math.round(savingsRatioScore + spendingControlScore + investmentScore) : 0;
  const healthLabel = !hasSims ? "Not Calculated" : healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : healthScore >= 40 ? "Fair" : "Needs Work";

  const stats = [
    { name: 'Total XP', value: totalXP, icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { name: 'Learning Streak', value: `${profile.lastActive ? 1 : 0} Days`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { name: 'Lessons Done', value: totalCompletedModules, icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
    { name: 'Current Level', value: level, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ];

  const chartData = [
    { day: 'Mon', xp: Math.max(0, totalXP - 400) },
    { day: 'Tue', xp: Math.max(0, totalXP - 300) },
    { day: 'Wed', xp: Math.max(0, totalXP - 200) },
    { day: 'Thu', xp: Math.max(0, totalXP - 100) },
    { day: 'Fri', xp: totalXP > 0 ? totalXP - 50 : 0 },
    { day: 'Sat', xp: totalXP },
    { day: 'Sun', xp: totalXP },
  ];

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile.name} 👋</h1>
          <p className="text-slate-400 mt-2">Learn finance by doing, not just reading.</p>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center gap-4 shadow-lg min-w-[280px]">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
             <Activity className="text-blue-400" size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Financial Health</p>
            {hasSims ? (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{healthScore}/100</span>
                <span className={cn(
                  "text-sm font-bold",
                  healthScore >= 80 ? "text-green-400" : healthScore >= 60 ? "text-blue-400" : healthScore >= 40 ? "text-yellow-400" : "text-red-400"
                )}>({healthLabel})</span>
              </div>
            ) : (
              <p className="text-sm text-slate-300 mt-1">Run a simulation to unlock</p>
            )}
          </div>
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
            {[
              { id: 'budget', title: 'Budget Management' },
              { id: 'investment', title: 'Investment Basics' },
              { id: 'tax', title: 'Tax Awareness' }
            ].map((course, i) => {
              // Group lessons by subject
              const subjectLessons = courses.filter((lesson) => lesson.subject === course.id);
              if (subjectLessons.length === 0) return null;
              
              const compCount = subjectLessons.filter((lesson) => allCompletedModulesIds.includes(lesson.id)).length;
              const percent = (compCount / subjectLessons.length) * 100;
              
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
                      <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{compCount}/{subjectLessons.length} Units</span>
                    </div>
                  </div>
                </Link>
              );
            })}
            
            {totalCompletedModules === 0 && (
               <div className="text-center p-6 bg-white/5 border border-white/5 rounded-2xl text-slate-400">
                  <p>Check out the subjects tab to start your first lesson!</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
