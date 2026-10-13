import { apiFetch } from '../utils/apiClient';
import React, { useState, useEffect } from 'react';
import {
  MapPin,
  TrendingUp,
  Calendar,
  Users,
  ArrowRight,
  Compass,
  Sparkles,
  Info,
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LocalOpportunity } from '../types';

interface HyperlocalApiResponse {
  demand: string;
  competition: string;
  market_gap: string;
  seasonality: string;
  resources: string[];
  opportunity_score: number;
  opportunities: LocalOpportunity[];
  is_demo: boolean;
  data_notice: string;
  data_source?: string;
  inputs_considered?: {
    location?: string;
    skills?: string[];
    capital?: number;
    business_goal?: string;
  };
}

export const OpportunitiesPage: React.FC = () => {
  const {
    opportunities: fallbackOpportunities,
    userProfile,
    selectBusiness,
    setCurrentPage,
    businesses,
    activeBusiness,
  } = useApp();

  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [hyperlocalData, setHyperlocalData] = useState<HyperlocalApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sectors = ['All', 'Agri-Processing', 'Livestock & Feed', 'Renewable Energy', 'Bio-Inputs'];

  const fetchHyperlocalOpportunities = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    const userLocation = userProfile.location || `${userProfile.district}, ${userProfile.state}`;
    const userSkills = userProfile.skills && userProfile.skills.length > 0 ? userProfile.skills : ['Food Processing', 'Trading'];
    const userCapital = userProfile.availableCapital || 120000;
    const userGoal = userProfile.businessGoal || activeBusiness?.name || 'Establish sustainable rural processing unit';

    try {
      const response = await apiFetch('/api/v1/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: userLocation,
          skills: userSkills,
          capital: userCapital,
          business_goal: userGoal,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: HyperlocalApiResponse = await response.json();
      setHyperlocalData(data);
    } catch (err: any) {
      console.warn('Failed to fetch from /api/v1/opportunities, falling back to local dataset:', err);
      setErrorMsg('Hyper-local service unreachable; displaying cached local intelligence.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHyperlocalOpportunities();
  }, [
    userProfile.district,
    userProfile.state,
    userProfile.availableCapital,
    userProfile.businessGoal,
    userProfile.skills,
  ]);

  const displayedOpportunities: LocalOpportunity[] =
    hyperlocalData?.opportunities && hyperlocalData.opportunities.length > 0
      ? hyperlocalData.opportunities
      : fallbackOpportunities;

  const filteredOpportunities = displayedOpportunities.filter((opp) => {
    const matchesSector = selectedSector === 'All' || opp.sector === selectedSector;
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opp.rawMaterialSurplus && opp.rawMaterialSurplus.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (opp.district && opp.district.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSector && matchesSearch;
  });

  const handleSelectOpportunityBusiness = (bizId: string) => {
    selectBusiness(bizId);
    setCurrentPage('recommendations');
  };

  const isDemo = hyperlocalData ? hyperlocalData.is_demo : true;

  return (
    <div className="space-y-6 pb-20 md:pb-6 text-left">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold text-stone-900 sm:text-2xl flex items-center gap-2">
              <Compass className="h-6 w-6 text-emerald-700" />
              <span>Local District Opportunities & Supply Gaps</span>
            </h1>

            {/* Clear Demo Data Badge */}
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 tracking-wide">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              DEMO DATA
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Unmet market demands, APMC mandis, and raw material gluts mapped across {userProfile.district}, {userProfile.state} and neighboring economic corridors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900">
            <MapPin className="h-3.5 w-3.5 text-emerald-700" />
            <span>Active Region: {userProfile.district}, {userProfile.state}</span>
          </div>

          <button
            onClick={fetchHyperlocalOpportunities}
            disabled={isLoading}
            title="Refresh hyper-local intelligence"
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-xs transition hover:bg-stone-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-emerald-700' : 'text-stone-500'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Demo Notice Banner */}
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50/80 via-amber-50/40 to-stone-50 p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-amber-100 p-2 text-amber-800 shrink-0">
            <Info className="h-4 w-4" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <span>Hyper-Local Backend Intelligence Module Active</span>
              <span className="rounded bg-amber-200/80 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-amber-900">
                Demo Engine
              </span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              {hyperlocalData?.data_notice ||
                'DEMO DATA: District supply deficits, APMC mandi arrivals, and raw material gluts are simulated demo models designed for prototype assessment.'}
            </p>
          </div>
        </div>
      </div>

      {/* Backend Hyperlocal Evaluation Summary Card (From POST /api/v1/opportunities) */}
      {hyperlocalData && (
        <div className="rounded-2xl border border-emerald-200/80 bg-white p-5 shadow-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-stone-900">
                  Regional Opportunity Assessment ({userProfile.district})
                </h2>
                <p className="text-[11px] text-stone-400">
                  Computed by POST /api/v1/opportunities (DEMO DATA Engine)
                </p>
              </div>
            </div>

            {/* Overall Score */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Opportunity Score</div>
                <div className="text-lg font-black text-emerald-700">
                  {hyperlocalData.opportunity_score}/100
                </div>
              </div>
              <div className="h-8 w-px bg-stone-200" />
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                High Viability
              </span>
            </div>
          </div>

          {/* Key Returned Attributes Grid */}
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {/* Demand */}
            <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-3 text-xs">
              <div className="font-bold text-stone-800 flex items-center gap-1.5 mb-1">
                <Users className="h-3.5 w-3.5 text-emerald-700" />
                <span>Demand Strength</span>
              </div>
              <p className="text-stone-600 line-clamp-3 leading-relaxed text-[11px]">
                {hyperlocalData.demand}
              </p>
            </div>

            {/* Competition */}
            <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-3 text-xs">
              <div className="font-bold text-stone-800 flex items-center gap-1.5 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-blue-700" />
                <span>Competition</span>
              </div>
              <p className="text-stone-600 line-clamp-3 leading-relaxed text-[11px]">
                {hyperlocalData.competition}
              </p>
            </div>

            {/* Market Gap */}
            <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-3 text-xs">
              <div className="font-bold text-stone-800 flex items-center gap-1.5 mb-1">
                <Layers className="h-3.5 w-3.5 text-amber-700" />
                <span>Market Gap</span>
              </div>
              <p className="text-stone-600 line-clamp-3 leading-relaxed text-[11px]">
                {hyperlocalData.market_gap}
              </p>
            </div>

            {/* Seasonality */}
            <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-3 text-xs">
              <div className="font-bold text-stone-800 flex items-center gap-1.5 mb-1">
                <Calendar className="h-3.5 w-3.5 text-purple-700" />
                <span>Seasonality</span>
              </div>
              <p className="text-stone-600 line-clamp-3 leading-relaxed text-[11px]">
                {hyperlocalData.seasonality}
              </p>
            </div>
          </div>

          {/* Local Resources */}
          {hyperlocalData.resources && hyperlocalData.resources.length > 0 && (
            <div className="mt-3.5 flex flex-wrap items-center gap-1.5 pt-3 border-t border-stone-100">
              <span className="text-[11px] font-bold text-stone-500 mr-1">Available Local Resources:</span>
              {hyperlocalData.resources.map((res, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-700 border border-stone-200"
                >
                  {res}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Sector Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                selectedSector === sec
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search crops, gaps, mandis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Opportunities List Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredOpportunities.map((opp) => {
          const matchedBiz = businesses.find((b) =>
            opp.recommendedBusinessIds && opp.recommendedBusinessIds.includes(b.id)
          );

          const oppScore = opp.opportunity_score || opp.feasibilityScore || 90;

          return (
            <div
              key={opp.id}
              className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition hover:border-emerald-300 hover:shadow-md relative overflow-hidden"
            >
              <div className="space-y-3">
                {/* Badge Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-bold text-stone-700">
                      {opp.sector}
                    </span>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-extrabold text-amber-800">
                      DEMO DATA
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>{oppScore}% Local Feasibility</span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    {opp.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-stone-400">
                    <MapPin className="h-3 w-3 text-stone-400" />
                    <span>{opp.district}, {opp.state}</span>
                  </div>
                </div>

                {/* Raw Material Surplus Box */}
                <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-xs">
                  <div className="font-semibold text-amber-900">
                    Local Raw Material Surplus:
                  </div>
                  <p className="mt-1 text-stone-700 leading-relaxed">
                    {opp.rawMaterialSurplus}
                  </p>
                </div>

                {/* Demand Gap Box */}
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs">
                  <div className="font-semibold text-emerald-950">
                    Unmet Demand & Commercial Deficit:
                  </div>
                  <p className="mt-1 text-stone-700 leading-relaxed">
                    {opp.market_gap || opp.demandGap}
                  </p>
                </div>

                {/* Key Metrics Pill Row */}
                <div className="grid grid-cols-3 gap-2 rounded-xl bg-stone-50 p-2.5 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-stone-400 font-medium">Market Potential</div>
                    <div className="mt-0.5 font-bold text-stone-900">
                      ₹{(opp.estimatedMarketSizePerMonth / 100000).toFixed(1)}L/mo
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400 font-medium">Gross Margin</div>
                    <div className="mt-0.5 font-bold text-emerald-700">
                      ~{opp.marginPotentialPercent}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400 font-medium">Competition</div>
                    <div
                      className={`mt-0.5 font-bold ${
                        String(opp.competition).includes('Low')
                          ? 'text-emerald-700'
                          : String(opp.competition).includes('Medium')
                          ? 'text-amber-700'
                          : 'text-red-600'
                      }`}
                    >
                      {String(opp.competition).split('—')[0].trim()}
                    </div>
                  </div>
                </div>

                {/* Seasonality & Buyers */}
                <div className="space-y-1 text-[11px] text-stone-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    <span><strong>Peak Season:</strong> {opp.seasonality || opp.keySeasonality}</span>
                  </div>
                  {opp.buyerTypes && opp.buyerTypes.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      <span><strong>Target Buyers:</strong> {opp.buyerTypes.join(', ')}</span>
                    </div>
                  )}
                  {opp.resources && opp.resources.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      <span className="truncate"><strong>Key Resources:</strong> {opp.resources.slice(0, 2).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              {matchedBiz && (
                <div className="mt-4 border-t border-stone-100 pt-3">
                  <button
                    onClick={() => handleSelectOpportunityBusiness(matchedBiz.id)}
                    className="flex w-full items-center justify-between rounded-xl bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    <span>Recommended Business: <strong>{matchedBiz.name}</strong></span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
