import React from 'react';
import {
  LayoutDashboard,
  User,
  Sparkles,
  MapPin,
  Briefcase,
  Calculator,
  Sliders,
  Award,
  Brain,
  CalendarCheck,
  Settings,
  X,
  TrendingUp,
  ShieldCheck,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageId } from '../types';

interface NavItem {
  id: PageId;
  label: string;
  hindiLabel: string;
  marathiLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    hindiLabel: 'डैशबोर्ड',
    marathiLabel: 'डॅशबोर्ड',
    icon: LayoutDashboard,
    category: 'OVERVIEW',
  },
  {
    id: 'profile',
    label: 'Profile & Assets',
    hindiLabel: 'प्रोफ़ाइल एवं संसाधन',
    marathiLabel: 'माहिती व संसाधने',
    icon: User,
    category: 'OVERVIEW',
  },
  {
    id: 'add-profile',
    label: 'Add Profile',
    hindiLabel: 'प्रोफ़ाइल जोड़ें',
    marathiLabel: 'प्रोफाइल जोडा',
    icon: User,
    category: 'OVERVIEW',
  },
  {
    id: 'advisor',
    label: 'AI Advisor & Voice',
    hindiLabel: 'एआई सलाहकार (आवाज)',
    marathiLabel: 'एआय सल्लागार (आवाज)',
    icon: Sparkles,
    category: 'INTELLIGENCE',
    badge: 'Voice AI',
  },
  {
    id: 'opportunities',
    label: 'Local Opportunities',
    hindiLabel: 'स्थानीय अवसर',
    marathiLabel: 'स्थानिक बाजार संधी',
    icon: MapPin,
    category: 'INTELLIGENCE',
    badge: 'Hot',
  },
  {
    id: 'recommendations',
    label: 'Business Recommendations',
    hindiLabel: 'व्यवसाय सुझाव',
    marathiLabel: 'व्यवसाय शिफारसी',
    icon: Briefcase,
    category: 'INTELLIGENCE',
  },
  {
    id: 'financial-planner',
    label: 'Financial Planner',
    hindiLabel: 'वित्तीय योजनाकार',
    marathiLabel: 'आर्थिक नियोजन',
    icon: Calculator,
    category: 'PLANNING & RISK',
  },
  {
    id: 'simulator',
    label: 'What-If Simulator',
    hindiLabel: 'सिमुलेटर (जोखिम जांच)',
    marathiLabel: 'जोखीम सिम्युलेटर',
    icon: Sliders,
    category: 'PLANNING & RISK',
  },
  {
    id: 'schemes',
    label: 'Scheme Matcher',
    hindiLabel: 'सरकारी योजनाएं',
    marathiLabel: 'शासकीय योजना',
    icon: Award,
    category: 'PLANNING & RISK',
    badge: '35% Off',
  },
  {
    id: 'explainability',
    label: 'Explainability',
    hindiLabel: 'सुझाव का कारण',
    marathiLabel: 'शिफारशींचे कारण',
    icon: Brain,
    category: 'EXECUTION',
  },
  {
    id: 'action-plan',
    label: '90-Day Action Plan',
    hindiLabel: '90 दिवसीय कार्ययोजना',
    marathiLabel: '90-दिवसीय कृती योजना',
    icon: CalendarCheck,
    category: 'EXECUTION',
    badge: 'Roadmap',
  },
  {
    id: 'settings',
    label: 'Settings',
    hindiLabel: 'सेटिंग्स',
    marathiLabel: 'सेटिंग्ज',
    icon: Settings,
    category: 'SYSTEM',
  },
];

export const Sidebar: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    isSidebarOpen,
    setIsSidebarOpen,
    activeBusiness,
    userProfile,
    language,
  } = useApp();

  const handleNavClick = (pageId: PageId) => {
    setCurrentPage(pageId);
    setIsSidebarOpen(false);
  };

  const categories = ['OVERVIEW', 'INTELLIGENCE', 'PLANNING & RISK', 'EXECUTION', 'SYSTEM'];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto bg-stone-900 text-stone-200">
      <div className="p-4">
        {/* Mobile Header in Drawer */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 md:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 font-extrabold text-emerald-950">
              V
            </div>
            <div>
              <div className="text-sm font-bold text-white">VYOMIK</div>
              <div className="text-[10px] text-stone-400">Rural Micro-Enterprise</div>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selected Business Pill / Active Context */}
        <div className="mt-3 rounded-xl border border-stone-800 bg-stone-800/60 p-3">
          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span>Selected Venture</span>
            <span className="rounded bg-emerald-900/80 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
              {activeBusiness.overallViabilityScore}% Fit
            </span>
          </div>
          <div className="mt-1 font-semibold text-xs text-white line-clamp-1">
            {activeBusiness.name}
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-stone-300">
            <span>Est. Net Profit:</span>
            <span className="font-bold text-emerald-400">
              ₹{activeBusiness.monthlyProfitEstimate.toLocaleString('en-IN')}/mo
            </span>
          </div>
        </div>

        {/* Navigation Categories */}
        <nav className="mt-4 space-y-4">
          {categories.map((cat) => {
            const items = NAV_ITEMS.filter((item) => item.category === cat);
            if (!items.length) return null;

            return (
              <div key={cat} className="space-y-1">
                <div className="px-3 text-[10px] font-semibold tracking-wider text-stone-300 uppercase">
                  {cat}
                </div>
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;

                  return (
                    <button
                      key={item.id}
                      id={`nav-${item.id}`}
                      onClick={() => handleNavClick(item.id)}
                      className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                          : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-4 w-4 transition ${
                            isActive
                              ? 'text-white'
                              : 'text-stone-400 group-hover:text-emerald-400'
                          }`}
                        />
                        <div className="flex flex-col">
                          <span>
                            {language === 'मराठी'
                              ? item.marathiLabel
                              : language === 'हिंदी'
                              ? item.hindiLabel
                              : item.label}
                          </span>
                          {language !== 'English' && (
                            <span className="text-[10px] font-normal text-stone-400 group-hover:text-stone-300">
                              {item.label}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-tight ${
                              isActive
                                ? 'bg-white text-emerald-900'
                                : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight
                          className={`h-3 w-3 opacity-0 transition group-hover:opacity-100 ${
                            isActive ? 'opacity-100' : ''
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer: Village Panchayat / Kendra Info */}
      <div className="border-t border-stone-800 p-4">
        <div className="rounded-lg bg-stone-800/40 p-2.5 text-[11px] text-stone-300">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Panchayat Sync Ready</span>
          </div>
          <p className="mt-1 text-stone-400 text-[10px] leading-relaxed">
            Offline cache enabled for {userProfile.block} block, {userProfile.district}.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-stone-800 md:block">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative flex w-4/5 max-w-xs flex-1 flex-col shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
