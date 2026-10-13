import { apiFetch } from '../utils/apiClient';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Calculator,
  IndianRupee,
  TrendingUp,
  Sliders,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  RefreshCw,
  CreditCard,
  Zap,
  Sparkles,
  ArrowUpRight,
  Info,
  Scale,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface FinanceApiResponse {
  status: string;
  revenue: number;
  expenses: number;
  profit: number;
  cash_flow: number;
  EMI: number;
  total_repayment: number;
  break_even: number;
  repayment_burden: number;
  investment?: number;
  loan_amount?: number;
  interest_rate?: number;
  loan_tenure_months?: number;
  total_interest?: number;
  principal_amount?: number;
  operating_profit?: number;
  net_profit?: number;
  net_profit_margin_percent?: number;
  variable_cost_per_unit?: number;
  contribution_margin_per_unit?: number;
  break_even_units?: number;
  break_even_revenue?: number;
  break_even_capacity_percent?: number;
  cash_break_even_units?: number;
  cash_break_even_revenue?: number;
  repayment_burden_pct_of_profit?: number;
  repayment_burden_pct_of_revenue?: number;
  repayment_burden_status?: string;
  debt_service_coverage_ratio?: number;
  annual_revenue?: number;
  annual_profit?: number;
  annual_cash_flow?: number;
  return_on_investment_percent?: number;
  payback_period_months?: number;
  engine?: string;
}

export const FinancialPlannerPage: React.FC = () => {
  const {
    activeBusiness,
    financialData,
    updateFinancials,
    userProfile,
    setCurrentPage,
  } = useApp();

  const {
    capitalExpenditure,
    operationalMonthly,
    pricingAndVolume,
    workingCapitalBufferMonths,
  } = financialData;

  // Total CapEx from state
  const totalCapEx =
    capitalExpenditure.machinery +
    capitalExpenditure.shedCivilWorks +
    capitalExpenditure.electricalConnections +
    capitalExpenditure.licensesAndRegistration;

  // Monthly Fixed Costs from state
  const monthlyFixedCost =
    operationalMonthly.laborWages +
    operationalMonthly.electricityFuel +
    operationalMonthly.rentMisc;

  // Monthly Variable Cost from state
  const totalMonthlyVariableCost =
    pricingAndVolume.expectedMonthlyVolume * pricingAndVolume.variableCostPerUnit +
    operationalMonthly.packagingTransportation;

  // Recommended Working Capital (45 to 60 days)
  const recommendedBuffer = Math.round(
    (monthlyFixedCost + totalMonthlyVariableCost) * workingCapitalBufferMonths
  );

  // Total Project Cost (CapEx + Working Capital)
  const totalProjectCost = totalCapEx + recommendedBuffer;

  // Loan & Debt Service Parameters
  const [loanAmount, setLoanAmount] = useState<number>(() => {
    // Default: project cost minus user available capital or 1 Lakh
    const diff = totalProjectCost - (userProfile.availableCapital || 0);
    return Math.max(25000, Math.min(diff > 0 ? diff : 100000, 1000000));
  });
  const [interestRate, setInterestRate] = useState<number>(9.0); // 9% p.a. standard Mudra / PMEGP rate
  const [loanTenure, setLoanTenure] = useState<number>(36); // 36 months (3 years)
  const [loanTenureUnit, setLoanTenureUnit] = useState<'months' | 'years'>('months');

  // API State
  const [apiData, setApiData] = useState<FinanceApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Call the Python Financial Engine endpoint: POST /api/v1/finance/calculate
  const calculateWithBackend = useCallback(
    async (customParams?: {
      investment?: number;
      fixed_costs?: number;
      monthly_expenses?: number;
      selling_price?: number;
      units_sold?: number;
      loan_amount?: number;
      interest_rate?: number;
      loan_tenure?: number;
    }) => {
      setIsLoading(true);
      setApiError(null);

      const payload = {
        investment: customParams?.investment ?? totalProjectCost,
        fixed_costs: customParams?.fixed_costs ?? monthlyFixedCost,
        monthly_expenses: customParams?.monthly_expenses ?? totalMonthlyVariableCost,
        selling_price: customParams?.selling_price ?? pricingAndVolume.sellingPricePerUnit,
        units_sold: customParams?.units_sold ?? pricingAndVolume.expectedMonthlyVolume,
        loan_amount: customParams?.loan_amount ?? loanAmount,
        interest_rate: customParams?.interest_rate ?? interestRate,
        loan_tenure: customParams?.loan_tenure ?? loanTenure,
        loan_tenure_unit: loanTenureUnit,
      };

      try {
        const response = await apiFetch('/api/v1/finance/calculate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}: Failed to calculate financials`);
        }

        const data: FinanceApiResponse = await response.json();
        setApiData(data);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (err: any) {
        console.error('Python Financial Engine Error:', err);
        setApiError(err.message || 'Error connecting to Python Financial Engine.');

        // Fallback calculation in client if offline
        const rev = payload.selling_price * payload.units_sold;
        const exp = payload.fixed_costs + payload.monthly_expenses;
        const prof = rev - exp;
        const r = (payload.interest_rate / 100) / 12;
        const n = payload.loan_tenure;
        const emi = payload.loan_amount > 0 && n > 0 && r > 0
          ? (payload.loan_amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
          : (payload.loan_amount > 0 && n > 0 ? payload.loan_amount / n : 0);
        const cm = payload.selling_price - (payload.monthly_expenses / (payload.units_sold || 1));
        const be = cm > 0 ? Math.round(payload.fixed_costs / cm) : 0;
        const burden = prof > 0 ? (emi / prof) * 100 : 0;

        setApiData({
          status: 'client_fallback',
          revenue: rev,
          expenses: exp,
          profit: prof,
          cash_flow: Math.round((prof - emi) * 100) / 100,
          EMI: Math.round(emi * 100) / 100,
          total_repayment: Math.round(emi * n * 100) / 100,
          break_even: be,
          repayment_burden: Math.round(burden * 100) / 100,
          repayment_burden_status: burden < 25 ? 'Low / Very Safe (<25%)' : burden < 45 ? 'Moderate (25-45%)' : 'High Burden (>45%)',
          engine: 'Local Client Math Fallback',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      totalProjectCost,
      monthlyFixedCost,
      totalMonthlyVariableCost,
      pricingAndVolume.sellingPricePerUnit,
      pricingAndVolume.expectedMonthlyVolume,
      loanAmount,
      interestRate,
      loanTenure,
      loanTenureUnit,
    ]
  );

  // Trigger calculation when parameters change
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateWithBackend();
    }, 250);
    return () => clearTimeout(timer);
  }, [calculateWithBackend]);

  // Sample Values Preset Handlers
  const handleApplySample = (sampleId: number) => {
    if (sampleId === 1) {
      // Sample 1: Standard MSME Micro Unit
      updateFinancials({
        pricingAndVolume: {
          ...pricingAndVolume,
          sellingPricePerUnit: 120,
          variableCostPerUnit: 58.33,
          expectedMonthlyVolume: 600,
        },
        operationalMonthly: {
          ...operationalMonthly,
          laborWages: 8000,
          electricityFuel: 4500,
          rentMisc: 2500,
          packagingTransportation: 0,
        },
        capitalExpenditure: {
          ...capitalExpenditure,
          machinery: 100000,
          shedCivilWorks: 30000,
          electricalConnections: 12000,
          licensesAndRegistration: 8000,
        },
      });
      setLoanAmount(100000);
      setInterestRate(9.0);
      setLoanTenure(36);
      calculateWithBackend({
        investment: 150000,
        fixed_costs: 15000,
        monthly_expenses: 35000,
        selling_price: 120,
        units_sold: 600,
        loan_amount: 100000,
        interest_rate: 9.0,
        loan_tenure: 36,
      });
    } else if (sampleId === 2) {
      // Sample 2: Micro Cottage Unit / Shishu
      updateFinancials({
        pricingAndVolume: {
          ...pricingAndVolume,
          sellingPricePerUnit: 45,
          variableCostPerUnit: 17.5,
          expectedMonthlyVolume: 800,
        },
        operationalMonthly: {
          ...operationalMonthly,
          laborWages: 3500,
          electricityFuel: 1500,
          rentMisc: 1000,
          packagingTransportation: 0,
        },
        capitalExpenditure: {
          ...capitalExpenditure,
          machinery: 35000,
          shedCivilWorks: 15000,
          electricalConnections: 5000,
          licensesAndRegistration: 5000,
        },
      });
      setLoanAmount(40000);
      setInterestRate(8.5);
      setLoanTenure(24);
      calculateWithBackend({
        investment: 60000,
        fixed_costs: 6000,
        monthly_expenses: 14000,
        selling_price: 45,
        units_sold: 800,
        loan_amount: 40000,
        interest_rate: 8.5,
        loan_tenure: 24,
      });
    } else if (sampleId === 3) {
      // Sample 3: PMEGP Expansion Unit
      updateFinancials({
        pricingAndVolume: {
          ...pricingAndVolume,
          sellingPricePerUnit: 250,
          variableCostPerUnit: 100,
          expectedMonthlyVolume: 800,
        },
        operationalMonthly: {
          ...operationalMonthly,
          laborWages: 18000,
          electricityFuel: 10000,
          rentMisc: 7000,
          packagingTransportation: 0,
        },
        capitalExpenditure: {
          ...capitalExpenditure,
          machinery: 280000,
          shedCivilWorks: 70000,
          electricalConnections: 35000,
          licensesAndRegistration: 15000,
        },
      });
      setLoanAmount(250000);
      setInterestRate(10.0);
      setLoanTenure(48);
      calculateWithBackend({
        investment: 400000,
        fixed_costs: 35000,
        monthly_expenses: 80000,
        selling_price: 250,
        units_sold: 800,
        loan_amount: 250000,
        interest_rate: 10.0,
        loan_tenure: 48,
      });
    }
  };

  // Safe display numbers
  const displayRevenue = apiData?.revenue ?? (pricingAndVolume.expectedMonthlyVolume * pricingAndVolume.sellingPricePerUnit);
  const displayExpenses = apiData?.expenses ?? (monthlyFixedCost + totalMonthlyVariableCost);
  const displayProfit = apiData?.profit ?? (displayRevenue - displayExpenses);
  const displayCashFlow = apiData?.cash_flow ?? displayProfit;
  const displayEmi = apiData?.EMI ?? 0;
  const displayTotalRepayment = apiData?.total_repayment ?? 0;
  const displayBreakEven = apiData?.break_even ?? 0;
  const displayRepaymentBurden = apiData?.repayment_burden ?? 0;
  const displayBreakEvenPercent = apiData?.break_even_capacity_percent ?? Math.min(
    100,
    Math.round((displayBreakEven / (pricingAndVolume.expectedMonthlyVolume || 1)) * 100)
  );

  return (
    <div className="space-y-6 pb-20 md:pb-6 text-left">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-stone-900 sm:text-2xl flex items-center gap-2">
              <Calculator className="h-6 w-6 text-emerald-700" />
              <span>Financial Planner & Cashflow Engine</span>
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
              <Zap className="h-3 w-3 text-emerald-600 fill-emerald-500" />
              <span>Python Math API</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Deterministic unit economics, break-even analysis, and debt repayment burden for{' '}
            <strong className="text-stone-800">{activeBusiness.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => calculateWithBackend()}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-900 transition hover:bg-emerald-100 disabled:opacity-50"
            title="Recalculate via POST /api/v1/finance/calculate"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-700 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Calculating...' : 'Recalculate Engine'}</span>
          </button>

          <button
            onClick={() => setCurrentPage('simulator')}
            className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 transition hover:bg-amber-100"
          >
            <Sliders className="h-4 w-4 text-amber-700" />
            <span>Test Shocks</span>
          </button>
        </div>
      </div>

      {/* Engine Status Banner & Sample Presets */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900">
                  Backend Financial Engine: POST /api/v1/finance/calculate
                </span>
                <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold text-stone-600">
                  Pure Python Math (No Gemini)
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Calculates revenue, expenses, operating profit, net cash flow, EMI, total repayment, break-even & debt burden.
                {lastUpdated && <span className="ml-2 text-stone-400">Synced at {lastUpdated}</span>}
              </p>
            </div>
          </div>

          {/* Quick 1-Click Sample Values */}
          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t border-stone-100 md:border-t-0">
            <span className="text-[11px] font-semibold text-stone-500">Test Samples:</span>
            <button
              onClick={() => handleApplySample(1)}
              className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-700 transition hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900"
            >
              Sample 1: ₹1.5L Unit (₹1L Loan)
            </button>
            <button
              onClick={() => handleApplySample(2)}
              className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-700 transition hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900"
            >
              Sample 2: ₹60K Cottage (₹40K Loan)
            </button>
            <button
              onClick={() => handleApplySample(3)}
              className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-700 transition hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900"
            >
              Sample 3: ₹4L PMEGP (₹2.5L Loan)
            </button>
          </div>
        </div>

        {apiError && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-900 border border-amber-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
            <span>{apiError} (Switched to local mathematical formulas)</span>
          </div>
        )}
      </div>

      {/* Primary KPI Highlights Bar from Python Engine */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Monthly Revenue */}
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
            Gross Monthly Revenue
          </div>
          <div className="mt-1 text-2xl font-black text-stone-900">
            ₹{displayRevenue.toLocaleString('en-IN')}
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            {pricingAndVolume.expectedMonthlyVolume} units @ ₹{pricingAndVolume.sellingPricePerUnit}
          </div>
        </div>

        {/* 2. Monthly Expenses */}
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
            Monthly Expenses (OpEx)
          </div>
          <div className="mt-1 text-2xl font-black text-stone-900">
            ₹{displayExpenses.toLocaleString('en-IN')}
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            Fixed: ₹{monthlyFixedCost.toLocaleString('en-IN')} + Var: ₹{totalMonthlyVariableCost.toLocaleString('en-IN')}
          </div>
        </div>

        {/* 3. Operating Profit */}
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
            Est. Monthly Profit
          </div>
          <div className={`mt-1 text-2xl font-black ${displayProfit > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            ₹{displayProfit.toLocaleString('en-IN')}
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            {displayRevenue > 0 ? `${Math.round((displayProfit / displayRevenue) * 100)}% operating margin` : 'Before loan repayment'}
          </div>
        </div>

        {/* 4. Net Cash Flow after EMI */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
            Net Monthly Cash Flow
          </div>
          <div className={`mt-1 text-2xl font-black ${displayCashFlow > 0 ? 'text-emerald-800' : 'text-red-600'}`}>
            ₹{displayCashFlow.toLocaleString('en-IN')}
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">
            Cash in hand after ₹{displayEmi.toLocaleString('en-IN')} loan EMI
          </div>
        </div>
      </div>

      {/* Secondary Metrics Bar: Debt, Break-Even & Repayment Burden */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-stone-200 bg-white p-3 shadow-xs">
          <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Monthly EMI (Debt)
          </div>
          <div className="mt-1 text-lg font-bold text-stone-900">
            ₹{displayEmi.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-stone-500">
            {loanTenure} months @ {interestRate}%
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-3 shadow-xs">
          <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Total Repayment
          </div>
          <div className="mt-1 text-lg font-bold text-stone-900">
            ₹{displayTotalRepayment.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-stone-500">
            Principal: ₹{loanAmount.toLocaleString('en-IN')} + Int: ₹{(apiData?.total_interest ?? (displayTotalRepayment - loanAmount)).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-3 shadow-xs">
          <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Break-Even Target
          </div>
          <div className="mt-1 text-lg font-bold text-stone-900">
            {displayBreakEven} <span className="text-xs font-normal text-stone-500">units/mo</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">
            {displayBreakEvenPercent}% of monthly volume
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-3 shadow-xs">
          <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Repayment Burden
          </div>
          <div className={`mt-1 text-lg font-bold ${displayRepaymentBurden < 25 ? 'text-emerald-700' : displayRepaymentBurden < 45 ? 'text-amber-600' : 'text-red-600'}`}>
            {displayRepaymentBurden}%
          </div>
          <div className="text-[10px] text-stone-500">
            {apiData?.repayment_burden_status || (displayRepaymentBurden < 25 ? 'Safe (<25%)' : 'Watch cashflow')}
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs and Debt Engine */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Detailed Inputs and Loan Engine */}
        <div className="space-y-6 lg:col-span-2">
          {/* Card: VYOMIK Loan & Debt Engine */}
          <div className="rounded-2xl border border-emerald-200 bg-linear-to-b from-white to-emerald-50/20 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-100 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-700" />
                <h2 className="text-sm font-bold text-stone-900">
                  Loan, Interest & Debt Service Parameters
                </h2>
              </div>
              <span className="text-xs font-medium text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Mudra Kishore / PMEGP Mode
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Loan Amount */}
              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Loan Principal Amount (₹)
                </label>
                <div className="mt-1 relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-stone-400">₹</span>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-stone-200 pl-7 pr-3 py-2 text-xs font-bold text-stone-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    placeholder="e.g. 100000"
                  />
                </div>
                <span className="text-[10px] text-stone-400 mt-1 block">
                  PMEGP/Mudra bank borrowing
                </span>
              </div>

              {/* Interest Rate */}
              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Annual Interest Rate (% p.a.)
                </label>
                <div className="mt-1 relative">
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    placeholder="e.g. 9.0"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-stone-400">%</span>
                </div>
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Govt priority sector 8.5%–10%
                </span>
              </div>

              {/* Loan Tenure */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-stone-700">
                    Loan Tenure ({loanTenureUnit})
                  </label>
                  <button
                    type="button"
                    onClick={() => setLoanTenureUnit(loanTenureUnit === 'months' ? 'years' : 'months')}
                    className="text-[10px] text-emerald-700 hover:underline font-medium"
                  >
                    Switch to {loanTenureUnit === 'months' ? 'Years' : 'Months'}
                  </button>
                </div>
                <input
                  type="number"
                  value={loanTenure}
                  onChange={(e) => setLoanTenure(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder={loanTenureUnit === 'months' ? 'e.g. 36' : 'e.g. 3'}
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  {loanTenureUnit === 'months' ? `${Math.round((loanTenure / 12) * 10) / 10} Years` : `${loanTenure * 12} Months`}
                </span>
              </div>
            </div>

            {/* Live Loan Calculation Summary Callout */}
            <div className="mt-4 rounded-xl bg-white p-3.5 border border-emerald-100 text-xs text-stone-700 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] text-stone-400 block">Monthly Installment</span>
                <span className="font-extrabold text-stone-900 text-sm">₹{displayEmi.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">Total Interest Paid</span>
                <span className="font-extrabold text-amber-800 text-sm">
                  ₹{(apiData?.total_interest ?? Math.max(0, displayTotalRepayment - loanAmount)).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">Debt Burden Ratio</span>
                <span className={`font-extrabold text-sm ${displayRepaymentBurden < 25 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {displayRepaymentBurden}% of profit
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">Safety Assessment</span>
                <span className="font-extrabold text-emerald-800 text-xs">
                  {apiData?.repayment_burden_status || 'Sustainable'}
                </span>
              </div>
            </div>
          </div>

          {/* Unit Pricing & Production Volume */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
              <span>Unit Economics & Target Volume</span>
              <span className="text-xs font-normal text-stone-400">
                Unit: {pricingAndVolume.unitName}
              </span>
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Selling Price per Unit (₹)
                </label>
                <div className="mt-1 relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-stone-400">₹</span>
                  <input
                    type="number"
                    value={pricingAndVolume.sellingPricePerUnit}
                    onChange={(e) =>
                      updateFinancials({
                        pricingAndVolume: {
                          ...pricingAndVolume,
                          sellingPricePerUnit: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full rounded-xl border border-stone-200 pl-7 pr-3 py-2 text-xs font-bold text-stone-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Variable Cost per Unit (₹)
                </label>
                <div className="mt-1 relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-stone-400">₹</span>
                  <input
                    type="number"
                    value={pricingAndVolume.variableCostPerUnit}
                    onChange={(e) =>
                      updateFinancials({
                        pricingAndVolume: {
                          ...pricingAndVolume,
                          variableCostPerUnit: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full rounded-xl border border-stone-200 pl-7 pr-3 py-2 text-xs font-bold text-stone-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Monthly Production Volume
                </label>
                <input
                  type="number"
                  value={pricingAndVolume.expectedMonthlyVolume}
                  onChange={(e) =>
                    updateFinancials({
                      pricingAndVolume: {
                        ...pricingAndVolume,
                        expectedMonthlyVolume: Number(e.target.value),
                      },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50/80 p-3 text-xs text-emerald-950">
              <span>Gross Margin per Unit:</span>
              <span className="font-bold text-emerald-900">
                ₹{pricingAndVolume.sellingPricePerUnit - pricingAndVolume.variableCostPerUnit} (
                {Math.round(
                  ((pricingAndVolume.sellingPricePerUnit - pricingAndVolume.variableCostPerUnit) /
                    (pricingAndVolume.sellingPricePerUnit || 1)) *
                    100
                )}
                %)
              </span>
            </div>
          </div>

          {/* Setup Capital Expenditure (CapEx) */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
              <span>Setup Capital Expenditure (CapEx)</span>
              <span className="text-xs font-bold text-emerald-800">
                Total CapEx: ₹{totalCapEx.toLocaleString('en-IN')}
              </span>
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Primary Machinery & Tools (₹)
                </label>
                <input
                  type="number"
                  value={capitalExpenditure.machinery}
                  onChange={(e) =>
                    updateFinancials({
                      capitalExpenditure: {
                        ...capitalExpenditure,
                        machinery: Number(e.target.value),
                      },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Shed Flooring & Civil Works (₹)
                </label>
                <input
                  type="number"
                  value={capitalExpenditure.shedCivilWorks}
                  onChange={(e) =>
                    updateFinancials({
                      capitalExpenditure: {
                        ...capitalExpenditure,
                        shedCivilWorks: Number(e.target.value),
                      },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Electrical Panel & 3-Phase Meter (₹)
                </label>
                <input
                  type="number"
                  value={capitalExpenditure.electricalConnections}
                  onChange={(e) =>
                    updateFinancials({
                      capitalExpenditure: {
                        ...capitalExpenditure,
                        electricalConnections: Number(e.target.value),
                      },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  FSSAI, Udyam & Panchayat Licences (₹)
                </label>
                <input
                  type="number"
                  value={capitalExpenditure.licensesAndRegistration}
                  onChange={(e) =>
                    updateFinancials({
                      capitalExpenditure: {
                        ...capitalExpenditure,
                        licensesAndRegistration: Number(e.target.value),
                      },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium text-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Monthly Fixed Operating Costs (OpEx) */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
              <span>Monthly Fixed Operating Costs (OpEx)</span>
              <span className="text-xs font-bold text-stone-700">
                Fixed: ₹{monthlyFixedCost.toLocaleString('en-IN')}/mo
              </span>
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Labor / Helper Wages (₹)
                </label>
                <input
                  type="number"
                  value={operationalMonthly.laborWages}
                  onChange={(e) =>
                    updateFinancials({
                      operationalMonthly: {
                        ...operationalMonthly,
                        laborWages: Number(e.target.value),
                      },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Electricity / Commercial Bill (₹)
                </label>
                <input
                  type="number"
                  value={operationalMonthly.electricityFuel}
                  onChange={(e) =>
                    updateFinancials({
                      operationalMonthly: {
                        ...operationalMonthly,
                        electricityFuel: Number(e.target.value),
                      },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Rent & Maintenance (₹)
                </label>
                <input
                  type="number"
                  value={operationalMonthly.rentMisc}
                  onChange={(e) =>
                    updateFinancials({
                      operationalMonthly: {
                        ...operationalMonthly,
                        rentMisc: Number(e.target.value),
                      },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium text-stone-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Working Capital, Break-Even Meter & Repayment Burden */}
        <div className="space-y-4">
          {/* Repayment Burden Gauge */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="h-4 w-4 text-emerald-700" />
                <span>Debt Service & Repayment Burden</span>
              </h3>
            </div>

            <div className="mt-4 text-center">
              <div className={`text-3xl font-black ${displayRepaymentBurden < 25 ? 'text-emerald-700' : displayRepaymentBurden < 45 ? 'text-amber-600' : 'text-red-600'}`}>
                {displayRepaymentBurden}%
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                of monthly operating profit absorbed by EMI
              </p>
            </div>

            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-stone-100">
              <div
                className={`h-full rounded-full transition-all ${
                  displayRepaymentBurden < 25
                    ? 'bg-emerald-600'
                    : displayRepaymentBurden < 45
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, displayRepaymentBurden))}%` }}
              />
            </div>

            <div className="mt-3 space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Monthly Operating Profit:</span>
                <span className="font-bold text-stone-900">₹{displayProfit.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly EMI Obligation:</span>
                <span className="font-bold text-stone-900">₹{displayEmi.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-t border-stone-100 pt-1 font-bold text-emerald-900">
                <span>Net Cash Retained:</span>
                <span>₹{displayCashFlow.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-500 leading-relaxed">
              {displayRepaymentBurden < 25 ? (
                <span className="text-emerald-700 font-semibold">
                  ✓ Safe Burden: EMI is well under 25% of profit, protecting your working capital.
                </span>
              ) : displayRepaymentBurden < 45 ? (
                <span className="text-amber-700 font-semibold">
                  ⚠️ Moderate Burden: EMI takes up a significant slice. Ensure steady monthly production.
                </span>
              ) : (
                <span className="text-red-700 font-semibold">
                  🚨 High Debt Burden: EMI exceeds safe limits. Consider extending tenure or taking a PMEGP capital subsidy.
                </span>
              )}
            </div>
          </div>

          {/* Break-Even Progress Meter */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Break-Even Capacity Gauge
            </h3>

            <div className="mt-4 text-center">
              <div className="text-3xl font-black text-stone-900">
                {displayBreakEvenPercent}%
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                of monthly output covers all operating expenses
              </p>
            </div>

            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-stone-100">
              <div
                className={`h-full rounded-full transition-all ${
                  displayBreakEvenPercent < 50
                    ? 'bg-emerald-600'
                    : displayBreakEvenPercent < 75
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${displayBreakEvenPercent}%` }}
              />
            </div>

            <div className="mt-3 space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Target Units:</span>
                <span className="font-bold text-stone-900">{pricingAndVolume.expectedMonthlyVolume}</span>
              </div>
              <div className="flex justify-between">
                <span>Operating Break-Even:</span>
                <span className="font-bold text-stone-900">{displayBreakEven} units</span>
              </div>
              {apiData?.cash_break_even_units && (
                <div className="flex justify-between text-stone-500">
                  <span>Cash Break-Even (with EMI):</span>
                  <span className="font-medium text-stone-700">{apiData.cash_break_even_units} units</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Profit Zone:</span>
                <span className="font-bold text-emerald-700">
                  +{Math.max(0, pricingAndVolume.expectedMonthlyVolume - displayBreakEven)} units
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-500 leading-relaxed">
              {displayBreakEvenPercent < 60 ? (
                <span className="text-emerald-700 font-semibold">
                  ✓ Healthy venture: Break-even is reached by mid-month.
                </span>
              ) : (
                <span className="text-amber-700 font-semibold">
                  ⚠️ Caution: Requires high production volume to break even.
                </span>
              )}
            </div>
          </div>

          {/* Working Capital Buffer Card */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>Recommended Working Capital Buffer</span>
            </div>
            <p className="mt-1 text-xs text-stone-600 leading-relaxed">
              Rural commodity cycles experience 30 to 45 day payment lags from local retailers. VYOMIK recommends maintaining <strong>2-Month Operating Cash Buffer</strong>.
            </p>

            <div className="mt-4 space-y-2 rounded-xl bg-white p-3.5 border border-emerald-100 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>1-Month Operating Cost:</span>
                <span className="font-bold text-stone-900">₹{displayExpenses.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Buffer Multiplier:</span>
                <span className="font-bold text-stone-900">{workingCapitalBufferMonths} Months</span>
              </div>
              <div className="border-t border-stone-100 pt-1.5 flex justify-between font-bold text-emerald-950">
                <span>Liquidity Cushion:</span>
                <span>₹{recommendedBuffer.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-stone-500">
              Total Project Cost (CapEx + Buffer):{' '}
              <strong className="text-stone-900">₹{totalProjectCost.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
