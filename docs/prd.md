# RemZy Production-Ready Requirements Document

## 1. Application Overview

### 1.1 Application Name
RemZy\n
### 1.2 Application Description
RemZy is a production-ready mobile application ecosystem designed to support Alzheimer's patients through real-time memory assistance, safety monitoring, and emotional support. The system operates across two strictly separated device modes (Patient Mode and Caregiver Mode) with secure device linking, providing comprehensive care while maintaining patient dignity and privacy.

### 1.3 System Architecture
- **Frontend**: Native iOS and Android applications\n- **Backend**: Cloud-based microservices architecture
- **Database**: Cloud-hosted distributed database with real-time sync
- **AI Services**: Real-time face recognition and conversational AI with cloud integration
- **Infrastructure**: Scalable, healthcare-grade deployment\n
## 2. Core Architecture

### 2.1 Device Mode System

**Patient Mode**
- Runs exclusively on patient's device\n- Locked after initial setup, cannot access caregiver features
- Core capabilities: real-time camera processing, Bluetooth audio, AI companion, self-managed tasks and contacts
- All guidance delivered privately through Bluetooth earphones

**Caregiver Mode**
- Runs exclusively on caregiver's device
- Locked after initial setup, cannot access patient UI
- Core capabilities: real-time monitoring dashboard, alert reception, activity logs, patient management
- View-only access unless emergency situation

### 2.2 Device Linking Mechanism
- Patient device generates secure QR code or unique linking code during setup
- Caregiver scans or enters code to establish permanent link
- All data flows exclusively between linked devices
- No global visibility or public access\n- Support multiple patient-caregiver linkages\n
## 3. Patient Mode Features

### 3.1 Real-Time Always-On Camera System with Face Recognition
- **Continuous real-time camera operation** running in background
- **Instant face recognition** using hybrid AI (on-device + cloud) with minimal latency
- **Real-time recognition workflow**:
  - **Known face detected**: Immediately whisper person's name and relationship via Bluetooth (e.g., 'This is John, your friend')
  - **Unknown face detected**: Instantly whisper warning 'You are meeting someone new', prompt patient to save person with name, face photo, and optional note (relationship: friend, doctor, neighbor, etc.)
  - **Face photo capture**: When saving a new person, system automatically captures and saves the current face image from camera feed as reference photo, displayed in save dialog for confirmation
  - **Saved face**: Newly saved faces with photos are immediately added to recognition database and available for instant recognition in future encounters
- **Real-time whisper delivery**: All recognition results delivered within 1-2 seconds of face detection
- Camera feed provides continuous environmental context to AI companion
- Face recognition operates continuously without manual triggering

### 3.2 Contact Management with Photo Support
- Patient can manually add contacts independently
- Contact attributes:\n  - Name (required)
  - Relationship (friend, family, doctor, neighbor, etc.)\n  - Phone number (optional)
  - Notes (optional)
  - **Photo**: Patient can add photo through three methods:
    - Capture photo using camera in real-time
    - Select existing photo from device gallery
    - Use automatically captured face photo from face recognition encounter
- **Photo management**:
  - Photo preview displayed in contact card
  - Edit or replace photo anytime
  - Photo used for face recognition training and matching
  - Circular thumbnail display in contact list
- All contact photos encrypted and stored securely in cloud storage
- Contact photos synced to caregiver device for reference

### 3.3 Bluetooth Whisper Audio System
- All guidance delivered exclusively through Bluetooth earphones in real-time
- No loudspeaker output except emergencies
- Whispered content includes:
  - Real-time face recognition results (name and relationship)
  - Task reminders\n  - Orientation information (day, date, location, identity)
  - Safety warnings
- Text-to-speech with calm, friendly, human-like tone
- Instant audio delivery with minimal delay
\n### 3.4 AI Companion\n- Proactive conversational AI providing frequent check-ins
- Core functions:
  - Identity reminders ('who they are')
  - Temporal orientation (current day, date, time)
  - Spatial orientation (current location)\n  - Recent social interactions recap
  - Task status updates
- Natural language query support:\n  - 'What day is it?'
  - 'Who am I?'
  - 'Did I take my medicine?'
  - 'Who is this person?' (triggers immediate face recognition)
- Context-aware responses using real-time camera data, task logs, and interaction history
- Reassuring, friendly, and simple communication style

### 3.5 Task and Reminder System
- Patient can independently add tasks\n- Task attributes:
  - Name\n  - Time
  - Optional location
- Bluetooth whisper reminders at scheduled times
- Task status options:
  - Completed
  - Skipped
- All status changes logged and synced to caregiver device

### 3.6 Location Tracking
- Real-time GPS tracking with background updates
- Safe area boundary monitoring
- Automatic caregiver alert when patient exits safe zone
- Location data included in all alerts and logs
\n### 3.7 Health Awareness\n- Integration with wearable or phone-based health metrics:\n  - Heart rate\n  - Step count
  - Inactivity duration
- Abnormal pattern detection\n- Automatic caregiver alerts when thresholds exceeded

### 3.8 Emergency Panic Button
- Large, always-accessible button on patient interface
- Single tap triggers:\n  - Immediate caregiver alert
  - Live location transmission
  - Optional camera snapshot or live feed
\n### 3.9 Automatic Logging
- Comprehensive logging of all activities:\n  - Real-time face recognition events (timestamp, person name, recognition confidence)
  - Task reminders and completions
  - Unknown person encounters with save actions and face photos
  - Contact additions and photo updates
  - AI conversation transcripts
  - Location history\n  - Health data readings
- Real-time sync to caregiver device via cloud backend

## 4. Caregiver Mode Features

### 4.1 Dashboard\n- Real-time patient location map
- Task status overview
- Recent AI interactions summary
- Health indicators display
- Real-time face recognition event feed
- Unknown person encounter alerts
- Contact list with photos
\n### 4.2 Alert System
Instant alerts for:
- Emergency button activation
- Skipped tasks
- Unknown person detection
- Abnormal health metrics
- Safe area boundary breach
- New face saved by patient
- New contact added with photo

### 4.3 Live Monitoring
- Optional live camera feed access (privacy-safeguarded)
- Environment viewing only when necessary
\n### 4.4 Logs and Reports
- Searchable history of:\n  - Real-time face recognition events
  - Tasks\n  - People encounters with face photos
  - Contact additions and updates
  - Location records
  - AI interactions
  - Health data
- Filterable by date, type, and status

### 4.5 Patient Management
- Support for multiple patient linkages
- Customizable settings:\n  - Reminder tones
  - Reminder frequency
  - Alert sensitivity levels
  - Face recognition confidence threshold
\n## 5. Backend Architecture

### 5.1 Microservices Structure
\n**Authentication Service**
- User registration and login
- Device authentication and linking
- JWT token management
- OAuth 2.0 support

**Face Recognition Service**
- Real-time face detection and encoding
- Face matching against database
- Face model training and updates
- Hybrid processing (on-device + cloud)

**AI Companion Service**
- Natural language processing\n- Context-aware response generation
- Conversation history management
- Integration with GPT-4 or similar LLM

**Task Management Service**
- Task CRUD operations
- Reminder scheduling and delivery
- Task status tracking
- Push notification integration

**Location Service**
- Real-time GPS data processing
- Geofencing and safe area monitoring
- Location history storage
- Alert triggering for boundary breaches

**Health Monitoring Service**
- Wearable device integration
- Health metrics collection and analysis
- Anomaly detection algorithms
- Alert generation for abnormal patterns
\n**Media Storage Service**
- Face photo and contact photo upload
- Image compression and optimization
- CDN integration for fast delivery
- Secure encrypted storage

**Real-Time Sync Service**
- WebSocket connections for live updates
- Event-driven data synchronization
- Priority queue for critical events
- Conflict resolution mechanisms

**Alert and Notification Service**
- Multi-channel alert delivery (push, SMS, email)\n- Alert priority management
- Delivery confirmation tracking
- Alert history logging

### 5.2 API Gateway
- RESTful API endpoints\n- GraphQL support for complex queries
- Rate limiting and throttling
- API versioning
- Request validation and sanitization

### 5.3 Message Queue
- RabbitMQ or Apache Kafka for asynchronous processing
- Event streaming for real-time updates
- Dead letter queue for failed messages
- Message persistence and replay

## 6. Cloud Database Structure

### 6.1 Database Technology
- **Primary Database**: PostgreSQL for relational data
- **Cache Layer**: Redis for session management and real-time data
- **Document Store**: MongoDB for logs and unstructured data
- **Object Storage**: AWS S3 or Google Cloud Storage for images
- **Search Engine**: Elasticsearch for log searching and analytics

### 6.2 Core Tables (PostgreSQL)
\n**Patients**
- patient_id (UUID, primary key)
- name (VARCHAR)\n- device_id (VARCHAR, unique)
- safe_area_coordinates (JSONB)
- health_thresholds (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
\n**Caregivers**\n- caregiver_id (UUID, primary key)
- name (VARCHAR)
- email (VARCHAR, unique)
- device_id (VARCHAR, unique)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**Device_Linking**
- link_id (UUID, primary key)\n- patient_device_id (VARCHAR, foreign key)
- caregiver_device_id (VARCHAR, foreign key)
- link_code (VARCHAR, unique)
- link_timestamp (TIMESTAMP)
- status (ENUM: active, inactive)\n\n**Tasks**
- task_id (UUID, primary key)
- patient_id (UUID, foreign key)\n- task_name (VARCHAR)
- scheduled_time (TIMESTAMP)
- location (VARCHAR, nullable)
- status (ENUM: pending, completed, skipped)
- completion_time (TIMESTAMP, nullable)
- created_at (TIMESTAMP)
\n**Contacts**
- contact_id (UUID, primary key)
- patient_id (UUID, foreign key)
- contact_name (VARCHAR)
- relationship (VARCHAR)\n- phone_number (VARCHAR, nullable)
- notes (TEXT, nullable)
- photo_url (VARCHAR, nullable)
- photo_source (ENUM: camera, gallery, face_recognition)
- added_date (TIMESTAMP)
- last_updated (TIMESTAMP)
\n**Known_Faces**
- face_id (UUID, primary key)\n- patient_id (UUID, foreign key)
- person_name (VARCHAR)
- relationship_note (VARCHAR, nullable)
- face_encoding (BYTEA)\n- face_photo_url (VARCHAR)\n- contact_id (UUID, foreign key, nullable)
- added_date (TIMESTAMP)
- last_recognized_date (TIMESTAMP, nullable)

**Face_Recognition_Events**
- event_id (UUID, primary key)
- patient_id (UUID, foreign key)
- face_id (UUID, foreign key, nullable)
- timestamp (TIMESTAMP)
- location (GEOGRAPHY)
- recognition_confidence (FLOAT)
- whisper_delivered (BOOLEAN)
- created_at (TIMESTAMP)
\n**Unknown_Encounters**
- encounter_id (UUID, primary key)
- patient_id (UUID, foreign key)\n- timestamp (TIMESTAMP)
- location (GEOGRAPHY)
- face_snapshot_url (VARCHAR)
- patient_action (ENUM: saved, ignored)\n- saved_as_face_id (UUID, foreign key, nullable)
- saved_as_contact_id (UUID, foreign key, nullable)
- created_at (TIMESTAMP)
\n**Health_Metrics**\n- metric_id (UUID, primary key)
- patient_id (UUID, foreign key)
- timestamp (TIMESTAMP)
- heart_rate (INTEGER, nullable)
- steps (INTEGER, nullable)
- inactivity_duration (INTEGER, nullable)
- created_at (TIMESTAMP)
\n**Location_History**
- location_id (UUID, primary key)
- patient_id (UUID, foreign key)
- timestamp (TIMESTAMP)
- latitude (DECIMAL)
- longitude (DECIMAL)\n- accuracy (FLOAT)
- created_at (TIMESTAMP)

### 6.3 Document Collections (MongoDB)

**AI_Interaction_Logs**
- log_id (ObjectId)\n- patient_id (String)
- timestamp (Date)
- user_query (String)
- ai_response (String)
- context_data (Object)
- processing_time_ms (Number)
\n**System_Logs**
- log_id (ObjectId)
- service_name (String)
- log_level (String)
- message (String)
- timestamp (Date)
- metadata (Object)
\n### 6.4 Cache Structure (Redis)
- Session tokens: `session:{user_id}`
- Real-time location: `location:{patient_id}`
- Active face encodings: `faces:{patient_id}`
- Recent AI context: `ai_context:{patient_id}`
- Alert queue: `alerts:{caregiver_id}`
\n## 7. AI Integration\n
### 7.1 Face Recognition AI
\n**Technology Stack**
- **Face Detection**: MTCNN or RetinaFace
- **Face Encoding**: FaceNet or ArcFace
- **Matching Algorithm**: Cosine similarity with threshold 0.6
- **Training**: Continuous learning with new face additions
\n**Hybrid Processing**
- **On-Device**: Initial face detection and encoding (iOS: Core ML, Android: ML Kit)
- **Cloud**: Face matching against full database, model updates
- **Fallback**: Cloud processing if on-device fails

**Performance Optimization**
- Face encoding caching in Redis
- Batch processing for multiple faces
- GPU acceleration on cloud servers
- Model quantization for mobile devices

### 7.2 Conversational AI

**Technology Stack**
- **LLM**: OpenAI GPT-4 or Google PaLM 2
- **Speech-to-Text**: Google Cloud Speech-to-Text or Whisper API
- **Text-to-Speech**: Google Cloud TTS or Amazon Polly
- **Context Management**: Custom vector database for conversation history

**AI Prompt Engineering**
- System prompt: 'You are a compassionate AI companion for an Alzheimer's patient. Provide clear, simple, reassuring responses. Use patient's name and current context.'
- Context injection: Recent tasks, location, time, recent interactions
- Response formatting: Short sentences, avoid complex vocabulary
\n**Real-Time Processing**
- WebSocket connection for instant responses
- Streaming responses for natural conversation flow
- Context caching for faster follow-up queries

## 8. Security and Privacy

### 8.1 Data Protection
- End-to-end encryption (AES-256) for data at rest and in transit
- TLS 1.3 for all API communications
- Face encoding data, face photos, and contact photos encrypted in cloud storage
- Database encryption at rest
- Regular security audits and penetration testing\n
### 8.2 Authentication and Authorization
- Multi-factor authentication for caregiver accounts
- Device fingerprinting for patient devices
- Role-based access control (RBAC)
- JWT tokens with short expiration (15 minutes)
- Refresh token rotation\n
### 8.3 Privacy Safeguards
- HIPAA compliance for health data
- GDPR compliance for EU users
- Data anonymization for analytics
- User consent management
- Right to deletion and data export\n- Audit logs for all data access

### 8.4 Camera and Media Privacy
- Live camera feed access requires explicit caregiver justification
- All monitoring activities logged for transparency
- Face photos and contact photos stored with consent
- Automatic deletion of old face snapshots (90 days)
- No third-party access to media files

## 9. Technical Implementation Requirements

### 9.1 Frontend Technology Stack

**iOS**
- Swift 5.9+
- SwiftUI for UI components
- Core ML for on-device face recognition
- AVFoundation for camera access
- Core Location for GPS tracking
- HealthKit for health data integration

**Android**
- Kotlin 1.9+
- Jetpack Compose for UI components
- ML Kit for on-device face recognition
- CameraX for camera access
- Fused Location Provider for GPS tracking
- Google Fit API for health data integration

**Shared Libraries**
- Retrofit/Alamofire for API calls
- Socket.IO for real-time communication
- SQLite for local data caching
- Glide/Kingfisher for image loading
\n### 9.2 Backend Technology Stack

**Core Framework**
- Node.js with Express.js or Python with FastAPI
- TypeScript for type safety
\n**AI Services**
- TensorFlow Serving for face recognition models
- OpenAI API for conversational AI\n- Google Cloud AI Platform for model hosting
\n**Infrastructure**
- Docker for containerization
- Kubernetes for orchestration
- Nginx for load balancing
- AWS/GCP/Azure for cloud hosting

**Monitoring and Logging**
- Prometheus for metrics\n- Grafana for visualization\n- ELK Stack (Elasticsearch, Logstash, Kibana) for log management
- Sentry for error tracking
\n### 9.3 Required Outputs
- Complete app screen list and navigation flow
- UI wireframes for phone-screen interface
- Feature-wise code structure
- Real-time face recognition pipeline architecture
- Contact management system with photo capture and storage
- AI logic flow and prompt handling system
- Database schema and real-time sync logic
- Camera and face recognition integration logic with performance optimization
- Face photo and contact photo capture and storage system
- Photo gallery integration and image picker implementation
- Bluetooth audio whisper system implementation with low-latency delivery
- Alert and notification system architecture
- API documentation (OpenAPI/Swagger)
- Deployment scripts and CI/CD pipeline\n- Infrastructure as Code (Terraform/CloudFormation)
\n### 9.4 Integration Points
- OpenAI GPT-4 API for conversational AI
- Google Cloud Vision API or AWS Rekognition for face recognition backup
- Twilio for SMS alerts
- SendGrid for email notifications
- Firebase Cloud Messaging for push notifications
- Stripe for payment processing (if subscription model)
- Apple HealthKit and Google Fit APIs\n- Mapbox or Google Maps for location visualization
\n### 9.5 Performance Requirements
- Face recognition latency: <2 seconds from detection to whisper\n- Camera processing: 15-30 FPS for smooth real-time recognition
- Face photo and contact photo capture: instant snapshot with auto-focus
- Photo upload and sync: <5 seconds for standard resolution images
- Bluetooth audio delay: <500ms\n- API response time: <200ms for 95th percentile
- Database query time: <100ms for simple queries
- Real-time sync latency: <3 seconds for critical events
- System uptime: 99.9% availability
- Concurrent users: Support 10,000+ active patients

## 10. Design Style\n
### 10.1 Visual Design\n- **Color Scheme**: Calming blues (#4A90E2) and soft greens (#7ED321) for patient mode, professional grays (#F5F5F5) and whites (#FFFFFF) for caregiver mode
- **Typography**: Large San Francisco/Roboto fonts (24-32px) with high contrast for patient interface, standard 14-18px for caregiver dashboard
- **Layout**: Card-based layout with 16px padding for patient mode, grid-based dashboard with 8px spacing for caregiver mode
- **Icons**: Material Design icons with text labels for patient mode, standard system icons for caregiver mode
- **Photo Display**: Circular thumbnail images (48px diameter) with 2px border for contact list, larger square preview (200x200px) with 8px rounded corners in contact details, full-screen preview with pinch-to-zoom\n- **Photo Capture UI**: Clean camera interface with large circular capture button (80px), gallery access button, and preview confirmation screen with retake/confirm options
- **Real-time Indicators**: Subtle pulsing blue dot (8px) for active face recognition, green checkmark for whisper delivery confirmation\n
### 10.2 Interaction Design
- Large touch targets for patient interface (minimum 60px)\n- Smooth fade animations (300ms duration) to avoid confusion
- Persistent emergency button with red background (#FF3B30) and high visibility
- Minimal navigation depth for patient mode (maximum 2 levels)
- Photo capture flow: tap add photo → choose camera/gallery → capture/select → preview → confirm/retake → save
- Face photo preview in save dialog with confirm/retake options
- Contact photo editing with replace/remove options
- Comprehensive filtering and search for caregiver logs
- Instant visual feedback for photo save actions with thumbnail confirmation
- Real-time status indicators for camera and recognition system
- Pinch-to-zoom for photo preview in contact details
- Pull-to-refresh for caregiver dashboard
- Swipe gestures for navigation in patient mode

## 11. Deployment and DevOps

### 11.1 Cloud Infrastructure
\n**Hosting**
- AWS/GCP/Azure multi-region deployment
- Auto-scaling groups for backend services
- Load balancers with health checks
- CDN for static assets and images
\n**Database Hosting**
- Managed PostgreSQL (AWS RDS/Google Cloud SQL)
- Managed Redis (AWS ElastiCache/Google Memorystore)
- Managed MongoDB (MongoDB Atlas)\n- S3/Cloud Storage for object storage
\n**Compute Resources**
- Kubernetes cluster with 3+ nodes
- GPU instances for AI model inference
- Serverless functions for event-driven tasks
\n### 11.2 CI/CD Pipeline

**Version Control**
- Git with GitHub/GitLab\n- Branch protection rules
- Code review requirements
\n**Build Pipeline**
- Automated testing (unit, integration, e2e)
- Code quality checks (ESLint, SonarQube)
- Security scanning (Snyk, OWASP)\n- Docker image building\n
**Deployment Pipeline**
- Staging environment for testing
- Blue-green deployment for zero downtime
- Automated rollback on failure
- Canary releases for gradual rollout
\n### 11.3 Monitoring and Alerting

**Application Monitoring**
- Real-time performance metrics
- Error rate tracking
- User session monitoring
- API endpoint monitoring

**Infrastructure Monitoring**
- Server health checks
- Database performance metrics
- Network latency monitoring
- Storage usage tracking

**Alerting**
- PagerDuty/Opsgenie integration\n- Slack/Email notifications
- Escalation policies
- Incident response playbooks

### 11.4 Backup and Disaster Recovery
- Automated daily database backups
- Point-in-time recovery capability
- Cross-region replication
- Disaster recovery plan with RTO <4 hours, RPO <1 hour
- Regular disaster recovery drills
\n## 12. Compliance and Regulations

### 12.1 Healthcare Compliance
- HIPAA compliance for US deployment
- HITECH Act requirements\n- FDA medical device classification assessment
- Clinical validation and testing
\n### 12.2 Data Privacy Regulations
- GDPR compliance for EU users
- CCPA compliance for California users
- Data processing agreements
- Privacy impact assessments

### 12.3 Accessibility Standards
- WCAG 2.1 Level AA compliance
- VoiceOver/TalkBack support
- High contrast mode
- Adjustable font sizes
\n## 13. Testing Strategy

### 13.1 Testing Types
- Unit testing (80%+ code coverage)
- Integration testing for API endpoints
- End-to-end testing for critical user flows
- Performance testing (load, stress, spike)
- Security testing (penetration, vulnerability scanning)
- Usability testing with target users
- Accessibility testing\n
### 13.2 Testing Tools
- Jest/XCTest for unit testing
- Postman/Newman for API testing
- Selenium/Appium for e2e testing
- JMeter/Gatling for performance testing
- OWASP ZAP for security testing
\n## 14. Cost Estimation

### 14.1 Infrastructure Costs (Monthly)
- Cloud hosting: $2,000-5,000\n- Database services: $1,000-2,000
- AI API calls (OpenAI, Cloud Vision): $1,500-3,000
- CDN and storage: $500-1,000\n- Monitoring and logging: $300-500
- **Total**: $5,300-11,500/month

### 14.2 Development Costs (One-Time)
- Frontend development (iOS + Android): 6-8 months\n- Backend development: 4-6 months
- AI integration and training: 2-3 months\n- Testing and QA: 2-3 months
- Design and UX: 1-2 months
- **Total**: 15-22 months development time

## 15. Roadmap and Milestones

### Phase 1 (Months 1-3): Foundation
- Backend architecture setup
- Database schema implementation
- Authentication and device linking
- Basic patient and caregiver UI
\n### Phase 2 (Months 4-6): Core Features
- Face recognition integration
- Contact management with photos
- Task and reminder system
- Location tracking
\n### Phase 3 (Months 7-9): AI and Real-Time
- AI companion integration
- Real-time sync implementation
- Bluetooth audio system
- Alert and notification system

### Phase 4 (Months 10-12): Advanced Features
- Health monitoring integration
- Live camera feed
- Advanced analytics and reporting
- Performance optimization

### Phase 5 (Months 13-15): Testing and Refinement
- Comprehensive testing
- Security audits
- Usability testing with real users
- Bug fixes and optimization

### Phase 6 (Months 16-18): Compliance and Launch
- HIPAA/GDPR compliance certification
- App store submission
- Marketing and user onboarding
- Production deployment

### Phase 7 (Months 19+): Post-Launch
- User feedback collection
- Feature enhancements
- Scale infrastructure
- Continuous improvement