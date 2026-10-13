import { apiFetch } from '../utils/apiClient';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sliders,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Zap,
  Sparkles,
  IndianRupee,
  CheckCircle2,
  RefreshCw,
  Activity,
  Landmark,
  Percent,
  BarChart3,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Scale,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SimulatorApiResponse {
  status: string;
  profit: number;
  cash_flow: number;
  EMI: number;
  break_even: number;
  risk: string;
  risk_level?: string;
  risk_score?: number;
  risk_status?: string;
  risk_factors?: string[];
  revenue?: number;
  expenses?: number;
  total_repayment?: number;
  repayment_burden?: number;
  repayment_burden_status?: string;
  debt_service_coverage_ratio?: number;
  net_profit_margin_percent?: number;
  break_even_capacity_percent?: number;
  break_even_revenue?: number;
  variable_cost_per_unit?: number;
  contribution_margin_per_unit?: number;
  engine?: string;
}

interface ScenarioComparisonItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  sales: number;
  expenses: number;
  loan: number;
  interest: number;
  description: string;
}

export const SimulatorPage: React.FC = () => {
  const {
    activeBusiness,
    financialData,
    userProfile,
  } = useApp();

  const { pricingAndVolume, operationalMonthly, capitalExpenditure } = financialData;

  // Derive Baseline Operational Parameters from active business financial model
  const baseMonthlyFixedCost =
    operationalMonthly.laborWages +
    operationalMonthly.electricityFuel +
    operationalMonthly.rentMisc;

  const basePrice = pricingAndVolume.sellingPricePerUnit || 120;
  const baseSales = pricingAndVolume.expectedMonthlyVolume || 600;
  const baseVariableTotal =
    pricingAndVolume.expectedMonthlyVolume * (pricingAndVolume.variableCostPerUnit || 75) +
    operationalMonthly.packagingTransportation;
  const baseExpenses = Math.round(baseMonthlyFixedCost + baseVariableTotal);

  const totalCapEx =
    capitalExpenditure.machinery +
    capitalExpenditure.shedCivilWorks +
    capitalExpenditure.electricalConnections +
    capitalExpenditure.licensesAndRegistration;

  const baseLoan = Math.max(
    25000,
    Math.round(totalCapEx - (userProfile.availableCapital > 0 ? userProfile.availableCapital * 0.5 : 0)) || 100000
  );
  const baseInterest = 9.0; // 9.0% standard rural Mudra / PMEGP rate

  // The 5 Interactive Parameters specified in the prompt:
  // price, sales, expenses, loan, interest
  const [price, setPrice] = useState<number>(basePrice);
  const [sales, setSales] = useState<number>(baseSales);
  const [expenses, setExpenses] = useState<number>(baseExpenses);
  const [loan, setLoan] = useState<number>(baseLoan);
  const [interest, setInterest] = useState<number>(baseInterest);

  // Backend API state
  const [apiData, setApiData] = useState<SimulatorApiResponse | null>(null);
  const [baselineApiData, setBaselineApiData] = useState<SimulatorApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [activePresetId, setActivePresetId] = useState<string>('baseline');

  // Debounce ref to avoid flooding Python backend on rapid slider drags
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Core API call function sending: price, sales, expenses, loan, interest
  const fetchSimulationFromPython = useCallback(
    async (
      simParams: {
        price: number;
        sales: number;
        expenses: number;
        loan: number;
        interest: number;
      },
      isBaseline = false
    ) => {
      setIsLoading(true);
      setApiError(null);

      const payload = {
        price: simParams.price,
        sales: simParams.sales,
        expenses: simParams.expenses,
        loan: simParams.loan,
        interest: simParams.interest,
        investment: totalCapEx > 0 ? totalCapEx : 150000,
        loan_tenure: 36, // 36 months standard
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
          throw new Error(`HTTP error ${response.status}: Failed to calculate with Python`);
        }

        const data: SimulatorApiResponse = await response.json();

        if (isBaseline) {
          setBaselineApiData(data);
        } else {
          setApiData(data);
        }
        setLastUpdated(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      } catch (err: any) {
        console.error('Python Financial Engine Error in Simulator:', err);
        setApiError(err.message || 'Error communicating with Python backend');

        // Mathematical fallback matching Python formulas if connection drops
        const rev = simParams.price * simParams.sales;
        const exp = simParams.expenses;
        const prof = rev - exp;
        const monthlyRate = (simParams.interest / 100) / 12;
        const tenureMonths = 36;
        const emi =
          simParams.loan > 0 && monthlyRate > 0
            ? (simParams.loan * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
              (Math.pow(1 + monthlyRate, tenureMonths) - 1)
            : 0;
        const cashFlow = prof - emi;
        const estimatedFixed = exp * 0.35;
        const estimatedVarUnit = simParams.sales > 0 ? (exp * 0.65) / simParams.sales : 0;
        const cm = simParams.price - estimatedVarUnit;
        const be = cm > 0 ? Math.round(estimatedFixed / cm) : 0;

        let rLevel = 'Low';
        let rScore = 20;
        if (prof <= 0 || cashFlow < 0) {
          rLevel = 'High';
          rScore = 80;
        } else if (prof > 0 && (emi / prof) > 0.35) {
          rLevel = 'Moderate';
          rScore = 50;
        }

        const fallbackResult: SimulatorApiResponse = {
          status: 'fallback',
          profit: prof,
          cash_flow: Math.round(cashFlow * 100) / 100,
          EMI: Math.round(emi * 100) / 100,
          break_even: be,
          risk: rLevel,
          risk_level: rLevel,
          risk_score: rScore,
          risk_status: `${rLevel} Risk: Mathematical fallback`,
          risk_factors: [
            prof <= 0 ? 'Operating at a monthly deficit' : 'Healthy operating margin',
            cashFlow < 0 ? 'Negative cash flow after EMI' : 'Positive debt-serviced cash flow',
          ],
          revenue: rev,
          expenses: exp,
        };

        if (isBaseline) {
          setBaselineApiData(fallbackResult);
        } else {
          setApiData(fallbackResult);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [totalCapEx]
  );

  // Initial load: calculate baseline and initial simulation
  useEffect(() => {
    // 1. Compute baseline
    fetchSimulationFromPython(
      {
        price: basePrice,
        sales: baseSales,
        expenses: baseExpenses,
        loan: baseLoan,
        interest: baseInterest,
      },
      true
    );

    // 2. Compute initial simulation
    fetchSimulationFromPython(
      {
        price,
        sales,
        expenses,
        loan,
        interest,
      },
      false
    );
  }, []);

  // Trigger calculation when any of the 5 parameters change with slight debounce
  const triggerDebouncedCalculation = useCallback(
    (newParams: {
      price: number;
      sales: number;
      expenses: number;
      loan: number;
      interest: number;
    }) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        fetchSimulationFromPython(newParams, false);
      }, 150);
    },
    [fetchSimulationFromPython]
  );

  // Parameter Change Handlers
  const handlePriceChange = (newPrice: number) => {
    const val = Math.max(1, Math.round(newPrice));
    setPrice(val);
    setActivePresetId('custom');
    triggerDebouncedCalculation({ price: val, sales, expenses, loan, interest });
  };

  const handleSalesChange = (newSales: number) => {
    const val = Math.max(0, Math.round(newSales));
    setSales(val);
    setActivePresetId('custom');
    triggerDebouncedCalculation({ price, sales: val, expenses, loan, interest });
  };

  const handleExpensesChange = (newExpenses: number) => {
    const val = Math.max(0, Math.round(newExpenses));
    setExpenses(val);
    setActivePresetId('custom');
    triggerDebouncedCalculation({ price, sales, expenses: val, loan, interest });
  };

  const handleLoanChange = (newLoan: number) => {
    const val = Math.max(0, Math.round(newLoan));
    setLoan(val);
    setActivePresetId('custom');
    triggerDebouncedCalculation({ price, sales, expenses, loan: val, interest });
  };

  const handleInterestChange = (newInterest: number) => {
    const val = Math.max(0, Math.min(30, parseFloat(newInterest.toFixed(1))));
    setInterest(val);
    setActivePresetId('custom');
    triggerDebouncedCalculation({ price, sales, expenses, loan, interest: val });
  };

  // Reset to Baseline
  const handleResetToBaseline = () => {
    setPrice(basePrice);
    setSales(baseSales);
    setExpenses(baseExpenses);
    setLoan(baseLoan);
    setInterest(baseInterest);
    setActivePresetId('baseline');
    fetchSimulationFromPython(
      {
        price: basePrice,
        sales: baseSales,
        expenses: baseExpenses,
        loan: baseLoan,
        interest: baseInterest,
      },
      false
    );
  };

  // Preset rural stress scenarios for testing multiple changes
  const scenarioPresets: ScenarioComparisonItem[] = [
    {
      id: 'baseline',
      name: 'Baseline Plan',
      icon: '☀️',
      price: basePrice,
      sales: baseSales,
      expenses: baseExpenses,
      loan: baseLoan,
      interest: baseInterest,
      description: 'Standard baseline operations with standard 9% MUDRA loan.',
    },
    {
      id: 'drought',
      name: 'Drought & Input Inflation',
      icon: '🌵',
      price: Math.round(basePrice * 1.05),
      sales: Math.round(baseSales * 0.8),
      expenses: Math.round(baseExpenses * 1.25),
      loan: baseLoan,
      interest: baseInterest,
      description: 'Raw material costs spike +25%, sales dip -20%, minor retail price pass-through.',
    },
    {
      id: 'bumper',
      name: 'Bumper Harvest & Mandi Glut',
      icon: '🌊',
      price: Math.round(basePrice * 0.9),
      sales: Math.round(baseSales * 1.35),
      expenses: Math.round(baseExpenses * 0.88),
      loan: baseLoan,
      interest: baseInterest,
      description: 'Plentiful raw material reduces costs -12%, volume surges +35%, market price cools -10%.',
    },
    {
      id: 'power_hike',
      name: 'Fuel & Power Tariff Hike',
      icon: '⚡',
      price: basePrice,
      sales: baseSales,
      expenses: Math.round(baseExpenses * 1.18),
      loan: baseLoan,
      interest: baseInterest,
      description: 'Commercial electricity tariff and diesel transport fuel increase monthly expenses by +18%.',
    },
    {
      id: 'debt_stress',
      name: 'Heavy Loan & NBFC Interest',
      icon: '🏦',
      price: basePrice,
      sales: baseSales,
      expenses: baseExpenses,
      loan: Math.round(baseLoan * 1.8),
      interest: 14.5,
      description: 'Expansion financed at higher NBFC rate (14.5% p.a.) with ₹' + Math.round(baseLoan * 1.8).toLocaleString('en-IN') + ' borrowed.',
    },
    {
      id: 'festive_surge',
      name: 'Festive Season Surge',
      icon: '🎉',
      price: Math.round(basePrice * 1.12),
      sales: Math.round(baseSales * 1.5),
      expenses: Math.round(baseExpenses * 1.15),
      loan: baseLoan,
      interest: baseInterest,
      description: 'Peak wedding & festival demand boosts volume +50% with premium margins.',
    },
    {
      id: 'crisis_shock',
      name: 'Severe Stress / Downturn',
      icon: '🚨',
      price: Math.round(basePrice * 0.85),
      sales: Math.round(baseSales * 0.65),
      expenses: Math.round(baseExpenses * 1.2),
      loan: Math.round(baseLoan * 1.5),
      interest: 13.0,
      description: 'Simultaneous price slump, demand contraction, cost inflation, and heavy debt service.',
    },
  ];

  const applyScenarioPreset = (preset: ScenarioComparisonItem) => {
    setActivePresetId(preset.id);
    setPrice(preset.price);
    setSales(preset.sales);
    setExpenses(preset.expenses);
    setLoan(preset.loan);
    setInterest(preset.interest);
    fetchSimulationFromPython(
      {
        price: preset.price,
        sales: preset.sales,
        expenses: preset.expenses,
        loan: preset.loan,
        interest: preset.interest,
      },
      false
    );
  };

  // Compute deltas against baseline
  const priceDeltaPercent =
    basePrice > 0 ? Math.round(((price - basePrice) / basePrice) * 100) : 0;
  const salesDeltaPercent =
    baseSales > 0 ? Math.round(((sales - baseSales) / baseSales) * 100) : 0;
  const expensesDeltaPercent =
    baseExpenses > 0 ? Math.round(((expenses - baseExpenses) / baseExpenses) * 100) : 0;
  const loanDeltaPercent =
    baseLoan > 0 ? Math.round(((loan - baseLoan) / baseLoan) * 100) : 0;
  const interestDelta = Math.round((interest - baseInterest) * 10) / 10;

  // Active simulated outputs from Python
  const simProfit = apiData?.profit ?? (price * sales - expenses);
  const baseProfit = baselineApiData?.profit ?? (basePrice * baseSales - baseExpenses);
  const profitDeltaPercent =
    baseProfit !== 0 ? Math.round(((simProfit - baseProfit) / Math.abs(baseProfit)) * 100) : 0;

  const simCashFlow = apiData?.cash_flow ?? (simProfit - (apiData?.EMI ?? 0));
  const simEMI = apiData?.EMI ?? 0;
  const simBreakEven = apiData?.break_even ?? 0;
  const simRisk = apiData?.risk ?? (simProfit > 0 && simCashFlow > 0 ? 'Low' : 'High');
  const simRiskScore = apiData?.risk_score ?? (simProfit <= 0 ? 85 : 25);
  const simRiskFactors = apiData?.risk_factors ?? [];

  // Runway under loss
  const monthlyLoss = simCashFlow < 0 ? Math.abs(simCashFlow) : 0;
  const runwayMonths =
    monthlyLoss > 0
      ? (userProfile.availableCapital / monthlyLoss).toFixed(1)
      : 'Sustainable';

  return (
    <div className="space-y-6 pb-20 md:pb-6 text-left">
      {/* Top Header & Engine Connection Status */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected to Python: POST /api/v1/finance/calculate
            </span>
            {lastUpdated && (
              <span className="text-[11px] text-stone-400">
                Synced at {lastUpdated}
              </span>
            )}
          </div>
          <h1 className="mt-1.5 text-xl font-extrabold text-stone-900 sm:text-2xl flex items-center gap-2">
            <Sliders className="h-6 w-6 text-amber-600" />
            <span>What-If Financial Simulator</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Dynamically recalculate <strong className="text-stone-800">{activeBusiness.name}</strong> using the pure Python financial engine. Adjust{' '}
            <strong className="text-stone-700">price, sales, expenses, loan, and interest</strong> to view real-time impact on{' '}
            <strong className="text-stone-700">profit, cash flow, EMI, break-even, and risk</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              fetchSimulationFromPython(
                { price, sales, expenses, loan, interest },
                false
              )
            }
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-xs transition-colors"
            title="Recalculate with Python"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
            <span>{isLoading ? 'Calculating...' : 'Recalculate'}</span>
          </button>

          <button
            onClick={handleResetToBaseline}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 shadow-xs transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Baseline</span>
          </button>
        </div>
      </div>

      {/* Error notification if API fails */}
      {apiError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Backend notice: {apiError}. Using client mathematical formulas.</span>
          </div>
          <button
            onClick={() => fetchSimulationFromPython({ price, sales, expenses, loan, interest }, false)}
            className="underline font-bold hover:text-amber-950 ml-2"
          >
            Retry Python
          </button>
        </div>
      )}

      {/* 5 Primary Outputs Required by User Prompt:
          Show updated:
          1. profit
          2. cash flow
          3. EMI
          4. break-even
          5. risk
      */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-amber-600" />
            Simulated Outputs from Python Engine (Live)
          </span>
          {isLoading && (
            <span className="text-xs font-medium text-amber-600 flex items-center gap-1 animate-pulse">
              <RefreshCw className="h-3 w-3 animate-spin" /> Recalculating metrics...
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* 1. PROFIT */}
          <div
            className={`rounded-2xl border p-4 shadow-xs transition-all ${
              simProfit >= 0
                ? 'border-emerald-200 bg-gradient-to-b from-emerald-50/70 to-white'
                : 'border-red-200 bg-gradient-to-b from-red-50/70 to-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                1. Profit
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  simProfit >= 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {apiData?.net_profit_margin_percent
                  ? `${apiData.net_profit_margin_percent}% margin`
                  : simProfit >= 0
                  ? 'Profitable'
                  : 'Loss'}
              </span>
            </div>
            <div
              className={`mt-2 text-2xl font-black ${
                simProfit >= 0 ? 'text-emerald-800' : 'text-red-700'
              }`}
            >
              ₹{Math.round(simProfit).toLocaleString('en-IN')}
              <span className="text-xs font-normal text-stone-500 ml-1">/mo</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold">
              {profitDeltaPercent >= 0 ? (
                <span className="flex items-center text-emerald-700">
                  <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
                  +{profitDeltaPercent}% vs baseline
                </span>
              ) : (
                <span className="flex items-center text-red-700">
                  <TrendingDown className="h-3.5 w-3.5 mr-0.5" />
                  {profitDeltaPercent}% vs baseline
                </span>
              )}
            </div>
            <div className="mt-1 text-[10px] text-stone-400">
              Baseline: ₹{Math.round(baseProfit).toLocaleString('en-IN')}
            </div>
          </div>

          {/* 2. CASH FLOW */}
          <div
            className={`rounded-2xl border p-4 shadow-xs transition-all ${
              simCashFlow >= 0
                ? 'border-blue-200 bg-gradient-to-b from-blue-50/70 to-white'
                : 'border-amber-200 bg-gradient-to-b from-amber-50/70 to-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                2. Cash Flow
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  simCashFlow >= 0
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                In-Hand Cash
              </span>
            </div>
            <div
              className={`mt-2 text-2xl font-black ${
                simCashFlow >= 0 ? 'text-blue-900' : 'text-amber-800'
              }`}
            >
              ₹{Math.round(simCashFlow).toLocaleString('en-IN')}
              <span className="text-xs font-normal text-stone-500 ml-1">/mo</span>
            </div>
            <div className="mt-2 text-[11px] text-stone-600 font-medium">
              After ₹{Math.round(simEMI).toLocaleString('en-IN')} loan EMI
            </div>
            <div className="mt-1 text-[10px] text-stone-400">
              Runway: <strong className="text-stone-700">{runwayMonths}</strong>{' '}
              {typeof runwayMonths === 'string' && runwayMonths !== 'Sustainable' ? 'mos' : ''}
            </div>
          </div>

          {/* 3. EMI */}
          <div className="rounded-2xl border border-stone-200 bg-gradient-to-b from-stone-50/70 to-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                3. EMI
              </span>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                {interest}% p.a.
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-stone-900">
              ₹{Math.round(simEMI).toLocaleString('en-IN')}
              <span className="text-xs font-normal text-stone-500 ml-1">/mo</span>
            </div>
            <div className="mt-2 text-[11px] text-stone-600 font-medium">
              On ₹{loan.toLocaleString('en-IN')} principal (36m)
            </div>
            <div className="mt-1 text-[10px] text-stone-400">
              Repayment Burden:{' '}
              <strong className="text-stone-700">
                {apiData?.repayment_burden ?? (simProfit > 0 ? Math.round((simEMI / simProfit) * 1000) / 10 : 0)}%
              </strong>
            </div>
          </div>

          {/* 4. BREAK-EVEN */}
          <div className="rounded-2xl border border-stone-200 bg-gradient-to-b from-stone-50/70 to-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                4. Break-Even
              </span>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                Threshold
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-stone-900">
              {Math.round(simBreakEven).toLocaleString('en-IN')}
              <span className="text-xs font-normal text-stone-500 ml-1">units/mo</span>
            </div>
            <div className="mt-2 text-[11px] text-stone-600 font-medium">
              {sales > 0
                ? `${Math.round((simBreakEven / sales) * 100)}% of simulated sales (${sales})`
                : 'Zero sales recorded'}
            </div>
            <div className="mt-1 text-[10px] text-stone-400">
              Revenue BE: ₹{Math.round(apiData?.break_even_revenue ?? simBreakEven * price).toLocaleString('en-IN')}
            </div>
          </div>

          {/* 5. RISK */}
          <div
            className={`rounded-2xl border p-4 shadow-xs transition-all ${
              simRisk === 'Low'
                ? 'border-emerald-300 bg-gradient-to-b from-emerald-50 to-white'
                : simRisk === 'Moderate'
                ? 'border-amber-300 bg-gradient-to-b from-amber-50 to-white'
                : 'border-red-300 bg-gradient-to-b from-red-50 to-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                5. Risk
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                  simRisk === 'Low'
                    ? 'bg-emerald-100 text-emerald-800'
                    : simRisk === 'Moderate'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {simRisk} Risk
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              {simRisk === 'Low' ? (
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              ) : simRisk === 'Moderate' ? (
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              ) : (
                <ShieldAlert className="h-6 w-6 text-red-600" />
              )}
              <div>
                <div
                  className={`text-xl font-black ${
                    simRisk === 'Low'
                      ? 'text-emerald-900'
                      : simRisk === 'Moderate'
                      ? 'text-amber-900'
                      : 'text-red-900'
                  }`}
                >
                  {simRiskScore} / 100
                </div>
                <div className="text-[10px] text-stone-500">Risk Score</div>
              </div>
            </div>
            <div className="mt-2 text-[11px] font-medium leading-tight text-stone-700 line-clamp-2">
              {apiData?.risk_status || (simRisk === 'Low' ? 'Safe and viable' : 'Requires caution')}
            </div>
          </div>
        </div>
      </div>

      {/* Preset Stress Scenarios (One-Click Testing for Multiple Changes) */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Test Multiple Changes via One-Click Rural Stress Presets:
            </span>
          </div>
          <span className="text-[11px] text-stone-400">
            Click any scenario to send all 5 variables directly to Python
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7">
          {scenarioPresets.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => applyScenarioPreset(preset)}
                className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/30'
                    : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100/80'
                }`}
              >
                <div className="flex items-center gap-1.5 w-full">
                  <span className="text-base">{preset.icon}</span>
                  <span className="text-xs font-bold text-stone-800 truncate">{preset.name}</span>
                </div>
                <div className="mt-1 text-[10px] text-stone-500 line-clamp-2 leading-tight">
                  {preset.description}
                </div>
                <div className="mt-2 text-[9px] font-semibold text-stone-400 w-full pt-1 border-t border-stone-200/60">
                  P: ₹{preset.price} | S: {preset.sales}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Controls for the 5 User Parameters:
          1. price
          2. sales
          3. expenses
          4. loan
          5. interest
      */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-3 gap-2">
          <div>
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-amber-600" />
              <span>Interactive Parameter Controls (Sends to Python API on Change)</span>
            </h2>
            <p className="text-xs text-stone-500">
              Drag the sliders or type numbers directly. Every modification triggers <code className="text-amber-700 font-mono">POST /api/v1/finance/calculate</code>.
            </p>
          </div>
          {activePresetId !== 'baseline' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
              Active Mode: <strong className="text-amber-700 uppercase">{activePresetId}</strong>
            </span>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Parameter 1: Price (selling_price) */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/40 p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <IndianRupee className="h-3.5 w-3.5 text-emerald-600" />
                <span>1. Selling Price per Unit (price)</span>
              </label>
              <div className="flex items-center gap-2">
                {priceDeltaPercent !== 0 && (
                  <span
                    className={`text-[11px] font-bold ${
                      priceDeltaPercent > 0 ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {priceDeltaPercent > 0 ? '+' : ''}
                    {priceDeltaPercent}% vs baseline
                  </span>
                )}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-xs text-stone-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={price}
                    onChange={(e) => handlePriceChange(Number(e.target.value))}
                    className="w-24 rounded-lg border border-stone-300 bg-white pl-5 pr-2 py-1 text-xs font-bold text-stone-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <input
              type="range"
              min={Math.max(1, Math.round(basePrice * 0.4))}
              max={Math.round(basePrice * 2.5)}
              step="1"
              value={price}
              onChange={(e) => handlePriceChange(Number(e.target.value))}
              className="mt-3 w-full accent-emerald-600 cursor-pointer"
            />
            <div className="mt-1 flex justify-between text-[10px] text-stone-400">
              <span>₹{Math.max(1, Math.round(basePrice * 0.4))} (Heavy Discount)</span>
              <span className="font-semibold text-stone-600">Baseline: ₹{basePrice}</span>
              <span>₹{Math.round(basePrice * 2.5)} (Premium)</span>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <button
                onClick={() => handlePriceChange(Math.round(basePrice * 0.85))}
                className="rounded-md bg-stone-200/70 hover:bg-stone-200 px-2 py-0.5 text-[10px] font-medium text-stone-700"
              >
                -15% (Price War)
              </button>
              <button
                onClick={() => handlePriceChange(basePrice)}
                className="rounded-md bg-stone-200/70 hover:bg-stone-200 px-2 py-0.5 text-[10px] font-medium text-stone-700"
              >
                Baseline (₹{basePrice})
              </button>
              <button
                onClick={() => handlePriceChange(Math.round(basePrice * 1.15))}
                className="rounded-md bg-stone-200/70 hover:bg-stone-200 px-2 py-0.5 text-[10px] font-medium text-stone-700"
              >
                +15% (Branded Packaging)
              </button>
            </div>
          </div>

          {/* Parameter 2: Sales (units_sold) */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/40 p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
                <span>2. Monthly Sales Volume (sales)</span>
              </label>
              <div className="flex items-center gap-2">
                {salesDeltaPercent !== 0 && (
                  <span
                    className={`text-[11px] font-bold ${
                      salesDeltaPercent > 0 ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {salesDeltaPercent > 0 ? '+' : ''}
                    {salesDeltaPercent}% vs baseline
                  </span>
                )}
                <input
                  type="number"
                  min="0"
                  max="50000"
                  value={sales}
                  onChange={(e) => handleSalesChange(Number(e.target.value))}
                  className="w-24 rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs font-bold text-stone-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <input
              type="range"
              min={Math.max(10, Math.round(baseSales * 0.2))}
              max={Math.round(baseSales * 2.5)}
              step="10"
              value={sales}
              onChange={(e) => handleSalesChange(Number(e.target.value))}
              className="mt-3 w-full accent-blue-600 cursor-pointer"
            />
            <div className="mt-1 flex justify-between text-[10px] text-stone-400">
              <span>{Math.max(10, Math.round(baseSales * 0.2))} units (Sluggish)</span>
              <span className="font-semibold text-stone-600">Baseline: {baseSales} units</span>
              <span>{Math.round(baseSales * 2.5)} units (Peak festival)</span>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <button
                onClick={() => handleSalesChange(Math.round(baseSales * 0.7))}
                className="rounded-md bg-stone-200/70 hover:bg-stone-200 px-2 py-0.5 text-[10px] font-medium text-stone-700"
              >
                -30% (Lean Season)
              </button>
              <button
                onClick={() => handleSalesChange(baseSales)}
                className="rounded-md bg-stone-200/70 hover:bg-stone-200 px-2 py-0.5 text-[10px] font-medium text-stone-700"
              >
                Baseline ({baseSales})
              </button>
              <button
                onClick={() => handleSalesChange(Math.round(baseSales * 1.4))}
                className="rounded-md bg-stone-200/70 hover:bg-stone-200 px-2 py-0.5 text-[10px] font-medium text-stone-700"
              >
                +40% (New Haat Tie-up)
              </button>
            </div>
          </div>

          {/* Parameter 3: Expenses (fixed_costs + monthly_expenses) */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/40 p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-amber-600" />
                <span>3. Monthly Total Expenses (expenses)</span>
              </label>
              <div className="flex items-center gap-2">
                {expensesDeltaPercent !== 0 && (
                  <span
                    className={`text-[11px] font-bold ${
                      expensesDeltaPercent > 0 ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    {expensesDeltaPercent > 0 ? '+' : ''}
                    {expensesDeltaPercent}% vs baseline
                  </span>
                )}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-xs text-stone-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="1000000"
                    step="1000"
                    value={expenses}
                    onChange={(e) => handleExpensesChange(Number(e.target.value))}
                    className="w-28 rounded-lg border border-stone-300 bg-white pl-5 pr-2 py-1 text-xs font-bold text-stone-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <input
              type="range"
              min={Math.max(5000, Math.round(baseExpenses * 0.4))}
              max={Math.round(baseExpenses * 2.2)}
              step="1000"
              value={expenses}
              onChange={(e) => handleExpensesChange(Number(e.target.value))}
              className="mt-3 w-full accent-amber-600 cursor-pointer"
            />
            <div className="mt-1 flex justify-between text-[10px] text-stone-400">
              <span>₹{Math.max(5000, Math.round(baseExpenses * 0.4)).toLocaleString('en-IN')} (Bulk savings)</span>
              <span className="font-semibold text-stone-600">Baseline: ₹{baseExpenses.toLocaleString('en-IN')}</span>
              <span>₹{Math.round(baseExpenses * 2.2).toLocaleString('en-IN')} (High inflation)</span>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <button
                onClick={() => handleExpensesChange(Math.round(baseExpenses * 0.85))}
                className="rounded-md bg-stone-200/70 hover:bg-stone-200 px-2 py-0.5 text-[10px] font-medium text-stone-700"
              >
                -15% (Solar / Bulk Mandi)
              </button>
              <button
                onClick={() => handleExpensesChange(baseExpenses)}
                className="rounded-md bg-stone-200/70 hover:bg-stone-200 px-2 py-0.5 text-[10px] font-medium text-stone-700"
              >
                Baseline (₹{baseExpenses.toLocaleString('en-IN')})
              </button>
              <button
                onClick={() => handleExpensesChange(Math.round(baseExpenses * 1.25))}
                className="rounded-md bg-stone-200/70 hover:bg-stone-200 px-2 py-0.5 text-[10px] font-medium text-stone-700"
              >
                +25% (Diesel / Drought Shock)
              </button>
            </div>
          </div>

          {/* Parameter 4 & 5: Loan & Interest in combined card */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/40 p-4 space-y-4">
            {/* 4. Loan */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Landmark className="h-3.5 w-3.5 text-purple-600" />
                  <span>4. Loan Amount Borrowed (loan)</span>
                </label>
                <div className="flex items-center gap-2">
                  {loanDeltaPercent !== 0 && (
                    <span
                      className={`text-[11px] font-bold ${
                        loanDeltaPercent > 0 ? 'text-amber-700' : 'text-emerald-700'
                      }`}
                    >
                      {loanDeltaPercent > 0 ? '+' : ''}
                      {loanDeltaPercent}% vs baseline
                    </span>
                  )}
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-xs text-stone-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="2000000"
                      step="10000"
                      value={loan}
                      onChange={(e) => handleLoanChange(Number(e.target.value))}
                      className="w-28 rounded-lg border border-stone-300 bg-white pl-5 pr-2 py-1 text-xs font-bold text-stone-900 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="800000"
                step="10000"
                value={loan}
                onChange={(e) => handleLoanChange(Number(e.target.value))}
                className="mt-2 w-full accent-purple-600 cursor-pointer"
              />
              <div className="mt-1 flex justify-between text-[10px] text-stone-400">
                <span>₹0 (Zero Debt)</span>
                <span className="font-semibold text-stone-600">Baseline: ₹{baseLoan.toLocaleString('en-IN')}</span>
                <span>₹8,00,000 (Tarun Loan)</span>
              </div>
            </div>

            {/* 5. Interest */}
            <div className="pt-3 border-t border-stone-200/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Percent className="h-3.5 w-3.5 text-rose-600" />
                  <span>5. Annual Interest Rate (interest)</span>
                </label>
                <div className="flex items-center gap-2">
                  {interestDelta !== 0 && (
                    <span
                      className={`text-[11px] font-bold ${
                        interestDelta > 0 ? 'text-red-600' : 'text-emerald-700'
                      }`}
                    >
                      {interestDelta > 0 ? '+' : ''}
                      {interestDelta}%
                    </span>
                  )}
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      step="0.5"
                      value={interest}
                      onChange={(e) => handleInterestChange(Number(e.target.value))}
                      className="w-20 rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs font-bold text-stone-900 focus:border-rose-500 focus:outline-none"
                    />
                    <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-xs text-stone-400 pointer-events-none">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <input
                type="range"
                min="4"
                max="24"
                step="0.5"
                value={interest}
                onChange={(e) => handleInterestChange(Number(e.target.value))}
                className="mt-2 w-full accent-rose-600 cursor-pointer"
              />
              <div className="mt-1 flex justify-between text-[10px] text-stone-400">
                <span>4% (Subsidized SHG)</span>
                <span className="font-semibold text-stone-600">Mudra: 9.0%</span>
                <span>24% (Informal moneylender)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factors and Mitigation Breakdown from Python Engine */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left: Risk Breakdown & Factors from Python */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <span>Python Risk Evaluation & Factors</span>
            </h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                simRisk === 'Low'
                  ? 'bg-emerald-100 text-emerald-800'
                  : simRisk === 'Moderate'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              Risk Status: {simRisk}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {simRiskFactors.length > 0 ? (
              simRiskFactors.map((factor, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 rounded-xl bg-stone-50 p-3 text-xs text-stone-700"
                >
                  <div className="mt-0.5">
                    {simRisk === 'Low' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : simRisk === 'Moderate' ? (
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    ) : (
                      <ShieldAlert className="h-4 w-4 text-red-600 shrink-0" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-stone-900">Factor {idx + 1}:</span>{' '}
                    <span>{factor}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Healthy margins, positive cash flow, and safe debt repayment burden.</span>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-xl border border-stone-100 bg-stone-50/70 p-3 text-xs text-stone-600 flex justify-between items-center">
            <div>
              <span className="font-bold text-stone-800">Debt Service Coverage (DSCR): </span>
              <span>{apiData?.debt_service_coverage_ratio ?? (simProfit > 0 && simEMI > 0 ? (simProfit / simEMI).toFixed(2) : 'N/A')}</span>
            </div>
            <div>
              <span className="font-bold text-stone-800">Repayment Burden: </span>
              <span>{apiData?.repayment_burden ?? 0}% of profit</span>
            </div>
          </div>
        </div>

        {/* Right: Operational Mitigation Advice */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-900 text-white p-5 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-300 pb-3 border-b border-emerald-800">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Resilience Action Plan for this Scenario</span>
          </div>

          <div className="mt-4 space-y-3 text-xs leading-relaxed text-emerald-100">
            <div className="rounded-xl bg-emerald-800/60 p-3">
              <strong className="text-white block mb-1">1. Cash Buffer Allocation:</strong>
              {userProfile.availableCapital > 0 ? (
                <span>
                  Your personal reserve buffer of ₹{userProfile.availableCapital.toLocaleString('en-IN')} provides{' '}
                  <strong className="text-white font-bold">{runwayMonths} months</strong> of runway under worst-case operational distress.
                </span>
              ) : (
                <span>
                  Maintain at least 45 days of working capital (₹{Math.round(expenses * 1.5).toLocaleString('en-IN')}) in a liquid Gramin bank savings account.
                </span>
              )}
            </div>

            <div className="rounded-xl bg-emerald-800/60 p-3">
              <strong className="text-white block mb-1">2. Price vs. Volume Tradeoff:</strong>
              <span>
                At selling price ₹{price} and expense ₹{expenses.toLocaleString('en-IN')}, break-even requires selling at least{' '}
                <strong className="text-white font-bold">{Math.round(simBreakEven)} units</strong>/month. Prioritize direct sales at local Haats to protect price realization.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
