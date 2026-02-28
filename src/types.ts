export type IncomeStatus = 'earning' | 'student' | 'freelancer' | 'not-earning';

export type LifeStage = 'student' | 'working-professional' | 'business-owner' | 'preparing-exams' | 'married' | 'other';

export interface Expense {
  category: string;
  amount: number;
}

export interface Debt {
  hasDebt: boolean;
  type?: string;
  monthlyEMI?: number;
}

export interface FinancialData {
  incomeStatus: IncomeStatus;
  monthlyIncome: number;
  expenses: Expense[];
  debt: Debt;
  lifeStage: LifeStage;
}

export interface FinancialAnalysis {
  savingsPercentage: number;
  emergencyFund: number;
  investmentSuggestions: string[];
  emergencyFundSuggestions: string[];
  detailedInvestmentSuggestions: string[];
  spendingInsights: {
    overspending: string[];
    reductionAreas: string[];
    allocationAreas: string[];
  };
  financialScore: number;
}
