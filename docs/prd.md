# RemZy Requirements Document

## 1. Application Overview

### 1.1 Application Name
RemZy\n
### 1.2 Application Description
RemZy is a production-ready mobile application ecosystem designed to support Alzheimer's patients through real-time memory assistance, safety monitoring, and emotional support. The system operates across two strictly separated device modes (Patient Mode and Caregiver Mode) with secure device linking, providing comprehensive care while maintaining patient dignity and privacy.

## 2. Core Architecture

### 2.1 Device Mode System

**Patient Mode**
- Runs exclusively on patient's device
- Locked after initial setup, cannot access caregiver features
- Core capabilities: camera processing, Bluetooth audio, AI companion, self-managed tasks and contacts
- All guidance delivered privately through Bluetooth earphones
\n**Caregiver Mode**
- Runs exclusively on caregiver's device
- Locked after initial setup, cannot access patient UI
- Core capabilities: real-time monitoring dashboard, alert reception, activity logs, patient management
- View-only access unless emergency situation

### 2.2 Device Linking Mechanism
- Patient device generates secure QR code or unique linking code during setup
- Caregiver scans or enters code to establish permanent link
- All data flows exclusively between linked devices
- No global visibility or public access
- Support multiple patient-caregiver linkages\n
## 3. Patient Mode Features

### 3.1 Always-On Camera System
- Continuous background camera operation
- Real-time face recognition using on-device or hybrid AI\n- Recognition outcomes:
  - **Known face detected**: Whisper person's name via Bluetooth
  - **Unknown face detected**: Whisper warning 'You are meeting someone new', prompt patient to save person with name and optional note (relationship: friend, doctor, neighbor, etc.)
- Camera feed provides environmental context to AI companion

### 3.2 Bluetooth Whisper Audio System
- All guidance delivered exclusively through Bluetooth earphones
- No loudspeaker output except emergencies
- Whispered content includes:
  - Task reminders
  - Orientation information (day, date, location, identity)
  - People recognition results
  - Safety warnings
- Text-to-speech with calm, friendly, human-like tone

### 3.3 AI Companion\n- Proactive conversational AI providing frequent check-ins
- Core functions:
  - Identity reminders ('who they are')
  - Temporal orientation (current day, date, time)
  - Spatial orientation (current location)
  - Recent social interactions recap
  - Task status updates
- Natural language query support:\n  - 'What day is it?'
  - 'Who am I?'
  - 'Did I take my medicine?'
- Context-aware responses using camera data, task logs, and interaction history
- Reassuring, friendly, and simple communication style

### 3.4 Task and Reminder System
- Patient can independently add tasks\n- Task attributes:
  - Name
  - Time
  - Optional location
- Bluetooth whisper reminders at scheduled times
- Task status options:
  - Completed
  - Skipped
- All status changes logged and synced to caregiver device

### 3.5 Location Tracking
- Real-time GPS tracking with background updates
- Safe area boundary monitoring
- Automatic caregiver alert when patient exits safe zone
- Location data included in all alerts and logs
\n### 3.6 Health Awareness
- Integration with wearable or phone-based health metrics:
  - Heart rate
  - Step count
  - Inactivity duration
- Abnormal pattern detection
- Automatic caregiver alerts when thresholds exceeded

### 3.7 Emergency Panic Button
- Large, always-accessible button on patient interface
- Single tap triggers:
  - Immediate caregiver alert
  - Live location transmission
  - Optional camera snapshot or live feed

### 3.8 Automatic Logging
- Comprehensive logging of all activities:\n  - Task reminders and completions
  - Face recognition events
  - Unknown person encounters
  - AI conversation transcripts
  - Location history\n  - Health data readings
- Real-time sync to caregiver device\n
## 4. Caregiver Mode Features
\n### 4.1 Dashboard
- Real-time patient location map
- Task status overview\n- Recent AI interactions summary
- Health indicators display
- Unknown person encounter alerts
\n### 4.2 Alert System
Instant alerts for:
- Emergency button activation
- Skipped tasks\n- Unknown person detection
- Abnormal health metrics
- Safe area boundary breach

### 4.3 Live Monitoring
- Optional live camera feed access (privacy-safeguarded)
- Environment viewing only when necessary
\n### 4.4 Logs and Reports
- Searchable history of:
  - Tasks
  - People encounters
  - Location records
  - AI interactions
  - Health data
- Filterable by date, type, and status

### 4.5 Patient Management\n- Support for multiple patient linkages
- Customizable settings:\n  - Reminder tones\n  - Reminder frequency
  - Alert sensitivity levels
\n## 5. Database Structure

### 5.1 Core Tables
- **Patients**: patient_id, name, device_id, safe_area_coordinates, health_thresholds\n- **Caregivers**: caregiver_id, name, device_id, linked_patients\n- **Tasks**: task_id, patient_id, task_name, scheduled_time, location, status, completion_time
- **Known Faces**: face_id, patient_id, person_name, relationship_note, face_encoding, added_date
- **Unknown Encounters**: encounter_id, patient_id, timestamp, location, face_snapshot, patient_action
- **Health Metrics**: metric_id, patient_id, timestamp, heart_rate, steps, inactivity_duration
- **AI Interaction Logs**: log_id, patient_id, timestamp, user_query, ai_response, context_data
- **Device Linking**: link_id, patient_device_id, caregiver_device_id, link_code, link_timestamp

### 5.2 Data Relationships
- One-to-many: Patients to Tasks, Known Faces, Health Metrics, AI Logs
- Many-to-many: Patients to Caregivers (via Device Linking table)
- Real-time sync mechanism between linked devices

## 6. Security and Privacy\n
### 6.1 Data Protection
- End-to-end encryption for data at rest and in transit
- Camera and microphone access restricted to patient device only
- Caregiver access is view-only unless emergency override
- No data sharing outside linked device pairs

### 6.2 Privacy Safeguards\n- Live camera feed access requires explicit caregiver justification
- All monitoring activities logged for transparency
- Patient dignity maintained through private Bluetooth audio guidance
\n## 7. Technical Implementation Requirements

### 7.1 Required Outputs
- Complete app screen list and navigation flow
- UI wireframes for phone-screen interface
- Feature-wise code structure
- AI logic flow and prompt handling system
- Database schema and sync logic
- Camera and face recognition integration logic
- Bluetooth audio whisper system implementation
- Alert and notification system architecture
- Deployment-ready scalable architecture

### 7.2 Integration Points
- On-device or hybrid AI for face recognition
- Bluetooth audio API for whisper guidance
- GPS and location services\n- Health data APIs (wearable integration)
- Real-time data synchronization between devices
- Text-to-speech engine with natural voice\n
## 8. Design Style\n
### 8.1 Visual Design
- **Color Scheme**: Calming blues and soft greens for patient mode (reducing anxiety), professional grays and whites for caregiver mode (clarity and focus)
- **Typography**: Large, high-contrast fonts for patient interface (readability), standard professional fonts for caregiver dashboard\n- **Layout**: Card-based layout for patient mode with minimal clutter, grid-based dashboard for caregiver mode with information density
- **Icons**: Simple, intuitive icons with text labels for patient mode, standard system icons for caregiver mode

### 8.2 Interaction Design
- Large touch targets for patient interface (minimum 60px)\n- Smooth, gentle animations to avoid confusion
- Persistent emergency button with high visibility
- Minimal navigation depth for patient mode (maximum 2 levels)
- Comprehensive filtering and search for caregiver logs

## 9. Deployment Considerations

### 9.1 Platform Support
- iOS and Android native applications
- Optimized for continuous background operation
- Battery optimization for always-on camera and location tracking
\n### 9.2 Scalability
- Cloud-based sync infrastructure for multi-device support
- Modular architecture for feature expansion
- Healthcare-grade reliability and uptime requirements