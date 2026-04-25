
export const budgetSimulation = (income: number, needs: number, wants: number, savings: number) => {
  const totalSpent = needs + wants + savings;
  const remaining = income - totalSpent;

  let score = 0;
  if (totalSpent <= income) score += 50;
  
  const idealNeeds = income * 0.5;
  const idealWants = income * 0.3;
  const idealSavings = income * 0.2;

  if (savings >= idealSavings) score += 30;
  else score += Math.max(0, 30 * (savings / idealSavings));

  if (needs <= idealNeeds) score += 20;
  else score -= Math.min(20, 20 * ((needs - idealNeeds) / idealNeeds));
      
  const insights: string[] = [];

  const wantsPercentage = ((wants / income) * 100).toFixed(1);
  const savingsPercentage = ((savings / income) * 100).toFixed(1);
  const needsPercentage = ((needs / income) * 100).toFixed(1);

  if (savings < idealSavings) {
    insights.push(`Your current savings rate is ${savingsPercentage}%. Try increasing it to 20% (₹${idealSavings}) to build a stronger financial cushion.`);
  } else {
    insights.push(`Great job! You are saving ${savingsPercentage}% of your income, which meets or exceeds the recommended 20%.`);
  }

  if (wants > idealWants) {
    const diff = wants - idealWants;
    insights.push(`You are spending ${wantsPercentage}% on 'wants', which is above the 50/30/20 rule's 30% guideline. Consider reallocating ₹${diff} towards savings or needs.`);
  }

  if (needs > idealNeeds) {
    insights.push(`Your essential 'needs' consume ${needsPercentage}% of your income. Evaluate if any fixed expenses can be optimized to stay closer to 50%.`);
  }

  if (remaining > 0) {
    insights.push(`You have an unallocated surplus of ₹${remaining}. Assign a job to every rupee, such as investing it or paying off high-interest debt.`);
  }

  if (totalSpent > income) {
    insights.push(`CRITICAL: You are spending ₹${Math.abs(remaining)} more than you make. You must urgently reduce your expenses to avoid debt.`);
  }

  return {
    remaining,
    score: Math.min(100, Math.max(0, Math.round(score))),
    insights
  };
};

export const investmentSimulation = (monthly: number, years: number, riskLevel: string) => {
  const rates: Record<string, number> = {
    safe: 0.07,
    moderate: 0.12,
    aggressive: 0.20
  };
  
  const rate = rates[riskLevel.toLowerCase()] || 0.12;
  const months = years * 12;
  const monthlyRate = rate / 12;
  
  let futureValue = 0;
  if (monthlyRate > 0) {
    futureValue = monthly * (((1 + monthlyRate) ** months - 1) / monthlyRate);
  } else {
    futureValue = monthly * months;
  }
      
  const totalInvested = monthly * months;
  const gain = futureValue - totalInvested;

  return {
    finalValue: Number(futureValue.toFixed(2)),
    totalInvested: Number(totalInvested.toFixed(2)),
    gain: Number(gain.toFixed(2)),
    riskApplied: riskLevel
  };
};
