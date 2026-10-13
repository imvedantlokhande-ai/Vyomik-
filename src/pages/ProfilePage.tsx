import { apiFetch } from '../utils/apiClient';
import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Globe,
  Award,
  Clock,
  Briefcase,
  Layers,
  IndianRupee,
  TrendingDown,
  Wrench,
  Target,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  Plus,
  X,
  Edit3,
  RotateCcw,
  Sparkles,
  Check,
  Building,
  Users,
  Compass,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import { getTranslation } from '../utils/i18n';

// Preset skills popular in rural enterprises
const PRESET_SKILLS = [
  'Crop Sorting & Grading',
  'Tractor Operation',
  'Cold Press / Milling',
  'Spice Grinding',
  'Pickle & Food Packaging',
  'Basic Electrical & Motor Repair',
  'Smartphone UPI / Bookkeeping',
  'Mandi / APMC Trading',
  'Solar Pump Operation',
  'Dairy Animal Management',
  'Organic Composting',
];

// Preset resource assets
const PRESET_RESOURCES = [
  'Owned Farmland / Homestead',
  'Roadside Shed / Workshop',
  '3-Phase Grid Electricity',
  'Borewell / Water Supply',
  'Two-Wheeler / Cargo Auto',
  'SHG / Bachat Gat Backing',
  'Family Labor Available',
  'Smartphone with Internet',
  'APMC Trader Network',
];

// Preset business types
const PRESET_BUSINESS_TYPES = [
  'Agri-Processing & Cold-Press Oil',
  'Spice Grinding & Food Packaging',
  'Cattle & Poultry Feed Grinding',
  'Solar Cold Storage & Aggregation',
  'Organic Bio-Fertilizer & Vermicompost',
  'Dairy & Animal Husbandry',
  'Rural Retail & Distribution',
  'Other Rural Enterprise',
];

// Preset business stages
const PRESET_BUSINESS_STAGES = [
  'Idea / Feasibility Stage',
  'Planning & Seeking Loan (0-3 months)',
  'Ready to Purchase Equipment & Launch',
  'Existing Micro-unit Expansion',
];

// Preset business goals
const PRESET_GOALS = [
  'Generate ₹30,000–₹50,000/month supplementary income for family',
  'Establish a full-time family manufacturing enterprise',
  'Create 3-5 local youth jobs in the village',
  'Build a regional brand and supply city mandis & retailers',
];

export const ProfilePage: React.FC<{ forceCreateMode?: boolean }> = ({ forceCreateMode }) => {
  const {
    userProfile,
    saveProfile,
    availableProfiles,
    switchProfile,
    language,
    setCurrentPage,
    businesses,
  } = useApp();

  const t = getTranslation(language);

  // Mode: 'view' (showing saved profile card) vs 'form' (step-by-step wizard for create/edit)
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  // Local draft state for the 12 required fields
  const [formData, setFormData] = useState<UserProfile>({ ...userProfile });

  // Temporary inputs for custom skills/resources
  const [customSkill, setCustomSkill] = useState('');
  const [customResource, setCustomResource] = useState('');

  // Notification / Success toast
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Open Create Mode
  const handleStartCreate = () => {
    const newBlankProfile: UserProfile = {
      id: `user-${Date.now()}`,
      name: '',
      location: '',
      village: '',
      block: '',
      district: '',
      state: 'Maharashtra',
      phone: '+91 ',
      age: 30,
      gender: 'Male',
      education: 'Class 12th Pass',
      availableCapital: 100000,
      monthlyExpenses: 15000,
      landAsset: '1 Acre farmland',
      powerReliabilityHours: 16,
      shgMember: false,
      casteCategory: 'General',
      skills: ['Crop Sorting & Grading', 'Smartphone UPI / Bookkeeping'],
      experience: '0-1 Years (Beginner / First Venture)',
      businessType: 'Agri-Processing & Cold-Press Oil',
      businessStage: 'Idea / Feasibility Stage',
      resources: ['Owned Farmland / Homestead', 'Smartphone with Internet'],
      businessGoal: 'Generate ₹30,000–₹50,000/month supplementary income for family',
      riskAppetite: 'Balanced',
      preferredLanguage: language === 'मराठी' ? 'मराठी' : language === 'हिंदी' ? 'हिंदी' : 'English',
      selectedBusinessId: 'biz-oil-ghani',
    };
    setFormData(newBlankProfile);
    setIsCreatingNew(true);
    setCurrentStep(1);
    setIsEditing(true);
    setValidationError(null);
  };

  // Handle forceCreateMode
  useEffect(() => {
    if (forceCreateMode) {
      handleStartCreate();
    }
  }, [forceCreateMode]);

  // Sync draft whenever userProfile changes and not actively editing
  useEffect(() => {
    if (!isEditing && !forceCreateMode) {
      setFormData({ ...userProfile });
    }
  }, [userProfile, isEditing, forceCreateMode]);

  // Handle text input changes
  const handleFieldChange = (field: keyof UserProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationError(null);
  };

  // Helper to toggle skills
  const toggleSkill = (skill: string) => {
    setFormData((prev) => {
      const exists = prev.skills.includes(skill);
      const updated = exists
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills: updated };
    });
  };

  // Helper to add custom skill
  const handleAddCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setCustomSkill('');
    }
  };

  // Helper to toggle resources
  const toggleResource = (resource: string) => {
    setFormData((prev) => {
      const current = prev.resources || [];
      const exists = current.includes(resource);
      const updated = exists
        ? current.filter((r) => r !== resource)
        : [...current, resource];
      return { ...prev, resources: updated };
    });
  };

  // Helper to add custom resource
  const handleAddCustomResource = () => {
    const trimmed = customResource.trim();
    const current = formData.resources || [];
    if (trimmed && !current.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        resources: [...current, trimmed],
      }));
      setCustomResource('');
    }
  };

  // Open Edit Mode
  const handleStartEdit = () => {
    setFormData({ ...userProfile });
    setIsCreatingNew(false);
    setCurrentStep(1);
    setIsEditing(true);
    setValidationError(null);
  };

  // Quick fill sample data to easily test "create"
  const handleFillSampleData = () => {
    setFormData({
      id: `user-sample-${Date.now()}`,
      name: 'Kavita Jadhav',
      location: 'Baramati, Pune, Maharashtra',
      village: 'Baramati',
      block: 'Baramati',
      district: 'Pune',
      state: 'Maharashtra',
      phone: '+91 98220 54321',
      age: 32,
      gender: 'Female',
      education: 'Graduate (B.Com)',
      availableCapital: 175000,
      monthlyExpenses: 20000,
      landAsset: 'Family farmhouse with 200 sq.ft processing shed',
      powerReliabilityHours: 18,
      shgMember: true,
      shgName: 'Yashaswini Bachat Gat',
      casteCategory: 'OBC',
      skills: ['Spice Grinding', 'Pickle & Food Packaging', 'Smartphone UPI / Bookkeeping', 'Mandi / APMC Trading'],
      experience: '2-5 Years (Experienced in Agriculture/Trade)',
      businessType: 'Agri-Processing & Cold-Press Oil',
      businessStage: 'Planning & Seeking Loan (0-3 months)',
      resources: ['Roadside Shed / Workshop', '3-Phase Grid Electricity', 'SHG / Bachat Gat Backing', 'Smartphone with Internet'],
      businessGoal: 'Establish an automated cold press unit generating ₹45,000 net monthly income',
      riskAppetite: 'Growth-oriented',
      preferredLanguage: 'मराठी',
      selectedBusinessId: 'biz-oil-ghani',
    });
    setSuccessToast('Sample data populated! Review and click Save.');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Step validation
  const validateCurrentStep = (): boolean => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setValidationError('Please enter entrepreneur name / उद्योजकाचे नाव प्रविष्ट करा.');
        return false;
      }
      if (!formData.location && !formData.district && !formData.village) {
        setValidationError('Please specify location (Village, District or State).');
        return false;
      }
    }
    if (currentStep === 4) {
      if (formData.availableCapital <= 0) {
        setValidationError('Please enter available capital greater than ₹0.');
        return false;
      }
    }
    setValidationError(null);
    return true;
  };

  // Navigate to next step
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  // Navigate to previous step
  const handlePrevStep = () => {
    setValidationError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Save profile to FastAPI backend and application state
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateCurrentStep()) return;

    // Match best business if not selected
    let matchingBizId = formData.selectedBusinessId || businesses[0].id;
    if (formData.availableCapital < 60000) {
      matchingBizId = 'biz-vermicompost';
    } else if (formData.availableCapital <= 110000) {
      matchingBizId = 'biz-spices-pulverizer';
    } else if (formData.availableCapital <= 180000) {
      matchingBizId = 'biz-oil-ghani';
    } else if (formData.availableCapital <= 250000) {
      matchingBizId = 'biz-cattle-feed';
    } else {
      matchingBizId = 'biz-solar-cold-storage';
    }

    // Format location string if needed
    const finalLocation =
      formData.location?.trim() ||
      `${formData.village || 'Village'}, ${formData.district || 'District'}, ${formData.state || 'State'}`;

    const updatedProfile: UserProfile = {
      ...formData,
      location: finalLocation,
      village: formData.village || finalLocation.split(',')[0]?.trim() || 'Village',
      district: formData.district || finalLocation.split(',')[1]?.trim() || 'District',
      state: formData.state || finalLocation.split(',')[2]?.trim() || 'Maharashtra',
      selectedBusinessId: matchingBizId,
    };

    // Payload for FastAPI POST /api/v1/profile
    const fastApiPayload = {
      name: updatedProfile.name,
      location: updatedProfile.location || finalLocation,
      language: updatedProfile.preferredLanguage || language || 'English',
      skills: updatedProfile.skills || [],
      experience: updatedProfile.experience || '',
      capital: Number(updatedProfile.availableCapital) || 0,
      monthly_expenses: Number(updatedProfile.monthlyExpenses) || 0,
      resources: updatedProfile.resources || [],
      goal: updatedProfile.businessGoal || '',
      risk_appetite: updatedProfile.riskAppetite || 'Balanced',
      id: updatedProfile.id,
      village: updatedProfile.village,
      block: updatedProfile.block,
      district: updatedProfile.district,
      state: updatedProfile.state,
      phone: updatedProfile.phone,
      age: updatedProfile.age,
      gender: updatedProfile.gender,
      education: updatedProfile.education,
      businessType: updatedProfile.businessType,
      businessStage: updatedProfile.businessStage,
      landAsset: updatedProfile.landAsset,
      powerReliabilityHours: updatedProfile.powerReliabilityHours,
      shgMember: updatedProfile.shgMember,
      shgName: updatedProfile.shgName,
      casteCategory: updatedProfile.casteCategory,
      selectedBusinessId: updatedProfile.selectedBusinessId,
    };

    try {
      const response = await apiFetch('/api/v1/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fastApiPayload),
      });

      if (response.ok) {
        const savedData = await response.json();
        console.log('FastAPI profile saved successfully:', savedData);
      } else {
        console.warn('FastAPI responded with status:', response.status);
      }
    } catch (err) {
      console.error('Failed to post profile to FastAPI:', err);
    }

    // Save into application state
    saveProfile(updatedProfile);

    const message = isCreatingNew
      ? `✓ New profile for "${updatedProfile.name}" saved to FastAPI and application state!`
      : `✓ Profile for "${updatedProfile.name}" updated successfully in FastAPI!`;

    setSuccessToast(message);
    setIsEditing(false);
    setIsCreatingNew(false);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  // Cancel form
  const handleCancelForm = () => {
    setFormData({ ...userProfile });
    setIsEditing(false);
    setIsCreatingNew(false);
    setValidationError(null);
  };

  // Location presets
  const LOCATION_PRESETS = [
    { label: 'Nashik, Maharashtra', village: 'Ozar', district: 'Nashik', state: 'Maharashtra' },
    { label: 'Anand, Gujarat', village: 'Vasad', district: 'Anand', state: 'Gujarat' },
    { label: 'Nalanda, Bihar', village: 'Silao', district: 'Nalanda', state: 'Bihar' },
    { label: 'Mandya, Karnataka', village: 'Keragodu', district: 'Mandya', state: 'Karnataka' },
    { label: 'Pune, Maharashtra', village: 'Baramati', district: 'Pune', state: 'Maharashtra' },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-6 text-left">
      {/* Top Banner & Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white font-black shadow-sm">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-stone-900 sm:text-2xl tracking-tight">
                {language === 'मराठी'
                  ? 'उद्योजक प्रोफाइल व संसाधन केंद्र'
                  : language === 'हिंदी'
                  ? 'उद्यमी प्रोफाइल एवं संसाधन'
                  : 'Entrepreneur Profile & Rural Assets'}
              </h1>
              <p className="text-xs text-stone-500">
                Collects your verified profile to customize viability scoring, cashflow, and 35% PMEGP subsidies.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons in Header */}
        <div className="flex flex-wrap items-center gap-2">
          {!isEditing ? (
            <>
              <button
                id="profile-create-new-btn"
                onClick={handleStartCreate}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-white px-3.5 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50 active:scale-95 min-h-[40px] shadow-xs"
              >
                <Plus className="h-4 w-4 text-emerald-700" />
                <span>+ Create New Profile</span>
              </button>

              <button
                id="profile-edit-active-btn"
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-800 active:scale-95 min-h-[40px] shadow-sm"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            </>
          ) : (
            <button
              id="profile-cancel-edit-btn"
              onClick={handleCancelForm}
              className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-700 transition hover:bg-stone-100 min-h-[40px]"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {successToast && (
        <div
          id="profile-success-banner"
          className="flex items-center justify-between rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-900 shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-stone-400 hover:text-stone-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Demo Profiles Quick Selector */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
        <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-emerald-700" />
          <span>Switch Saved Profiles:</span>
        </span>
        {availableProfiles.map((p) => {
          const isSelected = p.id === userProfile.id && !isCreatingNew;
          return (
            <button
              key={p.id}
              id={`switch-profile-${p.id}`}
              onClick={() => {
                switchProfile(p.id);
                setIsEditing(false);
                setIsCreatingNew(false);
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-95 min-h-[36px] ${
                isSelected
                  ? 'bg-emerald-800 text-white font-bold shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-emerald-100/70 border border-emerald-200'
              }`}
            >
              <span>{p.name.split(' ')[0]}</span>
              <span className="text-[10px] opacity-80">({p.district || p.location?.split(',')[1] || 'Rural'})</span>
              {isSelected && <Check className="h-3.5 w-3.5 text-amber-300" />}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE: Comprehensive Active Profile Summary Card (Showing all 12 items) */}
      {/* ========================================================================= */}
      {!isEditing && (
        <div className="space-y-6">
          {/* Active Profile Highlight Card */}
          <div
            id="active-profile-card"
            className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm"
          >
            {/* Card Header with Name & Quick Badges */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-700/80 px-3 py-0.5 text-xs font-bold text-emerald-200 border border-emerald-600/50">
                      <MapPin className="h-3 w-3 text-amber-300" />
                      {userProfile.location || `${userProfile.village}, ${userProfile.district}, ${userProfile.state}`}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-400/30">
                      <Globe className="h-3 w-3" />
                      {userProfile.preferredLanguage}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-800/80 px-2.5 py-0.5 text-[11px] font-bold text-teal-200">
                      ID: {userProfile.id}
                    </span>
                  </div>

                  <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                    {userProfile.name}
                  </h2>

                  <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
                    🎯 <strong>Goal:</strong> {userProfile.businessGoal || 'Build a sustainable village manufacturing enterprise.'}
                  </p>
                </div>

                {/* Edit Profile CTA in Banner */}
                <div className="flex items-center gap-2">
                  <button
                    id="profile-banner-edit-btn"
                    onClick={handleStartEdit}
                    className="flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-2.5 text-xs sm:text-sm font-black text-emerald-950 shadow-md transition hover:bg-amber-300 active:scale-95 min-h-[44px]"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit This Profile</span>
                  </button>
                </div>
              </div>
            </div>

            {/* The 12 Collected Fields Grid */}
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-500">
                  Profile Parameters & Registered Details (12 Key Attributes)
                </h3>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  Active in State
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* 1. Name */}
                <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    <User className="h-3.5 w-3.5 text-emerald-700" />
                    1. Entrepreneur Name
                  </span>
                  <div className="mt-1.5 text-base font-black text-stone-900">
                    {userProfile.name}
                  </div>
                  <div className="mt-1 text-[11px] text-stone-500">
                    {userProfile.gender} • {userProfile.age} Years • {userProfile.education}
                  </div>
                </div>

                {/* 2. Location */}
                <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                    2. Location
                  </span>
                  <div className="mt-1.5 text-base font-black text-stone-900">
                    {userProfile.location || `${userProfile.village}, ${userProfile.district}, ${userProfile.state}`}
                  </div>
                  <div className="mt-1 text-[11px] text-stone-500">
                    District: <strong>{userProfile.district}</strong> • State: <strong>{userProfile.state}</strong>
                  </div>
                </div>

                {/* 3. Language */}
                <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    <Globe className="h-3.5 w-3.5 text-emerald-700" />
                    3. Language
                  </span>
                  <div className="mt-1.5 text-base font-black text-emerald-800">
                    {userProfile.preferredLanguage}
                  </div>
                  <div className="mt-1 text-[11px] text-stone-500">
                    Preferred UI & Voice Mitra Advisor language
                  </div>
                </div>

                {/* 4. Skills */}
                <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4 lg:col-span-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    <Award className="h-3.5 w-3.5 text-emerald-700" />
                    4. Verified Skills
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {userProfile.skills && userProfile.skills.length > 0 ? (
                      userProfile.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-emerald-100/90 px-2.5 py-1 text-xs font-semibold text-emerald-900 border border-emerald-200"
                        >
                          ✓ {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-stone-400 italic">No skills registered yet</span>
                    )}
                  </div>
                </div>

                {/* 5. Experience */}
                <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    <Clock className="h-3.5 w-3.5 text-emerald-700" />
                    5. Experience Level
                  </span>
                  <div className="mt-1.5 text-sm font-black text-stone-900">
                    {userProfile.experience || '2-5 Years (Agricultural & Trading)'}
                  </div>
                  <div className="mt-1 text-[11px] text-stone-500">
                    Field knowledge and machinery familiarity
                  </div>
                </div>

                {/* 6. Business Type */}
                <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    <Briefcase className="h-3.5 w-3.5 text-emerald-700" />
                    6. Business Type
                  </span>
                  <div className="mt-1.5 text-sm font-black text-stone-900">
                    {userProfile.businessType || 'Agri-Processing & Cold Press'}
                  </div>
                  <div className="mt-1 text-[11px] text-emerald-700 font-semibold">
                    Mapped to regional ODOP scheme
                  </div>
                </div>

                {/* 7. Business Stage */}
                <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    <Layers className="h-3.5 w-3.5 text-emerald-700" />
                    7. Business Stage
                  </span>
                  <div className="mt-1.5 text-sm font-black text-stone-900">
                    {userProfile.businessStage || 'Planning & Seeking Loan (0-3 months)'}
                  </div>
                  <div className="mt-1 text-[11px] text-stone-500">
                    Execution timeline & readiness
                  </div>
                </div>

                {/* 8. Available Capital */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    <IndianRupee className="h-3.5 w-3.5 text-emerald-700" />
                    8. Available Capital
                  </span>
                  <div className="mt-1.5 text-2xl font-black text-emerald-950">
                    ₹{userProfile.availableCapital.toLocaleString('en-IN')}
                  </div>
                  <div className="mt-1 text-[11px] text-emerald-800 font-medium">
                    Eligible for 35% PMEGP subsidy grant
                  </div>
                </div>

                {/* 9. Monthly Expenses */}
                <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    <TrendingDown className="h-3.5 w-3.5 text-stone-600" />
                    9. Monthly Expenses
                  </span>
                  <div className="mt-1.5 text-xl font-black text-stone-900">
                    ₹{(userProfile.monthlyExpenses || 18000).toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-stone-500"> / month</span>
                  </div>
                  <div className="mt-1 text-[11px] text-stone-500">
                    Household & baseline living reserve
                  </div>
                </div>

                {/* 10. Resources */}
                <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4 lg:col-span-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    <Wrench className="h-3.5 w-3.5 text-emerald-700" />
                    10. Available Resources & Assets
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {userProfile.resources && userProfile.resources.length > 0 ? (
                      userProfile.resources.map((r, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-stone-200/90 px-2.5 py-1 text-xs font-semibold text-stone-800"
                        >
                          ⚙️ {r}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-stone-400 italic">No specific resources entered</span>
                    )}
                  </div>
                </div>

                {/* 11. Business Goal */}
                <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4 lg:col-span-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    <Target className="h-3.5 w-3.5 text-emerald-700" />
                    11. Business Goal
                  </span>
                  <div className="mt-1.5 text-xs sm:text-sm font-bold text-stone-800 leading-relaxed">
                    "{userProfile.businessGoal || 'Establish village cold-press unit earning ₹40,000/month net profit'}"
                  </div>
                </div>

                {/* 12. Risk Appetite */}
                <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                    12. Risk Appetite
                  </span>
                  <div className="mt-1.5">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold border ${
                        userProfile.riskAppetite === 'Conservative'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : userProfile.riskAppetite === 'Balanced'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-blue-100 text-blue-900 border-blue-300'
                      }`}
                    >
                      {userProfile.riskAppetite} Risk Profile
                    </span>
                  </div>
                  <div className="mt-1.5 text-[11px] text-stone-500">
                    {userProfile.riskAppetite === 'Conservative'
                      ? 'Prioritizes safety, low debt, and predictable cash flow.'
                      : userProfile.riskAppetite === 'Balanced'
                      ? 'Balances moderate capital with steady local mandi demand.'
                      : 'Aims for rapid scale, higher returns, and tech-driven operations.'}
                  </div>
                </div>
              </div>

              {/* Action Buttons to test or navigate */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-5">
                <div className="flex items-center gap-2">
                  <button
                    id="profile-create-test-btn"
                    onClick={handleStartCreate}
                    className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100 min-h-[44px]"
                  >
                    <Plus className="h-4 w-4 text-emerald-700" />
                    <span>Test Create New Profile</span>
                  </button>

                  <button
                    id="profile-edit-test-btn"
                    onClick={handleStartEdit}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100 min-h-[44px]"
                  >
                    <Edit3 className="h-4 w-4 text-emerald-700" />
                    <span>Test Edit Fields</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="profile-go-dashboard-btn"
                    onClick={() => setCurrentPage('dashboard')}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-sm min-h-[44px]"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORM MODE: Step-by-Step Form (Collects all 12 items & allows editing/creation) */}
      {/* ========================================================================= */}
      {isEditing && (
        <div
          id="profile-step-form-container"
          className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7"
        >
          {/* Header of Form */}
          <div className="flex flex-col justify-between gap-3 border-b border-stone-100 pb-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                  {isCreatingNew ? '+' : '✎'}
                </span>
                <h2 className="text-lg font-black text-stone-900 sm:text-xl">
                  {isCreatingNew ? 'Create New Entrepreneur Profile' : `Edit Profile: ${formData.name || 'Entrepreneur'}`}
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-stone-500">
                Step-by-step form collecting all 12 key attributes for intelligent rural matching.
              </p>
            </div>

            {isCreatingNew && (
              <button
                id="profile-fill-sample-btn"
                type="button"
                onClick={handleFillSampleData}
                className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 min-h-[36px]"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>⚡ Fill Sample Data (1-Tap Test)</span>
              </button>
            )}
          </div>

          {/* Stepper Progress Tabs */}
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { num: 1, title: 'Identity & Location', desc: 'Name, Location, Lang' },
              { num: 2, title: 'Skills & Assets', desc: 'Skills, Exp, Resources' },
              { num: 3, title: 'Business Vision', desc: 'Type, Stage, Goal' },
              { num: 4, title: 'Financials & Risk', desc: 'Capital, Expenses, Risk' },
            ].map((s) => {
              const isCurrent = currentStep === s.num;
              const isDone = currentStep > s.num;
              return (
                <button
                  key={s.num}
                  id={`step-tab-${s.num}`}
                  type="button"
                  onClick={() => {
                    if (validateCurrentStep()) {
                      setCurrentStep(s.num);
                    }
                  }}
                  className={`flex flex-col items-start rounded-2xl p-3 text-left transition border min-h-[64px] ${
                    isCurrent
                      ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                      : isDone
                      ? 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800'
                      : 'border-stone-200 bg-white text-stone-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black ${
                        isCurrent
                          ? 'bg-emerald-700 text-white'
                          : isDone
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {isDone ? '✓' : s.num}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isCurrent ? 'text-emerald-950' : 'text-stone-700'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                  <span className="mt-1 text-[10px] text-stone-500 line-clamp-1">
                    {s.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Validation Error Alert */}
          {validationError && (
            <div
              id="profile-form-error"
              className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-bold text-red-900"
            >
              ⚠️ {validationError}
            </div>
          )}

          {/* Step Form Body */}
          <form onSubmit={handleSaveProfile} className="mt-6 space-y-6">
            {/* ------------------------------------------------------------- */}
            {/* STEP 1: Name, Location, Language */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-stone-100 pb-2">
                  <h3 className="text-sm font-black text-stone-900">
                    Step 1: Entrepreneur Identity & Location
                  </h3>
                  <p className="text-xs text-stone-500">
                    Configure your name, native place/district, and preferred dialect.
                  </p>
                </div>

                {/* 1. Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-700">
                    1. Full Name / उद्योजकाचे नाव <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
                    <input
                      id="input-profile-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      placeholder="e.g. Ramesh Patel / सुनीता देवी"
                      className="w-full rounded-2xl border border-stone-300 pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold text-stone-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 min-h-[46px]"
                      required
                    />
                  </div>
                </div>

                {/* 2. Location */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-700">
                    2. Location (Village, District, State) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
                    <input
                      id="input-profile-location"
                      type="text"
                      value={formData.location || `${formData.village}, ${formData.district}, ${formData.state}`}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleFieldChange('location', val);
                        const parts = val.split(',');
                        if (parts[0]) handleFieldChange('village', parts[0].trim());
                        if (parts[1]) handleFieldChange('district', parts[1].trim());
                        if (parts[2]) handleFieldChange('state', parts[2].trim());
                      }}
                      placeholder="e.g. Vasad, Anand, Gujarat or Ozar, Nashik, Maharashtra"
                      className="w-full rounded-2xl border border-stone-300 pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold text-stone-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 min-h-[46px]"
                      required
                    />
                  </div>

                  {/* Preset Location Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-stone-500">Quick Select:</span>
                    {LOCATION_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            location: preset.label,
                            village: preset.village,
                            district: preset.district,
                            state: preset.state,
                          }));
                        }}
                        className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-emerald-50 hover:border-emerald-300 min-h-[30px]"
                      >
                        📍 {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Language */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">
                    3. Language / भाषा
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['English', 'हिंदी', 'मराठी'].map((lang) => {
                      const isSelected = formData.preferredLanguage === lang;
                      return (
                        <button
                          key={lang}
                          id={`profile-lang-btn-${lang}`}
                          type="button"
                          onClick={() => handleFieldChange('preferredLanguage', lang)}
                          className={`flex items-center justify-center gap-2 rounded-2xl border p-3.5 text-xs font-black transition min-h-[48px] ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600/20'
                              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <Globe className="h-4 w-4" />
                          <span>{lang}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-emerald-700" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 2: Skills, Experience, Resources */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-stone-100 pb-2">
                  <h3 className="text-sm font-black text-stone-900">
                    Step 2: Skills, Experience & Available Resources
                  </h3>
                  <p className="text-xs text-stone-500">
                    Select the hands-on skills, practical years of background, and tangible village assets available.
                  </p>
                </div>

                {/* 4. Skills */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-stone-700">
                      4. Skills (Select relevant or add custom)
                    </label>
                    <span className="text-[11px] text-emerald-800 font-semibold">
                      {formData.skills.length} skills selected
                    </span>
                  </div>

                  {/* Preset skill chips */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {PRESET_SKILLS.map((skill) => {
                      const isSelected = formData.skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition min-h-[36px] ${
                            isSelected
                              ? 'bg-emerald-700 text-white font-bold shadow-xs'
                              : 'border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {skill}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add custom skill input */}
                  <div className="mt-3 flex gap-2">
                    <input
                      id="input-custom-skill"
                      type="text"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomSkill();
                        }
                      }}
                      placeholder="Type custom skill (e.g. Flour Milling)..."
                      className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 min-h-[40px]"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSkill}
                      className="rounded-xl bg-stone-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-stone-900 min-h-[40px]"
                    >
                      + Add Skill
                    </button>
                  </div>
                </div>

                {/* 5. Experience */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    5. Experience Level
                  </label>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    {[
                      {
                        level: '0-1 Years (Beginner)',
                        desc: 'First micro-venture, basic agricultural familiarity.',
                      },
                      {
                        level: '2-5 Years (Experienced)',
                        desc: 'Hands-on trade, APMC dealings, machinery operation.',
                      },
                      {
                        level: '5+ Years (Veteran)',
                        desc: 'Established farm family business or deep craft expertise.',
                      },
                    ].map((exp) => {
                      const isSelected = formData.experience?.includes(exp.level.split(' ')[0]);
                      return (
                        <button
                          key={exp.level}
                          type="button"
                          onClick={() => handleFieldChange('experience', exp.level)}
                          className={`rounded-2xl border p-3.5 text-left transition min-h-[70px] ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600/20'
                              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <div className="text-xs font-black">{exp.level}</div>
                          <div className="mt-1 text-[11px] text-stone-500">{exp.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Resources */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-stone-700">
                      6. Available Resources & Assets
                    </label>
                    <span className="text-[11px] text-emerald-800 font-semibold">
                      {(formData.resources || []).length} assets tagged
                    </span>
                  </div>

                  {/* Preset resource chips */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {PRESET_RESOURCES.map((res) => {
                      const current = formData.resources || [];
                      const isSelected = current.includes(res);
                      return (
                        <button
                          key={res}
                          type="button"
                          onClick={() => toggleResource(res)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition min-h-[36px] ${
                            isSelected
                              ? 'bg-stone-900 text-white font-bold shadow-xs'
                              : 'border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {res}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add custom resource input */}
                  <div className="mt-3 flex gap-2">
                    <input
                      id="input-custom-resource"
                      type="text"
                      value={customResource}
                      onChange={(e) => setCustomResource(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomResource();
                        }
                      }}
                      placeholder="Type custom resource (e.g. Solar Dryer Space)..."
                      className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 min-h-[40px]"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomResource}
                      className="rounded-xl bg-stone-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-stone-900 min-h-[40px]"
                    >
                      + Add Asset
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 3: Business Type, Stage, Goal */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-stone-100 pb-2">
                  <h3 className="text-sm font-black text-stone-900">
                    Step 3: Business Type, Stage & Enterprise Goal
                  </h3>
                  <p className="text-xs text-stone-500">
                    Define what kind of venture you want to run, its current readiness, and your milestone target.
                  </p>
                </div>

                {/* 7. Business Type */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    7. Preferred Business Type / उद्योगाचा प्रकार
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {PRESET_BUSINESS_TYPES.map((type) => {
                      const isSelected = formData.businessType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleFieldChange('businessType', type)}
                          className={`flex items-center justify-between rounded-2xl border p-3 text-left transition min-h-[48px] ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-950 ring-2 ring-emerald-600/20 shadow-xs'
                              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <span className="text-xs font-semibold">{type}</span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 8. Business Stage */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    8. Current Business Stage
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {PRESET_BUSINESS_STAGES.map((stage) => {
                      const isSelected = formData.businessStage === stage;
                      return (
                        <button
                          key={stage}
                          type="button"
                          onClick={() => handleFieldChange('businessStage', stage)}
                          className={`flex items-center justify-between rounded-2xl border p-3 text-left transition min-h-[48px] ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-950 ring-2 ring-emerald-600/20 shadow-xs'
                              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <span className="text-xs font-semibold">{stage}</span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 9. Business Goal */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    9. Primary Business Goal / मुख्य उद्दिष्ट
                  </label>
                  <input
                    id="input-profile-goal"
                    type="text"
                    value={formData.businessGoal || ''}
                    onChange={(e) => handleFieldChange('businessGoal', e.target.value)}
                    placeholder="e.g. Generate ₹35,000 monthly income or scale cold-press brand..."
                    className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-xs sm:text-sm font-semibold text-stone-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 min-h-[46px]"
                  />

                  {/* Preset Goal Suggestions */}
                  <div className="mt-2 space-y-1.5">
                    <span className="text-[11px] font-semibold text-stone-500">Quick Presets:</span>
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {PRESET_GOALS.map((goal, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleFieldChange('businessGoal', goal)}
                          className="rounded-xl border border-stone-200 bg-stone-50 p-2 text-left text-[11px] text-stone-700 hover:bg-emerald-50 hover:border-emerald-300"
                        >
                          🎯 {goal}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 4: Available Capital, Monthly Expenses, Risk Appetite */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-stone-100 pb-2">
                  <h3 className="text-sm font-black text-stone-900">
                    Step 4: Financial Capacity & Risk Appetite
                  </h3>
                  <p className="text-xs text-stone-500">
                    Specify your available own equity, monthly living outflow, and risk preference.
                  </p>
                </div>

                {/* 10. Available Capital */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-stone-700">
                      10. Available Capital (Own Investment / Savings) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs font-black text-emerald-800">
                      ₹{formData.availableCapital.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="relative mt-1">
                    <IndianRupee className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
                    <input
                      id="input-profile-capital"
                      type="number"
                      value={formData.availableCapital}
                      onChange={(e) => handleFieldChange('availableCapital', Number(e.target.value))}
                      className="w-full rounded-2xl border border-stone-300 pl-10 pr-4 py-3 text-base font-black text-stone-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 min-h-[46px]"
                      min="10000"
                      step="5000"
                      required
                    />
                  </div>

                  {/* Quick capital buttons */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[45000, 100000, 125000, 160000, 250000, 350000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleFieldChange('availableCapital', amt)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border transition min-h-[30px] ${
                          formData.availableCapital === amt
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        ₹{(amt / 1000).toFixed(0)}k
                      </button>
                    ))}
                  </div>
                </div>

                {/* 11. Monthly Expenses */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-stone-700">
                      11. Monthly Living & Operating Expenses
                    </label>
                    <span className="text-xs font-bold text-stone-700">
                      ₹{(formData.monthlyExpenses || 18000).toLocaleString('en-IN')} / mo
                    </span>
                  </div>

                  <div className="relative mt-1">
                    <IndianRupee className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
                    <input
                      id="input-profile-expenses"
                      type="number"
                      value={formData.monthlyExpenses || 18000}
                      onChange={(e) => handleFieldChange('monthlyExpenses', Number(e.target.value))}
                      className="w-full rounded-2xl border border-stone-300 pl-10 pr-4 py-3 text-base font-black text-stone-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 min-h-[46px]"
                      min="5000"
                      step="1000"
                    />
                  </div>

                  {/* Quick expense buttons */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[12000, 18000, 22000, 28000, 35000].map((exp) => (
                      <button
                        key={exp}
                        type="button"
                        onClick={() => handleFieldChange('monthlyExpenses', exp)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border transition min-h-[30px] ${
                          formData.monthlyExpenses === exp
                            ? 'bg-stone-800 text-white border-stone-800'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        ₹{(exp / 1000).toFixed(0)}k / mo
                      </button>
                    ))}
                  </div>
                </div>

                {/* 12. Risk Appetite */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">
                    12. Risk Appetite / जोखीम घेण्याची क्षमता
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                      {
                        title: 'Conservative',
                        badge: 'Low Capital Risk',
                        color: 'border-emerald-500 bg-emerald-50/50',
                        desc: 'Steady demand, minimal bank debt, zero-loss post-harvest buffer.',
                      },
                      {
                        title: 'Balanced',
                        badge: 'Optimal Growth',
                        color: 'border-amber-500 bg-amber-50/50',
                        desc: 'Moderate investment, strong local kirana retail margins.',
                      },
                      {
                        title: 'Growth-oriented',
                        badge: 'High Ambition',
                        color: 'border-blue-500 bg-blue-50/50',
                        desc: 'Aggressive technology, cold chain, city mandi distribution scale.',
                      },
                    ].map((item) => {
                      const isSelected = formData.riskAppetite === item.title;
                      return (
                        <button
                          key={item.title}
                          id={`profile-risk-btn-${item.title.toLowerCase()}`}
                          type="button"
                          onClick={() => handleFieldChange('riskAppetite', item.title as any)}
                          className={`rounded-2xl border-2 p-4 text-left transition min-h-[100px] flex flex-col justify-between ${
                            isSelected
                              ? `${item.color} shadow-xs`
                              : 'border-stone-200 bg-white hover:bg-stone-50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-black text-stone-900">{item.title}</span>
                              {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-700" />}
                            </div>
                            <span className="mt-1 inline-block rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-stone-700">
                              {item.badge}
                            </span>
                            <p className="mt-2 text-[11px] text-stone-600 leading-tight">
                              {item.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation & Submission Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-5">
              <div>
                {currentStep > 1 && (
                  <button
                    id="profile-form-prev-btn"
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100 min-h-[44px]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  id="profile-form-cancel-btn"
                  type="button"
                  onClick={handleCancelForm}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-stone-500 hover:text-stone-800 min-h-[44px]"
                >
                  Cancel
                </button>

                {currentStep < totalSteps ? (
                  <button
                    id="profile-form-next-btn"
                    type="button"
                    onClick={handleNextStep}
                    className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-sm min-h-[44px]"
                  >
                    <span>Next: Step {currentStep + 1}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    id="profile-form-save-btn"
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs sm:text-sm font-black text-white hover:bg-emerald-800 shadow-md active:scale-95 min-h-[44px]"
                  >
                    <Save className="h-4 w-4" />
                    <span>
                      {isCreatingNew ? 'Create & Save Profile' : 'Save Profile Changes'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
