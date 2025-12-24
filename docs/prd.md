# RemZy Requirements Document

## 1. Application Overview

### 1.1 Application Name
RemZy\n
### 1.2 Application Description
RemZy is a production-ready mobile application ecosystem designed to support Alzheimer's patients through real-time memory assistance, safety monitoring, and emotional support. The system operates across two strictly separated device modes (Patient Mode and Caregiver Mode) with secure device linking, providing comprehensive care while maintaining patient dignity and privacy.\n
## 2. Core Architecture

### 2.1 Device Mode System

**Patient Mode**
- Runs exclusively on patient's device
- Locked after initial setup, cannot access caregiver features\n- Core capabilities: real-time camera processing, Bluetooth audio, AI companion, self-managed tasks and contacts
- All guidance delivered privately through Bluetooth earphones

**Caregiver Mode**\n- Runs exclusively on caregiver's device
- Locked after initial setup, cannot access patient UI
- Core capabilities: real-time monitoring dashboard, alert reception, activity logs, patient management
- View-only access unless emergency situation

### 2.2 Device Linking Mechanism
- Patient device generates secure QR code or unique linking code during setup
- Caregiver scans or enters code to establish permanent link
- All data flows exclusively between linked devices\n- No global visibility or public access
- Support multiple patient-caregiver linkages

## 3. Patient Mode Features\n
### 3.1 Real-Time Always-On Camera System with Face Recognition
- **Continuous real-time camera operation** running in background
- **Instant face recognition** using on-device or hybrid AI with minimal latency\n- **Real-time recognition workflow**:
  - **Known face detected**: Immediately whisper person's name and relationship via Bluetooth (e.g., 'This is John, your friend')
  - **Unknown face detected**: Instantly whisper warning 'You are meeting someone new', prompt patient to save person with name, face photo, and optional note (relationship: friend, doctor, neighbor, etc.)
  - **Face photo capture**: When saving a new person, system automatically captures and saves the current face image from camera feed as reference photo, displayed in save dialog for confirmation
  - **Saved face**: Newly saved faces with photos are immediately added to recognition database and available for instant recognition in future encounters
- **Real-time whisper delivery**: All recognition results delivered within 1-2 seconds of face detection
- Camera feed provides continuous environmental context to AI companion
- Face recognition operates continuously without manual triggering
\n### 3.2 Contact Management with Photo Support
- Patient can manually add contacts independently
- Contact attributes:
  - Name (required)
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
- All contact photos encrypted and stored securely
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

### 3.4 AI Companion
- Proactive conversational AI providing frequent check-ins
- Core functions:
  - Identity reminders ('who they are')
  - Temporal orientation (current day, date, time)
  - Spatial orientation (current location)
  - Recent social interactions recap
  - Task status updates
- Natural language query support:
  - 'What day is it?'
  - 'Who am I?'
  - 'Did I take my medicine?'
  - 'Who is this person?' (triggers immediate face recognition)
- Context-aware responses using real-time camera data, task logs, and interaction history
- Reassuring, friendly, and simple communication style

### 3.5 Task and Reminder System
- Patient can independently add tasks
- Task attributes:
  - Name
  - Time
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

### 3.7 Health Awareness
- Integration with wearable or phone-based health metrics:\n  - Heart rate
  - Step count
  - Inactivity duration
- Abnormal pattern detection
- Automatic caregiver alerts when thresholds exceeded

### 3.8 Emergency Panic Button
- Large, always-accessible button on patient interface
- Single tap triggers:
  - Immediate caregiver alert
  - Live location transmission
  - Optional camera snapshot or live feed
\n### 3.9 Automatic Logging
- Comprehensive logging of all activities:
  - Real-time face recognition events (timestamp, person name, recognition confidence)
  - Task reminders and completions
  - Unknown person encounters with save actions and face photos
  - Contact additions and photo updates
  - AI conversation transcripts
  - Location history
  - Health data readings
- Real-time sync to caregiver device

## 4. Caregiver Mode Features\n
### 4.1 Dashboard
- Real-time patient location map
- Task status overview
- Recent AI interactions summary
- Health indicators display
- Real-time face recognition event feed
- Unknown person encounter alerts\n- Contact list with photos

### 4.2 Alert System
Instant alerts for:
- Emergency button activation
- Skipped tasks\n- Unknown person detection
- Abnormal health metrics
- Safe area boundary breach
- New face saved by patient
- New contact added with photo

### 4.3 Live Monitoring
- Optional live camera feed access (privacy-safeguarded)
- Environment viewing only when necessary

### 4.4 Logs and Reports
- Searchable history of:
  - Real-time face recognition events
  - Tasks
  - People encounters with face photos
  - Contact additions and updates
  - Location records
  - AI interactions\n  - Health data
- Filterable by date, type, and status

### 4.5 Patient Management
- Support for multiple patient linkages\n- Customizable settings:
  - Reminder tones
  - Reminder frequency
  - Alert sensitivity levels
  - Face recognition confidence threshold

## 5. Database Structure

### 5.1 Core Tables
- **Patients**: patient_id, name, device_id, safe_area_coordinates, health_thresholds
- **Caregivers**: caregiver_id, name, device_id, linked_patients
- **Tasks**: task_id, patient_id, task_name, scheduled_time, location, status, completion_time
- **Contacts**: contact_id, patient_id, contact_name, relationship, phone_number, notes, photo_url, photo_source (camera/gallery/face_recognition), added_date, last_updated
- **Known Faces**: face_id, patient_id, person_name, relationship_note, face_encoding, face_photo_url, contact_id (linked to Contacts table), added_date, last_recognized_date
- **Face Recognition Events**: event_id, patient_id, face_id, timestamp, location, recognition_confidence, whisper_delivered
- **Unknown Encounters**: encounter_id, patient_id, timestamp, location, face_snapshot, patient_action, saved_as_face_id, saved_as_contact_id
- **Health Metrics**: metric_id, patient_id, timestamp, heart_rate, steps, inactivity_duration
- **AI Interaction Logs**: log_id, patient_id, timestamp, user_query, ai_response, context_data
- **Device Linking**: link_id, patient_device_id, caregiver_device_id, link_code, link_timestamp

### 5.2 Data Relationships
- One-to-many: Patients to Tasks, Contacts, Known Faces, Face Recognition Events, Health Metrics, AI Logs
- One-to-one (optional): Contacts to Known Faces (when contact photo is used for face recognition)
- Many-to-many: Patients to Caregivers (via Device Linking table)\n- Real-time sync mechanism between linked devices with priority for face recognition events and contact updates

## 6. Security and Privacy

### 6.1 Data Protection\n- End-to-end encryption for data at rest and in transit\n- Camera and microphone access restricted to patient device only
- Face encoding data, face photos, and contact photos encrypted and stored securely
- Caregiver access is view-only unless emergency override\n- No data sharing outside linked device pairs

### 6.2 Privacy Safeguards
- Live camera feed access requires explicit caregiver justification
- All monitoring activities logged for transparency\n- Patient dignity maintained through private Bluetooth audio guidance
- Face recognition operates locally with optional cloud backup
- Face photos and contact photos stored with consent and used solely for recognition and identification purposes
- Photo access permissions managed through device settings

## 7. Technical Implementation Requirements
\n### 7.1 Required Outputs
- Complete app screen list and navigation flow
- UI wireframes for phone-screen interface\n- Feature-wise code structure\n- Real-time face recognition pipeline architecture
- Contact management system with photo capture and storage
- AI logic flow and prompt handling system
- Database schema and real-time sync logic
- Camera and face recognition integration logic with performance optimization
- Face photo and contact photo capture and storage system
- Photo gallery integration and image picker implementation
- Bluetooth audio whisper system implementation with low-latency delivery
- Alert and notification system architecture
- Deployment-ready scalable architecture

### 7.2 Integration Points\n- On-device or hybrid AI for real-time face recognition (target: <2 second recognition time)
- Face encoding library (e.g., FaceNet, DeepFace) with continuous learning capability
- Image capture and storage API for face photos and contact photos
- Device gallery access API for photo selection
- Image compression and optimization library
- Bluetooth audio API for instant whisper guidance
- GPS and location services
- Health data APIs (wearable integration)
- Real-time data synchronization between devices with priority queuing
- Text-to-speech engine with natural voice and minimal latency
\n### 7.3 Performance Requirements
- Face recognition latency: <2 seconds from detection to whisper
- Camera processing: 15-30 FPS for smooth real-time recognition
- Face photo and contact photo capture: instant snapshot with auto-focus
- Photo upload and sync: <5 seconds for standard resolution images
- Bluetooth audio delay: <500ms
- Database sync: <3 seconds for critical events (face recognition, alerts, contact updates)
- Battery optimization for continuous camera and recognition operation
- Image storage optimization with efficient compression (target: <500KB per photo)

## 8. Design Style

### 8.1 Visual Design\n- **Color Scheme**: Calming blues and soft greens for patient mode (reducing anxiety), professional grays and whites for caregiver mode (clarity and focus)
- **Typography**: Large, high-contrast fonts for patient interface (readability), standard professional fonts for caregiver dashboard\n- **Layout**: Card-based layout for patient mode with minimal clutter, grid-based dashboard for caregiver mode with information density
- **Icons**: Simple, intuitive icons with text labels for patient mode, standard system icons for caregiver mode\n- **Photo Display**: Circular thumbnail images with subtle borders for contact list and saved faces, larger square preview in contact details with rounded corners, full-screen preview option with zoom capability
- **Photo Capture UI**: Clean camera interface with large capture button, gallery access button, and preview confirmation screen with retake/confirm options
- **Real-time Indicators**: Subtle visual feedback for active face recognition (small pulsing icon) and whisper delivery confirmation\n
### 8.2Interaction Design
- Large touch targets for patient interface (minimum 60px)\n- Smooth, gentle animations to avoid confusion
- Persistent emergency button with high visibility
- Minimal navigation depth for patient mode (maximum 2 levels)
- Photo capture flow: tap add photo → choose camera/gallery → capture/select → preview → confirm/retake → save
- Face photo preview in save dialog with confirm/retake options
- Contact photo editing with replace/remove options
- Comprehensive filtering and search for caregiver logs
- Instant visual feedback for photo save actions with thumbnail confirmation
- Real-time status indicators for camera and recognition system
- Pinch-to-zoom for photo preview in contact details

## 9. Deployment Considerations

### 9.1 Platform Support
- iOS and Android native applications
- Optimized for continuous background operation
- Battery optimization for always-on camera, real-time face recognition, and location tracking
- Hardware acceleration for face recognition processing
- Efficient image compression for face photo and contact photo storage
- Camera and gallery permissions management

### 9.2 Scalability
- Cloud-based sync infrastructure for multi-device support
- Modular architecture for feature expansion
- Healthcare-grade reliability and uptime requirements
- Scalable face recognition database with efficient indexing
- Real-time event processing pipeline with load balancing
- Optimized image storage with CDN support for face photos and contact photos
- Image caching strategy for offline access to contact photos