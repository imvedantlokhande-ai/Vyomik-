import { apiFetch } from '../utils/apiClient';
import React, { useState, useEffect } from 'react';
import {
  Brain,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Info,
  Scale,
  Sparkles,
  RefreshCw,
  Briefcase,
  Users,
  DollarSign,
  Building2,
  AlertTriangle,
  FileText,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ExplainApiResponse } from '../types';

export const ExplainabilityPage: React.FC = () => {
  const { activeBusiness, userProfile, setCurrentPage, businesses, selectBusiness, opportunities, financialData } = useApp();

  const [explainData, setExplainData] = useState<ExplainApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'entrepreneur' | 'market' | 'financial' | 'resource' | 'risks' | 'assumptions' | 'limitations'>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Fetch explanation from POST /api/v1/explain
  const fetchExplanation = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const opportunityData =
        opportunities.find((o) => o.recommendedBusinessIds?.includes(activeBusiness.id)) ||
        opportunities[0] ||
        {};

      const response = await apiFetch('/api/v1/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: userProfile,
          recommended_business: activeBusiness,
          opportunity_data: opportunityData,
          financial_data: financialData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: ExplainApiResponse = await response.json();
      setExplainData(data);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      console.error('Failed to fetch /api/v1/explain:', err);
      setError('Could not connect to /api/v1/explain backend. Showing cached deterministic explainability model.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExplanation(true);
  }, [activeBusiness.id, userProfile.id]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchExplanation(false);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 text-left">
      {/* Header with Backend Status */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 sm:text-2xl flex items-center gap-2">
            <Brain className="h-6 w-6 text-emerald-700" />
            <span>AI Recommendation Explainability</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Transparent explanations across entrepreneur, market, financial, resource, risks, assumptions, and data limitations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-mono text-[11px]">POST /api/v1/explain</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition shadow-xs disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-700 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Updating...' : 'Refresh AI Audit'}</span>
          </button>
        </div>
      </div>

      {/* Venture Selector Banner */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-stone-600">
            <span className="text-stone-400 font-semibold uppercase tracking-wider text-[10px]">Audited Venture:</span>
            <span className="font-bold text-stone-900 text-sm">{activeBusiness.name}</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              {activeBusiness.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="venture-select" className="text-xs text-stone-500 font-medium">Switch Venture:</label>
            <select
              id="venture-select"
              value={activeBusiness.id}
              onChange={(e) => selectBusiness(e.target.value)}
              className="rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-1.5 text-xs font-semibold text-stone-800 focus:border-emerald-600 focus:outline-hidden"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.category})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white shadow-md">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-700/80 px-2.5 py-1 text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Venture Feasibility & Explainability Index
              </span>
              {lastUpdated && (
                <span className="text-[11px] text-emerald-200/70 font-mono">
                  Synced {lastUpdated}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black sm:text-3xl text-white">
              {explainData ? explainData.overall_match_score : activeBusiness.overallViabilityScore}% Overall Match Score
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              {explainData?.summary || activeBusiness.explainabilitySummary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCurrentPage('financial-planner')}
              className="rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-bold text-emerald-950 hover:bg-amber-300 transition flex items-center gap-1.5 shadow-xs"
            >
              <DollarSign className="h-4 w-4" />
              <span>Unit Economics</span>
            </button>
            <button
              onClick={() => setCurrentPage('schemes')}
              className="rounded-xl bg-emerald-700/70 hover:bg-emerald-700 border border-emerald-500/50 px-3.5 py-2 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-xs"
            >
              <FileText className="h-4 w-4" />
              <span>Matching Schemes</span>
            </button>
          </div>
        </div>

        {/* 4 Quantitative Pillar Bars */}
        {explainData && (
          <div className="mt-6 pt-5 border-t border-emerald-700/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl bg-emerald-950/40 border border-emerald-700/40 p-3">
              <div className="flex items-center justify-between text-[11px] text-emerald-200 mb-1">
                <span>Entrepreneur Fit</span>
                <span className="font-bold text-white">{explainData.entrepreneur_fit.score}%</span>
              </div>
              <div className="h-1.5 w-full bg-emerald-900/60 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${explainData.entrepreneur_fit.score}%` }} />
              </div>
              <span className="text-[10px] text-emerald-300 mt-1 block font-medium">{explainData.entrepreneur_fit.rating}</span>
            </div>

            <div className="rounded-xl bg-emerald-950/40 border border-emerald-700/40 p-3">
              <div className="flex items-center justify-between text-[11px] text-emerald-200 mb-1">
                <span>Market Fit</span>
                <span className="font-bold text-white">{explainData.market_fit.score}%</span>
              </div>
              <div className="h-1.5 w-full bg-emerald-900/60 rounded-full overflow-hidden">
                <div className="h-full bg-teal-300 rounded-full" style={{ width: `${explainData.market_fit.score}%` }} />
              </div>
              <span className="text-[10px] text-emerald-300 mt-1 block font-medium">{explainData.market_fit.rating}</span>
            </div>

            <div className="rounded-xl bg-emerald-950/40 border border-emerald-700/40 p-3">
              <div className="flex items-center justify-between text-[11px] text-emerald-200 mb-1">
                <span>Financial Fit</span>
                <span className="font-bold text-white">{explainData.financial_fit.score}%</span>
              </div>
              <div className="h-1.5 w-full bg-emerald-900/60 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${explainData.financial_fit.score}%` }} />
              </div>
              <span className="text-[10px] text-amber-200 mt-1 block font-medium">{explainData.financial_fit.rating}</span>
            </div>

            <div className="rounded-xl bg-emerald-950/40 border border-emerald-700/40 p-3">
              <div className="flex items-center justify-between text-[11px] text-emerald-200 mb-1">
                <span>Resource Fit</span>
                <span className="font-bold text-white">{explainData.resource_fit.score}%</span>
              </div>
              <div className="h-1.5 w-full bg-emerald-900/60 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-300 rounded-full" style={{ width: `${explainData.resource_fit.score}%` }} />
              </div>
              <span className="text-[10px] text-cyan-200 mt-1 block font-medium">{explainData.resource_fit.rating}</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter Navigation Tabs for the 7 Dimensions */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-stone-200 text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
            activeTab === 'all' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          All 7 Dimensions
        </button>
        <button
          onClick={() => setActiveTab('entrepreneur')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'entrepreneur' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Entrepreneur Fit</span>
        </button>
        <button
          onClick={() => setActiveTab('market')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'market' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Market Fit</span>
        </button>
        <button
          onClick={() => setActiveTab('financial')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'financial' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <DollarSign className="h-3.5 w-3.5" />
          <span>Financial Fit</span>
        </button>
        <button
          onClick={() => setActiveTab('resource')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'resource' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>Resource Fit</span>
        </button>
        <button
          onClick={() => setActiveTab('risks')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'risks' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Risks & Mitigations</span>
        </button>
        <button
          onClick={() => setActiveTab('assumptions')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'assumptions' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Scale className="h-3.5 w-3.5" />
          <span>Assumptions</span>
        </button>
        <button
          onClick={() => setActiveTab('limitations')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'limitations' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Data Limitations</span>
        </button>
      </div>

      {loading && !explainData && (
        <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center shadow-sm">
          <RefreshCw className="h-8 w-8 text-emerald-700 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-stone-800">Synthesizing Non-Blackbox Explanations...</p>
          <p className="text-xs text-stone-500 mt-1">Calling POST /api/v1/explain with profile, venture, market, and financial data.</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Backend Communication Notice:</span> {error}
          </div>
        </div>
      )}

      {explainData && (
        <div className="space-y-6">
          {/* 1. ENTREPRENEUR FIT SECTION */}
          {(activeTab === 'all' || activeTab === 'entrepreneur') && (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">1. Entrepreneur Fit Explanation</h3>
                    <p className="text-xs text-stone-500">Why your skills, background, and demographics match this venture</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                    Score: {explainData.entrepreneur_fit.score}/100
                  </span>
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
                    {explainData.entrepreneur_fit.rating}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-stone-50 p-3.5 text-xs text-stone-800 font-medium leading-relaxed border border-stone-200/60">
                <strong>Executive Summary:</strong> {explainData.entrepreneur_fit.summary}
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider text-[11px]">Core Match Rationale:</span>
                <ul className="space-y-2 text-xs text-stone-700">
                  {explainData.entrepreneur_fit.key_points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 p-3.5 text-xs">
                  <span className="font-bold text-emerald-950 block mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                    Verified Entrepreneur Strengths
                  </span>
                  <ul className="space-y-1 text-stone-600">
                    {explainData.entrepreneur_fit.strengths.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl bg-amber-50/70 border border-amber-100 p-3.5 text-xs">
                  <span className="font-bold text-amber-950 block mb-1.5 flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-amber-700" />
                    Actionable Readiness Tips
                  </span>
                  <ul className="space-y-1 text-stone-600">
                    {explainData.entrepreneur_fit.growth_areas.map((g, i) => (
                      <li key={i}>• {g}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 2. MARKET FIT SECTION */}
          {(activeTab === 'all' || activeTab === 'market') && (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">2. Market Fit & Buyer Channel Explanation</h3>
                    <p className="text-xs text-stone-500">Local consumer demand, buyer types, and commercial channel stability</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-bold text-teal-800">
                    Score: {explainData.market_fit.score}/100
                  </span>
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
                    {explainData.market_fit.rating}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-stone-50 p-3.5 text-xs text-stone-800 font-medium leading-relaxed border border-stone-200/60">
                <strong>Executive Summary:</strong> {explainData.market_fit.summary}
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider text-[11px]">Market Demand Drivers:</span>
                <ul className="space-y-2 text-xs text-stone-700">
                  {explainData.market_fit.key_points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider text-[11px]">Identified Buyer Segments:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {explainData.market_fit.target_buyers.map((tb, i) => (
                    <div key={i} className="rounded-xl border border-stone-100 bg-stone-50/80 p-3">
                      <span className="font-bold text-stone-900 block">{tb.buyer}</span>
                      <span className="text-stone-600 text-[11px] mt-0.5 block">{tb.reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-teal-50/60 border border-teal-100 p-3 text-xs text-teal-950">
                <strong>Competitive Moat:</strong> {explainData.market_fit.competition_analysis}
              </div>
            </div>
          )}

          {/* 3. FINANCIAL FIT SECTION */}
          {(activeTab === 'all' || activeTab === 'financial') && (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">3. Financial Fit & Capital Feasibility</h3>
                    <p className="text-xs text-stone-500">Capital requirements, break-even velocity, and payback buffer</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                    Score: {explainData.financial_fit.score}/100
                  </span>
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
                    {explainData.financial_fit.rating}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-stone-50 p-3.5 text-xs text-stone-800 font-medium leading-relaxed border border-stone-200/60">
                <strong>Executive Summary:</strong> {explainData.financial_fit.summary}
              </div>

              {/* 4 Financial Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="rounded-xl bg-stone-50 p-3 border border-stone-200/70">
                  <span className="text-[10px] text-stone-500 block uppercase font-bold">Capital Coverage</span>
                  <span className="text-lg font-black text-stone-900 mt-0.5 block">{explainData.financial_fit.capital_coverage_percent}%</span>
                  <span className="text-[10px] text-stone-500">of minimum CapEx</span>
                </div>

                <div className="rounded-xl bg-stone-50 p-3 border border-stone-200/70">
                  <span className="text-[10px] text-stone-500 block uppercase font-bold">Break-Even</span>
                  <span className="text-lg font-black text-emerald-700 mt-0.5 block">{explainData.financial_fit.estimated_break_even_months} Mos</span>
                  <span className="text-[10px] text-stone-500">at initial volume</span>
                </div>

                <div className="rounded-xl bg-stone-50 p-3 border border-stone-200/70">
                  <span className="text-[10px] text-stone-500 block uppercase font-bold">Capital Payback</span>
                  <span className="text-lg font-black text-stone-900 mt-0.5 block">{explainData.financial_fit.estimated_payback_months} Mos</span>
                  <span className="text-[10px] text-stone-500">full recovery</span>
                </div>

                <div className="rounded-xl bg-stone-50 p-3 border border-stone-200/70">
                  <span className="text-[10px] text-stone-500 block uppercase font-bold">Monthly Profit</span>
                  <span className="text-lg font-black text-emerald-800 mt-0.5 block">₹{explainData.financial_fit.monthly_net_profit_estimate.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-stone-500">estimated net</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider text-[11px]">Financial Viability Rationale:</span>
                <ul className="space-y-2 text-xs text-stone-700">
                  {explainData.financial_fit.key_points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-amber-50/70 border border-amber-100 p-3 text-xs text-amber-950">
                <strong>Liquidity Buffer Requirement:</strong> {explainData.financial_fit.buffer_recommendation}
              </div>
            </div>
          )}

          {/* 4. RESOURCE FIT SECTION */}
          {(activeTab === 'all' || activeTab === 'resource') && (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-800">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">4. Resource & Infrastructure Fit</h3>
                    <p className="text-xs text-stone-500">Power, shed, raw material surplus, and equipment accessibility</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-bold text-cyan-800">
                    Score: {explainData.resource_fit.score}/100
                  </span>
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
                    {explainData.resource_fit.rating}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-stone-50 p-3.5 text-xs text-stone-800 font-medium leading-relaxed border border-stone-200/60">
                <strong>Executive Summary:</strong> {explainData.resource_fit.summary}
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider text-[11px]">Resource Alignment Breakdown:</span>
                <ul className="space-y-2 text-xs text-stone-700">
                  {explainData.resource_fit.key_points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-cyan-700 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider text-[11px]">Verified Infrastructure Prerequisites:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {explainData.resource_fit.critical_resources_verified.map((cr, i) => (
                    <div key={i} className="rounded-lg bg-cyan-50/60 border border-cyan-100 p-2.5 flex items-center gap-2 text-stone-700">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-700 shrink-0" />
                      <span>{cr}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-stone-50 border border-stone-200/70 p-3 text-xs text-stone-700">
                <strong>Infrastructure Advisory:</strong> {explainData.resource_fit.infrastructure_notes}
              </div>
            </div>
          )}

          {/* 5. RISKS & MITIGATIONS SECTION */}
          {(activeTab === 'all' || activeTab === 'risks') && (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-800">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">5. Downside Risks & Practical Mitigations</h3>
                    <p className="text-xs text-stone-500">Unfiltered evaluation of operational risks and low-cost protections</p>
                  </div>
                </div>
                <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-800">
                  Risk Level: {explainData.risks.risk_level}
                </span>
              </div>

              <div className="rounded-xl bg-stone-50 p-3.5 text-xs text-stone-800 font-medium leading-relaxed border border-stone-200/60">
                <strong>Executive Summary:</strong> {explainData.risks.summary}
              </div>

              <div className="space-y-3">
                {explainData.risks.identified_risks.map((risk, i) => (
                  <div key={i} className="rounded-xl border border-rose-100 bg-rose-50/30 p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-stone-900">
                        <AlertTriangle className="h-4 w-4 text-rose-600" />
                        <span>{risk.risk_title}</span>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        risk.severity === 'High'
                          ? 'bg-red-100 text-red-800'
                          : risk.severity === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {risk.severity} Severity
                      </span>
                    </div>
                    <p className="text-stone-600 pl-6">{risk.explanation}</p>
                    <div className="ml-6 rounded-lg bg-white p-2.5 border border-rose-200/60 text-stone-800">
                      <strong className="text-emerald-900">Actionable Mitigation:</strong> {risk.mitigation}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-950">
                <strong>Structural Safety Net:</strong> {explainData.risks.overall_downside_protection}
              </div>
            </div>
          )}

          {/* 6. OPERATING ASSUMPTIONS SECTION */}
          {(activeTab === 'all' || activeTab === 'assumptions') && (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-800">
                    <Scale className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">6. Baseline Operating Assumptions</h3>
                    <p className="text-xs text-stone-500">Transparent parameters used to model revenue, costs, and cash turnaround</p>
                  </div>
                </div>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-800 border border-indigo-200">
                  Audit Verified
                </span>
              </div>

              <div className="rounded-xl bg-stone-50 p-3.5 text-xs text-stone-800 font-medium leading-relaxed border border-stone-200/60">
                <strong>Executive Summary:</strong> {explainData.assumptions.summary}
              </div>

              {explainData.assumptions.operating_parameters && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div className="rounded-lg bg-indigo-50/50 p-2.5 border border-indigo-100 text-center">
                    <span className="text-[10px] text-stone-500 block">Work Days</span>
                    <strong className="text-sm text-indigo-950">{explainData.assumptions.operating_parameters.working_days_per_month}/mo</strong>
                  </div>
                  <div className="rounded-lg bg-indigo-50/50 p-2.5 border border-indigo-100 text-center">
                    <span className="text-[10px] text-stone-500 block">Daily Shift</span>
                    <strong className="text-sm text-indigo-950">{explainData.assumptions.operating_parameters.shift_hours_per_day} Hours</strong>
                  </div>
                  <div className="rounded-lg bg-indigo-50/50 p-2.5 border border-indigo-100 text-center">
                    <span className="text-[10px] text-stone-500 block">M1 Capacity</span>
                    <strong className="text-sm text-indigo-950">{explainData.assumptions.operating_parameters.starting_capacity_utilization_percent}%</strong>
                  </div>
                  <div className="rounded-lg bg-indigo-50/50 p-2.5 border border-indigo-100 text-center">
                    <span className="text-[10px] text-stone-500 block">Target Capacity</span>
                    <strong className="text-sm text-indigo-950">{explainData.assumptions.operating_parameters.target_capacity_utilization_percent}%</strong>
                  </div>
                  <div className="rounded-lg bg-indigo-50/50 p-2.5 border border-indigo-100 text-center col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-stone-500 block">Collection Cycle</span>
                    <strong className="text-sm text-indigo-950">{explainData.assumptions.operating_parameters.average_collection_days} Days</strong>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider text-[11px]">Core Operating Parameters:</span>
                <ul className="space-y-2 text-xs text-stone-700">
                  {explainData.assumptions.key_assumptions.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-indigo-700 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 7. DATA LIMITATIONS & TRANSPARENCY SECTION */}
          {(activeTab === 'all' || activeTab === 'limitations') && (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">7. Data Limitations & Field Ground-Truthing</h3>
                    <p className="text-xs text-stone-500">Clear boundaries of model estimates and recommended field verification</p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                  Transparent Disclosure
                </span>
              </div>

              <div className="rounded-xl bg-stone-50 p-3.5 text-xs text-stone-800 font-medium leading-relaxed border border-stone-200/60">
                <strong>Executive Summary:</strong> {explainData.data_limitations.summary}
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider text-[11px]">Identified Data Boundaries:</span>
                <ul className="space-y-2 text-xs text-stone-700">
                  {explainData.data_limitations.limitations.map((lim, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{lim}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-4 space-y-2 text-xs">
                <span className="font-bold text-amber-950 block flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-700" />
                  Mandatory Field Ground-Truthing Checklist for {userProfile.name}:
                </span>
                <ul className="space-y-1.5 text-stone-700 pl-5 list-disc">
                  {explainData.data_limitations.field_action_checklist.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-stone-600">
              Ready to execute this venture? Review step-by-step statutory milestones and loan application workflow.
            </span>
            <button
              onClick={() => setCurrentPage('action-plan')}
              className="rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white px-4 py-2 font-bold transition flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            >
              <span>View 90-Day Action Plan</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
