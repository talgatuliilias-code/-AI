import React from 'react';
import { AuthModal, ToastBanner } from './components/LayoutChrome';
import { WorkspaceShell } from './components/WorkspaceShell';
import { HealthProvider, useHealth } from './context/HealthContext';
import { AssistantPage } from './pages/AssistantPage';
import { BmiCalculatorPage } from './pages/BmiCalculatorPage';
import { CabinetPage } from './pages/CabinetPage';
import { ChildHealthPage, PreventiveHealthPage } from './pages/ChildAndPreventivePages';
import { ClimatePage, RedFlagsPage } from './pages/ClimateAndRedFlagsPages';
import {
  AboutPage,
  HistoryPage,
  SettingsPage,
} from './pages/HistoryAboutSettingsPages';
import { HomePage } from './pages/HomePage';
import {
  DamumedPage,
  DoctorsPage,
  EgovPage,
  EmergencyPage,
  PharmaciesPage,
} from './pages/KazakhstanServicesPages';
import { LabAnalyzerPage, MedicationsPage } from './pages/LabAndMedicationsPages';
import { FamilyPage, ProfilePage } from './pages/ProfileAndFamilyPages';
import { SkinAnalyzerPage } from './pages/SkinAnalyzerPage';
import { LibraryPage, TranslatorPage } from './pages/TranslatorAndLibraryPages';
import { MentalHealthPage, VitalsPage } from './pages/VitalsAndMentalPages';

const RouteDispatcher: React.FC = () => {
  const { route } = useHealth();

  if (route === 'home') {
    return <HomePage />;
  }

  const renderWorkspacePage = () => {
    switch (route) {
      case 'cabinet':
        return <CabinetPage />;
      case 'skin-analyzer':
        return <SkinAnalyzerPage />;
      case 'bmi':
        return <BmiCalculatorPage />;
      case 'assistant':
        return <AssistantPage />;
      case 'profile':
        return <ProfilePage />;
      case 'family':
        return <FamilyPage />;
      case 'climate':
        return <ClimatePage />;
      case 'red-flags':
        return <RedFlagsPage />;
      case 'lab-analyzer':
        return <LabAnalyzerPage />;
      case 'medications':
        return <MedicationsPage />;
      case 'vitals':
        return <VitalsPage />;
      case 'mental-health':
        return <MentalHealthPage />;
      case 'child-health':
        return <ChildHealthPage />;
      case 'doctors':
        return <DoctorsPage />;
      case 'egov':
        return <EgovPage />;
      case 'damumed':
        return <DamumedPage />;
      case 'pharmacies':
        return <PharmaciesPage />;
      case 'emergency':
        return <EmergencyPage />;
      case 'translator':
        return <TranslatorPage />;
      case 'library':
        return <LibraryPage />;
      case 'preventive':
        return <PreventiveHealthPage />;
      case 'history':
        return <HistoryPage />;
      case 'about':
        return <AboutPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <CabinetPage />;
    }
  };

  return <WorkspaceShell>{renderWorkspacePage()}</WorkspaceShell>;
};

export default function App() {
  return (
    <HealthProvider>
      <RouteDispatcher />
      <AuthModal />
      <ToastBanner />
    </HealthProvider>
  );
}
