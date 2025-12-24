# RemZy Requirements Document
\n## 1. Application Overview\n
### 1.1 Application Name
RemZy

### 1.2 Application Description
RemZy is a production-ready mobile application ecosystem designed to support Alzheimer's patients through real-time memory assistance, safety monitoring, and emotional support. The system operates across two strictly separated device modes (Patient Mode and Caregiver Mode) with secure device linking, providing comprehensive care while maintaining patient dignity and privacy.

## 2. Core Architecture

### 2.1 Device Mode System\n
**Patient Mode**\n- Runs exclusively on patient's device
- Locked after initial setup, cannot access caregiver features
- Core capabilities: real-time camera processing, Bluetooth audio, AI companion, self-managed tasks and contacts
- All guidance delivered privately through Bluetooth earphones
\n**Caregiver Mode**
- Runs exclusively on caregiver's device
- Locked after initial setup, cannot access patient UI
- Core capabilities: real-time monitoring dashboard, alert reception, activity logs, patient management
- View-only access unless emergency situation\n
### 2.2 Device Linking Mechanism
- Patient device generates secure QR code or unique linking code during setup
- Caregiver scans or enters code to establish permanent link
- All data flows exclusively between linked devices
- No global visibility or public access
- Support multiple patient-caregiver linkages
\n## 3. Patient Mode Features

### 3.1 Real-Time Always-On Camera System with Face Recognition
- **Continuous real-time camera operation** running in background
- **Instant face recognition** using on-device or hybrid AI with minimal latency
- **Real-time recognition workflow**:
  - **Known face detected**: Immediately whisper person's name and relationship via Bluetooth (e.g., 'This is John, your friend')
  - **Unknown face detected**: Instantly whisper warning 'You are meeting someone new', prompt patient to save person with name, face photo, and optional note (relationship: friend, doctor, neighbor, etc.)\n  - **Face photo capture**: When saving a new person, system automatically captures and saves the current face image from camera feed as reference photo, displayed in save dialog for confirmation
  - **Saved face**: Newly saved faces with photos are immediately added to recognition database and available for instant recognition in future encounters
- **Real-time whisper delivery**: All recognition results delivered within 1-2 seconds of face detection\n- Camera feed provides continuous environmental context to AI companion
- Face recognition operates continuously without manual triggering

### 3.2 Bluetooth Whisper Audio System\n- All guidance delivered exclusively through Bluetooth earphones in real-time\n- No loudspeaker output except emergencies
- Whispered content includes:
  - Real-time face recognition results (name and relationship)
  - Task reminders
  - Orientation information (day, date, location, identity)\n  - Safety warnings
- Text-to-speech with calm, friendly, human-like tone
- Instant audio delivery with minimal delay

### 3.3 AI Companion
- Proactive conversational AI providing frequent check-ins
- Core functions:
  - Identity reminders ('who they are')
  - Temporal orientation (current day, date, time)
  - Spatial orientation (current location)
  - Recent social interactions recap
  - Task status updates
- Natural language query support:
  - 'What day is it?'
  - 'Who am I?'\n  - 'Did I take my medicine?'
  - 'Who is this person?' (triggers immediate face recognition)
- Context-aware responses using real-time camera data, task logs, and interaction history\n- Reassuring, friendly, and simple communication style

### 3.4 Task and Reminder System
- Patient can independently add tasks
- Task attributes:
  - Name
  - Time
  - Optional location
- Bluetooth whisper reminders at scheduled times
- Task status options:
  - Completed
  - Skipped\n- All status changes logged and synced to caregiver device

### 3.5 Location Tracking
- Real-time GPS tracking with background updates
- Safe area boundary monitoring
- Automatic caregiver alert when patient exits safe zone
- Location data included in all alerts and logs

### 3.6 Health Awareness
- Integration with wearable or phone-based health metrics:
  - Heart rate\n  - Step count
  - Inactivity duration
- Abnormal pattern detection
- Automatic caregiver alerts when thresholds exceeded

### 3.7 Emergency Panic Button
- Large, always-accessible button on patient interface
- Single tap triggers:
  - Immediate caregiver alert
  - Live location transmission
  - Optional camera snapshot or live feed\n
### 3.8 Automatic Logging
- Comprehensive logging of all activities:
  - Real-time face recognition events (timestamp, person name, recognition confidence)
  - Task reminders and completions
  - Unknown person encounters with save actions and face photos
  - AI conversation transcripts
  - Location history\n  - Health data readings
- Real-time sync to caregiver device

## 4. Caregiver Mode Features

### 4.1 Dashboard
- Real-time patient location map
- Task status overview
- Recent AI interactions summary
- Health indicators display\n- Real-time face recognition event feed
- Unknown person encounter alerts

### 4.2 Alert System
Instant alerts for:
- Emergency button activation
- Skipped tasks\n- Unknown person detection
- Abnormal health metrics
- Safe area boundary breach
- New face saved by patient

### 4.3 Live Monitoring
- Optional live camera feed access (privacy-safeguarded)\n- Environment viewing only when necessary\n
### 4.4 Logs and Reports
- Searchable history of:
  - Real-time face recognition events\n  - Tasks
  - People encounters with face photos
  - Location records\n  - AI interactions
  - Health data
- Filterable by date, type, and status

### 4.5 Patient Management
- Support for multiple patient linkages
- Customizable settings:
  - Reminder tones
  - Reminder frequency
  - Alert sensitivity levels
  - Face recognition confidence threshold

## 5. Database Structure

### 5.1 Core Tables
- **Patients**: patient_id, name, device_id, safe_area_coordinates, health_thresholds
- **Caregivers**: caregiver_id, name, device_id, linked_patients
- **Tasks**: task_id, patient_id, task_name, scheduled_time, location, status, completion_time
- **Known Faces**: face_id, patient_id, person_name, relationship_note, face_encoding, face_photo_url, added_date, last_recognized_date
- **Face Recognition Events**: event_id, patient_id, face_id, timestamp, location, recognition_confidence, whisper_delivered
- **Unknown Encounters**: encounter_id, patient_id, timestamp, location, face_snapshot, patient_action, saved_as_face_id
- **Health Metrics**: metric_id, patient_id, timestamp, heart_rate, steps, inactivity_duration
- **AI Interaction Logs**: log_id, patient_id, timestamp, user_query, ai_response, context_data
- **Device Linking**: link_id, patient_device_id, caregiver_device_id, link_code, link_timestamp

### 5.2 Data Relationships\n- One-to-many: Patients to Tasks, Known Faces, Face Recognition Events, Health Metrics, AI Logs
- Many-to-many: Patients to Caregivers (via Device Linking table)
- Real-time sync mechanism between linked devices with priority for face recognition events

## 6. Security and Privacy

### 6.1 Data Protection
- End-to-end encryption for data at rest and in transit
- Camera and microphone access restricted to patient device only\n- Face encoding data and face photos encrypted and stored securely
- Caregiver access is view-only unless emergency override
- No data sharing outside linked device pairs\n
### 6.2 Privacy Safeguards
- Live camera feed access requires explicit caregiver justification
- All monitoring activities logged for transparency
- Patient dignity maintained through private Bluetooth audio guidance
- Face recognition operates locally with optional cloud backup
- Face photos stored with consent and used solely for recognition purposes

## 7. Technical Implementation Requirements

### 7.1 Required Outputs
- Complete app screen list and navigation flow
- UI wireframes for phone-screen interface
- Feature-wise code structure
- Real-time face recognition pipeline architecture\n- AI logic flow and prompt handling system
- Database schema and real-time sync logic
- Camera and face recognition integration logic with performance optimization
- Face photo capture and storage system
- Bluetooth audio whisper system implementation with low-latency delivery
- Alert and notification system architecture
- Deployment-ready scalable architecture

### 7.2 Integration Points\n- On-device or hybrid AI for real-time face recognition (target: <2second recognition time)
- Face encoding library (e.g., FaceNet, DeepFace) with continuous learning capability
- Image capture and storage API for face photos
- Bluetooth audio API for instant whisper guidance\n- GPS and location services
- Health data APIs (wearable integration)
- Real-time data synchronization between devices with priority queuing
- Text-to-speech engine with natural voice and minimal latency

### 7.3 Performance Requirements
- Face recognition latency: <2 seconds from detection to whisper
- Camera processing: 15-30 FPS for smooth real-time recognition
- Face photo capture: instant snapshot with auto-focus
- Bluetooth audio delay: <500ms
- Database sync: <3 seconds for critical events (face recognition, alerts)
- Battery optimization for continuous camera and recognition operation

## 8. Design Style

### 8.1 Visual Design
- **Color Scheme**: Calming blues and soft greens for patient mode (reducing anxiety), professional grays and whites for caregiver mode (clarity and focus)
- **Typography**: Large, high-contrast fonts for patient interface (readability), standard professional fonts for caregiver dashboard
- **Layout**: Card-based layout for patient mode with minimal clutter, grid-based dashboard for caregiver mode with information density
- **Icons**: Simple, intuitive icons with text labels for patient mode, standard system icons for caregiver mode
- **Face Photo Display**: Circular thumbnail images with subtle borders for saved contacts, larger preview in save dialog with confirmation overlay
- **Real-time Indicators**: Subtle visual feedback for active face recognition (small pulsing icon) and whisper delivery confirmation

### 8.2 Interaction Design
- Large touch targets for patient interface (minimum 60px)
- Smooth, gentle animations to avoid confusion
- Persistent emergency button with high visibility
- Minimal navigation depth for patient mode (maximum 2 levels)
- Face photo preview in save dialog with confirm/retake options
- Comprehensive filtering and search for caregiver logs
- Instant visual feedback for face save actions with photo confirmation
- Real-time status indicators for camera and recognition system
\n## 9. Deployment Considerations

### 9.1 Platform Support
- iOS and Android native applications
- Optimized for continuous background operation\n- Battery optimization for always-on camera, real-time face recognition, and location tracking
- Hardware acceleration for face recognition processing
- Efficient image compression for face photo storage

### 9.2 Scalability\n- Cloud-based sync infrastructure for multi-device support
- Modular architecture for feature expansion
- Healthcare-grade reliability and uptime requirements
- Scalable face recognition database with efficient indexing
- Real-time event processing pipeline with load balancing
- Optimized image storage with CDN support for face photos