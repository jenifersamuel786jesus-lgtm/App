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
import PatientEmergencyPage from './pages/patient/PatientEmergencyPage';

// Caregiver pages
import CaregiverSetupPage from './pages/caregiver/CaregiverSetupPage';
import CaregiverDashboardPage from './pages/caregiver/CaregiverDashboardPage';
import CaregiverPatientsPage from './pages/caregiver/CaregiverPatientsPage';
import CaregiverPatientDetailsPage from './pages/caregiver/CaregiverPatientDetailsPage';
import CaregiverAlertsPage from './pages/caregiver/CaregiverAlertsPage';

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
    element: <Navigate to="/login" replace />
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
  {
    name: 'Emergency',
    path: '/patient/emergency',
    element: <PatientEmergencyPage />
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
    name: 'Manage Patients',
    path: '/caregiver/patients',
    element: <CaregiverPatientsPage />
  },
  {
    name: 'Patient Details',
    path: '/caregiver/patient/:patientId',
    element: <CaregiverPatientDetailsPage />
  },
  {
    name: 'Alerts',
    path: '/caregiver/alerts',
    element: <CaregiverAlertsPage />
  },
];

export default routes;
