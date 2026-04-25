export interface LessonRecord {
  id: string;
  subject: "budget" | "investment" | "tax";
  unitNumber: number;
  title: string;
  content: string;
  xpReward: number;
  difficulty: "easy" | "medium" | "hard";
}

export const LESSONS: LessonRecord[] = [
  {
    id: "budget_01",
    subject: "budget",
    unitNumber: 1,
    title: "Unit 01: Fundamentals of Budgeting",
    content: "Why Budgeting Is Important: Explain that budgeting clarifies spending vs income. Cite that budgets provide peace of mind and help save confidently. Emphasize that tracking expenses (even small ones) reveals waste (e.g. a $3 coffee adding up). Long-Term Wealth: Discuss how regular saving (the cornerstone of any budget) compounds into wealth. For example, saving even a small amount monthly (or investing via SIP) grows significantly over decades. Activity: Have students list all income sources (job, allowances) and recent expenses. Identify one expense to cut (e.g. reducing takeaway food) and calculate the annual savings. Example Scenario: A student with ₹10,000 monthly income creates a budget: ₹5,000 needs (food/rent), ₹3,000 wants (entertainment), and ₹2,000 saved.",
    xpReward: 50,
    difficulty: "easy"
  },
  {
    id: "budget_02",
    subject: "budget",
    unitNumber: 2,
    title: "Unit 02: Creating a Personal Budget",
    content: "List Income: Write down all net income (salary, freelance, family support). Identify Fixed Expenses: List fixed commitments (rent, tuition fees, EMIs, utilities). These are mandatory monthly costs. List Variable Expenses: Note variable or discretionary costs (groceries, transport, entertainment, clothes). Subtract & Allocate: Calculate net income - total expenses. From the remainder, decide saving/investment amount. Remember to 'pay yourself first' by allocating savings immediately. Adjust: If expenses exceed income, trim non-essentials. If you have extra, boost savings or pay off debt.",
    xpReward: 50,
    difficulty: "easy"
  },
  {
    id: "budget_03",
    subject: "budget",
    unitNumber: 3,
    title: "Unit 03: Managing and Optimizing Expenses",
    content: "Cut Non-essentials: Question small, habitual spendings. Needs vs Wants: Prioritize essentials (food, housing, education) and minimize luxuries during tight months. Shop Smart: Plan purchases (use lists), compare prices, buy in bulk or on sale. Reduce Waste: Turn off lights, fix leaks, use public transport. Energy-saving and frugal habits can noticeably cut bills. Avoid Fees: Automate bills to avoid late fees.",
    xpReward: 50,
    difficulty: "medium"
  },
  {
    id: "budget_04",
    subject: "budget",
    unitNumber: 4,
    title: "Unit 04: Saving and Financial Planning",
    content: "Setting Goals: Introduce goal-setting: short-term (0-3 years), medium (3-10 years), long-term (10+ years). Emergency Fund: Emphasize an immediate goal of building an emergency cushion (3-6 months of expenses). Wealth Goals: Longer-term goals might include buying a home, children's education or retirement. Strategies: Automate Savings, Use Tax-Saving Investments, Track Progress.",
    xpReward: 50,
    difficulty: "medium"
  },
  {
    id: "budget_05",
    subject: "budget",
    unitNumber: 5,
    title: "Unit 05: Advanced Budgeting & Real-Life Scenarios",
    content: "Managing Emergencies: In a crisis, first use emergency fund. If income stops, adjust discretionary expenses immediately. Irregular/Variable Income: Use a baseline budgeting approach. Use the lowest consistent month's income to make the monthly budget. Buffer Fund: Build a buffer for low-income months. Flexibility: Categorize expenses into must-pay and adjustable.",
    xpReward: 50,
    difficulty: "hard"
  },
  {
    id: "investment_01",
    subject: "investment",
    unitNumber: 1,
    title: "Unit 01: Introduction to Investment",
    content: "Investing means buying assets (stocks, bonds, property, etc.) to grow your wealth or generate income over time. Unlike simply saving money, investing gives your money a chance to work for you by potentially earning higher returns. Over the long term, compounding can substantially increase wealth. Why It Matters: Discuss goals like retirement. Risk Awareness: All investments carry risk, but higher-risk assets usually have higher average returns.",
    xpReward: 50,
    difficulty: "easy"
  },
  {
    id: "investment_02",
    subject: "investment",
    unitNumber: 2,
    title: "Unit 02: Risk, Return & Investment Principles",
    content: "Risk vs. Reward: Safer assets yield lower returns, and riskier assets potentially higher ones. Diversification is a way to manage risk. Measuring Risk: Volatility. Matching to Goals: Short-term goals demand liquid, low-risk investments. Medium-term might use a balanced mix. Long-term can lean into equities for growth.",
    xpReward: 50,
    difficulty: "medium"
  },
  {
    id: "investment_03",
    subject: "investment",
    unitNumber: 3,
    title: "Unit 03: Investment Options (Beginner Level)",
    content: "Fixed Deposits (FDs): Very safe but offers modest returns. Mutual Funds: Pools money from many investors. Equity Funds (high risk), Debt Funds (lower risk), Balanced Funds (mix). Public Provident Fund (PPF): Government-backed long-term savings scheme. National Savings Certificate (NSC).",
    xpReward: 50,
    difficulty: "medium"
  },
  {
    id: "investment_04",
    subject: "investment",
    unitNumber: 4,
    title: "Unit 04: Practical Investing Skills",
    content: "Financial Goals & Profile: Determine risk appetite. Documentation/KYC: PAN card, Aadhaar, bank account. Account Opening: Demat and trading account or Mutual Funds account. Placing Orders: Buy/sell shares or select a mutual fund and set up an SIP. Monitoring: Use online statements or apps to track investments.",
    xpReward: 50,
    difficulty: "hard"
  },
  {
    id: "investment_05",
    subject: "investment",
    unitNumber: 5,
    title: "Unit 05: Smart Investing & Real-Life Scenarios",
    content: "Long-Term Strategy: Emphasize discipline and patience. Diversification reduces risk. Review and Rebalance periodically. Market Cycles: bull (rising prices) vs bear (falling prices). Time in market beats timing the market.",
    xpReward: 50,
    difficulty: "hard"
  },
  {
    id: "tax_01",
    subject: "tax",
    unitNumber: 1,
    title: "Unit 01: Basics of Taxation",
    content: "Direct vs. Indirect Taxes: Income Tax is direct; GST is indirect. Income Tax Act 1961 governs direct taxation on income. Progressive Tax Structure: higher incomes pay higher rates.",
    xpReward: 50,
    difficulty: "easy"
  },
  {
    id: "tax_02",
    subject: "tax",
    unitNumber: 2,
    title: "Unit 02: Income & Tax Calculation",
    content: "Heads of Income: Salary, House Property, Capital Gains, Business/Profession, Other Sources. Gross Total Income is the sum. Exemptions & Deductions are subtracted to get Taxable Income. Tax is calculated using slab rates. New vs old tax regime.",
    xpReward: 50,
    difficulty: "medium"
  },
  {
    id: "tax_03",
    subject: "tax",
    unitNumber: 3,
    title: "Unit 03: Deductions & Tax-Saving Sections",
    content: "Section 80C: Up to 1.5 lakh for PPF, EPF, life insurance, ELSS, etc. Section 80D: Health insurance deductions. Other Sections: 80CCD, 80G, 80TTA. Investing in these serves dual purpose: wealth building and tax saving.",
    xpReward: 50,
    difficulty: "medium"
  },
  {
    id: "tax_04",
    subject: "tax",
    unitNumber: 4,
    title: "Unit 04: Filing Taxes & Compliance",
    content: "Filing Steps: Collect Documents (Form 16). Log in to e-filing portal. Select ITR Form. Fill data. Calculate tax & pay. Verify & Submit. Compliance Notes: filing deadline is usually July 31st.",
    xpReward: 50,
    difficulty: "hard"
  },
  {
    id: "tax_05",
    subject: "tax",
    unitNumber: 5,
    title: "Unit 05: Advanced Tax Concepts",
    content: "Capital Gains: Short-Term vs Long-Term. Assets held longer are usually taxed at lower rates. Loss Adjustment. Advanced Planning: Old vs New Regime. Tax-Saving Investments. Year-end Planning.",
    xpReward: 50,
    difficulty: "hard"
  }
];
