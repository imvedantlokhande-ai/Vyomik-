import { apiFetch } from '../utils/apiClient';
import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  IndianRupee,
  Building,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  RefreshCw,
  AlertCircle,
  Briefcase,
  Lightbulb,
  DollarSign,
  ChevronRight,
  Download,
  Brain,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActionPlanApiResponse, ActionPlanPhase } from '../types';

export const ActionPlanPage: React.FC = () => {
  const {
    actionPlan,
    toggleTaskCompletion,
    setActionPlanForBusiness,
    activeBusiness,
    userProfile,
    businesses,
    selectBusiness,
    setCurrentPage,
  } = useApp();

  const [apiResponse, setApiResponse] = useState<ActionPlanApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activePhaseId, setActivePhaseId] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null);

  // Fetch Action Plan from POST /api/v1/action-plan
  const fetchActionPlan = async (isRegenerate = false) => {
    if (isRegenerate) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await apiFetch('/api/v1/action-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: userProfile,
          selected_business: activeBusiness,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: ActionPlanApiResponse = await response.json();
      setApiResponse(data);
      if (data.phases && data.phases.length > 0) {
        setActionPlanForBusiness(activeBusiness.id, data.phases);
        // Default to first phase if not selected
        setActivePhaseId((prev) => (prev ? prev : data.phases[0].id));
      }
      setLastGeneratedAt(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch (err: any) {
      console.error('Failed to fetch /api/v1/action-plan:', err);
      setError('Could not reach Gemini action plan API. Displaying verified local operational roadmap.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActionPlan(false);
  }, [activeBusiness.id, userProfile.id]);

  // Use current actionPlan from context or fallback from API
  const currentPhases: ActionPlanPhase[] =
    actionPlan && actionPlan.length > 0 ? actionPlan : apiResponse?.phases || [];

  useEffect(() => {
    if (currentPhases.length > 0 && (!activePhaseId || !currentPhases.some((p) => p.id === activePhaseId))) {
      setActivePhaseId(currentPhases[0].id);
    }
  }, [currentPhases, activePhaseId]);

  const allTasks = currentPhases.flatMap((p) => p.tasks || []);
  const completedTasks = allTasks.filter((t) => t.isCompleted).length;
  const progressPercent = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;

  const totalCost = allTasks.reduce((acc, t) => acc + (t.estimatedCost || 0), 0);
  const selectedPhase = currentPhases.find((p) => p.id === activePhaseId) || currentPhases[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 text-left">
      {/* Header with Live Endpoint Status & Actions */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 sm:text-2xl flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-emerald-700" />
            <span>90-Day Execution Action Plan</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            AI-generated, field-tested roadmap for <strong className="text-stone-800">{activeBusiness.name}</strong> in {userProfile.village || userProfile.district}, {userProfile.district}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-mono text-[11px]">POST /api/v1/action-plan</span>
          </div>

          <button
            onClick={() => fetchActionPlan(true)}
            disabled={isRefreshing || loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition shadow-xs disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-700 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Generating...' : 'Regenerate with Gemini'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition shadow-xs"
          >
            <Printer className="h-3.5 w-3.5 text-stone-500" />
            <span>Print Checklist</span>
          </button>
        </div>
      </div>

      {/* Venture Switcher Banner */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-stone-600">
            <span className="text-stone-400 font-semibold uppercase tracking-wider text-[10px]">Selected Venture:</span>
            <span className="font-bold text-stone-900 text-sm">{activeBusiness.name}</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              {activeBusiness.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="venture-select-action" className="text-xs text-stone-500 font-medium">Switch Venture:</label>
            <select
              id="venture-select-action"
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

      {/* Hero Summary Card with Roadmap Metrics */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white shadow-md">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-700/80 px-2.5 py-1 text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>AI-Powered 4-Stage Roadmap</span>
              </span>
              {apiResponse?.model_used && (
                <span className="rounded-full bg-emerald-950/60 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                  {apiResponse.model_used}
                </span>
              )}
              {lastGeneratedAt && (
                <span className="text-[11px] text-emerald-200/70 font-mono">
                  Synced {lastGeneratedAt}
                </span>
              )}
            </div>

            <h2 className="text-xl font-black sm:text-2xl text-white">
              Structured 7, 30, 60 & 90-Day Execution Journey
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              {apiResponse?.roadmap_summary ||
                `Field-tested, non-extortion action plan structured for ${userProfile.name} to navigate statutory compliance, bank loan sanctions, machinery commissioning, and commercial retail distribution.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCurrentPage('explain')}
              className="rounded-xl bg-emerald-700/70 hover:bg-emerald-700 border border-emerald-500/50 px-3.5 py-2 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-xs"
            >
              <Brain className="h-4 w-4 text-emerald-300" />
              <span>Recommendation Audit</span>
            </button>
            <button
              onClick={() => setCurrentPage('schemes')}
              className="rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-bold text-emerald-950 hover:bg-amber-300 transition flex items-center gap-1.5 shadow-xs"
            >
              <FileText className="h-4 w-4" />
              <span>Apply for Subsidies</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="mt-6 pt-5 border-t border-emerald-700/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl bg-emerald-950/40 border border-emerald-700/40 p-3">
            <div className="flex items-center justify-between text-[11px] text-emerald-200 mb-1">
              <span>Roadmap Completion</span>
              <span className="font-bold text-white">{completedTasks}/{allTasks.length} Done ({progressPercent}%)</span>
            </div>
            <div className="h-2 w-full bg-emerald-900/60 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="text-[10px] text-emerald-300 mt-1 block">
              {completedTasks === allTasks.length ? 'All milestones completed!' : `${allTasks.length - completedTasks} milestones remaining`}
            </span>
          </div>

          <div className="rounded-xl bg-emerald-950/40 border border-emerald-700/40 p-3">
            <span className="text-[10px] text-emerald-200 block uppercase font-bold">Estimated Setup Outlay</span>
            <div className="text-lg font-black text-amber-300 mt-0.5">
              ₹{(apiResponse?.total_estimated_budget || totalCost).toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-emerald-300">Statutory fees, advance & initial setup</span>
          </div>

          <div className="rounded-xl bg-emerald-950/40 border border-emerald-700/40 p-3">
            <span className="text-[10px] text-emerald-200 block uppercase font-bold">Execution Horizons</span>
            <div className="text-lg font-black text-white mt-0.5">
              4 Distinct Stages
            </div>
            <span className="text-[10px] text-emerald-300">7-Day, 30-Day, 60-Day & 90-Day Plans</span>
          </div>
        </div>
      </div>

      {/* Loading Banner */}
      {loading && !apiResponse && (
        <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-xs">
          <RefreshCw className="h-8 w-8 text-emerald-700 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-stone-800">Generating Customized Action Plan with Gemini...</p>
          <p className="text-xs text-stone-500 mt-1">
            Analyzing {userProfile.name}&apos;s capital (₹{userProfile.availableCapital?.toLocaleString('en-IN')}) and {activeBusiness.name} requirements.
          </p>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Notice:</span> {error}
          </div>
        </div>
      )}

      {/* 4 Phase Tabs: 7-Day, 30-Day, 60-Day, 90-Day */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {currentPhases.map((phase, idx) => {
          const phaseTasks = phase.tasks || [];
          const phaseDone = phaseTasks.filter((t) => t.isCompleted).length;
          const isActive = phase.id === activePhaseId;
          const defaultTimeline =
            idx === 0
              ? 'Days 1 to 7'
              : idx === 1
              ? 'Days 8 to 30'
              : idx === 2
              ? 'Days 31 to 60'
              : 'Days 61 to 90';
          const defaultLabel =
            idx === 0
              ? '7-Day Sprint'
              : idx === 1
              ? '30-Day Plan'
              : idx === 2
              ? '60-Day Plan'
              : '90-Day Plan';

          return (
            <button
              key={phase.id || `phase-${idx}`}
              onClick={() => setActivePhaseId(phase.id)}
              className={`flex flex-col rounded-xl border p-3.5 text-left transition shadow-xs ${
                isActive
                  ? 'border-emerald-700 bg-emerald-800 text-white'
                  : 'border-stone-200 bg-white hover:border-emerald-300 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className={`font-bold ${isActive ? 'text-amber-300' : 'text-emerald-700'}`}>
                  {defaultLabel}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    isActive ? 'bg-emerald-900 text-emerald-100' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {phaseDone}/{phaseTasks.length} Done
                </span>
              </div>
              <div className={`mt-1 font-bold text-xs line-clamp-1 ${isActive ? 'text-white' : 'text-stone-900'}`}>
                {(phase.name || phase.title || `Phase ${idx + 1}`).replace(/^Phase \d+:\s*/, '')}
              </div>
              <div className={`text-[10px] mt-0.5 ${isActive ? 'text-emerald-200' : 'text-stone-500'}`}>
                {phase.timeframe || phase.timelineDays || defaultTimeline}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Phase Detail & Task Checklist */}
      {selectedPhase && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
          {/* Phase Header */}
          <div className="border-b border-stone-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  {selectedPhase.timeframe || selectedPhase.timelineDays || `Phase ${selectedPhase.phaseNumber}`}
                </span>
                <h2 className="mt-1.5 text-base sm:text-lg font-bold text-stone-900">
                  {selectedPhase.name || selectedPhase.title}
                </h2>
              </div>
              <div className="text-xs text-stone-500">
                {(selectedPhase.tasks || []).filter((t) => t.isCompleted).length} of {(selectedPhase.tasks || []).length} Milestones Achieved
              </div>
            </div>

            {selectedPhase.goal && (
              <div className="mt-3 rounded-xl bg-stone-50 p-3 text-xs text-stone-700 border border-stone-200/60 leading-relaxed">
                <strong className="text-stone-900">Phase Goal:</strong> {selectedPhase.goal}
                {selectedPhase.keyMilestone && (
                  <span className="block mt-1 text-emerald-800 font-medium">
                    🎯 <strong>Target Key Milestone:</strong> {selectedPhase.keyMilestone}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Tasks List */}
          <div className="space-y-3.5">
            {(selectedPhase.tasks || []).map((task) => {
              const docs = task.mandatoryDocuments || task.documentsNeeded || [];

              return (
                <div
                  key={task.id}
                  onClick={() => toggleTaskCompletion(selectedPhase.id, task.id)}
                  className={`group flex flex-col justify-between rounded-xl border p-4 transition cursor-pointer sm:flex-row sm:items-start gap-4 ${
                    task.isCompleted
                      ? 'border-emerald-200 bg-emerald-50/40 text-stone-600'
                      : 'border-stone-200 bg-white hover:border-emerald-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <div className="pt-0.5">
                      <CheckCircle2
                        className={`h-5 w-5 transition ${
                          task.isCompleted
                            ? 'text-emerald-600 fill-emerald-100'
                            : 'text-stone-300 group-hover:text-emerald-500'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5 flex-1 text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`text-sm font-bold ${
                            task.isCompleted ? 'text-stone-500 line-through' : 'text-stone-900'
                          }`}
                        >
                          {task.title}
                        </h3>
                        {task.officialEntity && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-700">
                            <Building className="h-3 w-3 text-emerald-700" />
                            <span>{task.officialEntity}</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">{task.description}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-stone-500">
                        <span>
                          Time Required: <strong>{task.timeEstimate || `${task.durationDays} Days`}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Est. Cost: <strong>₹{(task.estimatedCost || 0).toLocaleString('en-IN')}</strong>
                        </span>
                      </div>

                      {docs.length > 0 && (
                        <div className="mt-2 rounded-lg bg-stone-50 p-2.5 text-[11px] text-stone-700 border border-stone-200/50">
                          <span className="font-bold text-stone-900 flex items-center gap-1 mb-1">
                            <FileText className="h-3.5 w-3.5 text-stone-500" />
                            <span>Carry with you (Mandatory Documents):</span>
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {docs.map((doc, dIdx) => (
                              <span
                                key={dIdx}
                                className="rounded bg-white px-2 py-0.5 text-[10px] font-medium text-stone-700 border border-stone-200"
                              >
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {task.practicalTips && (
                        <div className="mt-2 rounded-lg bg-amber-50/70 p-2.5 text-[11px] text-amber-950 border border-amber-200/60">
                          <span className="font-bold flex items-center gap-1 text-amber-900 mb-0.5">
                            <Lightbulb className="h-3.5 w-3.5 text-amber-700" />
                            <span>Practical Insider Tip:</span>
                          </span>
                          <span>{task.practicalTips}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sm:self-start">
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold whitespace-nowrap ${
                        task.isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {task.isCompleted ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Navigation & Shortcut Actions */}
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-stone-600">
          Ready to verify subsidy schemes or compute unit economics for this roadmap?
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCurrentPage('schemes')}
            className="rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 px-3.5 py-2 font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="h-3.5 w-3.5 text-emerald-700" />
            <span>Eligible Schemes</span>
          </button>
          <button
            onClick={() => setCurrentPage('financial-planner')}
            className="rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white px-4 py-2 font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <span>Check Unit Economics</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
