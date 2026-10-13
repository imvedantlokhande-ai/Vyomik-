import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../utils/apiClient';
import { getTranslation } from '../utils/i18n';
import { Check, ChevronRight, Loader2, Globe, Building2, Wallet, Target } from 'lucide-react';

const LANGUAGES = [
  { code: 'English', label: 'English', localLabel: 'English' },
  { code: 'Hindi', label: 'Hindi', localLabel: 'हिंदी' },
  { code: 'Marathi', label: 'Marathi', localLabel: 'मराठी' }
];

export default function OnboardingPage() {
  const { userProfile, saveProfile, language, setLanguage } = useApp();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const t = getTranslation(language);
  
  // Local state for profile building
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    language: 'English',
    skills: '',
    experience: '',
    businessType: '',
    businessStage: 'Idea',
    capital: '',
    monthlyExpenses: '',
    resources: '',
    goal: '',
    riskAppetite: 'Medium'
  });

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
      const payload = {
        user_id: 'anonymous',
        name: formData.name,
        district: formData.location.split(',')[0] || formData.location,
        state: formData.location.split(',')[1] || 'Maharashtra',
        language: formData.language,
        skills: skillsArray,
        experience: formData.experience,
        businessType: formData.businessType,
        businessStage: formData.businessStage,
        capital: formData.capital,
        monthlyExpenses: formData.monthlyExpenses,
        resources: formData.resources,
        goal: formData.goal,
        riskAppetite: formData.riskAppetite
      };

      const response = await apiFetch(`/api/v1/profile`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }
      
      const savedProfile = await response.json();
      saveProfile(savedProfile);
    } catch (err) {
      console.error(err);
      // Fallback for UI if backend is not reachable during demo
      const fallbackProfile = {
        id: `prof_${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name,
        preferredLanguage: formData.language,
        district: formData.location.split(',')[0] || formData.location,
        state: 'Maharashtra',
        village: formData.location.split(',')[0] || formData.location,
        availableCapital: Number(formData.capital) || 0,
        goal: formData.goal,
        skills: formData.skills.split(',').map(s => s.trim()),
        selectedBusinessId: 'biz-oil-ghani',
        riskAppetite: formData.riskAppetite
      };
      saveProfile(fallbackProfile);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-stone-900">{t.onboarding.title}</h2>
          <p className="mt-2 text-stone-600">{t.onboarding.subtitle}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-stone-100">
            <div style={{ width: `${(step / 4) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-600 transition-all duration-300"></div>
          </div>
          <div className="flex justify-between text-xs font-medium text-stone-500">
            <span className={step >= 1 ? 'text-emerald-600' : ''}>Basics</span>
            <span className={step >= 2 ? 'text-emerald-600' : ''}>Business</span>
            <span className={step >= 3 ? 'text-emerald-600' : ''}>Finances</span>
            <span className={step >= 4 ? 'text-emerald-600' : ''}>Goals</span>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-stone-100 p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <Globe className="h-6 w-6 text-emerald-600" />
                <h3 className="text-xl font-bold text-stone-900">Basic Information</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">
                  Preferred Language
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setFormData({ ...formData, language: lang.code });
                        setLanguage(lang.code);
                      }}
                      className={`py-3 px-4 border rounded-xl flex flex-col items-center justify-center transition-all ${
                        formData.language === lang.code 
                          ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600 ring-opacity-50' 
                          : 'border-stone-200 hover:border-emerald-300'
                      }`}
                    >
                      <span className="font-semibold">{lang.localLabel}</span>
                      <span className="text-xs text-stone-500 mt-1">{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g. Ramesh Patil"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Location (District, State)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g. Kolhapur, Maharashtra"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <Building2 className="h-6 w-6 text-emerald-600" />
                <h3 className="text-xl font-bold text-stone-900">Business Details</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={e => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g. Dairy farming, Milk distribution"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Experience (Years)
                </label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={e => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g. 3 years"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Business Stage
                </label>
                <select
                  value={formData.businessStage}
                  onChange={e => setFormData({ ...formData, businessStage: e.target.value })}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  <option value="Idea">Idea Phase</option>
                  <option value="Startup">Startup (0-2 years)</option>
                  <option value="Established">Established (2+ years)</option>
                  <option value="Expansion">Looking to Expand</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <Wallet className="h-6 w-6 text-emerald-600" />
                <h3 className="text-xl font-bold text-stone-900">Financial Setup</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Available Capital (₹)
                </label>
                <input
                  type="number"
                  value={formData.capital}
                  onChange={e => setFormData({ ...formData, capital: e.target.value })}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g. 200000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Estimated Monthly Expenses (₹)
                </label>
                <input
                  type="number"
                  value={formData.monthlyExpenses}
                  onChange={e => setFormData({ ...formData, monthlyExpenses: e.target.value })}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g. 30000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Current Resources / Assets
                </label>
                <input
                  type="text"
                  value={formData.resources}
                  onChange={e => setFormData({ ...formData, resources: e.target.value })}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g. Small cattle shed, 1 acre land"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <Target className="h-6 w-6 text-emerald-600" />
                <h3 className="text-xl font-bold text-stone-900">Goals & Risks</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Business Goal
                </label>
                <textarea
                  rows={3}
                  value={formData.goal}
                  onChange={e => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  placeholder="e.g. Start a profitable local business and expand to neighboring villages"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Risk Appetite
                </label>
                <select
                  value={formData.riskAppetite}
                  onChange={e => setFormData({ ...formData, riskAppetite: e.target.value })}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  <option value="Low">Low (Safe, steady returns)</option>
                  <option value="Medium">Medium (Balanced growth)</option>
                  <option value="High">High (Aggressive expansion)</option>
                </select>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between pt-6 border-t border-stone-100">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="px-6 py-3 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}
            
            {step < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center px-8 py-3 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-all active:scale-95 shadow-md shadow-emerald-200"
              >
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex items-center px-8 py-3 bg-emerald-700 text-white text-sm font-medium rounded-xl hover:bg-emerald-800 transition-all active:scale-95 shadow-md shadow-emerald-200"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Check className="mr-2 h-4 w-4" />}
                Complete Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
