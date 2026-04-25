import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, TrendingUp, ShieldCheck, Calculator, Info, Brain, ArrowRight, BarChart, CheckCircle2 } from 'lucide-react';
import { api } from './api';
import { firebaseService } from './firebaseService';
import { useAuth } from './useAuth';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, Legend, AreaChart, Area, CartesianGrid } from 'recharts';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function Simulators() {
  const [activeTab, setActiveTab] = useState<'budget' | 'tax' | 'investment'>('budget');

  const tabs = [
    { id: 'budget', name: 'Budget Planner', icon: Wallet },
    { id: 'tax', name: 'Tax Calculator (India)', icon: ShieldCheck },
    { id: 'investment', name: 'Wealth Projector', icon: TrendingUp },
  ];

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-bold">Financial Simulators</h1>
        <p className="text-neutral-500 mt-2">Practice real-life financial decisions without the risk.</p>
      </header>

      {/* Tabs */}
      <div className="flex p-1.5 bg-white/5 border border-white/5 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm",
              activeTab === tab.id 
                ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            <tab.icon size={18} />
            {tab.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'budget' && <BudgetSimulator key="budget" />}
        {activeTab === 'tax' && <TaxSimulator key="tax" />}
        {activeTab === 'investment' && <InvestmentSimulator key="investment" />}
      </AnimatePresence>
    </div>
  );
}

function BudgetSimulator() {
  const { user } = useAuth();
  const [salary, setSalary] = useState(50000);
  const [rent, setRent] = useState(15000);
  const [food, setFood] = useState(10000);
  const [entertainment, setEntertainment] = useState(5000);
  const [savings, setSavings] = useState(10000);
  const [results, setResults] = useState<{ remaining: number; score: number; insights: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const total = rent + food + entertainment + savings;
  const remaining = salary - total;

  const data = [
    { name: 'Rent', value: rent, color: '#f43f5e' },
    { name: 'Food', value: food, color: '#f59e0b' },
    { name: 'Entertainment', value: entertainment, color: '#ec4899' },
    { name: 'Savings', value: savings, color: '#10b981' },
    { name: 'Unallocated', value: Math.max(0, remaining), color: '#3b82f6' },
  ];

  const getSimulation = async () => {
    setLoading(true);
    try {
      const inputData = { 
        income: salary, 
        needs: rent + food, 
        wants: entertainment, 
        savings 
      };
      // For the requirement "Enhance budget simulation to provide more detailed actionable insights"
      // Wait, that's not what I'm doing in THIS turn, but the backend API budgetSimulation does a custom prompt.
      // We are just saving what the API returns in Firestore now.
      const respData = await api.budgetSimulation(inputData);
      setResults(respData);
      if (user) {
         await firebaseService.saveSimulationResult(user.uid, 'budget', inputData, respData, respData.score || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="glass-panel p-8 space-y-8">
        <h3 className="text-xl font-bold flex items-center gap-3">
          <Calculator size={22} className="text-blue-500" />
          Budget Inputs
        </h3>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-3 text-sm font-bold tracking-wide">
              <label className="text-slate-400">Monthly Salary (₹)</label>
              <span className="text-blue-400">₹{salary.toLocaleString()}</span>
            </div>
            <input type="range" min="10000" max="200000" step="5000" value={salary} onChange={e => setSalary(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: 'Rent', val: rent, set: setRent },
              { label: 'Food', val: food, set: setFood },
              { label: 'Entertain', val: entertainment, set: setEntertainment },
              { label: 'Savings', val: savings, set: setSavings },
            ].map(item => (
              <div key={item.label}>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block">{item.label}</label>
                <input 
                  type="number" 
                  value={item.val} 
                  onChange={e => item.set(Number(e.target.value))} 
                  className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/50 focus:outline-none text-white transition-all" 
                />
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={getSimulation}
          disabled={loading}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
        >
          <Brain size={20} />
          {loading ? 'Running simulation...' : 'Run Simulation'}
        </button>

        {results && (
          <div className="ai-bubble p-6 rounded-[24px] border border-blue-500/20 bg-blue-500/5 space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-widest text-[10px]">
                  <Brain size={16} />
                  Simulation Success
                </div>
                <div className="flex items-center gap-1 bg-blue-500/20 px-2 py-1 rounded text-blue-400 font-bold text-xs">
                  Score: {results.score}/100
                </div>
             </div>
             <div className="space-y-2">
                {results.insights.map((insight, i) => (
                  <div key={i} className="flex gap-2 text-sm text-blue-100/70 leading-snug">
                    <CheckCircle2 size={14} className="mt-1 flex-shrink-0 text-blue-400" />
                    <span>{insight}</span>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      <div className="glass-panel p-8 flex flex-col">
        <h3 className="text-xl font-bold mb-10 text-white">Expense Allocation</h3>
        <div className="flex-1 min-h-[300px]">
           <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-y-4 gap-x-8 w-full mt-10">
           {data.map(item => (
             <div key={item.name} className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-slate-200">₹{item.value.toLocaleString()}</span>
             </div>
           ))}
        </div>
        <div className="mt-10 pt-8 border-t border-white/5 w-full flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Disposable Balance</p>
              <p className={cn("text-4xl font-black mt-2", remaining >= 0 ? "text-emerald-400" : "text-rose-400")}>
                ₹{remaining.toLocaleString()}
              </p>
            </div>
            {remaining < 0 && (
              <div className="flex items-center gap-2 bg-rose-500/10 text-rose-500 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-500/20 animate-pulse">
                <Info size={14} />
                Budget Warning
              </div>
            )}
        </div>
      </div>
    </motion.div>
  );
}

function TaxSimulator() {
  const [income, setIncome] = useState(1200000);
  const [deductions, setDeductions] = useState(150000);

  // Simplified Indian Tax Calculation (FY 2024-25 estimates)
  const calcOldRegime = (inc: number, ded: number) => {
    let taxable = Math.max(0, inc - ded);
    let tax = 0;
    if (taxable <= 250000) tax = 0;
    else if (taxable <= 500000) tax = (taxable - 250000) * 0.05;
    else if (taxable <= 1000000) tax = 12500 + (taxable - 500000) * 0.2;
    else tax = 112500 + (taxable - 1000000) * 0.3;
    // Rebate u/s 87A
    if (taxable <= 500000) tax = 0;
    return tax * 1.04; // Cess 4%
  };

  const calcNewRegime = (inc: number) => {
    let taxable = Math.max(0, inc - 50000); // Standard deduction 50k
    let tax = 0;
    if (taxable <= 300000) tax = 0;
    else if (taxable <= 600000) tax = (taxable - 300000) * 0.05;
    else if (taxable <= 900000) tax = 15000 + (taxable - 600000) * 0.1;
    else if (taxable <= 1200000) tax = 45000 + (taxable - 900000) * 0.15;
    else if (taxable <= 1500000) tax = 90000 + (taxable - 1200000) * 0.2;
    else tax = 150000 + (taxable - 1500000) * 0.3;
    // Rebate u/s 87A (up to 7L income)
    if (taxable <= 700000) tax = 0;
    return tax * 1.04; // Cess 4%
  };

  const oldTax = calcOldRegime(income, deductions);
  const newTax = calcNewRegime(income);
  const taxSaved = Math.max(0, oldTax - newTax);

  const chartData = [
    { regime: 'Old Regime', tax: oldTax, color: '#475569' },
    { regime: 'New Regime', tax: newTax, color: '#3b82f6' },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="glass-panel p-8 space-y-10">
        <h3 className="text-xl font-bold flex items-center gap-3">
          <ShieldCheck size={22} className="text-orange-500" />
          Tax Inputs (India)
        </h3>
        
        <div className="space-y-8">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block">Annual Income (₹)</label>
            <input 
              type="number" 
              value={income} 
              onChange={e => setIncome(Number(e.target.value))} 
              className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-2xl font-black text-blue-400 focus:ring-2 focus:ring-blue-500/50 shadow-inner group transition-all" 
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block">Total Deductions (80C, 80D, HRA)</label>
            <input 
              type="number" 
              value={deductions} 
              onChange={e => setDeductions(Number(e.target.value))} 
              className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-2xl font-black text-slate-300 focus:ring-2 focus:ring-blue-500/50 transition-all" 
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 rounded-[32px] flex items-center justify-between shadow-2xl shadow-blue-600/20">
          <div>
            <p className="text-[10px] font-black opacity-70 uppercase tracking-[0.2em]">Annual Tax Savings</p>
            <p className="text-4xl font-black mt-2 leading-none">₹{taxSaved.toLocaleString()}</p>
          </div>
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-md">
            <TrendingUp size={32} />
          </div>
        </div>
      </div>

      <div className="glass-panel p-8">
        <h3 className="text-xl font-bold mb-10 text-white">Tax Regime Comparison</h3>
        <div className="h-72 w-full">
           <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="regime" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} dy={10} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                formatter={(val: number) => `₹${val.toLocaleString()}`}
              />
              <Bar dataKey="tax" radius={[12, 12, 0, 0]} barSize={60}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </ReBarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-5 mt-10">
           <div className="flex items-center justify-between p-5 rounded-2xl stat-card border-white/5">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Old Regime Payable</span>
             <span className="font-bold text-slate-200">₹{oldTax.toLocaleString()}</span>
           </div>
           <div className="flex items-center justify-between p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
               <span className="text-xs font-black text-blue-400 uppercase tracking-widest">New Regime Payable</span>
             </div>
             <span className="font-black text-blue-400">₹{newTax.toLocaleString()}</span>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function InvestmentSimulator() {
  const { user } = useAuth();
  const [monthlyInvest, setMonthlyInvest] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [results, setResults] = useState<{ finalValue: number; totalInvested: number; gain: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const getSimulation = async () => {
    setLoading(true);
    try {
      const risk = rate <= 8 ? 'safe' : rate <= 15 ? 'moderate' : 'aggressive';
      const inputData = { 
        monthly: monthlyInvest, 
        years, 
        risk: risk as any
      };
      const respData = await api.investmentSimulation(inputData);
      setResults(respData);
      if (user) {
         await firebaseService.saveSimulationResult(user.uid, 'investment', inputData, respData, 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Local fallback/real-time preview
  const calculateLocalFV = (pmt: number, r: number, n: number) => {
    const monthlyRate = r / 100 / 12;
    const months = n * 12;
    return pmt * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  };

  const currentFV = results ? results.finalValue : calculateLocalFV(monthlyInvest, rate, years);
  const currentTotal = results ? results.totalInvested : monthlyInvest * 12 * years;
  const currentGain = results ? results.gain : currentFV - currentTotal;

  const chartData = Array.from({ length: years + 1 }, (_, i) => ({
    year: i,
    total: calculateLocalFV(monthlyInvest, rate, i),
    invested: monthlyInvest * 12 * i
  }));

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="glass-panel p-8 space-y-10">
        <h3 className="text-xl font-bold flex items-center gap-3">
          <TrendingUp size={22} className="text-emerald-500" />
          Wealth Parameters
        </h3>
        
        <div className="space-y-10">
           <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-bold tracking-wide">
                <label className="text-slate-400">Monthly Investment (₹)</label>
                <span className="text-blue-400">₹{monthlyInvest.toLocaleString()}</span>
              </div>
              <input type="range" min="500" max="100000" step="500" value={monthlyInvest} onChange={e => setMonthlyInvest(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
           </div>

           <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-bold tracking-wide">
                <label className="text-slate-400">Expected Returns (Annual %)</label>
                <span className="text-emerald-400">{rate}%</span>
              </div>
              <input type="range" min="1" max="30" step="1" value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
              <div className="flex justify-between text-[9px] text-slate-500 font-black uppercase tracking-widest">
                <span>Safe (7%)</span>
                <span>Moderate (12%)</span>
                <span>Aggressive (20%+)</span>
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-bold tracking-wide">
                <label className="text-slate-400">Time Horizon (Years)</label>
                <span className="text-orange-400">{years} Years</span>
              </div>
              <input type="range" min="1" max="40" step="1" value={years} onChange={e => setYears(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500" />
           </div>
        </div>

        <button 
          onClick={getSimulation}
          disabled={loading}
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all disabled:opacity-50"
        >
          <TrendingUp size={20} />
          {loading ? 'Running simulation...' : 'Run Simulation'}
        </button>

        <div className="grid grid-cols-2 gap-6">
           <div className="p-6 rounded-2xl stat-card border-white/5">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Invested</p>
             <p className="text-2xl font-black text-slate-200">₹{currentTotal.toLocaleString()}</p>
           </div>
           <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
             <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Estimated Earnings</p>
             <p className="text-2xl font-black text-emerald-400">₹{currentGain.toLocaleString()}</p>
           </div>
        </div>
      </div>

      <div className="glass-panel p-8 flex flex-col">
        <h3 className="text-xl font-bold mb-10 text-white">Wealth Trajectory</h3>
        <div className="flex-1 h-80 min-h-[300px]">
           <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                formatter={(val: number) => `₹${val.toLocaleString()}`}
              />
              <Area type="monotone" dataKey="total" stroke="#10b981" fill="url(#colorTotal)" strokeWidth={4} />
              <Area type="monotone" dataKey="invested" stroke="#475569" fill="#1e293b" fillOpacity={0.3} strokeWidth={2} />
              <Legend verticalAlign="top" align="right" height={40} iconType="circle" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-10 pt-8 border-t border-white/5 relative overflow-hidden">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">End Balance Portfolio Value</p>
            <p className="text-5xl font-black text-blue-400 mt-2">₹{currentFV.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-4 leading-relaxed font-semibold italic">"Compound interest is the powerful engine that turns persistence into prosperity."</p>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </motion.div>
  );
}
