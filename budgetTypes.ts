export type BudgetCategoryKind = 'needs' | 'wants' | 'savings';

export type BudgetPeriod = 'monthly' | 'yearly';

export type BudgetInsightTone = 'danger' | 'warning' | 'success' | 'info';

export interface BudgetCategory {
  id: string;
  label: string;
  amount: number;
  kind: BudgetCategoryKind;
  icon: string;
  color: string;
}

export interface BudgetBucketTotals {
  needs: number;
  wants: number;
  savings: number;
}

export interface BudgetRuleTargets {
  needs: number;
  wants: number;
  savings: number;
}

export interface BudgetHealthBreakdown {
  overall: number;
  savingsRatio: number;
  spendingControl: number;
  consistency: number;
}

export interface BudgetInsight {
  id: string;
  title: string;
  message: string;
  tone: BudgetInsightTone;
  amount?: number;
  categoryId?: string;
}

export interface BudgetOptimizationAction {
  id: string;
  categoryId: string;
  label: string;
  kind: BudgetCategoryKind;
  currentAmount: number;
  recommendedAmount: number;
  delta: number;
}

export interface BudgetScenario {
  label: string;
  period: BudgetPeriod;
  income: number;
  totalExpenses: number;
  remaining: number;
  categories: BudgetCategory[];
  groupTotals: BudgetBucketTotals;
  groupPercentages: BudgetBucketTotals;
  ruleTargets: BudgetRuleTargets;
  health: BudgetHealthBreakdown;
  largestCategoryId?: string;
  warnings: string[];
}

export interface BudgetWhatIfInput {
  categoryId: string;
  adjustmentPercent: number;
}

export interface BudgetSimulationRequest {
  income: number;
  period: BudgetPeriod;
  categories: BudgetCategory[];
  whatIf?: BudgetWhatIfInput | null;
}

export interface BudgetSimulationResponse {
  current: BudgetScenario;
  optimized: BudgetScenario;
  whatIf: BudgetScenario | null;
  optimizationActions: BudgetOptimizationAction[];
  insights: BudgetInsight[];
  aiSummary: string;
  generatedAt: string;
}
