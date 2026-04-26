import { createBudgetCategory } from './budgetConfig';
import {
  BudgetBucketTotals,
  BudgetCategory,
  BudgetCategoryKind,
  BudgetInsight,
  BudgetInsightTone,
  BudgetOptimizationAction,
  BudgetScenario,
  BudgetSimulationRequest,
  BudgetSimulationResponse,
  BudgetWhatIfInput,
} from './budgetTypes';

const TARGET_SPLIT = {
  needs: 0.5,
  wants: 0.3,
  savings: 0.2,
} satisfies Record<BudgetCategoryKind, number>;

export function emptyBudgetTotals(): BudgetBucketTotals {
  return { needs: 0, wants: 0, savings: 0 };
}

function roundAmount(value: number) {
  return Math.round(value);
}

function sanitizeAmount(value: number) {
  return Math.max(0, roundAmount(value));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeCategory(category: BudgetCategory): BudgetCategory {
  return {
    ...category,
    label: category.label.trim() || 'Untitled Category',
    amount: sanitizeAmount(Number.isFinite(category.amount) ? category.amount : 0),
  };
}

export function formatCurrency(value: number) {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

export function getBudgetHealthLabel(score: number) {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Healthy';
  if (score >= 45) return 'Watchful';
  return 'Needs Attention';
}

export function getBudgetHealthTone(score: number): BudgetInsightTone {
  if (score >= 80) return 'success';
  if (score >= 65) return 'info';
  if (score >= 45) return 'warning';
  return 'danger';
}

export function getBucketTotals(categories: BudgetCategory[]) {
  return categories.reduce<BudgetBucketTotals>((totals, category) => {
    totals[category.kind] += category.amount;
    return totals;
  }, emptyBudgetTotals());
}

function getBucketPercentages(income: number, totals: BudgetBucketTotals): BudgetBucketTotals {
  if (income <= 0) {
    return emptyBudgetTotals();
  }

  return {
    needs: Number(((totals.needs / income) * 100).toFixed(1)),
    wants: Number(((totals.wants / income) * 100).toFixed(1)),
    savings: Number(((totals.savings / income) * 100).toFixed(1)),
  };
}

function getLargestCategory(categories: BudgetCategory[], kind?: BudgetCategoryKind) {
  return categories
    .filter((category) => (kind ? category.kind === kind : true))
    .sort((left, right) => right.amount - left.amount)[0];
}

export function calculateBudgetScenario(input: {
  label: string;
  income: number;
  categories: BudgetCategory[];
  period: BudgetSimulationRequest['period'];
}): BudgetScenario {
  const categories = input.categories
    .map(normalizeCategory)
    .filter((category) => category.label.length > 0);
  const income = sanitizeAmount(input.income);
  const groupTotals = getBucketTotals(categories);
  const totalExpenses = groupTotals.needs + groupTotals.wants + groupTotals.savings;
  const remaining = roundAmount(income - totalExpenses);
  const groupPercentages = getBucketPercentages(income, groupTotals);
  const ruleTargets = {
    needs: sanitizeAmount(income * TARGET_SPLIT.needs),
    wants: sanitizeAmount(income * TARGET_SPLIT.wants),
    savings: sanitizeAmount(income * TARGET_SPLIT.savings),
  };

  const savingsRatioScore = income > 0
    ? clamp((groupTotals.savings / Math.max(ruleTargets.savings, 1)) * 40, 0, 40)
    : 0;

  const needsDeviation = income > 0 ? Math.max(0, groupTotals.needs - ruleTargets.needs) / Math.max(ruleTargets.needs, 1) : 0;
  const wantsDeviation = income > 0 ? Math.max(0, groupTotals.wants - ruleTargets.wants) / Math.max(ruleTargets.wants, 1) : 0;
  const spendingControl = clamp(
    35 - (needsDeviation * 18) - (wantsDeviation * 12) - (remaining < 0 ? 10 : 0),
    0,
    35,
  );

  const consistencyDeviation = (
    Math.abs(groupPercentages.needs - 50)
    + Math.abs(groupPercentages.wants - 30)
    + Math.abs(groupPercentages.savings - 20)
  ) / 3;
  const consistency = clamp(25 - (consistencyDeviation * 0.7) - (remaining < 0 ? 8 : 0), 0, 25);

  const warnings: string[] = [];
  if (remaining < 0) {
    warnings.push(`You are overspending by ${formatCurrency(Math.abs(remaining))} this ${input.period === 'monthly' ? 'month' : 'year'}.`);
  }
  if (groupTotals.savings < ruleTargets.savings) {
    warnings.push(`Savings are ${formatCurrency(ruleTargets.savings - groupTotals.savings)} below the 20% target.`);
  }
  if (groupTotals.wants > ruleTargets.wants) {
    warnings.push(`Lifestyle spending is ${formatCurrency(groupTotals.wants - ruleTargets.wants)} above the recommended 30% cap.`);
  }
  if (groupTotals.needs > ruleTargets.needs) {
    warnings.push(`Essential costs are ${formatCurrency(groupTotals.needs - ruleTargets.needs)} above the recommended 50% cap.`);
  }

  return {
    label: input.label,
    period: input.period,
    income,
    totalExpenses,
    remaining,
    categories,
    groupTotals,
    groupPercentages,
    ruleTargets,
    health: {
      overall: Math.round(clamp(savingsRatioScore + spendingControl + consistency, 0, 100)),
      savingsRatio: Math.round(savingsRatioScore),
      spendingControl: Math.round(spendingControl),
      consistency: Math.round(consistency),
    },
    largestCategoryId: getLargestCategory(categories)?.id,
    warnings,
  };
}

function distributeBucketToTarget(categories: BudgetCategory[], kind: BudgetCategoryKind, target: number) {
  const bucket = categories.filter((category) => category.kind === kind);
  const bucketTotal = bucket.reduce((sum, category) => sum + category.amount, 0);

  if (bucketTotal <= 0) {
    return categories;
  }

  return categories.map((category) => {
    if (category.kind !== kind) {
      return category;
    }

    const share = category.amount / bucketTotal;
    return {
      ...category,
      amount: sanitizeAmount(target * share),
    };
  });
}

function ensureSavingsCategory(categories: BudgetCategory[]) {
  const hasSavings = categories.some((category) => category.kind === 'savings');
  if (hasSavings) {
    return categories;
  }

  return [
    ...categories,
    createBudgetCategory({
      label: 'Emergency Fund',
      kind: 'savings',
      amount: 0,
      icon: 'savings',
    }),
  ];
}

function normalizeRoundingDelta(categories: BudgetCategory[], kind: BudgetCategoryKind, target: number) {
  const bucket = categories.filter((category) => category.kind === kind);
  if (bucket.length === 0) {
    return categories;
  }

  const current = bucket.reduce((sum, category) => sum + category.amount, 0);
  const delta = roundAmount(target - current);
  if (delta === 0) {
    return categories;
  }

  const largest = getLargestCategory(bucket, kind);
  if (!largest) {
    return categories;
  }

  return categories.map((category) => category.id === largest.id
      ? { ...category, amount: sanitizeAmount(category.amount + delta) }
      : category);
}

function createOptimizedCategories(income: number, categories: BudgetCategory[]) {
  let optimized = ensureSavingsCategory(categories.map((category) => ({ ...normalizeCategory(category) })));

  const currentTotals = getBucketTotals(optimized);
  const targets = {
    needs: sanitizeAmount(income * TARGET_SPLIT.needs),
    wants: sanitizeAmount(income * TARGET_SPLIT.wants),
    savings: sanitizeAmount(income * TARGET_SPLIT.savings),
  };

  if (currentTotals.needs > targets.needs) {
    optimized = distributeBucketToTarget(optimized, 'needs', targets.needs);
    optimized = normalizeRoundingDelta(optimized, 'needs', targets.needs);
  }

  if (currentTotals.wants > targets.wants) {
    optimized = distributeBucketToTarget(optimized, 'wants', targets.wants);
    optimized = normalizeRoundingDelta(optimized, 'wants', targets.wants);
  }

  let optimizedTotals = getBucketTotals(optimized);
  if (optimizedTotals.savings < targets.savings) {
    const shortfall = targets.savings - optimizedTotals.savings;
    const primarySavings = getLargestCategory(optimized, 'savings');
    optimized = optimized.map((category) => category.id === primarySavings?.id
      ? { ...category, amount: sanitizeAmount(category.amount + shortfall) }
      : category);
  }

  optimizedTotals = getBucketTotals(optimized);
  const remaining = income - (optimizedTotals.needs + optimizedTotals.wants + optimizedTotals.savings);
  if (remaining > 0) {
    const primarySavings = getLargestCategory(optimized, 'savings');
    optimized = optimized.map((category) => category.id === primarySavings?.id
      ? { ...category, amount: sanitizeAmount(category.amount + remaining) }
      : category);
  }

  optimizedTotals = getBucketTotals(optimized);
  const overflow = optimizedTotals.needs + optimizedTotals.wants + optimizedTotals.savings - income;
  if (overflow > 0) {
    const wantsCategory = getLargestCategory(optimized, 'wants') || getLargestCategory(optimized, 'needs');
    if (wantsCategory) {
      optimized = optimized.map((category) => category.id === wantsCategory.id
        ? { ...category, amount: sanitizeAmount(Math.max(0, category.amount - overflow)) }
        : category);
    }
  }

  return optimized;
}

function createWhatIfCategories(categories: BudgetCategory[], whatIf?: BudgetWhatIfInput | null) {
  if (!whatIf) {
    return null;
  }

  return categories.map((category) => {
    if (category.id !== whatIf.categoryId) {
      return { ...category };
    }

    const multiplier = 1 + (whatIf.adjustmentPercent / 100);
    return {
      ...category,
      amount: sanitizeAmount(category.amount * Math.max(0, multiplier)),
    };
  });
}

function buildOptimizationActions(current: BudgetScenario, optimized: BudgetScenario) {
  return current.categories.reduce<BudgetOptimizationAction[]>((actions, category) => {
    const recommended = optimized.categories.find((item) => item.id === category.id);
    if (!recommended) {
      return actions;
    }

    const delta = roundAmount(recommended.amount - category.amount);
    if (Math.abs(delta) < 1) {
      return actions;
    }

    actions.push({
      id: `${category.id}-action`,
      categoryId: category.id,
      label: category.label,
      kind: category.kind,
      currentAmount: category.amount,
      recommendedAmount: recommended.amount,
      delta,
    });

    return actions;
  }, []);
}

function buildBudgetInsights(
  current: BudgetScenario,
  optimized: BudgetScenario,
  optimizationActions: BudgetOptimizationAction[],
) {
  const insights: BudgetInsight[] = [];
  const biggestWant = getLargestCategory(current.categories, 'wants');
  const biggestNeed = getLargestCategory(current.categories, 'needs');
  const savingsBoost = optimizationActions
    .filter((action) => action.kind === 'savings' && action.delta > 0)
    .sort((left, right) => right.delta - left.delta)[0];
  const biggestCut = optimizationActions
    .filter((action) => action.delta < 0)
    .sort((left, right) => left.delta - right.delta)[0];

  if (current.remaining < 0) {
    insights.push({
      id: 'overspend',
      title: 'Spending is above your income',
      message: `You are overspending by ${formatCurrency(Math.abs(current.remaining))}. Trim variable costs before that gap turns into debt.`,
      tone: 'danger',
      amount: Math.abs(current.remaining),
    });
  }

  if (current.groupTotals.savings < current.ruleTargets.savings) {
    insights.push({
      id: 'savings-gap',
      title: 'Savings need a stronger lane',
      message: `You are ${formatCurrency(current.ruleTargets.savings - current.groupTotals.savings)} short of the 20% savings target. Lock in that amount before expanding lifestyle spend.`,
      tone: 'warning',
      amount: current.ruleTargets.savings - current.groupTotals.savings,
    });
  }

  if (current.groupTotals.wants > current.ruleTargets.wants && biggestWant) {
    insights.push({
      id: 'wants-overflow',
      title: `${biggestWant.label} is pushing wants over plan`,
      message: `${biggestWant.label} is your biggest wants category right now. Pulling it down even slightly helps you move back toward the 30% wants guideline.`,
      tone: 'warning',
      categoryId: biggestWant.id,
      amount: biggestWant.amount,
    });
  }

  if (current.groupTotals.needs > current.ruleTargets.needs && biggestNeed) {
    insights.push({
      id: 'needs-overflow',
      title: `${biggestNeed.label} deserves a renegotiation`,
      message: `Essentials are above the 50% rule. ${biggestNeed.label} is the largest fixed-cost driver, so that is the best place to negotiate or refinance.`,
      tone: 'info',
      categoryId: biggestNeed.id,
      amount: biggestNeed.amount,
    });
  }

  if (savingsBoost && biggestCut) {
    insights.push({
      id: 'optimization',
      title: `You can save ${formatCurrency(savingsBoost.delta)} more`,
      message: `Reduce ${biggestCut.label} by ${formatCurrency(Math.abs(biggestCut.delta))} and redirect it into ${savingsBoost.label.toLowerCase()} for a healthier split.`,
      tone: 'success',
      amount: savingsBoost.delta,
      categoryId: biggestCut.categoryId,
    });
  }

  if (current.health.overall >= 80) {
    insights.push({
      id: 'healthy',
      title: 'Your budget is already well balanced',
      message: `You are landing in the ${getBudgetHealthLabel(current.health.overall).toLowerCase()} range. Keep the same structure and direct any extra surplus into long-term investing.`,
      tone: 'success',
    });
  }

  return insights.slice(0, 5);
}

export function generateBudgetFallbackSummary(response: BudgetSimulationResponse) {
  const current = response.current;
  const optimized = response.optimized;
  const deltaSavings = optimized.groupTotals.savings - current.groupTotals.savings;
  const topWarning = current.warnings[0];

  return [
    `Current health score: ${current.health.overall}/100 (${getBudgetHealthLabel(current.health.overall)}).`,
    topWarning ? topWarning : 'Your current budget is operating within your income.',
    deltaSavings > 0
      ? `A stronger split would increase savings by ${formatCurrency(deltaSavings)} while keeping needs and wants closer to the 50/30/20 rule.`
      : 'Your current savings rate is already close to the recommended range.',
  ].join(' ');
}

export function buildBudgetAIPrompt(request: BudgetSimulationRequest, response: BudgetSimulationResponse) {
  const categoryLines = request.categories
    .map((category) => `- ${category.label} (${category.kind}): ${formatCurrency(category.amount)}`)
    .join('\n');

  return [
    'You are a personal finance coach for a fintech learning app.',
    `Period: ${request.period}`,
    `Income: ${formatCurrency(request.income)}`,
    `Current health score: ${response.current.health.overall}/100`,
    `Current split: Needs ${response.current.groupPercentages.needs}%, Wants ${response.current.groupPercentages.wants}%, Savings ${response.current.groupPercentages.savings}%`,
    `Optimized split: Needs ${response.optimized.groupPercentages.needs}%, Wants ${response.optimized.groupPercentages.wants}%, Savings ${response.optimized.groupPercentages.savings}%`,
    'Budget categories:',
    categoryLines,
    'Write 3 short, concrete insights for the user.',
    'Mention the biggest overspending risk, the easiest saving opportunity, and one motivating next step.',
    'Keep it under 120 words and do not use markdown bullets.',
  ].join('\n');
}

export function buildBudgetSimulationResponse(request: BudgetSimulationRequest): BudgetSimulationResponse {
  const current = calculateBudgetScenario({
    label: 'Current Plan',
    income: request.income,
    categories: request.categories,
    period: request.period,
  });
  const optimized = calculateBudgetScenario({
    label: 'Optimized Plan',
    income: request.income,
    categories: createOptimizedCategories(request.income, request.categories),
    period: request.period,
  });
  const whatIfCategories = createWhatIfCategories(request.categories, request.whatIf);
  const whatIf = whatIfCategories
    ? calculateBudgetScenario({
      label: 'What If Scenario',
      income: request.income,
      categories: whatIfCategories,
      period: request.period,
    })
    : null;
  const optimizationActions = buildOptimizationActions(current, optimized);

  const response: BudgetSimulationResponse = {
    current,
    optimized,
    whatIf,
    optimizationActions,
    insights: buildBudgetInsights(current, optimized, optimizationActions),
    aiSummary: '',
    generatedAt: new Date().toISOString(),
  };

  response.aiSummary = generateBudgetFallbackSummary(response);
  return response;
}
