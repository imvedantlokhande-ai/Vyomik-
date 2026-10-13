import React from 'react';
import {
  TrendingUp,
  Award,
  Sparkles,
  MapPin,
  CalendarCheck,
  Calculator,
  Sliders,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  IndianRupee,
  Factory,
  ChevronRight,
  Droplets,
  Zap,
  Mic,
  BarChart3,
  Percent,
  Compass,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Check,
  Building2,
  Users,
  Layers,
  ArrowUpRight,
  Briefcase,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/i18n';
import { ActionPlanPhase, ActionPlanTask } from '../types';
import {
  ViabilityGauge,
  CashflowBarChart,
  SubsidySplitChart,
} from '../components/SimpleCharts';

export const DashboardPage: React.FC = () => {
  const {
    userProfile,
    switchProfile,
    availableProfiles,
    activeBusiness,
    setCurrentPage,
    schemes,
    actionPlan,
    toggleTaskCompletion,
    businesses,
    selectBusiness,
    opportunities,
    language,
  } = useApp();

  const t = getTranslation(language);

  // Top matched scheme
  const topScheme = schemes[0];

  // Calculate task progress
  const allTasks = actionPlan.flatMap((p) => p.tasks);
  const completedTasks = allTasks.filter((t) => t.isCompleted).length;
  const progressPercent = Math.round((completedTasks / (allTasks.length || 1)) * 100);

  // Find next recommended pending action
  let nextTask: ActionPlanTask | null = null;
  let nextPhase: ActionPlanPhase | null = null;
  for (const phase of actionPlan) {
    const found = phase.tasks.find((task) => !task.isCompleted);
    if (found) {
      nextTask = found;
      nextPhase = phase;
      break;
    }
  }
  // If all completed, point to the last task
  if (!nextTask && actionPlan.length > 0 && actionPlan[0].tasks.length > 0) {
    const lastPhase = actionPlan[actionPlan.length - 1];
    nextTask = lastPhase.tasks[lastPhase.tasks.length - 1];
    nextPhase = lastPhase;
  }

  // Find matched local market opportunity for the user's district
  const matchedOpportunity =
    opportunities.find(
      (opp) => opp.district.toLowerCase() === userProfile.district.toLowerCase()
    ) ||
    opportunities.find((opp) =>
      opp.recommendedBusinessIds.includes(activeBusiness.id)
    ) ||
    opportunities[0];

  // Calculate dynamic Financial Health Score (0-100)
  const capitalCoverage = Math.min(
    100,
    Math.round((userProfile.availableCapital / (activeBusiness.minCapital || 1)) * 100)
  );
  const marginHealth = Math.min(
    100,
    Math.round((activeBusiness.grossMarginPercent / 35) * 100)
  );
  const paybackHealth =
    activeBusiness.paybackPeriodMonths <= 6
      ? 96
      : activeBusiness.paybackPeriodMonths <= 12
      ? 88
      : 74;
  const subsidyBoostScore = userProfile.casteCategory === 'General' ? 82 : 96;

  const financialHealthScore = Math.min(
    99,
    Math.round(
      capitalCoverage * 0.35 +
        marginHealth * 0.3 +
        paybackHealth * 0.2 +
        subsidyBoostScore * 0.15
    )
  );

  // Risk Level determination
  const isLowRisk =
    activeBusiness.operationalComplexity === 'Beginner' ||
    (activeBusiness.operationalComplexity === 'Moderate' &&
      userProfile.availableCapital >= activeBusiness.minCapital);
  const riskLevelText = isLowRisk ? 'Low Risk' : 'Moderate Risk';

  // Greeting based on language
  const greeting =
    language === 'मराठी'
      ? `राम राम, ${userProfile.name}!`
      : language === 'हिंदी'
      ? `नमस्ते, ${userProfile.name}!`
      : `Ram Ram, ${userProfile.name}!`;

  const localizedBizName =
    language === 'मराठी' && (activeBusiness as any).marathiName
      ? (activeBusiness as any).marathiName
      : language === 'हिंदी' && activeBusiness.hindiName
      ? activeBusiness.hindiName
      : activeBusiness.name;

  return (
    <div className="space-y-6 pb-20 md:pb-6 text-left">
      {/* 1. Hero Welcome & Location Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 p-5 text-white shadow-xl sm:p-7">
        <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-200">
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                <span>
                  {userProfile.village}, {userProfile.block} · {userProfile.district}, {userProfile.state}
                </span>
              </div>
              <span className="text-[11px] font-bold text-amber-300">
                {userProfile.casteCategory} Category · 35% PMEGP Eligible
              </span>
            </div>

            <h1 className="text-xl font-black tracking-tight sm:text-2xl lg:text-3xl text-white">
              {greeting}
            </h1>

            <p className="max-w-2xl text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {language === 'मराठी'
                ? `स्थानिक बाजार व कच्च्या मालानुसार सर्वोत्तम निवड: `
                : language === 'हिंदी'
                ? `स्थानीय मंडी एवं कृषि अधिशेष के अनुसार सर्वोत्तम अवसर: `
                : `Your verified rural venture recommendation is `}
              <strong className="text-amber-300 font-extrabold underline decoration-amber-400/50 underline-offset-4">
                {localizedBizName}
              </strong>
              . {activeBusiness.tagline}
            </p>

            {/* Quick Demo Profile Switcher Chips */}
            <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs text-emerald-200">
              <span className="text-[11px] font-medium text-emerald-300/80">Demo Profiles:</span>
              {availableProfiles.map((p) => {
                const isSelected = p.id === userProfile.id;
                return (
                  <button
                    key={p.id}
                    id={`demo-profile-btn-${p.id}`}
                    onClick={() => switchProfile(p.id)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition min-h-[32px] ${
                      isSelected
                        ? 'bg-amber-400 text-emerald-950 shadow-sm'
                        : 'bg-emerald-900/80 text-emerald-100 hover:bg-emerald-800 border border-emerald-700/50'
                    }`}
                  >
                    {p.name.split(' ')[0]} ({p.district})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Voice & Action Plan Top Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              id="dash-voice-ai-cta-btn"
              onClick={() => setCurrentPage('advisor')}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-300 px-4 py-3 text-xs sm:text-sm font-black text-emerald-950 shadow-md transition hover:scale-105 active:scale-95 min-h-[46px]"
            >
              <Mic className="h-5 w-5 fill-emerald-950" />
              <span>{t.advisor.micTapToSpeak}</span>
            </button>

            <button
              id="dash-open-action-plan-btn"
              onClick={() => setCurrentPage('action-plan')}
              className="flex items-center gap-1.5 rounded-2xl border border-emerald-700 bg-emerald-800/80 px-4 py-3 text-xs sm:text-sm font-bold text-white transition hover:bg-emerald-700 active:scale-95 min-h-[46px]"
            >
              <CalendarCheck className="h-4 w-4" />
              <span>90-Day Roadmap</span>
            </button>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute -right-12 -bottom-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-16 h-48 w-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* 2. REQUIRED QUICK BUTTONS BAR */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Quick Actions & Navigators
          </h2>
          <span className="text-[11px] text-stone-400">1-Tap Direct Access</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Quick Button 1: Ask AI */}
          <button
            id="quick-btn-ask-ai"
            onClick={() => setCurrentPage('advisor')}
            className="group flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 text-left shadow-sm transition hover:border-amber-400 hover:shadow-md active:scale-98 min-h-[56px]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-emerald-950 shadow-xs transition group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-black text-stone-900 group-hover:text-amber-800 sm:text-sm">
                {t.dashboard.quickButtons.askAi}
              </div>
              <div className="text-[11px] text-stone-500">
                Voice & Chat Mitra
              </div>
            </div>
          </button>

          {/* Quick Button 2: Explore Opportunities */}
          <button
            id="quick-btn-explore-opps"
            onClick={() => setCurrentPage('opportunities')}
            className="group flex items-center gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 text-left shadow-sm transition hover:border-emerald-400 hover:shadow-md active:scale-98 min-h-[56px]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs transition group-hover:scale-105">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-black text-stone-900 group-hover:text-emerald-800 sm:text-sm">
                {t.dashboard.quickButtons.exploreOpportunities}
              </div>
              <div className="text-[11px] text-stone-500">
                District Gaps & Surplus
              </div>
            </div>
          </button>

          {/* Quick Button 3: Financial Plan */}
          <button
            id="quick-btn-financial-plan"
            onClick={() => setCurrentPage('financial-planner')}
            className="group flex items-center gap-3 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4 text-left shadow-sm transition hover:border-blue-400 hover:shadow-md active:scale-98 min-h-[56px]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs transition group-hover:scale-105">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-black text-stone-900 group-hover:text-blue-800 sm:text-sm">
                {t.dashboard.quickButtons.financialPlan}
              </div>
              <div className="text-[11px] text-stone-500">
                Cashflow & Payback
              </div>
            </div>
          </button>

          {/* Quick Button 4: Government Support */}
          <button
            id="quick-btn-govt-support"
            onClick={() => setCurrentPage('schemes')}
            className="group flex items-center gap-3 rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-fuchsia-50/50 p-4 text-left shadow-sm transition hover:border-purple-400 hover:shadow-md active:scale-98 min-h-[56px]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs transition group-hover:scale-105">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-black text-stone-900 group-hover:text-purple-800 sm:text-sm">
                {t.dashboard.quickButtons.governmentSupport}
              </div>
              <div className="text-[11px] text-stone-500">
                35% Subsidy & Mudra
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 3. CORE SCORES: Business Opportunity Score, Financial Health Score, Risk Level */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Metric 1: Business Opportunity Score */}
        <div
          id="dash-opportunity-score-card"
          className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-emerald-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  {t.dashboard.businessOpportunityScore}
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-800">
                Verified Match
              </span>
            </div>

            <div className="my-3 flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-stone-900 sm:text-4xl">
                  {activeBusiness.overallViabilityScore}%
                </div>
                <div className="mt-1 text-xs font-semibold text-emerald-700">
                  High Local Agro Fit
                </div>
              </div>
              <ViabilityGauge
                score={activeBusiness.overallViabilityScore}
                size="md"
                label=""
              />
            </div>

            {/* Score Weights Breakdown */}
            <div className="space-y-1.5 border-t border-stone-100 pt-3 text-[11px]">
              <div className="flex justify-between text-stone-600">
                <span>Raw Material Surplus:</span>
                <span className="font-bold text-stone-900">
                  {activeBusiness.weights.rawMaterialSurplus}%
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Local Demand Strength:</span>
                <span className="font-bold text-stone-900">
                  {activeBusiness.weights.localDemandStrength}%
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Subsidy & Policy Boost:</span>
                <span className="font-bold text-stone-900">
                  {activeBusiness.weights.governmentSubsidyBoost}%
                </span>
              </div>
            </div>
          </div>

          <button
            id="dash-view-explainability-btn"
            onClick={() => setCurrentPage('explainability')}
            className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 min-h-[38px]"
          >
            <span>Why This Match? Algorithm</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Metric 2: Financial Health Score */}
        <div
          id="dash-financial-health-card"
          className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-blue-400 hover:shadow-md"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <IndianRupee className="h-4 w-4 text-blue-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  {t.dashboard.financialHealthScore}
                </span>
              </div>
              <span className="text-[11px] font-bold text-blue-800">
                Strong Health
              </span>
            </div>

            <div className="my-3 flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-stone-900 sm:text-4xl">
                  {financialHealthScore}
                  <span className="text-base font-normal text-stone-400">/100</span>
                </div>
                <div className="mt-1 text-xs font-semibold text-blue-700">
                  Low Debt • High ROI
                </div>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <BarChart3 className="h-7 w-7" />
              </div>
            </div>

            {/* Financial Parameters */}
            <div className="space-y-1.5 border-t border-stone-100 pt-3 text-[11px]">
              <div className="flex justify-between text-stone-600">
                <span>Est. Monthly Net Profit:</span>
                <strong className="text-emerald-700">
                  ₹{activeBusiness?.monthlyProfitEstimate?.toLocaleString('en-IN') || '0'}
                </strong>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Operating Profit Margin:</span>
                <span className="font-bold text-stone-900">
                  {activeBusiness.grossMarginPercent}%
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Payback Timeline:</span>
                <span className="font-bold text-stone-900">
                  {activeBusiness.paybackPeriodMonths} Months
                </span>
              </div>
            </div>
          </div>

          <button
            id="dash-view-financial-plan-btn"
            onClick={() => setCurrentPage('financial-planner')}
            className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 transition hover:bg-blue-100 min-h-[38px]"
          >
            <span>Detailed Cashflow Plan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Metric 3: Risk Level */}
        <div
          id="dash-risk-level-card"
          className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-amber-400 hover:shadow-md"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  {t.dashboard.riskLevel}
                </span>
              </div>
              <span className={`text-[11px] font-bold ${isLowRisk ? 'text-emerald-800' : 'text-amber-800'}`}>
                {riskLevelText}
              </span>
            </div>

            <div className="my-3 flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-stone-900 sm:text-3xl">
                  {riskLevelText}
                </div>
                <div className="mt-1 text-xs text-stone-500">
                  Post-Harvest Processing Buffer
                </div>
              </div>

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                  isLowRisk
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {isLowRisk ? (
                  <ShieldCheck className="h-7 w-7" />
                ) : (
                  <AlertTriangle className="h-7 w-7" />
                )}
              </div>
            </div>

            {/* Risk Factor Checklist */}
            <div className="space-y-1.5 border-t border-stone-100 pt-3 text-[11px]">
              <div className="flex justify-between text-stone-600">
                <span>Monsoon Sensitivity:</span>
                <span className="font-semibold text-emerald-700">Low (Post-harvest)</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Power Reliability:</span>
                <span className="font-semibold text-stone-900">
                  {userProfile.powerReliabilityHours}h / day available
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Market Off-Take Risk:</span>
                <span className="font-semibold text-emerald-700">Low (Kirana demand)</span>
              </div>
            </div>
          </div>

          <button
            id="dash-test-simulator-btn"
            onClick={() => setCurrentPage('simulator')}
            className="mt-4 flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 transition hover:bg-amber-100 min-h-[38px]"
          >
            <span>Stress Test in What-If Simulator</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 4. BEST BUSINESS RECOMMENDATION (HERO FEATURE CARD) */}
      <div
        id="dash-best-recommendation-card"
        className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="flex flex-col justify-between gap-3 border-b border-stone-100 pb-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <Factory className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-base font-extrabold text-stone-900 sm:text-lg">
                {t.dashboard.bestBusinessRecommendation}
              </h2>
            </div>
            <p className="text-xs text-stone-500">
              Ranked #1 for your capital (₹{userProfile?.availableCapital?.toLocaleString('en-IN') || '0'}) and {userProfile.district} agro-surplus.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-emerald-800">
              {activeBusiness.category}
            </span>
            <button
              id="dash-browse-all-recs-btn"
              onClick={() => setCurrentPage('recommendations')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline min-h-[36px]"
            >
              Browse All ({businesses.length}) →
            </button>
          </div>
        </div>

        {/* Business details grid */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Main Info */}
          <div className="space-y-3 lg:col-span-2">
            <div>
              <h3 className="text-lg font-black text-stone-900 sm:text-xl">
                {localizedBizName}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-stone-600 leading-relaxed">
                {activeBusiness.tagline}
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-2xl bg-stone-50 p-3.5 text-left">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Capital Needed
                </span>
                <div className="mt-0.5 text-xs sm:text-sm font-black text-stone-900">
                  ₹{(activeBusiness.minCapital / 1000).toFixed(0)}k – ₹{(activeBusiness.maxCapital / 1000).toFixed(0)}k
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Est. Net Profit
                </span>
                <div className="mt-0.5 text-xs sm:text-sm font-black text-emerald-700">
                  ₹{activeBusiness?.monthlyProfitEstimate?.toLocaleString('en-IN') || '0'}/mo
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Payback
                </span>
                <div className="mt-0.5 text-xs sm:text-sm font-black text-stone-900">
                  {activeBusiness.paybackPeriodMonths} Months
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Complexity
                </span>
                <div className="mt-0.5 text-xs sm:text-sm font-black text-emerald-800">
                  {activeBusiness.operationalComplexity}
                </div>
              </div>
            </div>

            {/* Machinery & Buyers */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1 text-xs">
              <div className="rounded-xl border border-stone-200 p-3">
                <strong className="text-stone-900 block mb-1.5 flex items-center gap-1.5">
                  <Factory className="h-3.5 w-3.5 text-stone-600" />
                  Key Equipment:
                </strong>
                <ul className="space-y-1 text-[11px] text-stone-600 list-disc list-inside">
                  {activeBusiness.keyEquipment.slice(0, 3).map((eq, i) => (
                    <li key={i} className="line-clamp-1">{eq}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-stone-200 p-3">
                <strong className="text-stone-900 block mb-1.5 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-stone-600" />
                  Primary Local Buyers:
                </strong>
                <ul className="space-y-1 text-[11px] text-stone-600 list-disc list-inside">
                  {activeBusiness.targetBuyers.slice(0, 3).map((tb, i) => (
                    <li key={i} className="line-clamp-1">{tb}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Business Switcher Panel */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
                Switch Business Recommendation
              </span>
              <p className="mt-0.5 text-[11px] text-stone-600">
                Test alternative rural enterprises suited for your region:
              </p>

              <div className="mt-3 space-y-2">
                {businesses.map((biz) => {
                  const isSelected = biz.id === activeBusiness.id;
                  return (
                    <button
                      key={biz.id}
                      id={`switch-biz-btn-${biz.id}`}
                      onClick={() => selectBusiness(biz.id)}
                      className={`w-full flex items-center justify-between rounded-xl p-2.5 text-left text-xs transition min-h-[44px] ${
                        isSelected
                          ? 'border-2 border-emerald-600 bg-white font-bold text-emerald-950 shadow-xs'
                          : 'border border-emerald-200 bg-white/80 text-stone-700 hover:bg-white'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate font-semibold">{biz.name.split('(')[0]}</div>
                        <div className="text-[10px] text-stone-500">
                          ₹{(biz.minCapital / 1000).toFixed(0)}k cap • {biz.overallViabilityScore}% Fit
                        </div>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          Select
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              id="dash-explore-financials-cta"
              onClick={() => setCurrentPage('financial-planner')}
              className="mt-3 w-full rounded-xl bg-emerald-700 py-2.5 text-center text-xs font-bold text-white transition hover:bg-emerald-800 active:scale-98 min-h-[42px]"
            >
              Open Financial Projection Model →
            </button>
          </div>
        </div>
      </div>

      {/* 5. LOCAL MARKET OPPORTUNITY & AVAILABLE SUPPORT (2-COL GRID) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Card: Local Market Opportunity */}
        <div
          id="dash-local-market-opp-card"
          className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6 text-left flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <Compass className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-sm font-extrabold text-stone-900 sm:text-base">
                    {t.dashboard.localMarketOpportunity}
                  </h2>
                  <span className="text-[11px] text-stone-500">
                    District Mandi & Supply Gap Mapping
                  </span>
                </div>
              </div>

              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                {matchedOpportunity.district}, {matchedOpportunity.state}
              </span>
            </div>

            {/* Opportunity Details */}
            <div className="mt-4 space-y-3">
              <h3 className="text-base font-bold text-stone-900">
                {matchedOpportunity.title}
              </h3>

              <div className="rounded-2xl bg-stone-50 p-3.5 space-y-2 text-xs">
                <div>
                  <span className="font-bold text-emerald-800">🌾 Raw Material Surplus:</span>
                  <p className="mt-0.5 text-stone-600 leading-relaxed text-[11px]">
                    {matchedOpportunity.rawMaterialSurplus}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-amber-800">🏪 Local Demand Gap:</span>
                  <p className="mt-0.5 text-stone-600 leading-relaxed text-[11px]">
                    {matchedOpportunity.demandGap}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-xl border border-stone-100 p-2.5 text-center text-xs">
                <div>
                  <span className="text-[10px] text-stone-500">Market Size</span>
                  <div className="font-bold text-stone-900">
                    ₹{(matchedOpportunity.estimatedMarketSizePerMonth / 1000).toFixed(0)}k/mo
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500">Margin Pot.</span>
                  <div className="font-bold text-emerald-700">
                    {matchedOpportunity.marginPotentialPercent}%
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500">Competition</span>
                  <div className="font-bold text-stone-900">
                    {matchedOpportunity.competition}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-stone-600 block mb-1">
                  Verified Local Buyers:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {matchedOpportunity.buyerTypes.map((b, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-stone-100 px-2.5 py-1 text-[10px] font-semibold text-stone-700"
                    >
                      ✓ {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            id="dash-explore-all-opps-cta"
            onClick={() => setCurrentPage('opportunities')}
            className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 py-2.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 min-h-[42px]"
          >
            <Compass className="h-4 w-4" />
            <span>Explore All Local Opportunities ({opportunities.length})</span>
          </button>
        </div>

        {/* Card: Available Support */}
        <div
          id="dash-available-support-card"
          className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6 text-left flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
                  <Award className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-sm font-extrabold text-stone-900 sm:text-base">
                    {t.dashboard.availableSupport}
                  </h2>
                  <span className="text-[11px] text-stone-500">
                    Government Subsidies & Nodal Desks
                  </span>
                </div>
              </div>

              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-800">
                3 Schemes Matched
              </span>
            </div>

            {/* Scheme Cards */}
            <div className="mt-4 space-y-2.5">
              {/* Scheme 1: PMEGP */}
              <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-3 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-black text-purple-950">
                      PMEGP (KVIC / MSME)
                    </h3>
                    <p className="text-[11px] text-purple-900/80">
                      35% Margin Money Capital Grant for {userProfile.casteCategory} Rural Units
                    </p>
                  </div>
                  <span className="rounded bg-purple-200 px-2 py-0.5 text-[10px] font-black text-purple-900">
                    35% Grant
                  </span>
                </div>
                <div className="mt-2 text-[10px] text-stone-600 flex items-center gap-3">
                  <span>Own equity: 5%</span>
                  <span>•</span>
                  <span>Bank Loan: 60%</span>
                  <span>•</span>
                  <span>Max: ₹50 Lakhs</span>
                </div>
              </div>

              {/* Scheme 2: PMFME */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-stone-900">
                      PMFME (Ministry of Food Processing)
                    </h3>
                    <p className="text-[11px] text-stone-600">
                      35% Credit-Linked Capital Subsidy up to ₹10 Lakhs with ODOP agro focus
                    </p>
                  </div>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    ODOP Eligible
                  </span>
                </div>
              </div>

              {/* Scheme 3: MUDRA */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-stone-900">
                      PMMY MUDRA (Kishore Loan)
                    </h3>
                    <p className="text-[11px] text-stone-600">
                      ₹50,000 to ₹5,00,000 collateral-free machinery financing through Gramin Bank
                    </p>
                  </div>
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                    0 Collateral
                  </span>
                </div>
              </div>

              {/* Institutional Support */}
              <div className="rounded-xl bg-amber-50/70 p-2.5 text-[11px] text-amber-950 flex items-center gap-2">
                <Building2 className="h-4 w-4 shrink-0 text-amber-700" />
                <span>
                  <strong>District Support:</strong> DIC Nodal Desk & RSETI free 10-day hands-on machinery training available in {userProfile.district}.
                </span>
              </div>
            </div>
          </div>

          <button
            id="dash-view-schemes-cta"
            onClick={() => setCurrentPage('schemes')}
            className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-purple-600 bg-purple-50 py-2.5 text-xs font-bold text-purple-900 transition hover:bg-purple-100 min-h-[42px]"
          >
            <Award className="h-4 w-4" />
            <span>Check Scheme Eligibility & Apply</span>
          </button>
        </div>
      </div>

      {/* 6. NEXT RECOMMENDED ACTION (ACTIVE LAUNCHPAD) */}
      <div
        id="dash-next-action-card"
        className="rounded-3xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50/80 via-white to-stone-50 p-5 shadow-sm sm:p-6 text-left"
      >
        <div className="flex flex-col justify-between gap-3 border-b border-emerald-100 pb-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <CalendarCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-stone-900 sm:text-lg">
                  {t.dashboard.nextRecommendedAction}
                </h2>
                <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-black text-emerald-950">
                  Priority Step
                </span>
              </div>
              <p className="text-xs text-stone-500">
                {nextPhase ? `${nextPhase.name} • ${nextPhase.timeframe}` : '90-Day Execution Roadmap'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <span className="font-bold text-emerald-800">
                {completedTasks} of {allTasks.length} Tasks Done
              </span>
              <div className="h-2 w-28 overflow-hidden rounded-full bg-stone-200 mt-1">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Task Details */}
        {nextTask && (
          <div className="mt-4 flex flex-col justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Action Step #{allTasks.findIndex((t) => t.id === nextTask?.id) + 1}
                </span>
                <span className="text-xs font-semibold text-stone-500">
                  Authority: {nextTask.officialEntity}
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-black text-stone-900">
                {nextTask.title}
              </h3>

              <p className="text-xs text-stone-600 leading-relaxed">
                {nextTask.description}
              </p>

              {/* Meta details */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-stone-500">
                <span className="inline-flex items-center gap-1 font-semibold text-stone-700">
                  <Clock className="h-3.5 w-3.5 text-stone-400" />
                  Duration: {nextTask.durationDays} Days
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <IndianRupee className="h-3.5 w-3.5" />
                  Govt Fee: ₹{nextTask.estimatedCost}
                </span>
              </div>

              {/* Practical tips */}
              <div className="rounded-xl bg-stone-50 p-2.5 text-[11px] text-stone-600">
                💡 <strong>Field Tip:</strong> {nextTask.practicalTips}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 shrink-0 sm:items-end">
              <button
                id={`task-toggle-btn-${nextTask.id}`}
                onClick={() => {
                  if (nextPhase && nextTask) {
                    toggleTaskCompletion(nextPhase.id, nextTask.id);
                  }
                }}
                className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-black transition active:scale-95 min-h-[46px] ${
                  nextTask.isCompleted
                    ? 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {nextTask.isCompleted ? 'Mark as Incomplete' : 'Mark as Completed ✓'}
                </span>
              </button>

              <button
                id="dash-view-full-roadmap-cta"
                onClick={() => setCurrentPage('action-plan')}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline text-center min-h-[36px]"
              >
                View Full 90-Day Plan →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 7. VISUAL CHARTS ROW: Monthly Cashflow Breakdown & PMEGP Financing Structure */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Monthly Cashflow Breakdown */}
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-700" />
              <h2 className="text-sm font-bold text-stone-900">
                Monthly Financial Flow ({localizedBizName})
              </h2>
            </div>
            <button
              id="dash-chart-full-planner-btn"
              onClick={() => setCurrentPage('financial-planner')}
              className="text-xs font-bold text-emerald-700 hover:underline min-h-[32px]"
            >
              Open Full Planner →
            </button>
          </div>

          <div className="mt-4">
            <CashflowBarChart
              revenue={activeBusiness.monthlyRevenueEstimate}
              costs={
                activeBusiness.monthlyRevenueEstimate -
                activeBusiness.monthlyProfitEstimate
              }
              profit={activeBusiness.monthlyProfitEstimate}
            />
          </div>

          <div className="mt-3 text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-xl flex items-center justify-between">
            <span>⚡ Break-Even Payback Period:</span>
            <strong className="text-stone-900">
              {activeBusiness.paybackPeriodMonths} Months
            </strong>
          </div>
        </div>

        {/* Chart 2: PMEGP Subsidy & Financing Split */}
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-purple-700" />
              <h2 className="text-sm font-bold text-stone-900">
                Financing Structure (PMEGP + Mudra)
              </h2>
            </div>
            <button
              id="dash-chart-view-schemes-btn"
              onClick={() => setCurrentPage('schemes')}
              className="text-xs font-bold text-purple-700 hover:underline min-h-[32px]"
            >
              View Schemes →
            </button>
          </div>

          <div className="mt-4">
            <SubsidySplitChart
              subsidyPercent={userProfile.casteCategory === 'General' ? 25 : 35}
              ownEquityPercent={userProfile.casteCategory === 'General' ? 10 : 5}
              loanPercent={userProfile.casteCategory === 'General' ? 65 : 60}
              totalProjectCost={activeBusiness.minCapital * 1.5}
            />
          </div>

          <div className="mt-3 text-[11px] text-purple-900 bg-purple-50/70 p-2.5 rounded-xl">
            💡 <strong>VYOMIK Insight:</strong> Under PMEGP rural guidelines, 35% of your project cost is credited directly as government grant after 3 years of successful operation.
          </div>
        </div>
      </div>
    </div>
  );
};
