import { apiFetch } from '../utils/apiClient';
import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  TrendingUp,
  CheckCircle2,
  IndianRupee,
  Clock,
  Zap,
  Award,
  ArrowRight,
  Brain,
  Calculator,
  ShieldCheck,
  Check,
  Sparkles,
  RefreshCw,
  Info,
  ShieldAlert,
  Layers,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BusinessModel, BusinessRecommendationItem, RecommendationsApiResponse } from '../types';

export const RecommendationsPage: React.FC = () => {
  const {
    businesses,
    activeBusiness,
    selectBusiness,
    userProfile,
    setCurrentPage,
    opportunities,
  } = useApp();

  const [topRecommendations, setTopRecommendations] = useState<BusinessRecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dataNotice, setDataNotice] = useState<string | null>(null);

  const [capitalFilter, setCapitalFilter] = useState<'All' | 'Under50k' | '50kTo150k' | 'Above150k'>('All');
  const [complexityFilter, setComplexityFilter] = useState<'All' | 'Beginner' | 'Moderate' | 'Advanced'>('All');

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    const userLocation = userProfile.location || `${userProfile.district}, ${userProfile.state}`;
    const userSkills = userProfile.skills && userProfile.skills.length > 0 ? userProfile.skills : ['Food Processing', 'Trading'];
    const userCapital = userProfile.availableCapital || 120000;
    const userGoal = userProfile.businessGoal || activeBusiness?.name || 'Establish sustainable rural processing unit';

    try {
      const response = await apiFetch('/api/v1/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            name: userProfile.name,
            district: userProfile.district,
            state: userProfile.state,
            location: userLocation,
            capital: userCapital,
            availableCapital: userCapital,
            skills: userSkills,
            resources: userProfile.resources || ['Roadside shed', '3-phase power', 'Family labor'],
            goal: userGoal,
            businessGoal: userGoal,
            riskAppetite: userProfile.riskAppetite || 'Balanced',
          },
          opportunity_data: {
            location: userLocation,
            opportunities: opportunities,
            demand: `Regional demand in ${userProfile.district}, ${userProfile.state}`,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: RecommendationsApiResponse = await response.json();
      const recs = data.recommendations || data.top_3 || [];
      setTopRecommendations(recs);
      if (data.data_notice) {
        setDataNotice(data.data_notice);
      }
    } catch (err: any) {
      console.warn('Failed to fetch from /api/v1/recommendations:', err);
      setErrorMsg('Live AI recommendations endpoint temporarily unavailable; showing computed business models.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [
    userProfile.id,
    userProfile.district,
    userProfile.state,
    userProfile.availableCapital,
    userProfile.businessGoal,
  ]);

  const filteredBusinesses = businesses.filter((biz) => {
    let matchesCapital = true;
    if (capitalFilter === 'Under50k') matchesCapital = biz.minCapital <= 50000;
    else if (capitalFilter === '50kTo150k') matchesCapital = biz.minCapital > 50000 && biz.minCapital <= 150000;
    else if (capitalFilter === 'Above150k') matchesCapital = biz.minCapital > 150000;

    let matchesComplexity = true;
    if (complexityFilter !== 'All') matchesComplexity = biz.operationalComplexity === complexityFilter;

    return matchesCapital && matchesComplexity;
  });

  const handleChooseBusiness = (bizId: string) => {
    selectBusiness(bizId);
  };

  return (
    <div className="space-y-8 pb-20 md:pb-6 text-left">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold text-stone-900 sm:text-2xl flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-emerald-700" />
              <span>Matched Business Recommendations</span>
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 tracking-wide">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              DEMO DATA
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Top 3 micro-enterprises ranked for {userProfile.name} in {userProfile.district}, {userProfile.state} with ₹{userProfile.availableCapital.toLocaleString('en-IN')} capital and local resources.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <span>Active: {activeBusiness.name}</span>
          </div>

          <button
            onClick={fetchRecommendations}
            disabled={isLoading}
            title="Refresh recommendations via POST /api/v1/recommendations"
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-xs transition hover:bg-stone-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-emerald-700' : 'text-stone-500'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* TOP 3 SUITABLE BUSINESSES SECTION */}
      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-emerald-600 p-2 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-stone-900">
                  Top 3 Suitable Businesses
                </h2>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  POST /api/v1/recommendations
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Deterministic calculations for investments & scores • Strategic reasoning powered by Gemini AI
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-xs">
            <div className="flex flex-col items-center justify-center gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-700" />
              <div className="text-sm font-bold text-stone-800">
                Evaluating Profile & Computing Top 3 Recommendations...
              </div>
              <p className="text-xs text-stone-500 max-w-md">
                Calculating deterministic capital feasibility and generating Gemini contextual reasoning based on {userProfile.district} APMC surpluses.
              </p>
            </div>
          </div>
        )}

        {/* Top 3 Cards Grid */}
        {!isLoading && topRecommendations.length > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {topRecommendations.map((item, index) => {
              const biz = item.business;
              const isSelected = biz.id === activeBusiness.id;
              const rankLabels = [
                { title: '#1 Top Match', color: 'bg-emerald-700 text-white' },
                { title: '#2 High Potential', color: 'bg-teal-700 text-white' },
                { title: '#3 Strong Fit', color: 'bg-stone-800 text-white' },
              ];
              const rankBadge = rankLabels[index] || { title: `#${index + 1} Match`, color: 'bg-stone-700 text-white' };

              return (
                <div
                  key={biz.id || index}
                  className={`flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-xs transition relative overflow-hidden ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-stone-200 hover:border-emerald-300 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Rank Badge & Opportunity Score */}
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-black tracking-wide ${rankBadge.color}`}>
                        {rankBadge.title}
                      </span>
                      <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-800 border border-emerald-200">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-700" />
                        <span>{item.opportunity_score}% Opportunity Score</span>
                      </div>
                    </div>

                    {/* Business Name & Tagline */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                          {biz.category}
                        </span>
                        {biz.hindiName && (
                          <span className="text-[11px] text-stone-500 font-medium truncate">
                            {biz.hindiName}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-stone-900 leading-snug">
                        {biz.name}
                      </h3>
                      <p className="mt-1 text-xs text-stone-600 leading-relaxed line-clamp-2">
                        {biz.tagline}
                      </p>
                    </div>

                    {/* Investment Box (Deterministic Calculations) */}
                    <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500 font-semibold">Total Investment:</span>
                        <span className="font-extrabold text-stone-900">
                          {item.investment.formatted}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-400">Capital Coverage:</span>
                        <span className="font-bold text-emerald-700">
                          {item.investment.coverage_status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 pt-1.5 border-t border-stone-200/80 text-[10px] text-stone-500">
                        <div>Equipment: ~₹{(item.investment.equipment / 1000).toFixed(0)}k</div>
                        <div>Working Cap: ~₹{(item.investment.working_capital / 1000).toFixed(0)}k</div>
                      </div>
                    </div>

                    {/* Demand, Competition & Risk Metrics */}
                    <div className="space-y-2 text-xs">
                      {/* Demand */}
                      <div className="rounded-lg bg-emerald-50/60 p-2 border border-emerald-100">
                        <div className="font-bold text-emerald-950 flex items-center gap-1 text-[11px]">
                          <Users className="h-3 w-3 text-emerald-700 shrink-0" />
                          <span>Demand:</span>
                        </div>
                        <p className="text-[11px] text-stone-700 mt-0.5 leading-tight">
                          {item.demand}
                        </p>
                      </div>

                      {/* Competition */}
                      <div className="rounded-lg bg-blue-50/60 p-2 border border-blue-100">
                        <div className="font-bold text-blue-950 flex items-center gap-1 text-[11px]">
                          <Layers className="h-3 w-3 text-blue-700 shrink-0" />
                          <span>Competition:</span>
                        </div>
                        <p className="text-[11px] text-stone-700 mt-0.5 leading-tight">
                          {item.competition}
                        </p>
                      </div>

                      {/* Risk */}
                      <div className="rounded-lg bg-amber-50/60 p-2 border border-amber-100">
                        <div className="font-bold text-amber-950 flex items-center gap-1 text-[11px]">
                          <ShieldAlert className="h-3 w-3 text-amber-700 shrink-0" />
                          <span>Risk:</span>
                        </div>
                        <p className="text-[11px] text-stone-700 mt-0.5 leading-tight">
                          {item.risk}
                        </p>
                      </div>
                    </div>

                    {/* Gemini AI Reasoning Box */}
                    <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50/70 via-white to-purple-50/40 p-3 shadow-xs">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-950 mb-1">
                        <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                        <span>Gemini AI Reasoning:</span>
                      </div>
                      <p className="text-[11px] text-stone-700 leading-relaxed font-normal">
                        {item.reason}
                      </p>
                    </div>

                    {/* Quick Financial Highlights */}
                    <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                      <div className="rounded-lg bg-stone-50 p-2">
                        <div className="text-[10px] text-stone-400 font-medium">Est. Net Profit</div>
                        <div className="font-bold text-emerald-700">
                          ₹{biz.monthlyProfitEstimate.toLocaleString('en-IN')}/mo
                        </div>
                      </div>
                      <div className="rounded-lg bg-stone-50 p-2">
                        <div className="text-[10px] text-stone-400 font-medium">Payback Period</div>
                        <div className="font-bold text-stone-800">
                          {biz.paybackPeriodMonths} Months
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col gap-2">
                    <button
                      onClick={() => handleChooseBusiness(biz.id)}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition ${
                        isSelected
                          ? 'bg-emerald-800 text-white cursor-default'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Active Selected Venture</span>
                        </>
                      ) : (
                        <span>Select as Active Venture</span>
                      )}
                    </button>

                    <div className="flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          selectBusiness(biz.id);
                          setCurrentPage('explainability');
                        }}
                        className="flex items-center gap-1 text-stone-600 hover:text-emerald-700 font-semibold"
                      >
                        <Brain className="h-3.5 w-3.5" />
                        <span>Why Recommended?</span>
                      </button>

                      <button
                        onClick={() => {
                          selectBusiness(biz.id);
                          setCurrentPage('financial-planner');
                        }}
                        className="flex items-center gap-1 text-stone-600 hover:text-emerald-700 font-semibold"
                      >
                        <Calculator className="h-3.5 w-3.5" />
                        <span>Financial Planner</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ALL AVAILABLE BUSINESS MODELS (CATALOG) */}
      <section className="space-y-4 pt-4 border-t border-stone-200">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              All Available Business Models ({filteredBusinesses.length})
            </h2>
            <p className="text-xs text-stone-500">
              Browse the complete catalog of rural micro-enterprises with customizable capital and skill filters.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs font-bold text-stone-500">
              <span>Capital:</span>
              {[
                { id: 'All', label: 'All' },
                { id: 'Under50k', label: '< ₹50k' },
                { id: '50kTo150k', label: '₹50k - ₹1.5L' },
                { id: 'Above150k', label: '> ₹1.5L' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setCapitalFilter(f.id as any)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    capitalFilter === f.id
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-stone-500">
              <span>Skill:</span>
              {['All', 'Beginner', 'Moderate', 'Advanced'].map((c) => (
                <button
                  key={c}
                  onClick={() => setComplexityFilter(c as any)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    complexityFilter === c
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Business Cards Grid */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filteredBusinesses.map((biz) => {
            const isSelected = biz.id === activeBusiness.id;
            const isAffordable = userProfile.availableCapital >= biz.minCapital;

            return (
              <div
                key={biz.id}
                className={`flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/20'
                    : 'border-stone-200 bg-white hover:border-emerald-300 hover:shadow-md'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Header Tag Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-bold text-stone-700">
                        {biz.category}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          biz.operationalComplexity === 'Beginner'
                            ? 'bg-blue-100 text-blue-800'
                            : biz.operationalComplexity === 'Moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {biz.operationalComplexity}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-700" />
                      <span>{biz.overallViabilityScore}% Fit</span>
                    </div>
                  </div>

                  {/* Name and Hindi Translation */}
                  <div>
                    <h3 className="text-base font-bold text-stone-900 leading-snug">
                      {biz.name}
                    </h3>
                    <div className="text-xs text-stone-500 font-medium mt-0.5">
                      {biz.hindiName}
                    </div>
                    <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                      {biz.tagline}
                    </p>
                  </div>

                  {/* Primary Financial Highlights */}
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-stone-50 p-3 text-center text-xs">
                    <div>
                      <div className="text-[10px] font-medium text-stone-400">Capital Needed</div>
                      <div className="mt-0.5 font-bold text-stone-900">
                        ₹{(biz.minCapital / 1000).toFixed(0)}k - ₹{(biz.maxCapital / 1000).toFixed(0)}k
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-medium text-stone-400">Est. Net Profit</div>
                      <div className="mt-0.5 font-bold text-emerald-700">
                        ₹{biz.monthlyProfitEstimate.toLocaleString('en-IN')}/mo
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-medium text-stone-400">Payback</div>
                      <div className="mt-0.5 font-bold text-stone-900">
                        {biz.paybackPeriodMonths} Months
                      </div>
                    </div>
                  </div>

                  {/* Equipment & Scheme Info */}
                  <div className="space-y-1.5 text-[11px] text-stone-600">
                    <div className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span><strong>Power:</strong> {biz.powerRequirement}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                      <span>
                        Eligible for <strong>{biz.schemeMatchCount} Central/State Schemes</strong> (PMEGP, Mudra, PMFME)
                      </span>
                    </div>
                  </div>

                  {/* Capital Affordability Indicator */}
                  <div className="text-[11px]">
                    {isAffordable ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Your capital covers 100% of minimum startup costs.</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                        <span>Requires ₹{(biz.minCapital - userProfile.availableCapital).toLocaleString('en-IN')} via Mudra loan.</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3">
                  <button
                    onClick={() => {
                      selectBusiness(biz.id);
                      setCurrentPage('explainability');
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-emerald-700"
                  >
                    <Brain className="h-3.5 w-3.5" />
                    <span>Why Recommended?</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        selectBusiness(biz.id);
                        setCurrentPage('financial-planner');
                      }}
                      className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                    >
                      Planner
                    </button>

                    <button
                      onClick={() => handleChooseBusiness(biz.id)}
                      className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                        isSelected
                          ? 'bg-emerald-800 text-white cursor-default'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Active Venture</span>
                        </>
                      ) : (
                        <span>Select This</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
