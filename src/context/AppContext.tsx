import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PageId,
  UserProfile,
  BusinessModel,
  LocalOpportunity,
  FinancialModelData,
  GovernmentScheme,
  ActionPlanPhase,
  WhatIfSimulation,
} from '../types';
import {
  DEMO_PROFILES,
  DEMO_BUSINESSES,
  DEMO_OPPORTUNITIES,
  DEMO_FINANCIALS,
  DEMO_SCHEMES,
  DEMO_ACTION_PLANS,
} from '../data/demoData';
import { isFirebaseConfigured } from '../lib/firebase';

interface AppContextType {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  switchProfile: (profileId: string) => void;
  saveProfile: (profile: UserProfile) => void;
  availableProfiles: UserProfile[];
  setAvailableProfiles: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  
  // Businesses
  businesses: BusinessModel[];
  activeBusiness: BusinessModel;
  selectBusiness: (businessId: string) => void;
  
  // Opportunities
  opportunities: LocalOpportunity[];
  selectedOpportunityId: string | null;
  setSelectedOpportunityId: (id: string | null) => void;
  
  // Financials
  financialData: FinancialModelData;
  updateFinancials: (updated: Partial<FinancialModelData>) => void;
  
  // What-If Simulation
  simulation: WhatIfSimulation;
  updateSimulation: (updated: Partial<WhatIfSimulation>) => void;
  resetSimulation: () => void;
  
  // Schemes
  schemes: GovernmentScheme[];
  selectedScheme: GovernmentScheme | null;
  setSelectedScheme: (scheme: GovernmentScheme | null) => void;
  
  // Action Plan
  actionPlan: ActionPlanPhase[];
  toggleTaskCompletion: (phaseId: string, taskId: string) => void;
  setActionPlanForBusiness: (businessId: string, phases: ActionPlanPhase[]) => void;
  
  // App wide settings
  language: string;
  setLanguage: (lang: string) => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (val: boolean) => void;
  resetAllDemoData: () => void;
  
  // Notifications / Alerts
  notifications: Array<{ id: string; title: string; desc: string; date: string; read: boolean; type: 'scheme' | 'alert' | 'tip' }>;
  markNotificationRead: (id: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_SIMULATION: WhatIfSimulation = {
  rawMaterialPriceChangePercent: 0,
  sellingPriceChangePercent: 0,
  volumeChangePercent: 0,
  powerCostChangePercent: 0,
  monsoonImpact: 'Normal',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [availableProfiles, setAvailableProfiles] = useState<UserProfile[]>(DEMO_PROFILES);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEMO_PROFILES[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [language, setLanguage] = useState('English');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem('vyomik_onboarding_completed') === 'true';
  });

  const [businesses] = useState<BusinessModel[]>(DEMO_BUSINESSES);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);

  const activeBusiness = businesses.find((b) => b.id === userProfile.selectedBusinessId) || businesses[0];

  // Financial model state for active business
  const [financialsState, setFinancialsState] = useState<Record<string, FinancialModelData>>(DEMO_FINANCIALS);
  const currentFinancials = financialsState[activeBusiness.id] || DEMO_FINANCIALS['biz-oil-ghani'];

  // Simulation state
  const [simulation, setSimulation] = useState<WhatIfSimulation>(DEFAULT_SIMULATION);

  // Schemes
  const [schemes] = useState<GovernmentScheme[]>(DEMO_SCHEMES);
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);

  // Action plan state
  const [actionPlansState, setActionPlansState] = useState<Record<string, ActionPlanPhase[]>>(DEMO_ACTION_PLANS);
  const currentActionPlan = actionPlansState[activeBusiness.id] || DEMO_ACTION_PLANS['biz-oil-ghani'] || [];

  // Notifications
  const [notifications, setNotifications] = useState([
    {
      id: 'n-1',
      title: 'PMEGP Subsidy Window Active',
      desc: 'District Industries Centre (DIC) is accepting fast-track rural micro-manufacturing applications until end of month.',
      date: 'Today',
      read: false,
      type: 'scheme' as const,
    },
    {
      id: 'n-2',
      title: 'Local Oilseed Mandi Glut',
      desc: 'Mustard seed prices dropped 11% at Anand APMC due to bumper arrivals—ideal time to secure 60-day raw material stock.',
      date: 'Yesterday',
      read: false,
      type: 'alert' as const,
    },
    {
      id: 'n-3',
      title: 'FSSAI Basic Portal Update',
      desc: 'Instant registration for rural units under ₹12 Lakhs is now enabled through Aadhaar OTP verification.',
      date: '3 days ago',
      read: true,
      type: 'tip' as const,
    },
  ]);

  const switchProfile = (profileId: string) => {
    const found = availableProfiles.find((p) => p.id === profileId);
    if (found) {
      setUserProfile(found);
      setLanguage(found.preferredLanguage);
    }
  };

  const saveProfile = async (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    setHasCompletedOnboarding(true);
    localStorage.setItem('vyomik_onboarding_completed', 'true');

    if (updatedProfile.preferredLanguage) {
      setLanguage(updatedProfile.preferredLanguage);
    }

    setAvailableProfiles((prev) => {
      const idx = prev.findIndex((p) => p.id === updatedProfile.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedProfile;
        return next;
      }
      return [updatedProfile, ...prev];
    });
  };

  const selectBusiness = async (businessId: string) => {
    setUserProfile((prev) => ({ ...prev, selectedBusinessId: businessId }));
  };

  const updateFinancials = (updated: Partial<FinancialModelData>) => {
    setFinancialsState((prev) => ({
      ...prev,
      [activeBusiness.id]: {
        ...currentFinancials,
        ...updated,
      },
    }));
  };

  const updateSimulation = (updated: Partial<WhatIfSimulation>) => {
    setSimulation((prev) => ({ ...prev, ...updated }));
  };

  const resetSimulation = () => {
    setSimulation(DEFAULT_SIMULATION);
  };

  const toggleTaskCompletion = (phaseId: string, taskId: string) => {
    setActionPlansState((prev) => {
      const plan = prev[activeBusiness.id] || DEMO_ACTION_PLANS['biz-oil-ghani'];
      const updatedPlan = plan.map((phase) => {
        if (phase.id !== phaseId) return phase;
        return {
          ...phase,
          tasks: phase.tasks.map((task) => {
            if (task.id !== taskId) return task;
            return { ...task, isCompleted: !task.isCompleted };
          }),
        };
      });
      return {
        ...prev,
        [activeBusiness.id]: updatedPlan,
      };
    });
  };

  const setActionPlanForBusiness = (businessId: string, phases: ActionPlanPhase[]) => {
    setActionPlansState((prev) => ({
      ...prev,
      [businessId]: phases,
    }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const resetAllDemoData = () => {
    setUserProfile(DEMO_PROFILES[0]);
    setFinancialsState(DEMO_FINANCIALS);
    setActionPlansState(DEMO_ACTION_PLANS);
    setSimulation(DEFAULT_SIMULATION);
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        userProfile,
        setUserProfile,
        switchProfile,
        saveProfile,
        availableProfiles,
        setAvailableProfiles,
        businesses,
        activeBusiness,
        selectBusiness,
        opportunities: DEMO_OPPORTUNITIES,
        selectedOpportunityId,
        setSelectedOpportunityId,
        financialData: currentFinancials,
        updateFinancials,
        simulation,
        updateSimulation,
        resetSimulation,
        schemes,
        selectedScheme,
        setSelectedScheme,
        actionPlan: currentActionPlan,
        toggleTaskCompletion,
        setActionPlanForBusiness,
        language,
        setLanguage,
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
        resetAllDemoData,
        notifications,
        markNotificationRead,
        isSidebarOpen,
        setIsSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
