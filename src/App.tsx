import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  ChevronLeft, 
  PieChart as PieChartIcon, 
  Wallet, 
  Briefcase, 
  GraduationCap, 
  User, 
  CreditCard,
  AlertCircle,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { ChatBot } from './components/ChatBot';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  FinancialData, 
  IncomeStatus, 
  LifeStage, 
  Expense, 
  FinancialAnalysis 
} from './types';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const EXPENSE_CATEGORIES = [
  'Food', 'Rent', 'Education', 'EMIs', 'Medical', 'Travel', 'Shopping', 'Other'
];

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b', '#0ea5e9'];

export default function App() {
  const [step, setStep] = useState<'home' | 'form' | 'results'>('home');
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState<FinancialData>({
    incomeStatus: 'earning',
    monthlyIncome: 0,
    expenses: EXPENSE_CATEGORIES.map(cat => ({ category: cat, amount: 0 })),
    debt: { hasDebt: false, type: '', monthlyEMI: 0 },
    lifeStage: 'working-professional'
  });

  const handleStart = () => setStep('form');

  const resetForm = () => {
    setFormData({
      incomeStatus: 'earning',
      monthlyIncome: 0,
      expenses: EXPENSE_CATEGORIES.map(cat => ({ category: cat, amount: 0 })),
      debt: { hasDebt: false, type: '', monthlyEMI: 0 },
      lifeStage: 'working-professional'
    });
    setFormStep(1);
    setStep('form');
  };

  const updateFormData = (updates: Partial<FinancialData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextFormStep = () => setFormStep(prev => prev + 1);
  const prevFormStep = () => setFormStep(prev => Math.max(1, prev - 1));

  const submitForm = () => {
    setStep('results');
  };

  // Financial Logic
  const analysis = useMemo((): FinancialAnalysis => {
    const totalExpenses = formData.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const income = formData.monthlyIncome || 0;
    const savings = Math.max(0, income - totalExpenses);
    const savingsPercentage = income > 0 ? (savings / income) * 100 : 0;
    
    // Emergency Fund: 3 months of expenses
    const emergencyFund = totalExpenses * 3;

    let investmentSuggestions: string[] = [];
    const emergencyFundSuggestions: string[] = [
      "Automate your savings: Set up a recurring transfer to a separate savings account.",
      "Cut back on non-essential spending (e.g., dining out, subscriptions).",
      "Save any windfalls (e.g., bonuses, tax refunds) directly into your emergency fund.",
      "Start small: Even ₹500 a month makes a difference over time."
    ];
    const detailedInvestmentSuggestions: string[] = [
      "Low Risk: Liquid Funds or High-Yield Savings Accounts for immediate needs.",
      "Medium Risk: Balanced Mutual Funds or Index Funds for long-term growth.",
      "High Risk: Direct Equity or Sector-specific Mutual Funds for higher potential returns.",
      "Tax Saving: ELSS (Equity Linked Savings Scheme) to save on taxes under Section 80C."
    ];
    let financialScore = 70; // Base score

    // Life Stage Logic
    switch (formData.lifeStage) {
      case 'student':
        investmentSuggestions = ['Start a small SIP (Systematic Investment Plan)', 'Invest in high-income skills (Courses/Certifications)', 'Open a high-yield savings account'];
        if (savingsPercentage < 10) financialScore -= 10;
        break;
      case 'working-professional':
        investmentSuggestions = ['Index Funds for long-term wealth', 'Diversified Equity Mutual Funds', 'Term Insurance for family protection'];
        if (savingsPercentage < 20) financialScore -= 15;
        break;
      case 'business-owner':
        investmentSuggestions = ['Diversify away from business assets', 'Debt management & optimization', 'Liquid funds for business contingencies'];
        if (formData.debt.hasDebt) financialScore -= 5;
        break;
      default:
        investmentSuggestions = ['Diversified Mutual Funds', 'Emergency Fund building', 'Health Insurance'];
    }

    // Debt Impact
    if (formData.debt.hasDebt) {
      financialScore -= 15;
      if ((formData.debt.monthlyEMI || 0) > income * 0.3) {
        financialScore -= 10;
      }
    }

    // Spending Insights
    const overspending: string[] = [];
    const reductionAreas: string[] = [];
    const allocationAreas: string[] = [];

    const foodExp = formData.expenses.find(e => e.category === 'Food')?.amount || 0;
    const eduExp = formData.expenses.find(e => e.category === 'Education')?.amount || 0;
    const medExp = formData.expenses.find(e => e.category === 'Medical')?.amount || 0;
    const shopExp = formData.expenses.find(e => e.category === 'Shopping')?.amount || 0;

    if (income > 0) {
      if (foodExp > income * 0.15) overspending.push('Food & Dining');
      if (eduExp > income * 0.2) overspending.push('Education');
      if (medExp > income * 0.1) overspending.push('Medical');
      if (shopExp > income * 0.1) reductionAreas.push('Impulse shopping');
      
      if (savingsPercentage < 20) allocationAreas.push('Monthly Savings/SIPs');
      if (emergencyFund > 0) allocationAreas.push('Emergency Fund');
    }

    if (financialScore < 0) financialScore = 0;
    if (financialScore > 100) financialScore = 100;

    return {
      savingsPercentage,
      emergencyFund,
      investmentSuggestions,
      emergencyFundSuggestions,
      detailedInvestmentSuggestions,
      spendingInsights: { overspending, reductionAreas, allocationAreas },
      financialScore
    };
  }, [formData]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep('home')}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">WealthNest</span>
          </div>
          <button 
            onClick={resetForm}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Start Financial Analysis
          </button>
        </div>
      </nav>

      <main className="pt-16">
        <AnimatePresence mode="wait">
          {step === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto px-4 py-6 md:py-10"
            >
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    Secure & AI-Powered Analysis
                  </div>
                  <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-950 leading-[1.1]">
                    Master Your Money with <span className="text-indigo-600">WealthNest</span>
                  </h1>
                  <p className="text-2xl text-slate-800 max-w-lg leading-relaxed">
                    Get personalized financial guidance, investment strategies, and spending insights tailored to your life stage.
                  </p>
                  <p className="text-lg font-medium italic text-indigo-600 border-l-4 border-indigo-600 pl-4 py-1">
                    "Saving is discipline. Investing is vision."
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={handleStart} className="btn-primary flex items-center justify-center gap-2">
                      Start Financial Analysis <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -inset-4 bg-indigo-500/10 blur-3xl rounded-full" />
                  <div className="relative glass-card rounded-3xl p-8 space-y-6 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">Financial Health</span>
                      <Zap className="text-amber-500 w-5 h-5 fill-amber-500" />
                    </div>
                    <div className="h-48 flex items-end gap-3">
                      {[40, 70, 55, 90, 65, 85, 75].map((h, i) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: i * 0.1, duration: 1 }}
                          className="flex-1 bg-indigo-600/20 rounded-t-lg relative group"
                        >
                          <div className="absolute inset-0 bg-indigo-600 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-xs text-slate-500 block mb-1 uppercase tracking-wider font-semibold">Savings</span>
                        <span className="text-lg font-bold text-slate-900">₹2,45,000</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-xs text-slate-500 block mb-1 uppercase tracking-wider font-semibold">Invested</span>
                        <span className="text-lg font-bold text-indigo-600">₹12,80,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'form' && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto px-4 py-12"
            >
              <div className="mb-8 flex items-center justify-between">
                <button onClick={prevFormStep} disabled={formStep === 1} className="p-2 hover:bg-slate-100 rounded-full disabled:opacity-0 transition-all">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <div 
                      key={s} 
                      className={cn(
                        "h-1.5 w-8 rounded-full transition-all duration-500",
                        s <= formStep ? "bg-indigo-600" : "bg-slate-200"
                      )} 
                    />
                  ))}
                </div>
                <div className="w-10" />
              </div>

              <div className="glass-card rounded-3xl p-8 md:p-12 shadow-lg">
                <AnimatePresence mode="wait">
                  {formStep === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900">What's your income status?</h2>
                        <p className="text-slate-500">This helps us understand your primary cash flow.</p>
                      </div>
                      <div className="grid gap-3">
                        {[
                          { id: 'earning', label: 'Earning (Job/Business)', icon: Briefcase },
                          { id: 'student', label: 'Student (Pocket Money)', icon: GraduationCap },
                          { id: 'freelancer', label: 'Freelancer', icon: User },
                          { id: 'not-earning', label: 'Not earning currently', icon: Wallet }
                        ].map(item => (
                          <button
                            key={item.id}
                            onClick={() => {
                              updateFormData({ incomeStatus: item.id as IncomeStatus });
                              nextFormStep();
                            }}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all group",
                              formData.incomeStatus === item.id 
                                ? "border-indigo-600 bg-indigo-50" 
                                : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                            )}
                          >
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                              formData.incomeStatus === item.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                            )}>
                              <item.icon className="w-6 h-6" />
                            </div>
                            <span className="font-semibold text-slate-900">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {formStep === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900">Monthly Income</h2>
                        <p className="text-slate-500">How much do you receive each month on average?</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-slate-500">₹</span>
                        <input 
                          type="number" 
                          placeholder="0.00"
                          className="input-field text-xl font-bold"
                          value={formData.monthlyIncome || ''}
                          onChange={(e) => updateFormData({ monthlyIncome: Number(e.target.value) })}
                          onWheel={(e) => e.currentTarget.blur()}
                          autoFocus
                        />
                      </div>
                      <button 
                        onClick={nextFormStep} 
                        disabled={!formData.monthlyIncome}
                        className="btn-primary w-full"
                      >
                        Continue
                      </button>
                    </motion.div>
                  )}

                  {formStep === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900">Monthly Expenses</h2>
                        <p className="text-slate-500">Break down where your money goes.</p>
                      </div>
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {formData.expenses.map((exp, idx) => (
                          <div key={exp.category} className="space-y-1">
                            <label className="text-sm font-semibold text-slate-600">{exp.category}</label>
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-slate-500">₹</span>
                              <input 
                                type="number" 
                                placeholder="0"
                                className="input-field"
                                value={exp.amount || ''}
                                onWheel={(e) => e.currentTarget.blur()}
                                onChange={(e) => {
                                  const newExpenses = [...formData.expenses];
                                  newExpenses[idx].amount = Number(e.target.value);
                                  updateFormData({ expenses: newExpenses });
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={nextFormStep} className="btn-primary w-full">
                        Continue
                      </button>
                    </motion.div>
                  )}

                  {formStep === 4 && (
                    <motion.div 
                      key="step4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900">Debt Status</h2>
                        <p className="text-slate-500">Do you have any active loans or credit card debt?</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => updateFormData({ debt: { ...formData.debt, hasDebt: true } })}
                          className={cn(
                            "p-4 rounded-2xl border-2 font-semibold transition-all",
                            formData.debt.hasDebt ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-slate-100 text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          Yes, I have debt
                        </button>
                        <button
                          onClick={() => {
                            updateFormData({ debt: { hasDebt: false, type: '', monthlyEMI: 0 } });
                            nextFormStep();
                          }}
                          className={cn(
                            "p-4 rounded-2xl border-2 font-semibold transition-all",
                            !formData.debt.hasDebt ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-slate-100 text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          No debt
                        </button>
                      </div>

                      {formData.debt.hasDebt && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-slate-100">
                          <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-600">Type of Debt</label>
                            <select 
                              className="input-field"
                              value={formData.debt.type}
                              onChange={(e) => updateFormData({ debt: { ...formData.debt, type: e.target.value } })}
                            >
                              <option value="">Select type...</option>
                              <option value="Education Loan">Education Loan</option>
                              <option value="Credit Card">Credit Card</option>
                              <option value="Personal Loan">Personal Loan</option>
                              <option value="Home Loan">Home Loan</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-600">Monthly EMI Amount</label>
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-slate-500">₹</span>
                              <input 
                                type="number" 
                                placeholder="0"
                                className="input-field"
                                value={formData.debt.monthlyEMI || ''}
                                onWheel={(e) => e.currentTarget.blur()}
                                onChange={(e) => updateFormData({ debt: { ...formData.debt, monthlyEMI: Number(e.target.value) } })}
                              />
                            </div>
                          </div>
                          <button onClick={nextFormStep} disabled={!formData.debt.type || !formData.debt.monthlyEMI} className="btn-primary w-full">
                            Continue
                          </button>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {formStep === 5 && (
                    <motion.div 
                      key="step5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900">Current Life Stage</h2>
                        <p className="text-slate-500">This helps us tailor long-term strategies.</p>
                      </div>
                      <div className="grid gap-3">
                        {[
                          { id: 'student', label: 'Student' },
                          { id: 'working-professional', label: 'Working Professional' },
                          { id: 'business-owner', label: 'Business Owner' },
                          { id: 'preparing-exams', label: 'Preparing for Exams' },
                          { id: 'married', label: 'Married' },
                          { id: 'other', label: 'Other' }
                        ].map(item => (
                          <button
                            key={item.id}
                            onClick={() => {
                              updateFormData({ lifeStage: item.id as LifeStage });
                              submitForm();
                            }}
                            className={cn(
                              "p-4 rounded-2xl border-2 text-left font-semibold transition-all",
                              formData.lifeStage === item.id 
                                ? "border-indigo-600 bg-indigo-50 text-indigo-600" 
                                : "border-slate-100 text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 py-12 space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-bold text-slate-950">Financial Analysis Report</h1>
                  <p className="text-slate-600 text-lg">Generated on {new Date().toLocaleDateString('en-GB')}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={resetForm} className="btn-primary flex items-center gap-2">
                    New Financial Analysis
                  </button>
                </div>
              </div>

              {/* Dashboard Grid */}
              <div className="grid md:grid-cols-3 gap-8">
                {/* Score Card */}
                <div className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Financial Score</h3>
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-slate-100"
                      />
                      <motion.circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={440}
                        initial={{ strokeDashoffset: 440 }}
                        animate={{ strokeDashoffset: 440 - (440 * analysis.financialScore) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="text-indigo-600"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold text-slate-900">{analysis.financialScore}</span>
                      <span className="text-xs font-bold text-slate-400">/ 100</span>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm">
                    {analysis.financialScore > 80 ? "Excellent! You're on the right track." : 
                     analysis.financialScore > 60 ? "Good, but there's room for optimization." : 
                     "Action required to improve your financial health."}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass-card rounded-3xl p-6 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <Wallet className="w-5 h-5" />
                      <span className="text-base font-bold uppercase tracking-wider">Savings Rate</span>
                    </div>
                    <div className="text-4xl font-bold text-slate-950">{analysis.savingsPercentage.toFixed(1)}%</div>
                    <p className="text-sm text-slate-600">Recommended: 20% or more</p>
                  </div>
                  <div className="glass-card rounded-3xl p-6 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <ShieldCheck className="w-5 h-5" />
                      <span className="text-base font-bold uppercase tracking-wider">Emergency Fund Target</span>
                    </div>
                    <div className="text-4xl font-bold text-slate-950">₹{analysis.emergencyFund.toLocaleString('en-IN')}</div>
                    <p className="text-sm text-slate-600">Covers 3 months of expenses</p>
                  </div>
                  <div className="glass-card rounded-3xl p-6 space-y-2">
                    <div className="flex items-center gap-2 text-amber-600">
                      <CreditCard className="w-5 h-5" />
                      <span className="text-base font-bold uppercase tracking-wider">Debt-to-Income</span>
                    </div>
                    <div className="text-4xl font-bold text-slate-950">
                      {formData.monthlyIncome > 0 ? ((formData.debt.monthlyEMI || 0) / formData.monthlyIncome * 100).toFixed(1) : 0}%
                    </div>
                    <p className="text-sm text-slate-600">Ideal: Below 30%</p>
                  </div>
                  <div className="glass-card rounded-3xl p-6 space-y-2">
                    <div className="flex items-center gap-2 text-violet-600">
                      <BarChart3 className="w-5 h-5" />
                      <span className="text-base font-bold uppercase tracking-wider">Monthly Surplus</span>
                    </div>
                    <div className="text-4xl font-bold text-slate-950">
                      ₹{Math.max(0, formData.monthlyIncome - formData.expenses.reduce((s, e) => s + e.amount, 0)).toLocaleString('en-IN')}
                    </div>
                    <p className="text-sm text-slate-600">Available for investment</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-8">
                  {/* Expense Breakdown */}
                  <div className="glass-card rounded-3xl p-8 space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-indigo-600" /> Expense Breakdown
                    </h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={formData.expenses.filter(e => e.amount > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="amount"
                            nameKey="category"
                          >
                            {formData.expenses.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {formData.expenses.filter(e => e.amount > 0).map((exp, idx) => (
                        <div key={exp.category} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="text-sm text-slate-600">{exp.category}: ₹{exp.amount.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl p-8 space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Personalized Tips
                    </h3>
                    <div className="space-y-4">
                      {analysis.investmentSuggestions.map((sug, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                            {i + 1}
                          </div>
                          <p className="text-slate-800 font-medium text-base">{sug}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl p-8 space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" /> Spending Insights
                    </h3>
                    <div className="space-y-4">
                      {analysis.spendingInsights.overspending.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-red-500 uppercase tracking-wider">High Spending</span>
                          <div className="flex flex-wrap gap-2">
                            {analysis.spendingInsights.overspending.map(item => (
                              <span key={item} className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Optimization Areas</span>
                        <ul className="space-y-2">
                          {analysis.spendingInsights.reductionAreas.map(item => (
                            <li key={item} className="text-base text-slate-700 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                              Reduce spending on {item}
                            </li>
                          ))}
                          {analysis.spendingInsights.allocationAreas.map(item => (
                            <li key={item} className="text-base text-slate-700 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Allocate more to {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Insights & Recommendations */}
                <div className="space-y-8">
                  <div className="glass-card rounded-3xl p-8 space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" /> Emergency Fund Strategy
                    </h3>
                    <div className="space-y-4">
                      {analysis.emergencyFundSuggestions.map((sug, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                            {i + 1}
                          </div>
                          <p className="text-slate-800 font-medium text-base">{sug}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl p-8 space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-600" /> Investment Opportunities
                    </h3>
                    <div className="space-y-4">
                      {analysis.detailedInvestmentSuggestions.map((sug, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                            {i + 1}
                          </div>
                          <p className="text-slate-800 font-medium text-base">{sug}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                <TrendingUp className="text-white w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">WealthNest</span>
            </div>
            <p className="text-sm text-slate-500">
              Empowering individuals to make smarter financial decisions through AI-driven insights.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-indigo-600">Analysis Tool</a></li>
              <li><a href="#" className="hover:text-indigo-600">Investment Guide</a></li>
              <li><a href="#" className="hover:text-indigo-600">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-indigo-600">About Us</a></li>
              <li><a href="#" className="hover:text-indigo-600">Careers</a></li>
              <li><a href="#" className="hover:text-indigo-600">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-indigo-600">Help Center</a></li>
              <li><a href="#" className="hover:text-indigo-600">Contact Us</a></li>
              <li><a href="#" className="hover:text-indigo-600">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pt-8 mt-8 border-t border-slate-100 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} WealthNest Financial Technologies. All rights reserved.
        </div>
      </footer>
      <ChatBot />
    </div>
  );
}
