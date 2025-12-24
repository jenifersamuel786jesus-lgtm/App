# RemZy Application Architecture

## Overview
RemZy is a dual-mode Alzheimer's care application with strict separation between Patient Mode and Caregiver Mode. The application uses a mobile-first design with large touch targets for patients and information-dense dashboards for caregivers.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         RemZy App                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐              ┌──────────────┐            │
│  │ Patient Mode │              │Caregiver Mode│            │
│  │              │              │              │            │
│  │ - Dashboard  │              │ - Dashboard  │            │
│  │ - AI Chat    │◄────────────►│ - Alerts     │            │
│  │ - Tasks      │  Device Link │ - Logs       │            │
│  │ - Contacts   │              │ - Reports    │            │
│  │ - Health     │              │ - Patients   │            │
│  │ - Emergency  │              │ - Settings   │            │
│  └──────────────┘              └──────────────┘            │
│         │                              │                     │
│         └──────────────┬───────────────┘                     │
│                        │                                     │
│                        ▼                                     │
│              ┌──────────────────┐                           │
│              │  Authentication  │                           │
│              │   (Supabase)     │                           │
│              └──────────────────┘                           │
│                        │                                     │
│                        ▼                                     │
│              ┌──────────────────┐                           │
│              │    Database      │                           │
│              │   (PostgreSQL)   │                           │
│              │                  │                           │
│              │ - profiles       │                           │
│              │ - patients       │                           │
│              │ - caregivers     │                           │
│              │ - device_links   │                           │
│              │ - tasks          │                           │
│              │ - known_faces    │                           │
│              │ - health_metrics │                           │
│              │ - ai_interactions│                           │
│              │ - alerts         │                           │
│              │ - activity_logs  │                           │
│              └──────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Routing**: React Router v6
- **State Management**: React Context API
- **QR Codes**: qrcode library

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Security**: Row Level Security (RLS)
- **Real-time**: Supabase Realtime (ready for implementation)

## Data Flow

### Patient Mode Flow
```
User Action → React Component → API Function → Supabase Client → Database
                                                                      ↓
                                                            RLS Policy Check
                                                                      ↓
                                                              Data Response
                                                                      ↓
Caregiver Dashboard ← Real-time Sync ← Database Update ← Success/Error
```

### Caregiver Mode Flow
```
Database Change (Patient Action) → Supabase → API Function → React State
                                                                    ↓
                                                            Alert Component
                                                                    ↓
                                                          Notification Display
```

## Security Architecture

### Authentication
- Username/password authentication via Supabase Auth
- No email verification required (simplified for care context)
- Session management with JWT tokens
- Automatic token refresh

### Authorization
- Role-based access control (patient/caregiver/admin)
- Device mode locking after initial setup
- RLS policies enforce data access rules
- Helper functions for permission checks

### Data Protection
- All data encrypted at rest (Supabase default)
- HTTPS for data in transit
- No public data access
- Strict device linking requirements

## Database Schema

### Core Entities

#### profiles
- Base user table
- Links to auth.users
- Stores role and device mode
- Created automatically on signup

#### patients
- Patient-specific data
- Links to profiles
- Stores safe area coordinates
- Health thresholds configuration

#### caregivers
- Caregiver-specific data
- Links to profiles
- Device identification

#### device_links
- Many-to-many relationship
- Patient ↔ Caregiver connections
- Unique linking codes
- Active/inactive status

### Activity Tracking

#### tasks
- Patient tasks and reminders
- Status tracking (pending/completed/skipped)
- Location and time information

#### known_faces
- Saved contacts for face recognition
- Relationship information
- Face encoding data (for future ML integration)

#### unknown_encounters
- Log of unknown person meetings
- Timestamp and location
- Optional face snapshot

#### health_metrics
- Heart rate, steps, activity
- Timestamp-based tracking
- Threshold monitoring

#### ai_interactions
- Conversation history
- User queries and AI responses
- Context data for learning

#### activity_logs
- Comprehensive activity tracking
- All patient actions logged
- Searchable and filterable

#### alerts
- System and emergency alerts
- Type-based categorization
- Status tracking (unread/read/resolved)

## Component Architecture

### Page Components
```
pages/
├── auth/
│   └── LoginPage.tsx          # Sign in/up with tabs
├── ModeSelectionPage.tsx      # Patient/Caregiver mode selection
├── patient/
│   ├── PatientSetupPage.tsx   # Multi-step setup with QR code
│   ├── PatientDashboardPage.tsx # Main patient interface
│   └── PatientAICompanionPage.tsx # AI chat interface
└── caregiver/
    ├── CaregiverSetupPage.tsx # Setup with linking code
    └── CaregiverDashboardPage.tsx # Monitoring dashboard
```

### Shared Components
```
components/
├── ui/                        # shadcn/ui components
├── common/
│   └── RouteGuard.tsx        # Authentication guard
└── layouts/                   # Layout components (future)
```

### Context Providers
```
contexts/
└── AuthContext.tsx           # Authentication state and methods
```

## API Layer

### Database API (`src/db/api.ts`)
All database operations are encapsulated in API functions:

- **Profile Operations**: CRUD for user profiles
- **Patient Operations**: Patient management
- **Caregiver Operations**: Caregiver management
- **Device Linking**: Link/unlink devices
- **Task Management**: CRUD for tasks
- **Face Recognition**: Known faces and encounters
- **Health Tracking**: Metrics CRUD
- **AI Interactions**: Conversation logging
- **Activity Logs**: Comprehensive logging
- **Alerts**: Alert management

### Error Handling
- All API functions include error logging
- Graceful fallbacks for failed operations
- User-friendly error messages
- Console logging for debugging

## Routing

### Public Routes
- `/login` - Authentication page
- `/mode-selection` - Device mode selection

### Patient Routes (Protected)
- `/patient/setup` - Initial patient setup
- `/patient/dashboard` - Main patient interface
- `/patient/ai-companion` - AI chat interface

### Caregiver Routes (Protected)
- `/caregiver/setup` - Initial caregiver setup
- `/caregiver/dashboard` - Monitoring dashboard

### Route Protection
- `RouteGuard` component checks authentication
- Redirects to login if not authenticated
- Public routes accessible without auth

## Design System

### Color Tokens
```css
/* Patient Mode - Calming */
--primary: Soft blue
--secondary: Gentle green
--accent: Light blue

/* Caregiver Mode - Professional */
--muted: Gray tones
--card: White/light gray

/* Semantic Colors */
--emergency: Red
--success: Green
--warning: Orange
```

### Typography
- **Patient Mode**: Large fonts (text-xl, text-2xl)
- **Caregiver Mode**: Standard fonts (text-sm, text-base)
- High contrast for readability
- Clear hierarchy

### Spacing
- **Patient Mode**: Large touch targets (min 60px)
- **Caregiver Mode**: Compact, information-dense
- Consistent padding and margins
- Responsive breakpoints

## Future Integration Points

### AI/ML Services
- **Face Recognition**: OpenCV, AWS Rekognition, or Azure Face API
- **AI Companion**: OpenAI GPT, Anthropic Claude, or custom LLM
- **Text-to-Speech**: Web Speech API, Google TTS, or Amazon Polly

### Location Services
- **GPS Tracking**: Browser Geolocation API
- **Geofencing**: Custom implementation or Mapbox
- **Maps**: Google Maps, Mapbox, or OpenStreetMap

### Health Integration
- **Wearables**: Apple HealthKit, Google Fit, Fitbit API
- **Sensors**: Heart rate monitors, activity trackers
- **Medical Devices**: Blood pressure, glucose monitors

### Notifications
- **Push Notifications**: Firebase Cloud Messaging
- **SMS Alerts**: Twilio, AWS SNS
- **Email Notifications**: SendGrid, AWS SES

## Deployment

### Build Process
```bash
pnpm install    # Install dependencies
pnpm build      # Build for production
pnpm preview    # Preview production build
```

### Environment Variables
```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### Hosting Options
- **Vercel**: Automatic deployment from Git
- **Netlify**: Continuous deployment
- **Static Hosting**: Any CDN or web server

### Database
- Supabase project automatically configured
- Migrations applied automatically
- RLS policies active by default

## Performance Considerations

### Optimization
- Code splitting with React.lazy (ready for implementation)
- Image optimization
- Lazy loading for lists
- Debounced search inputs

### Caching
- React Query for data caching (future enhancement)
- Browser caching for static assets
- Service worker for offline support (future)

### Monitoring
- Console logging for development
- Error boundaries for production
- Performance metrics tracking (future)

## Accessibility

### WCAG Compliance
- High contrast colors
- Large touch targets
- Keyboard navigation support
- Screen reader friendly

### Patient-Specific
- Simple language
- Clear icons with labels
- Minimal navigation depth
- Consistent layout

## Testing Strategy

### Manual Testing
- User flow testing for both modes
- Device linking verification
- Alert system testing
- Responsive design testing

### Automated Testing (Future)
- Unit tests for API functions
- Integration tests for user flows
- E2E tests with Playwright/Cypress
- Accessibility testing

## Maintenance

### Code Quality
- TypeScript for type safety
- ESLint for code standards
- Prettier for formatting
- Consistent naming conventions

### Documentation
- Inline code comments
- README for setup
- USER_GUIDE for end users
- ARCHITECTURE for developers

## Scalability

### Current Capacity
- Supports multiple patient-caregiver pairs
- Efficient database queries
- Optimized API calls

### Future Scaling
- Database indexing for large datasets
- Caching layer for frequent queries
- CDN for static assets
- Load balancing for high traffic

## Support and Maintenance

### Monitoring
- Database performance metrics
- Error logging and tracking
- User activity analytics

### Updates
- Regular dependency updates
- Security patches
- Feature enhancements
- Bug fixes

---

**Last Updated**: 2025-12-24
**Version**: 1.0.0
**Status**: Production Ready
