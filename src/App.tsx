import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdvisorPage } from './pages/AdvisorPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { FinancialPlannerPage } from './pages/FinancialPlannerPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { SchemeMatcherPage } from './pages/SchemeMatcherPage';
import { ExplainabilityPage } from './pages/ExplainabilityPage';
import { ActionPlanPage } from './pages/ActionPlanPage';
import { SettingsPage } from './pages/SettingsPage';
import OnboardingPage from './pages/OnboardingPage';

const MainContent: React.FC = () => {
  const { currentPage } = useApp();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'profile':
        return <ProfilePage forceCreateMode={false} />;
      case 'add-profile':
        return <ProfilePage forceCreateMode={true} />;
      case 'advisor':
        return <AdvisorPage />;
      case 'opportunities':
        return <OpportunitiesPage />;
      case 'recommendations':
        return <RecommendationsPage />;
      case 'financial-planner':
        return <FinancialPlannerPage />;
      case 'simulator':
        return <SimulatorPage />;
      case 'schemes':
        return <SchemeMatcherPage />;
      case 'explainability':
        return <ExplainabilityPage />;
      case 'action-plan':
        return <ActionPlanPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900 antialiased font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {renderCurrentPage()}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { hasCompletedOnboarding } = useApp();

  if (!hasCompletedOnboarding) {
    return <OnboardingPage />;
  }

  return <MainContent />;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
