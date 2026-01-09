# Welcome to Your Miaoda Project
Miaoda Application Link URL
    URL:https://medo.dev/projects/app-8g7cyjjxisxt

# RemZy - Alzheimer's Care Application

RemZy is a comprehensive mobile-first web application designed to support Alzheimer's patients through real-time memory assistance, safety monitoring, and emotional support. The system operates across two strictly separated device modes (Patient Mode and Caregiver Mode) with secure device linking.

## Features

### Patient Mode
- **AI Companion**: Interactive chat interface for memory assistance and orientation
- **Device Setup**: Easy onboarding with QR code generation for caregiver linking
- **Dashboard**: Large, accessible interface with clear navigation
- **Task Management**: View and manage daily tasks and reminders
- **Contacts**: Manage known faces and relationships
- **Health Monitoring**: Track health metrics and activity
- **Emergency Button**: Quick access to emergency assistance

### Caregiver Mode
- **Dashboard**: Real-time monitoring of linked patients
- **Alert System**: Instant notifications for important events
- **Patient Management**: Link and manage multiple patient devices
- **Activity Logs**: Comprehensive history of patient activities
- **Health Reports**: View patient health metrics and trends
- **Device Linking**: Secure pairing with patient devices via linking code

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Routing**: React Router v6
- **State Management**: React Context API
- **QR Codes**: qrcode library

## Database Schema

### Core Tables
- `profiles`: User profiles with role-based access (patient/caregiver/admin)
- `patients`: Patient-specific data including safe areas and health thresholds
- `caregivers`: Caregiver information and device details
- `device_links`: Many-to-many relationships between patients and caregivers
- `tasks`: Patient tasks with reminders and status tracking
- `known_faces`: Saved contacts for face recognition
- `unknown_encounters`: Log of unknown person encounters
- `health_metrics`: Heart rate, steps, and activity tracking
- `ai_interactions`: Conversation history with AI companion
- `activity_logs`: Comprehensive activity tracking
- `alerts`: System and emergency alerts

### Security
- Row Level Security (RLS) policies on all tables
- Role-based access control (patient/caregiver/admin)
- Secure device linking with unique codes
- End-to-end data protection

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account (automatically configured)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Start development server:
```bash
pnpm dev
```

3. Build for production:
```bash
pnpm build
```

### First User Setup

The first user to register automatically becomes an admin. Subsequent users default to patient role but can select their mode (patient or caregiver) after login.

## User Flows

### Patient Flow
1. Sign up / Sign in
2. Select "Patient Mode"
3. Complete patient setup (name, safe area, etc.)
4. Receive linking code and QR code
5. Share code with caregiver
6. Access patient dashboard and features

### Caregiver Flow
1. Sign up / Sign in
2. Select "Caregiver Mode"
3. Complete caregiver setup
4. Enter patient linking code
5. Access caregiver dashboard
6. Monitor linked patients and receive alerts

## Design System

### Colors
- **Patient Mode**: Calming blues and soft greens for reduced anxiety
- **Caregiver Mode**: Professional grays and whites for clarity
- **Emergency**: Red for urgent actions
- **Success**: Green for completed tasks
- **Warning**: Yellow/orange for alerts

### Typography
- Large, high-contrast fonts for patient interface
- Standard professional fonts for caregiver dashboard
- Minimum 60px touch targets for patient mode

## API Integration Points

The application is designed to integrate with:
- **Face Recognition API**: For identifying known faces (placeholder UI implemented)
- **AI/LLM API**: For intelligent companion responses (simulated responses implemented)
- **Text-to-Speech API**: For audio guidance (UI ready)
- **Location Services**: For GPS tracking and safe area monitoring
- **Health Data APIs**: For wearable integration

## Development

### Project Structure
```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── patient/         # Patient-specific components
│   ├── caregiver/       # Caregiver-specific components
│   ├── layouts/         # Layout components
│   └── common/          # Shared components
├── pages/
│   ├── auth/            # Authentication pages
│   ├── patient/         # Patient mode pages
│   └── caregiver/       # Caregiver mode pages
├── contexts/            # React contexts (Auth)
├── db/                  # Database client and API
├── types/               # TypeScript type definitions
└── routes.tsx           # Route configuration
```

### Key Files
- `src/db/supabase.ts`: Supabase client configuration
- `src/db/api.ts`: Database API functions
- `src/contexts/AuthContext.tsx`: Authentication context
- `src/types/types.ts`: TypeScript type definitions
- `src/routes.tsx`: Application routes

## Deployment

The application is production-ready and can be deployed to:
- Vercel
- Netlify
- Any static hosting service

Supabase backend is automatically configured and deployed.

## Future Enhancements

- Real face recognition integration
- Advanced AI companion with LLM integration
- Push notifications for mobile devices
- Offline mode support
- Voice commands
- Multi-language support
- Advanced health analytics
- Video calling between patient and caregiver
- Medication reminders with image recognition
- GPS tracking with real-time location updates

## License

Copyright © 2025 RemZy

## Support

For issues and questions, please refer to the documentation or contact support.
