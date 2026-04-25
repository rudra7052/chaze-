export const COURSES: Record<string, any> = {
  budget: {
    id: 'budget',
    title: 'Budget Management',
    units: [
      { id: 'b1', title: 'Fundamentals of Budgeting', description: 'Learn why budgeting is the foundation of wealth.' },
      { id: 'b2', title: 'Creating a Personal Budget', description: 'Step-by-step guide to building your first budget.' },
      { id: 'b3', title: 'Managing and Optimizing Expenses', description: 'Strategies to cut costs and spend smarter.' },
      { id: 'b4', title: 'Saving and Financial Planning', description: 'How to set and reach your financial goals.' },
      { id: 'b5', title: 'Advanced Budgeting & Real-Life Scenarios', description: 'Handling emergencies and variable income.' }
    ]
  },
  investment: {
    id: 'investment',
    title: 'Investment Basics',
    units: [
      { id: 'i1', title: 'Introduction to Investment', description: 'What is investing and why do it?' },
      { id: 'i2', title: 'Risk, Return & Investment Principles', description: 'Balancing risk with your financial dreams.' },
      { id: 'i3', title: 'Investment Options (Beginner Level)', description: 'FDs, Mutual Funds, and more.' },
      { id: 'i4', title: 'Practical Investing Skills', description: 'How to actually start investing.' },
      { id: 'i5', title: 'Smart Investing & Real-Life Scenarios', description: 'Long-term strategies and market cycles.' }
    ]
  },
  tax: {
    id: 'tax',
    title: 'Tax Awareness (India)',
    units: [
      { id: 't1', title: 'Basics of Taxation in India', description: 'Direct vs Indirect tax and the IT Act.' },
      { id: 't2', title: 'Income & Tax Calculation', description: 'How your taxable income is determined.' },
      { id: 't3', title: 'Deductions & Tax Saving Sections', description: '80C, 80D, and how to save tax.' },
      { id: 't4', title: 'Filing Taxes & Compliance', description: 'The process of filing ITR.' },
      { id: 't5', title: 'Advanced Tax Concepts & Real-Life Scenarios', description: 'Capital gains and complex tax planning.' }
    ]
  }
};

export const XP_PER_UNIT = 100;
export const XP_PER_QUIZ_CORRECT = 20;

export const LEVELS = [
  { name: 'Beginner', minXp: 0 },
  { name: 'Intermediate', minXp: 500 },
  { name: 'Advanced', minXp: 1500 },
  { name: 'Pro', minXp: 3000 }
];

export const BADGES = [
  { id: 'budget-master', name: 'Budget Master', icon: 'Wallet' },
  { id: 'smart-investor', name: 'Smart Investor', icon: 'TrendingUp' },
  { id: 'tax-saver', name: 'Tax Saver', icon: 'ShieldCheck' }
];
