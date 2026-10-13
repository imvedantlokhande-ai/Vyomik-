import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Sparkles,
  ChevronDown,
  User,
  ShieldCheck,
  CheckCircle2,
  X,
  Languages,
  Zap,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { logout } from '../lib/firebase';
import { SupportedLanguage, getTranslation } from '../utils/i18n';
import { ProgressiveOnboardingWizard } from './ProgressiveOnboardingWizard';

export const Header: React.FC = () => {
  const {
    userProfile,
    switchProfile,
    availableProfiles,
    notifications,
    markNotificationRead,
    setIsSidebarOpen,
    setCurrentPage,
    language,
    setLanguage,
  } = useApp();

  const { setUser } = useAuth();

  const t = getTranslation(language);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const supportedLanguages: SupportedLanguage[] = ['English', 'हिंदी', 'मराठी'];

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-emerald-950/20 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 px-3 py-2 text-white shadow-md sm:px-6 min-h-[58px]">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-800/80 text-emerald-100 hover:bg-emerald-700 active:scale-95 md:hidden min-h-[44px] min-w-[44px]"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div
            onClick={() => setCurrentPage('dashboard')}
            className="group flex cursor-pointer items-center gap-2.5 select-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 font-black text-emerald-950 shadow-md transition group-hover:scale-105">
              <span className="text-xl tracking-wider">V</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">
                  VYOMIK
                </span>
                <span className="hidden rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase sm:inline-block">
                  SIH Gold Edition
                </span>
              </div>
              <p className="hidden text-[10px] text-emerald-200/90 md:block">
                Rural Enterprise AI • Make in Rural India
              </p>
            </div>
          </div>
        </div>

        {/* Center/Right: 3-Way Language Toggle (EN | हिन्दी | मराठी) */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Prominent English / Hindi / Marathi Segmented Button */}
          <div className="flex items-center rounded-xl bg-emerald-950/70 p-1 border border-emerald-700/50 shadow-inner">
            {supportedLanguages.map((langOption) => (
              <button
                key={langOption}
                onClick={() => setLanguage(langOption)}
                className={`rounded-lg px-2 sm:px-3 py-1.5 text-xs font-extrabold transition-all min-h-[36px] ${
                  language === langOption
                    ? 'bg-amber-400 text-emerald-950 shadow-sm'
                    : 'text-emerald-100/80 hover:text-white hover:bg-emerald-800/60'
                }`}
                aria-label={`Switch language to ${langOption}`}
              >
                {langOption === 'English' ? 'EN' : langOption === 'हिंदी' ? 'हिन्दी' : 'मराठी'}
              </button>
            ))}
          </div>

          {/* 1-Minute Guided Setup Trigger Button */}
          <button
            id="header-quick-setup-btn"
            onClick={() => setShowOnboardingModal(true)}
            className="hidden sm:flex items-center gap-1.5 rounded-xl bg-amber-400/90 px-3 py-1.5 text-xs font-extrabold text-emerald-950 shadow-sm hover:bg-amber-300 active:scale-95 transition min-h-[38px]"
          >
            <Zap className="h-3.5 w-3.5 fill-emerald-950" />
            <span>1-Min Setup</span>
          </button>

          {/* Notifications dropdown */}
          <div className="relative">
            <button
              id="notifications-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-700 bg-emerald-800/60 text-emerald-100 transition hover:bg-emerald-800 active:scale-95 min-h-[40px] min-w-[40px]"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-emerald-950 shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-stone-200 bg-white text-stone-900 shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden text-left">
                <div className="flex items-center justify-between border-b border-stone-100 bg-emerald-900 px-4 py-3 text-white">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-300" />
                    <span className="text-xs font-bold text-white">
                      Rural Alerts & Mandi Subsidies ({unreadCount} new)
                    </span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="rounded p-1 text-emerald-200 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => markNotificationRead(item.id)}
                      className={`p-3.5 transition cursor-pointer text-left ${
                        item.read ? 'bg-white' : 'bg-emerald-50/70 hover:bg-emerald-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-stone-900">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-stone-400 whitespace-nowrap">
                          {item.date}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Switcher Dropdown */}
          <div className="relative">
            <button
              id="profile-dropdown-btn"
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-800/80 px-2 sm:px-2.5 py-1.5 text-left text-xs transition hover:bg-emerald-800 min-h-[40px]"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400 font-black text-emerald-950 text-xs shadow-xs">
                {userProfile.name.charAt(0)}
              </div>
              <div className="hidden text-left sm:block">
                <div className="font-bold text-white leading-tight">
                  {userProfile.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-emerald-300">
                  {userProfile.district} ({userProfile.state.substring(0, 2).toUpperCase()})
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-emerald-300 opacity-80" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-stone-200 bg-white p-3 text-stone-900 shadow-2xl ring-1 ring-black/5 z-50 text-left">
                <div className="border-b border-stone-100 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 font-bold text-white text-sm">
                      {userProfile.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900">
                        {userProfile.name}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {userProfile.village}, {userProfile.district} ({userProfile.state})
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-1.5 text-xs text-emerald-900 font-bold">
                    <span>Available Capital:</span>
                    <span className="text-emerald-950">
                      ₹{userProfile.availableCapital.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="px-1 py-1 text-[10px] font-bold tracking-wider text-stone-400 uppercase">
                    Switch Regional Demo Profile
                  </div>
                  <div className="space-y-1">
                    {availableProfiles.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          switchProfile(p.id);
                          setShowProfileMenu(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition ${
                          userProfile.id === p.id
                            ? 'bg-emerald-50 font-bold text-emerald-900'
                            : 'hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{p.name}</div>
                          <div className="text-[10px] text-stone-500 font-normal">
                            {p.district}, {p.state} • ₹{(p.availableCapital / 1000).toFixed(0)}k
                          </div>
                        </div>
                        {userProfile.id === p.id && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-2 border-t border-stone-100 pt-2 flex flex-col gap-1">
                  <button
                    onClick={() => {
                      setCurrentPage('profile');
                      setShowProfileMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition"
                  >
                    <User className="h-4 w-4" />
                    <span>View / Edit Assets</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowOnboardingModal(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-bold text-amber-800 hover:bg-amber-50 transition"
                  >
                    <Zap className="h-4 w-4 text-amber-600" />
                    <span>Rerun 1-Min Guided Onboarding</span>
                  </button>
                  <button
                    onClick={async () => {
                      setShowProfileMenu(false);
                      await logout();
                      setUser(null);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-bold text-red-700 hover:bg-red-50 border-t border-stone-100 mt-1 pt-2 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>
                      {language === 'हिंदी' ? 'लॉगआउट' : language === 'मराठी' ? 'लॉगआउट' : 'Logout'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Fullscreen/Modal Progressive Onboarding Wizard (if opened via Header button) */}
      {showOnboardingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl my-auto">
            <button
              onClick={() => setShowOnboardingModal(false)}
              className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-white shadow-lg hover:bg-stone-800"
              aria-label="Close wizard"
            >
              <X className="h-4 w-4" />
            </button>
            <ProgressiveOnboardingWizard
              onComplete={() => setShowOnboardingModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};
