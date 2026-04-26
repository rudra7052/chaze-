import {
  Banknote,
  BriefcaseBusiness,
  Car,
  Film,
  Fuel,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  LucideIcon,
  PiggyBank,
  Plane,
  Receipt,
  ShoppingBag,
  Smartphone,
  Soup,
  WalletCards,
} from 'lucide-react';
import { BudgetCategory, BudgetCategoryKind } from './budgetTypes';

export interface BudgetIconOption {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

export const BUDGET_ICON_OPTIONS: BudgetIconOption[] = [
  { value: 'home', label: 'Home', icon: Home, color: '#60A5FA' },
  { value: 'food', label: 'Food', icon: Soup, color: '#F97316' },
  { value: 'subscription', label: 'Subscription', icon: Smartphone, color: '#8B5CF6' },
  { value: 'travel', label: 'Travel', icon: Plane, color: '#14B8A6' },
  { value: 'shopping', label: 'Shopping', icon: ShoppingBag, color: '#EC4899' },
  { value: 'health', label: 'Health', icon: HeartPulse, color: '#F43F5E' },
  { value: 'fuel', label: 'Fuel', icon: Fuel, color: '#F59E0B' },
  { value: 'salary', label: 'Income', icon: BriefcaseBusiness, color: '#22C55E' },
  { value: 'savings', label: 'Savings', icon: PiggyBank, color: '#10B981' },
  { value: 'investment', label: 'Investment', icon: Landmark, color: '#06B6D4' },
  { value: 'rent', label: 'Rent', icon: WalletCards, color: '#3B82F6' },
  { value: 'education', label: 'Education', icon: GraduationCap, color: '#6366F1' },
  { value: 'bills', label: 'Bills', icon: Receipt, color: '#F59E0B' },
  { value: 'entertainment', label: 'Entertainment', icon: Film, color: '#A855F7' },
  { value: 'transport', label: 'Transport', icon: Car, color: '#38BDF8' },
  { value: 'cash', label: 'Cash', icon: Banknote, color: '#34D399' },
];

export const BUDGET_KIND_META: Record<BudgetCategoryKind, { label: string; accent: string; chip: string }> = {
  needs: {
    label: 'Needs',
    accent: 'text-sky-300',
    chip: 'bg-sky-500/15 text-sky-200 border-sky-400/20',
  },
  wants: {
    label: 'Wants',
    accent: 'text-fuchsia-300',
    chip: 'bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-400/20',
  },
  savings: {
    label: 'Savings',
    accent: 'text-emerald-300',
    chip: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/20',
  },
};

export function createBudgetCategory(partial: Partial<BudgetCategory> & Pick<BudgetCategory, 'label' | 'kind'>): BudgetCategory {
  const fallbackIcon = partial.kind === 'savings'
    ? BUDGET_ICON_OPTIONS.find((option) => option.value === 'savings')
    : partial.kind === 'wants'
      ? BUDGET_ICON_OPTIONS.find((option) => option.value === 'entertainment')
      : BUDGET_ICON_OPTIONS.find((option) => option.value === 'rent');
  const matchedIcon = BUDGET_ICON_OPTIONS.find((option) => option.value === partial.icon) || fallbackIcon || BUDGET_ICON_OPTIONS[0];

  return {
    id: partial.id || `category-${Math.random().toString(36).slice(2, 9)}`,
    label: partial.label,
    amount: partial.amount ?? 0,
    kind: partial.kind,
    icon: matchedIcon.value,
    color: partial.color || matchedIcon.color,
  };
}

export const DEFAULT_BUDGET_CATEGORIES: BudgetCategory[] = [
  createBudgetCategory({ label: 'Rent', kind: 'needs', amount: 18000, icon: 'rent' }),
  createBudgetCategory({ label: 'Groceries', kind: 'needs', amount: 9000, icon: 'food' }),
  createBudgetCategory({ label: 'Subscriptions', kind: 'wants', amount: 2500, icon: 'subscription' }),
  createBudgetCategory({ label: 'Weekend Fun', kind: 'wants', amount: 4000, icon: 'entertainment' }),
  createBudgetCategory({ label: 'Emergency Fund', kind: 'savings', amount: 10000, icon: 'savings' }),
];
