import React, { useState } from 'react';
import {
  Settings,
  Languages,
  Volume2,
  Wifi,
  Download,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Save,
  Info,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { logout } from '../lib/firebase';

export const SettingsPage: React.FC = () => {
  const { userProfile, setUserProfile } = useApp();
  const { setUser } = useAuth();

  const [voiceAssistance, setVoiceAssistance] = useState(true);
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const languages = [
    { code: 'English', label: 'English' },
    { code: 'Hindi', label: 'हिंदी (Hindi)' },
    { code: 'Gujarati', label: 'ગુજરાતી (Gujarati)' },
    { code: 'Marathi', label: 'मराठी (Marathi)' },
    { code: 'Kannada', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'Bengali', label: 'বাংলা (Bengali)' },
  ];

  const handleLanguageChange = (lang: string) => {
    setUserProfile({ ...userProfile, preferredLanguage: lang });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(userProfile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `VYOMIK_${userProfile.name.replace(/\s+/g, '_')}_Plan.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo entries to default factory state?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 text-left">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 sm:text-2xl flex items-center gap-2">
            <Settings className="h-6 w-6 text-emerald-700" />
            <span>Settings & Accessibility Preferences</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Configure regional languages, rural audio-prompts, low-data modes, and data backup.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Preferences updated</span>
          </div>
        )}
      </div>

      {/* Language Preferences */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
          <Languages className="h-4 w-4 text-emerald-700" />
          <span>Regional Language / भाषा चयन</span>
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {languages.map((lang) => {
            const isSelected = userProfile.preferredLanguage === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex items-center justify-between rounded-xl border p-3 text-xs font-semibold transition ${
                  isSelected
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-700'
                    : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <span>{lang.label}</span>
                {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-700" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rural Accessibility & Connectivity Toggles */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-emerald-700" />
          <span>Rural Connectivity & Accessibility</span>
        </h2>

        <div className="space-y-4 text-xs">
          {/* Audio Assistance */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-bold text-stone-900 flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-amber-600" />
                <span>Audio Narration & Voice Prompts</span>
              </div>
              <p className="text-stone-500 text-[11px]">
                Enables verbal readouts for step-by-step checklists and scheme documentation.
              </p>
            </div>
            <input
              type="checkbox"
              checked={voiceAssistance}
              onChange={(e) => setVoiceAssistance(e.target.checked)}
              className="h-5 w-5 accent-emerald-700 cursor-pointer"
            />
          </div>

          {/* Low Bandwidth Mode */}
          <div className="flex items-center justify-between border-t border-stone-100 pt-3">
            <div className="space-y-0.5">
              <div className="font-bold text-stone-900 flex items-center gap-2">
                <Wifi className="h-4 w-4 text-blue-600" />
                <span>Low-Bandwidth & 2G Network Optimizer</span>
              </div>
              <p className="text-stone-500 text-[11px]">
                Compresses background images and caches Mandi datasets for offline village usage.
              </p>
            </div>
            <input
              type="checkbox"
              checked={lowBandwidthMode}
              onChange={(e) => setLowBandwidthMode(e.target.checked)}
              className="h-5 w-5 accent-emerald-700 cursor-pointer"
            />
          </div>

          {/* WhatsApp Alert Reminders */}
          <div className="flex items-center justify-between border-t border-stone-100 pt-3">
            <div className="space-y-0.5">
              <div className="font-bold text-stone-900 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-emerald-600" />
                <span>WhatsApp Milestone Updates</span>
              </div>
              <p className="text-stone-500 text-[11px]">
                Receive deadline alerts for PMEGP interviews and FSSAI certificate dispatch.
              </p>
            </div>
            <input
              type="checkbox"
              checked={whatsappNotifications}
              onChange={(e) => setWhatsappNotifications(e.target.checked)}
              className="h-5 w-5 accent-emerald-700 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Data Management & Export */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
          <Download className="h-4 w-4 text-emerald-700" />
          <span>Data Backup & Management</span>
        </h2>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-emerald-700" />
            <span>Export Profile & DPR (JSON)</span>
          </button>

          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition"
          >
            <RotateCcw className="h-3.5 w-3.5 text-red-600" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={async () => {
              await logout();
              setUser(null);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-red-300 bg-red-100/50 px-4 py-2 text-xs font-bold text-red-800 hover:bg-red-100 transition"
          >
            <LogOut className="h-3.5 w-3.5 text-red-700" />
            <span>Logout Account</span>
          </button>
        </div>
      </div>

      {/* About VYOMIK */}
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 text-xs text-stone-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-stone-900">
          <Info className="h-4 w-4 text-emerald-700" />
          <span>About VYOMIK (व्योमिक) v1.0.0</span>
        </div>
        <p className="leading-relaxed">
          VYOMIK is an intelligence and execution copilot designed specifically for rural Indian micro-entrepreneurs. It bridges grassroots resource gluts with bankable project reports (DPRs), JanSamarth subsidy matching, and robust downside risk mitigation.
        </p>
        <p className="text-[11px] text-stone-400">
          Crafted for Atmanirbhar Bharat • Gram Udyog & Micro Enterprises.
        </p>
      </div>
    </div>
  );
};
