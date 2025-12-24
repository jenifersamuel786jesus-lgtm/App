import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import ModeSelectionPage from './pages/ModeSelectionPage';

// Patient pages
import PatientSetupPage from './pages/patient/PatientSetupPage';
import PatientDashboardPage from './pages/patient/PatientDashboardPage';
import PatientAICompanionPage from './pages/patient/PatientAICompanionPage';
import PatientTasksPage from './pages/patient/PatientTasksPage';
import PatientContactsPage from './pages/patient/PatientContactsPage';
import PatientHealthPage from './pages/patient/PatientHealthPage';
import PatientSettingsPage from './pages/patient/PatientSettingsPage';
import PatientFaceRecognitionPage from './pages/patient/PatientFaceRecognitionPage';

// Caregiver pages
import CaregiverSetupPage from './pages/caregiver/CaregiverSetupPage';
import CaregiverDashboardPage from './pages/caregiver/CaregiverDashboardPage';
import CaregiverPatientDetailsPage from './pages/caregiver/CaregiverPatientDetailsPage';

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
  {
    name: 'My Tasks',
    path: '/patient/tasks',
    element: <PatientTasksPage />
  },
  {
    name: 'My Contacts',
    path: '/patient/contacts',
    element: <PatientContactsPage />
  },
  {
    name: 'My Health',
    path: '/patient/health',
    element: <PatientHealthPage />
  },
  {
    name: 'Patient Settings',
    path: '/patient/settings',
    element: <PatientSettingsPage />
  },
  {
    name: 'Face Recognition',
    path: '/patient/face-recognition',
    element: <PatientFaceRecognitionPage />
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
  {
    name: 'Patient Details',
    path: '/caregiver/patient/:patientId',
    element: <CaregiverPatientDetailsPage />
  },
];

export default routes;
