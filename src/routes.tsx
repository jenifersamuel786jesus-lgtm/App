import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import ModeSelectionPage from './pages/ModeSelectionPage';

// Patient pages
import PatientSetupPage from './pages/patient/PatientSetupPage';
import PatientDashboardPage from './pages/patient/PatientDashboardPage';
import PatientAICompanionPage from './pages/patient/PatientAICompanionPage';

// Caregiver pages
import CaregiverSetupPage from './pages/caregiver/CaregiverSetupPage';
import CaregiverDashboardPage from './pages/caregiver/CaregiverDashboardPage';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <Navigate to="/mode-selection" replace />
  },
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />
  },
  {
    name: 'Mode Selection',
    path: '/mode-selection',
    element: <ModeSelectionPage />
  },
  // Patient routes
  {
    name: 'Patient Setup',
    path: '/patient/setup',
    element: <PatientSetupPage />
  },
  {
    name: 'Patient Dashboard',
    path: '/patient/dashboard',
    element: <PatientDashboardPage />
  },
  {
    name: 'AI Companion',
    path: '/patient/ai-companion',
    element: <PatientAICompanionPage />
  },
  // Caregiver routes
  {
    name: 'Caregiver Setup',
    path: '/caregiver/setup',
    element: <CaregiverSetupPage />
  },
  {
    name: 'Caregiver Dashboard',
    path: '/caregiver/dashboard',
    element: <CaregiverDashboardPage />
  },
];

export default routes;
