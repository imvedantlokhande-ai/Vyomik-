import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Sparkles,
  Calculator,
  Menu,
  Mic,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageId } from '../types';
import { getTranslation } from '../utils/i18n';

export const MobileBottomNav: React.FC = () => {
  const { currentPage, setCurrentPage, setIsSidebarOpen, language } = useApp();
  const t = getTranslation(language);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-18 items-center justify-around border-t border-stone-200/80 bg-white/95 backdrop-blur-md px-2 py-1 shadow-2xl md:hidden">
      {/* 1. Dashboard */}
      <button
        id="bottom-nav-dashboard"
        onClick={() => setCurrentPage('dashboard')}
        className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition min-h-[48px] ${
          currentPage === 'dashboard'
            ? 'text-emerald-800 font-extrabold'
            : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        <div
          className={`flex h-8 w-12 items-center justify-center rounded-2xl transition ${
            currentPage === 'dashboard' ? 'bg-emerald-100 text-emerald-800 shadow-xs' : ''
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">
          {language === 'मराठी' ? 'मुख्य' : language === 'हिंदी' ? 'होम' : 'Home'}
        </span>
      </button>

      {/* 2. Local Ops */}
      <button
        id="bottom-nav-opportunities"
        onClick={() => setCurrentPage('opportunities')}
        className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition min-h-[48px] ${
          currentPage === 'opportunities'
            ? 'text-emerald-800 font-extrabold'
            : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        <div
          className={`flex h-8 w-12 items-center justify-center rounded-2xl transition ${
            currentPage === 'opportunities' ? 'bg-emerald-100 text-emerald-800 shadow-xs' : ''
          }`}
        >
          <MapPin className="h-5 w-5" />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">
          {language === 'मराठी' ? 'बाजार' : language === 'हिंदी' ? 'मंडी' : 'Local Ops'}
        </span>
      </button>

      {/* 3. CENTER PROMINENT AI VOICE ADVISOR BUTTON */}
      <div className="relative -top-3 flex flex-col items-center justify-center">
        <button
          id="bottom-nav-voice-advisor"
          onClick={() => setCurrentPage('advisor')}
          className={`relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition active:scale-95 ${
            currentPage === 'advisor'
              ? 'bg-emerald-800 text-amber-300 ring-4 ring-amber-300'
              : 'bg-gradient-to-tr from-amber-400 to-amber-300 text-emerald-950 ring-4 ring-white shadow-amber-400/50'
          }`}
          aria-label="Open Voice AI Advisor"
        >
          <Mic className="h-7 w-7" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-600" />
          </span>
        </button>
        <span className="text-[10px] font-black text-emerald-950 mt-1 tracking-tight">
          {language === 'मराठी' ? 'एआय मित्र' : language === 'हिंदी' ? 'एआई मित्र' : 'Voice AI'}
        </span>
      </div>

      {/* 4. Financial Planner */}
      <button
        id="bottom-nav-financial-planner"
        onClick={() => setCurrentPage('financial-planner')}
        className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition min-h-[48px] ${
          currentPage === 'financial-planner'
            ? 'text-emerald-800 font-extrabold'
            : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        <div
          className={`flex h-8 w-12 items-center justify-center rounded-2xl transition ${
            currentPage === 'financial-planner' ? 'bg-emerald-100 text-emerald-800 shadow-xs' : ''
          }`}
        >
          <Calculator className="h-5 w-5" />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">
          {language === 'मराठी' ? 'नियोजन' : language === 'हिंदी' ? 'योजना' : 'Planner'}
        </span>
      </button>

      {/* 5. Menu / All Pages */}
      <button
        id="bottom-nav-menu"
        onClick={() => setIsSidebarOpen(true)}
        className="flex flex-col items-center justify-center flex-1 py-1 text-center transition min-h-[48px] text-stone-500 hover:text-stone-800"
        aria-label="Open full drawer menu"
      >
        <div className="flex h-8 w-12 items-center justify-center rounded-2xl transition">
          <Menu className="h-5 w-5" />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">
          {language === 'मराठी' ? 'मेनू' : language === 'हिंदी' ? 'मेनू' : 'All'}
        </span>
      </button>
    </nav>
  );
};
