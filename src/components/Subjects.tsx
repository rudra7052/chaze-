import { Wallet, TrendingUp, ShieldCheck, ChevronRight, Lock } from 'lucide-react';
import { COURSES } from '../constants';
import { progressService } from '../lib/mockFirebase';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Subjects() {
  const [completedUnits, setCompletedUnits] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      const prog = await progressService.getProgress('user-123');
      setCompletedUnits(prog.completedUnits);
    }
    loadData();
  }, []);

  const subjects = [
    { id: 'budget', title: 'Budget Management', icon: Wallet, color: 'bg-emerald-500', text: 'text-emerald-500', units: COURSES.budget.units },
    { id: 'investment', title: 'Investment Basics', icon: TrendingUp, color: 'bg-blue-500', text: 'text-blue-500', units: COURSES.investment.units },
    { id: 'tax', title: 'Tax Awareness (India)', icon: ShieldCheck, color: 'bg-orange-500', text: 'text-orange-500', units: COURSES.tax.units },
  ];

  return (
    <div className="space-y-12 pb-20">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Explore Subjects</h1>
        <p className="text-slate-400 mt-2">Pick a topic and start your financial journey.</p>
      </header>

      <div className="space-y-20">
        {subjects.map((subj, si) => (
          <section key={subj.id} className="space-y-8">
            <div className="flex items-center gap-6">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", subj.color)}>
                <subj.icon size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{subj.title}</h2>
                <p className="text-sm text-slate-500">Master the essentials of {subj.id === 'tax' ? 'taxes' : subj.id}.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subj.units.map((unit: any, ui: number) => {
                const isCompleted = completedUnits.includes(unit.id);
                // Unlock logic: first unit unlocked, or previous unit completed
                const isUnlocked = ui === 0 || completedUnits.includes(subj.units[ui - 1].id);
                
                return (
                  <motion.div
                    key={unit.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: ui * 0.05 }}
                  >
                    <Link
                      to={isUnlocked ? `/subjects/${subj.id}/${unit.id}` : '#'}
                      className={cn(
                        "block p-8 rounded-[32px] border relative group transition-all duration-300",
                        isUnlocked 
                          ? "glass-panel border-white/5 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] cursor-pointer" 
                          : "bg-slate-900/50 border-white/5 opacity-40 cursor-not-allowed"
                      )}
                    >
                      {!isUnlocked && (
                        <div className="absolute top-6 right-6 text-slate-600">
                          <Lock size={20} />
                        </div>
                      )}
                      {isCompleted && (
                        <div className="absolute top-6 right-6 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-emerald-400/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                          COMPLETED
                        </div>
                      )}
                      
                      <span className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Unit 0{ui + 1}</span>
                      <h3 className="text-xl font-bold mt-3 text-slate-100 group-hover:text-blue-400 transition-colors">{unit.title}</h3>
                      <p className="text-sm text-slate-400 mt-3 leading-relaxed line-clamp-2">{unit.description}</p>
                      
                      <div className="mt-8 flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-400 opacity-0 group-hover:opacity-100 transition-all translate-x--2 group-hover:translate-x-0">Start Learning</span>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                          <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
