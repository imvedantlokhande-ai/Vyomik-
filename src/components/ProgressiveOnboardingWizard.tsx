import React, { useState } from 'react';
import {
  MapPin,
  IndianRupee,
  Zap,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Building,
  Factory,
  Home,
  Award,
  Lightbulb,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import { getTranslation, SupportedLanguage } from '../utils/i18n';

interface ProgressiveOnboardingWizardProps {
  onComplete?: () => void;
  inline?: boolean;
}

export const ProgressiveOnboardingWizard: React.FC<ProgressiveOnboardingWizardProps> = ({
  onComplete,
  inline = false,
}) => {
  const {
    userProfile,
    setUserProfile,
    language,
    setLanguage,
    availableProfiles,
    switchProfile,
    businesses,
    setCurrentPage,
  } = useApp();

  const t = getTranslation(language);

  const [step, setStep] = useState<number>(1);
  const totalSteps = 4;

  // Local draft state
  const [draftProfile, setDraftProfile] = useState<UserProfile>({ ...userProfile });

  const updateDraft = (field: keyof UserProfile, value: any) => {
    setDraftProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleFinish = () => {
    // Determine the best matching business based on capital
    let bestBizId = businesses[0].id;
    if (draftProfile.availableCapital < 60000) {
      bestBizId = 'biz-vermicompost';
    } else if (draftProfile.availableCapital <= 100000) {
      bestBizId = 'biz-spices-pulverizer';
    } else if (draftProfile.availableCapital <= 180000) {
      bestBizId = 'biz-oil-ghani';
    } else if (draftProfile.availableCapital <= 250000) {
      bestBizId = 'biz-cattle-feed';
    } else {
      bestBizId = 'biz-solar-cold-storage';
    }

    const finalProfile: UserProfile = {
      ...draftProfile,
      selectedBusinessId: bestBizId,
    };

    setUserProfile(finalProfile);
    if (onComplete) {
      onComplete();
    } else {
      setCurrentPage('dashboard');
    }
  };

  // Preset location quick chips
  const regionalPresets = [
    { district: 'Nashik', state: 'Maharashtra', village: 'Ozar', capital: 160000, lang: 'मराठी', cat: 'OBC' },
    { district: 'Anand', state: 'Gujarat', village: 'Vasad', capital: 125000, lang: 'English', cat: 'OBC' },
    { district: 'Nalanda', state: 'Bihar', village: 'Silao', capital: 45000, lang: 'हिंदी', cat: 'SC' },
    { district: 'Mandya', state: 'Karnataka', village: 'Keragodu', capital: 280000, lang: 'English', cat: 'General' },
    { district: 'Pune', state: 'Maharashtra', village: 'Baramati', capital: 210000, lang: 'मराठी', cat: 'General' },
  ];

  // Budget quick tiers
  const capitalTiers = [
    { label: 'Micro Unit', range: '₹25k - ₹50k', value: 45000, desc: 'Vermicompost, Spices pouch packing, SHG pickle unit' },
    { label: 'Standard Unit', range: '₹50k - ₹1.5 Lakh', value: 125000, desc: 'Cold press oil ghani, Cattle feed grinder, Flour mill' },
    { label: 'Growth Enterprise', range: '₹1.5L - ₹3 Lakh', value: 220000, desc: 'Mini Dal mill, Solar vegetable dryer, Dairy chilling' },
    { label: 'Scale Hub', range: '₹3L - ₹10 Lakh+', value: 350000, desc: 'Farm-gate solar cold storage, Aggregation hub' },
  ];

  return (
    <div
      className={`rounded-2xl border border-stone-200 bg-white shadow-md text-left transition-all ${
        inline ? 'p-4 sm:p-6' : 'p-5 sm:p-8 max-w-2xl mx-auto'
      }`}
    >
      {/* Top Banner & Progress */}
      <div className="border-b border-stone-100 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 font-black text-emerald-950 text-xs">
              ⚡
            </span>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              {t.onboarding.badge}
            </span>
          </div>
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
            Step {step} of {totalSteps}
          </span>
        </div>

        {/* Step Progress Bar */}
        <div className="mt-3 flex items-center gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-emerald-600' : 'bg-stone-100'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step Contents */}
      <div className="py-5 min-h-[320px]">
        {/* STEP 1: Region & Language */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-stone-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-700" />
                <span>{t.onboarding.step1Title}</span>
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {t.onboarding.step1Desc}
              </p>
            </div>

            {/* Language Selector 3-way chips */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2">
                Select App Language / भाषा निवडा:
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {(['English', 'हिंदी', 'मराठी'] as SupportedLanguage[]).map((langOption) => (
                  <button
                    key={langOption}
                    type="button"
                    onClick={() => {
                      setLanguage(langOption);
                      updateDraft('preferredLanguage', langOption);
                    }}
                    className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                      language === langOption
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs ring-2 ring-emerald-500/20'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-stone-50/50'
                    }`}
                  >
                    <span className="text-sm font-extrabold">{langOption}</span>
                    <span className="text-[10px] text-stone-500">
                      {langOption === 'English' ? 'Standard' : langOption === 'हिंदी' ? 'राष्ट्रभाषा' : 'मातृभाषा'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick 1-tap Regional Presets */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Quick 1-Tap District Presets:
              </label>
              <div className="flex flex-wrap gap-2">
                {regionalPresets.map((preset) => (
                  <button
                    key={preset.district}
                    type="button"
                    onClick={() => {
                      updateDraft('district', preset.district);
                      updateDraft('state', preset.state);
                      updateDraft('village', preset.village);
                      updateDraft('availableCapital', preset.capital);
                      updateDraft('preferredLanguage', preset.lang);
                      updateDraft('casteCategory', preset.cat as any);
                      setLanguage(preset.lang);
                    }}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                      draftProfile.district === preset.district
                        ? 'border-emerald-600 bg-emerald-700 text-white font-bold'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    📍 {preset.district}, {preset.state}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Edit Inputs */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  District / जिल्हा
                </label>
                <input
                  type="text"
                  value={draftProfile.district}
                  onChange={(e) => updateDraft('district', e.target.value)}
                  placeholder="e.g. Nashik, Anand, Nalanda"
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-xs text-stone-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  State / राज्य
                </label>
                <input
                  type="text"
                  value={draftProfile.state}
                  onChange={(e) => updateDraft('state', e.target.value)}
                  placeholder="e.g. Maharashtra, Gujarat, Bihar"
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-xs text-stone-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Available Capital */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-stone-900 flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-emerald-700" />
                <span>{t.onboarding.step2Title}</span>
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {t.onboarding.step2Desc}
              </p>
            </div>

            {/* Current Selected Capital Display */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-center">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Immediate Investment Readiness
              </span>
              <div className="mt-1 text-3xl font-black text-emerald-950">
                ₹{draftProfile.availableCapital.toLocaleString('en-IN')}
              </div>
              <p className="mt-1 text-[11px] text-emerald-700">
                Qualifies for 25%–35% PMEGP subsidy + Mudra collateral-free bank loan
              </p>
            </div>

            {/* Quick Capital Touch Cards */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {capitalTiers.map((tier) => (
                <div
                  key={tier.label}
                  onClick={() => updateDraft('availableCapital', tier.value)}
                  className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                    draftProfile.availableCapital === tier.value
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">
                      {tier.label}
                    </span>
                    <span className="rounded bg-stone-100 px-2 py-0.5 text-[11px] font-bold text-stone-700">
                      {tier.range}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-stone-500 leading-snug">
                    {tier.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Fine-tune slider */}
            <div className="pt-2">
              <div className="flex justify-between text-xs font-semibold text-stone-600">
                <span>Custom Amount:</span>
                <span className="font-bold text-emerald-800">
                  ₹{draftProfile.availableCapital.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="20000"
                max="500000"
                step="10000"
                value={draftProfile.availableCapital}
                onChange={(e) => updateDraft('availableCapital', Number(e.target.value))}
                className="mt-2 w-full accent-emerald-700 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Land & Power Assets */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-stone-900 flex items-center gap-2">
                <Zap className="h-5 w-5 text-emerald-700" />
                <span>{t.onboarding.step3Title}</span>
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {t.onboarding.step3Desc}
              </p>
            </div>

            {/* Power Hours Selector */}
            <div className="rounded-xl border border-stone-200 p-4">
              <label className="block text-xs font-bold text-stone-800">
                Average Daily Electric Power Hours:
              </label>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { hours: 8, label: 'Low (<10h)', desc: 'Solar/Manual viable' },
                  { hours: 16, label: 'Standard (14-18h)', desc: 'Standard single-phase' },
                  { hours: 22, label: '3-Phase High (20h+)', desc: 'Heavy machinery' },
                ].map((p) => (
                  <button
                    key={p.hours}
                    type="button"
                    onClick={() => updateDraft('powerReliabilityHours', p.hours)}
                    className={`rounded-xl border p-2.5 text-center transition ${
                      draftProfile.powerReliabilityHours === p.hours
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="text-xs font-bold">{p.label}</div>
                    <div className="text-[10px] text-stone-500 mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Land & Shed Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-800">
                Premises or Workspace Available:
              </label>
              {[
                'Courtyard / Family homestead (150-200 sq.ft)',
                'Roadside tin shed / shop room (200-400 sq.ft)',
                '1-2 Acres ancestral agricultural land with open space',
                'Renting a village shop / commercial shed',
              ].map((option) => (
                <div
                  key={option}
                  onClick={() => updateDraft('landAsset', option)}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition cursor-pointer ${
                    draftProfile.landAsset.includes(option.split(' ')[0]) || draftProfile.landAsset === option
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <Home className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span className="text-xs">{option}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Category & SHG for 35% Subsidies */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-stone-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-700" />
                <span>{t.onboarding.step4Title}</span>
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {t.onboarding.step4Desc}
              </p>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-2">
                Select Your Category (PMEGP Subsidy Rate):
              </label>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {[
                  { cat: 'OBC', subsidy: '35% Special Category', equity: 'Only 5% equity' },
                  { cat: 'SC', subsidy: '35% Special Category', equity: 'Only 5% equity' },
                  { cat: 'ST', subsidy: '35% Special Category', equity: 'Only 5% equity' },
                  { cat: 'Minority', subsidy: '35% Special Category', equity: 'Only 5% equity' },
                  { cat: 'General', subsidy: '25% Rural Standard', equity: '10% own equity' },
                ].map((item) => (
                  <button
                    key={item.cat}
                    type="button"
                    onClick={() => updateDraft('casteCategory', item.cat as any)}
                    className={`rounded-xl border p-3 text-left transition ${
                      draftProfile.casteCategory === item.cat
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="text-xs font-extrabold text-stone-900">{item.cat}</div>
                    <div className="text-[11px] font-semibold text-emerald-700">{item.subsidy}</div>
                    <div className="text-[10px] text-stone-500">{item.equity}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* SHG Affiliation Card */}
            <div className="rounded-xl border border-stone-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-stone-900">
                    Self-Help Group (SHG) / Bachat Gat Member?
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Unlocks DAY-NRLM ₹50k revolving fund & 7% interest subvention.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateDraft('shgMember', true)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      draftProfile.shgMember
                        ? 'bg-emerald-700 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => updateDraft('shgMember', false)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      !draftProfile.shgMember
                        ? 'bg-emerald-700 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            {/* Final Match Summary Preview */}
            <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-3.5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white font-black text-sm">
                35%
              </div>
              <div>
                <div className="text-xs font-bold text-purple-900">
                  Government Subsidy Unlocked!
                </div>
                <div className="text-[11px] text-purple-700">
                  Your profile qualifies for up to ₹{Math.round(draftProfile.availableCapital * 3.5).toLocaleString('en-IN')} in total project financing under PMEGP & Mudra.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons: Large Touch Friendly */}
      <div className="border-t border-stone-100 pt-4 flex items-center justify-between gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 py-3 text-xs font-bold text-stone-700 hover:bg-stone-50 active:scale-95 transition min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t.onboarding.prevStep}</span>
          </button>
        ) : (
          <div />
        )}

        {step < totalSteps ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-xs sm:text-sm font-extrabold text-white shadow-sm hover:bg-emerald-800 active:scale-95 transition min-h-[44px]"
          >
            <span>{t.onboarding.nextStep}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            className="flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-xs sm:text-sm font-extrabold text-emerald-950 shadow-md hover:bg-amber-300 active:scale-95 transition min-h-[44px]"
          >
            <span>{t.onboarding.finishSetup}</span>
          </button>
        )}
      </div>
    </div>
  );
};
