# RemZy Production-Ready Requirements Document (Updated)

## 1. Application Overview

### 1.1 Application Name
RemZy\n
### 1.2 Application Description
RemZy is a production-ready mobile application ecosystem designed to support Alzheimer's patients through real-time memory assistance, safety monitoring, and emotional support. The system operates across two strictly separated device modes (Patient Mode and Caregiver Mode) with secure device linking, providing comprehensive care while maintaining patient dignity and privacy.

### 1.3 System Architecture
- **Frontend**: Native iOS and Android applications\n- **Backend**: Cloud-based microservices architecture
- **Database**: Cloud-hosted distributed database with real-time sync and complete data reset capability
- **AI Services**: Google ML Kit for face detection and recognition, Google Cloud Vision AI for enhanced analysis, conversational AI with contextual awareness
- **Infrastructure**: Scalable, healthcare-grade deployment\n
## 2. Core Architecture

### 2.1 Device Mode System
\n**Patient Mode**
- Runs exclusively on patient's device\n- Locked after initial setup, cannot access caregiver features
- Core capabilities: fully functional real-time camera processing with Google ML Kit face detection and recognition, contextual AI analysis, Bluetooth audio, AI companion, self-managed tasks and contacts
- All guidance delivered privately through Bluetooth earphones
- **Caregiver Link Display**: Shows accurate count and list of linked caregivers with their names and link status

**Caregiver Mode**
- Runs exclusively on caregiver's device
- Locked after initial setup, cannot access patient UI
- Core capabilities: real-time monitoring dashboard, alert reception, activity logs, patient management\n- View-only access unless emergency situation
- **Enhanced Management**: Full CRUD operations for patient's contacts, tasks, and alert configurations

### 2.2 Complete User Flow from First Launch

**First Launch Flow**
1. **Welcome Screen**: App opens to welcome screen with RemZy logo and tagline
2. **Mode Selection Screen**: User selects device mode (Patient Mode or Caregiver Mode)
3. **Account Creation/Login**:
   - New users: Create account with email, password, and basic profile (name, phone)\n   - Existing users: Login with email and password
   - Support Google OAuth login option
4. **Mode Confirmation**: System locks selected mode and displays confirmation message
5. **Device Linking Process**:
   - **Patient Device**: Generates unique 6-digit linking code and QR code, displays on screen with instructions
   - **Caregiver Device**: Provides input field to enter linking code or QR scanner to scan patient's code
   - **Link Establishment**: Upon successful code entry/scan, system establishes secure link between devices
   - **Link Confirmation**: Both devices display confirmation message with linked user details
6. **Dashboard Access**: User proceeds to respective dashboard (Patient Dashboard or Caregiver Dashboard)

**Proper Linking Mechanism**
- Patient device generates secure 6-digit alphanumeric code (e.g., A3X7K9) valid for 10 minutes
- QR code contains encrypted linking payload with patient_id, device_id, and timestamp
- Caregiver enters code or scans QR code in Caregiver Mode linking screen
- Backend validates code, checks expiration, and creates Device_Linking record
- Real-time WebSocket notification sent to both devices confirming successful link
- Patient device immediately updates caregiver count and list in UI
- Caregiver device adds patient to monitoring dashboard
- Link status synced to Redis cache and PostgreSQL database
- Support multiple caregiver links per patient (up to 5 caregivers)

### 2.3 Database Reset and Clean Start
- **Complete Data Wipe**: System supports full database reset to clear all existing data
- **Reset Trigger**: Admin-level API endpoint or database migration script to truncate all tables
- **Reset Scope**: Deletes all records from Patients, Caregivers, Device_Linking, Tasks, Contacts, Known_Faces, Face_Recognition_Events, Unknown_Encounters, Activity_Logs, Health_Metrics, Location_History, Alerts, Audit_Logs tables
- **Cache Clearing**: Redis cache flushed completely (all keys deleted)
- **Object Storage Cleanup**: All face photos, contact photos, and media files deleted from S3/Cloud Storage
- **Fresh Start**: After reset, system behaves as if newly deployed with no historical data
- **Testing Purpose**: Enables clean testing environment for first login flow validation

## 3. Patient Mode Features

### 3.1 Fully Functional Real-Time Face Detection and Recognition with Google ML Kit

**Technology Stack**
- **Face Detection**: Google ML Kit Face Detection API with real-time on-device processing
- **Face Recognition**: Google ML Kit Face Recognition with custom face encoding storage
- **Enhanced Analysis**: Google Cloud Vision AI for contextual scene understanding and attribute detection
- **Activity Recognition**: Google ML Kit Pose Detection for human posture and activity classification
\n**Continuous Real-Time Operation**
- Camera runs continuously in background with automatic restart on app launch
- Google ML Kit Face Detection processes every frame (15-30 FPS) with minimal latency
- Face detection results trigger immediate recognition pipeline
- System operates reliably in various lighting conditions with automatic exposure adjustment

**Complete Recognition Workflow**
- **Known Face Detected**:
  - Google ML Kit matches detected face against stored face encodings in local database
  - System retrieves person's name, relationship, and saved attributes from Contacts table
  - Google Cloud Vision AI analyzes current scene for contextual details (clothing color, accessories, background)
  - AI generates natural language description combining identity and context
  - Example output: Alan is watching you wearing green shirt or John your son is standing near the window wearing blue jacket
  - Whisper delivered via Bluetooth within 2 seconds of detection
  \n- **Unknown Face Detected**:
  - System identifies face as unrecognized (no match in database)
  - Google Cloud Vision AI analyzes person's appearance and behavior\n  - AI generates contextual warning with behavioral description
  - Example output: It is a new person he is watching you silently or Unknown person is approaching you wearing red hat
  - Whisper delivered immediately with prompt to save person\n  - Patient can tap Save button to add person with name, relationship, and auto-captured face photo

**AI-Enhanced Contextual Analysis**
- **Clothing Detection**: Google Cloud Vision AI detects clothing color, type, and style (e.g., green shirt, blue jacket, red dress)
- **Accessory Recognition**: Identifies glasses, hats, bags, jewelry, and other accessories
- **Behavioral Analysis**: Detects person's actions (watching, approaching, standing, sitting, walking, talking)\n- **Emotional Context**: Analyzes facial expressions for emotional state (smiling, neutral, concerned)\n- **Environmental Context**: Identifies background elements (indoor/outdoor, room type, nearby objects)
- **Natural Language Generation**: AI combines all detected attributes into natural, conversational descriptions
\n**Activity and Posture Detection**
- Google ML Kit Pose Detection identifies human body keypoints and skeleton structure
- Activity classification model determines current action: standing, sitting, walking, lying down, bending, reaching, waving, talking\n- Activity confidence score calculated for each detected action
- Activity information integrated into face recognition whisper output

**Face Saving and Storage**
- When saving unknown person, system auto-captures current face image from camera feed
- Face photo optimized for quality (lighting, angle, resolution) before storage
- Face encoding generated using Google ML Kit Face Recognition API
- Face encoding and photo stored in Known_Faces table with patient_id linkage
- Contact record created in Contacts table with name, relationship, photo_url, and face_encoding_id
- Newly saved face immediately available for recognition in future encounters (no delay)
- Face database synced to cloud backend for cross-device access

**Multi-Face Detection**
- System detects and processes multiple faces simultaneously in camera view
- Each face analyzed independently with separate recognition and contextual analysis
- Sequential whisper delivery for each recognized person with their respective attributes
- Example: Alan is watching you wearing green shirt, then Sarah your daughter is sitting beside you wearing yellow dress

**Performance and Robustness**
- Face detection latency: <500ms from frame capture to detection result
- Face recognition latency: <1.5 seconds from detection to identity match
- Contextual analysis latency: <2 seconds from detection to full description generation
- Total whisper delivery: <2.5 seconds from face detection to audio output
- Recognition accuracy: >95% for known faces with Google ML Kit optimized models
- False positive rate: <5% with confidence threshold tuning
- Operates reliably in indoor, outdoor, low light, and bright sunlight conditions
- Handles occlusions (glasses, masks, hats) with partial face matching
- Multi-angle detection (frontal, profile, tilted) with pose-invariant recognition

**Privacy and Security**
- All face processing happens on-device with Google ML Kit (no cloud upload for detection)
- Face encodings encrypted before cloud storage
- Contextual analysis uses Google Cloud Vision AI with secure API calls
- Face photos stored in encrypted S3/Cloud Storage buckets
- Compliance with biometric data regulations (GDPR Article 9, BIPA)\n\n### 3.2 Contact Management with Photo Support
- Patient can manually add contacts independently
- Contact attributes:\n  - Name (required)
  - Relationship (friend, family, doctor, neighbor, etc.)
  - Phone number (optional)
  - Notes (optional)
  - **Photo**: Patient can add photo through three methods:
    - Capture photo using camera in real-time with auto-focus and face detection
    - Select existing photo from device gallery
    - Use automatically captured face photo from face recognition encounter
- **Photo management**:
  - Photo preview displayed in contact card
  - Edit or replace photo anytime
  - Photo automatically processed for face recognition training and matching using Google ML Kit
  - Circular thumbnail display in contact list
  - High-quality photo storage with compression optimization
- All contact photos encrypted and stored securely in cloud storage
- Contact photos synced to caregiver device for reference
- Automatic face encoding generation for all contact photos to enable recognition

### 3.3 Bluetooth Whisper Audio System
- All guidance delivered exclusively through Bluetooth earphones in real-time
- No loudspeaker output except emergencies
- Whispered content includes:
  - Real-time face recognition results with AI-enhanced contextual descriptions (name, relationship, clothing, activity, behavior)
  - Task reminders\n  - Orientation information (day, date, location, identity)
  - Safety warnings
- Text-to-speech with calm, friendly, human-like tone
- Instant audio delivery with minimal delay (<500ms)
\n### 3.4 AI Companion\n- Proactive conversational AI providing frequent check-ins
- Core functions:
  - Identity reminders (who they are)\n  - Temporal orientation (current day, date, time)
  - Spatial orientation (current location)\n  - Recent social interactions recap with contextual details
  - Task status updates
- Natural language query support:\n  - What day is it?
  - Who am I?\n  - Did I take my medicine?
  - Who is this person? (triggers immediate face recognition with contextual analysis)
  - What is this person doing? (triggers activity detection and behavioral analysis)
- Context-aware responses using real-time camera data, task logs, activity recognition, face recognition events, and interaction history
- Reassuring, friendly, and simple communication style
\n### 3.5 Task and Reminder System
- Patient can independently add tasks\n- Task attributes:
  - Name\n  - Time
  - Optional location
- Bluetooth whisper reminders at scheduled times
- Task status options:
  - Completed
  - Skipped
- All status changes logged and synced to caregiver device
\n### 3.6 Location Tracking\n- Real-time GPS tracking with background updates
- Safe area boundary monitoring
- Automatic caregiver alert when patient exits safe zone
- Location data included in all alerts and logs
\n### 3.7 Health Awareness
- Integration with wearable or phone-based health metrics:\n  - Heart rate\n  - Step count
  - Inactivity duration
- Abnormal pattern detection\n- Automatic caregiver alerts when thresholds exceeded
\n### 3.8 Emergency Panic Button
- Large, always-accessible button on patient interface
- Single tap triggers:\n  - Immediate caregiver alert
  - Live location transmission
  - Optional camera snapshot or live feed
\n### 3.9 Automatic Logging
- Comprehensive logging of all activities:\n  - Real-time face recognition events with AI-enhanced contextual descriptions (timestamp, person name, recognition confidence, detected attributes, clothing, activity, behavior, face photo)
  - Task reminders and completions
  - Unknown person encounters with contextual analysis and face photos
  - Contact additions and photo updates
  - AI conversation transcripts
  - Location history\n  - Health data readings
- Real-time sync to caregiver device via cloud backend
\n### 3.10 Caregiver Link Status Display
- **Linked Caregivers Section**: Displays accurate count and list of all linked caregivers
- **Caregiver Details**: Shows caregiver name, link timestamp, and connection status (active/inactive)
- **Real-time Updates**: Caregiver list updates immediately when new caregiver links or existing link is removed
- **Visual Indicators**: Green checkmark for active links, gray icon for inactive links

## 4. Caregiver Mode Features

### 4.1 Dashboard\n- Real-time patient location map
- Task status overview
- Recent AI interactions summary
- Health indicators display
- Real-time face recognition event feed with AI-enhanced contextual descriptions and recognition accuracy metrics
- Unknown person encounter alerts with behavioral analysis\n- Contact list with photos\n\n### 4.2 Alert System
Instant alerts for:
- Emergency button activation
- Skipped tasks
- Unknown person detection with AI-generated behavioral description
- Abnormal health metrics
- Safe area boundary breach
- New face saved by patient
- New contact added with photo
- Face recognition or activity detection system errors or interruptions
- **Alert Delivery**: All alerts reliably delivered via push notifications, in-app notifications, and optional SMS/email
- **Alert Acknowledgment**: Caregivers can acknowledge alerts to mark as reviewed
- **Alert History**: Complete log of all alerts with timestamps and patient responses

### 4.3 Live Monitoring
- Optional live camera feed access (privacy-safeguarded)
- Environment viewing only when necessary
\n### 4.4 Logs and Reports
- Searchable history of:\n  - Real-time face recognition events with AI-enhanced contextual descriptions, accuracy scores, and detected attributes
  - Tasks\n  - People encounters with face photos and behavioral context
  - Contact additions and updates
  - Location records
  - AI interactions
  - Health data
- Filterable by date, type, and status
\n### 4.5 Patient Management
- Support for multiple patient linkages\n- Customizable settings:\n  - Reminder tones
  - Reminder frequency
  - Alert sensitivity levels
  - Face recognition confidence threshold (adjustable 0.5-0.8)
  - Activity detection sensitivity\n\n### 4.6 Enhanced Contact Management
- **Full CRUD Operations**: Caregivers can add, edit, and delete patient contacts remotely
- **Contact Addition**: Add new contacts with name, relationship, phone, notes, and photo (camera/gallery)
- **Contact Editing**: Modify existing contact details including photo replacement
- **Contact Deletion**: Remove contacts with confirmation prompt
- **Photo Management**: Upload, replace, or remove contact photos
- **Real-time Sync**: All contact changes immediately synced to patient device
- **Face Encoding Update**: Automatic face encoding regeneration using Google ML Kit when contact photo is updated
- **Audit Trail**: Log all caregiver-initiated contact changes with timestamp and caregiver ID

### 4.7 Enhanced Task Management
- **Full CRUD Operations**: Caregivers can create, edit, and delete patient tasks remotely
- **Task Creation**: Add new tasks with name, time, location, and recurrence options
- **Task Editing**: Modify task details including time, location, and reminder settings
- **Task Deletion**: Remove tasks with confirmation prompt
- **Bulk Operations**: Create multiple tasks at once (e.g., daily medication reminders)
- **Task Templates**: Pre-defined task templates for common activities (medication, meals, appointments)
- **Real-time Sync**: All task changes immediately synced to patient device
- **Reminder Override**: Caregivers can manually trigger task reminders
- **Audit Trail**: Log all caregiver-initiated task changes with timestamp and caregiver ID
\n### 4.8 Enhanced Alert Configuration
- **Custom Alert Rules**: Caregivers can define custom alert conditions (e.g., alert if patient inactive for 2 hours)
- **Alert Channels**: Configure alert delivery methods (push, SMS, email) per alert type
- **Alert Priority**: Set priority levels (critical, high, medium, low) for different alert types
- **Quiet Hours**: Define time periods when non-critical alerts are suppressed
- **Alert Escalation**: Automatic escalation to secondary caregivers if primary caregiver doesn't acknowledge within set time
- **Geofence Alerts**: Create multiple safe zones with custom alert triggers
- **Health Threshold Alerts**: Set custom thresholds for heart rate, steps, inactivity duration\n
## 5. Backend Architecture

### 5.1 Microservices Structure
\n**Authentication Service**
- User registration and login
- Device authentication and linking
- JWT token management
- Google OAuth 2.0 support
\n**Face Recognition Service (Google ML Kit Integration)**
- Real-time face detection using Google ML Kit Face Detection API
- Face encoding generation using Google ML Kit Face Recognition\n- Face matching against database with configurable confidence thresholds
- Hybrid processing (on-device Google ML Kit + cloud backup)
- Multi-face detection and batch processing
- Face quality assessment and optimal photo selection
- Automatic face encoding generation for all new photos
- Face database indexing for fast retrieval
- Recognition performance monitoring and optimization

**Contextual Analysis Service (Google Cloud Vision AI)**
- Scene understanding and object detection
- Clothing and accessory recognition
- Behavioral analysis and activity classification
- Emotional context detection
- Environmental context identification\n- Natural language description generation
- Integration with face recognition pipeline for enhanced output
\n**Activity Recognition Service (Google ML Kit Pose Detection)**\n- Real-time human pose estimation using Google ML Kit Pose Detection API
- Activity classification (standing, sitting, walking, lying down, bending, reaching, waving, talking)
- Pose keypoint tracking and skeleton structure analysis
- Multi-person activity tracking
- Temporal activity analysis for continuous actions
- Activity history logging and pattern recognition
- Performance optimization for real-time processing
\n**AI Companion Service**
- Natural language processing\n- Context-aware response generation
- Conversation history management
- Integration with GPT-4 or similar LLM
\n**Task Management Service**
- Task CRUD operations
- Reminder scheduling and delivery
- Task status tracking\n- Push notification integration
- **Caregiver Task Management**: API endpoints for caregiver-initiated task operations
- **Task Sync Engine**: Real-time task synchronization between caregiver and patient devices
\n**Location Service**
- Real-time GPS data processing
- Geofencing and safe area monitoring
- Location history storage\n- Alert triggering for boundary breaches
\n**Health Monitoring Service**\n- Wearable device integration
- Health metrics collection and analysis
- Anomaly detection algorithms
- Alert generation for abnormal patterns
\n**Media Storage Service**
- Face photo and contact photo upload
- Image compression and optimization
- CDN integration for fast delivery
- Secure encrypted storage
- Automatic face encoding extraction from photos using Google ML Kit

**Real-Time Sync Service**
- WebSocket connections for live updates
- Event-driven data synchronization
- Priority queue for critical events
- Conflict resolution mechanisms
- **Link Status Sync**: Real-time propagation of caregiver link status to patient devices\n- **Contact Sync**: Bidirectional contact synchronization with conflict resolution
- **Task Sync**: Bidirectional task synchronization with timestamp-based conflict resolution

**Alert and Notification Service**
- Multi-channel alert delivery (push, SMS, email)\n- Alert priority management
- Delivery confirmation tracking
- Alert history logging
- **Delivery Reliability**: Retry mechanism with exponential backoff for failed deliveries
- **Acknowledgment Tracking**: Track caregiver alert acknowledgment status
- **Escalation Engine**: Automatic alert escalation to secondary caregivers\n
**Contact Management Service**
- Contact CRUD operations with caregiver authorization
- Photo upload and processing
- Face encoding generation and update using Google ML Kit
- Real-time contact synchronization
- Audit logging for caregiver actions
\n**Database Reset Service**
- Admin API endpoint for complete database wipe
- Truncate all tables in PostgreSQL
- Flush all Redis cache keys
- Delete all objects from S3/Cloud Storage
- Reset auto-increment sequences
- Logging of reset operations for audit trail

### 5.2 API Gateway
- RESTful API endpoints\n- GraphQL support for complex queries
- Rate limiting and throttling
- API versioning
- Request validation and sanitization
\n### 5.3 Message Queue
- RabbitMQ or Apache Kafka for asynchronous processing
- Event streaming for real-time updates
- Dead letter queue for failed messages
- Message persistence and replay
\n## 6. Cloud Database Structure

### 6.1 Database Technology
- **Primary Database**: PostgreSQL for relational data
- **Cache Layer**: Redis for session management and real-time data
- **Document Store**: MongoDB for logs and unstructured data
- **Object Storage**: AWS S3 or Google Cloud Storage for images\n- **Search Engine**: Elasticsearch for log searching and analytics
\n### 6.2 Core Tables (PostgreSQL)
\n**Patients**
- patient_id (UUID, primary key)
- name (VARCHAR)\n- email (VARCHAR, unique)
- device_id (VARCHAR, unique)
- safe_area_coordinates (JSONB)
- health_thresholds (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
\n**Caregivers**\n- caregiver_id (UUID, primary key)
- name (VARCHAR)
- email (VARCHAR, unique)
- phone (VARCHAR)
- device_id (VARCHAR, unique)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**Device_Linking**
- link_id (UUID, primary key)\n- patient_device_id (VARCHAR, foreign key)
- caregiver_device_id (VARCHAR, foreign key)
- link_code (VARCHAR, unique)
- link_timestamp (TIMESTAMP)
- status (ENUM: active, inactive)\n- expires_at (TIMESTAMP)
\n**Tasks**
- task_id (UUID, primary key)\n- patient_id (UUID, foreign key)
- task_name (VARCHAR)
- scheduled_time (TIMESTAMP)
- location (VARCHAR, nullable)
- status (ENUM: pending, completed, skipped)
- completion_time (TIMESTAMP, nullable)
- created_at (TIMESTAMP)
- **created_by** (ENUM: patient, caregiver)
- **caregiver_id** (UUID, foreign key, nullable)
- **last_modified_by** (ENUM: patient, caregiver)
- **last_modified_at** (TIMESTAMP)

**Contacts**
- contact_id (UUID, primary key)\n- patient_id (UUID, foreign key)
- contact_name (VARCHAR)
- relationship (VARCHAR)
- phone_number (VARCHAR, nullable)
- notes (TEXT, nullable)
- photo_url (VARCHAR, nullable)
- photo_source (ENUM: camera, gallery, face_recognition)
- face_encoding_id (UUID, foreign key, nullable)
- added_date (TIMESTAMP)
- last_updated (TIMESTAMP)
- **created_by** (ENUM: patient, caregiver)
- **caregiver_id** (UUID, foreign key, nullable)
- **last_modified_by** (ENUM: patient, caregiver)
- **last_modified_at** (TIMESTAMP)
\n**Known_Faces**
- face_id (UUID, primary key)\n- patient_id (UUID, foreign key)
- person_name (VARCHAR)
- relationship_note (VARCHAR, nullable)
- face_encoding (BYTEA)\n- face_photo_url (VARCHAR)\n- contact_id (UUID, foreign key, nullable)
- encoding_version (VARCHAR)
- quality_score (FLOAT)
- added_date (TIMESTAMP)
- last_recognized_date (TIMESTAMP, nullable)
- recognition_count (INTEGER, default 0)
\n**Face_Recognition_Events**
- event_id (UUID, primary key)
- patient_id (UUID, foreign key)
- face_id (UUID, foreign key, nullable)
- timestamp (TIMESTAMP)
- location (GEOGRAPHY)
- recognition_confidence (FLOAT)
- detected_activity (VARCHAR)
- activity_confidence (FLOAT)
- contextual_description (TEXT)
- clothing_attributes (JSONB)
- behavioral_analysis (JSONB)
- whisper_delivered (BOOLEAN)
- processing_time_ms (INTEGER)
- created_at (TIMESTAMP)
\n**Unknown_Encounters**
- encounter_id (UUID, primary key)
- patient_id (UUID, foreign key)\n- timestamp (TIMESTAMP)
- location (GEOGRAPHY)
- face_snapshot_url (VARCHAR)
- detected_activity (VARCHAR)
- activity_confidence (FLOAT)
- contextual_description (TEXT)
- behavioral_analysis (JSONB)
- patient_action (ENUM: saved, ignored)\n- saved_as_face_id (UUID, foreign key, nullable)\n- saved_as_contact_id (UUID, foreign key, nullable)
- created_at (TIMESTAMP)
\n**Activity_Logs**
- activity_log_id (UUID, primary key)
- patient_id (UUID, foreign key)
- face_id (UUID, foreign key, nullable)
- timestamp (TIMESTAMP)
- detected_activity (VARCHAR)
- activity_confidence (FLOAT)
- duration_seconds (INTEGER)
- location (GEOGRAPHY)
- created_at (TIMESTAMP)

**Health_Metrics**
- metric_id (UUID, primary key)\n- patient_id (UUID, foreign key)
- timestamp (TIMESTAMP)
- heart_rate (INTEGER, nullable)
- steps (INTEGER, nullable)
- inactivity_duration (INTEGER, nullable)
- created_at (TIMESTAMP)
\n**Location_History**
- location_id (UUID, primary key)
- patient_id (UUID, foreign key)
- timestamp (TIMESTAMP)\n- latitude (DECIMAL)
- longitude (DECIMAL)\n- accuracy (FLOAT)
- created_at (TIMESTAMP)

**Alerts**
- alert_id (UUID, primary key)
- patient_id (UUID, foreign key)\n- caregiver_id (UUID, foreign key)
- alert_type (ENUM: emergency, task_skipped, unknown_person, health_anomaly, geofence_breach, system_error)
- alert_priority (ENUM: critical, high, medium, low)
- alert_message (TEXT)
- alert_data (JSONB)
- timestamp (TIMESTAMP)
- delivery_status (ENUM: pending, delivered, failed, acknowledged)
- delivery_channels (ARRAY: push, sms, email)
- acknowledged_at (TIMESTAMP, nullable)
- acknowledged_by (UUID, foreign key, nullable)
- created_at (TIMESTAMP)
\n**Audit_Logs**
- audit_id (UUID, primary key)
- patient_id (UUID, foreign key)
- caregiver_id (UUID, foreign key, nullable)
- action_type (ENUM: contact_add, contact_edit, contact_delete, task_add, task_edit, task_delete, alert_config, database_reset)
- entity_type (ENUM: contact, task, alert, system)
- entity_id (UUID)\n- old_value (JSONB, nullable)
- new_value (JSONB)\n- timestamp (TIMESTAMP)
- created_at (TIMESTAMP)\n
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
- Active face encodings: `faces:{patient_id}` (indexed for fast lookup)
- Recent AI context: `ai_context:{patient_id}`
- Alert queue: `alerts:{caregiver_id}`
- Face recognition performance metrics: `face_metrics:{patient_id}`
- Activity detection cache: `activity:{patient_id}`
- **Link status cache**: `links:{patient_id}` (caregiver count and details)
- **Pending alerts**: `pending_alerts:{caregiver_id}` (unacknowledged alerts)

## 7. AI Integration\n
### 7.1 Google ML Kit Face Detection and Recognition

**Technology Stack**
- **Face Detection**: Google ML Kit Face Detection API with on-device processing
- **Face Recognition**: Google ML Kit Face Recognition with custom face encoding storage
- **Face Encoding**: 128-dimensional face embeddings generated by Google ML Kit
- **Matching Algorithm**: Cosine similarity with configurable threshold (default 0.6, adjustable 0.5-0.8)\n- **Training**: Continuous learning with new face additions and automatic model updates
- **Quality Assessment**: Automatic face quality scoring (blur detection, lighting assessment, angle validation)

**Hybrid Processing (Production-Ready)**
- **On-Device**: Google ML Kit Face Detection and encoding generation (iOS: ML Kit for iOS, Android: ML Kit for Android)
- **Cloud**: Face matching against full database with GPU acceleration, model updates, batch processing
- **Fallback**: Automatic cloud processing if on-device fails, with seamless transition
- **Synchronization**: Real-time face database sync between device and cloud

**Performance Optimization**
- Face encoding caching in Redis with TTL management
- Batch processing for multiple faces with parallel execution
- GPU acceleration on cloud servers (NVIDIA T4 or better)
- Model quantization for mobile devices (INT8 precision)
- Face database indexing with FAISS for fast similarity search
- Automatic model pruning and optimization
- Background processing queue for non-critical tasks
\n**Robustness Features**
- Multi-angle face detection (frontal, profile, tilted)
- Lighting normalization and enhancement
- Occlusion handling (glasses, masks, hats)
- Age-invariant recognition\n- Expression-invariant recognition
- Automatic retry on recognition failure
- Confidence score calibration
\n**Continuous Improvement**
- Automatic model retraining with new face data
- A/B testing for model updates
- Performance monitoring and alerting
- User feedback integration for accuracy improvement
\n### 7.2 Google Cloud Vision AI for Contextual Analysis

**Technology Stack**
- **Scene Understanding**: Google Cloud Vision API Object Detection and Label Detection
- **Clothing Recognition**: Custom model trained on fashion datasets integrated with Vision API
- **Behavioral Analysis**: Combination of Pose Detection and Vision API for action recognition
- **Natural Language Generation**: GPT-4 or similar LLM for description synthesis
\n**Contextual Analysis Pipeline**
1. Face detected by Google ML Kit
2. Face recognized and matched to known person (or identified as unknown)
3. Current camera frame sent to Google Cloud Vision API
4. Vision API returns detected objects, labels, colors, and scene attributes
5. Clothing detection model identifies clothing items and colors
6. Pose Detection API provides activity classification\n7. All attributes combined and sent to NLG model\n8. NLG model generates natural language description
9. Description delivered via Bluetooth whisper
\n**Detected Attributes**
- **Clothing**: Color (green, blue, red, yellow, etc.), type (shirt, jacket, dress, pants, etc.), style (casual, formal, sporty)\n- **Accessories**: Glasses, hats, bags, jewelry, watches\n- **Activities**: Watching, approaching, standing, sitting, walking, talking, waving, bending, reaching\n- **Emotions**: Smiling, neutral, concerned, surprised (based on facial expression analysis)
- **Environment**: Indoor/outdoor, room type (living room, kitchen, bedroom), nearby objects (table, chair, door)

**Natural Language Output Examples**
- Known person: Alan is watching you wearing green shirt
- Known person with activity: John your son is standing near the window wearing blue jacket
- Unknown person: It is a new person he is watching you silently
- Unknown person with context: Unknown person is approaching you wearing red hat
- Multiple people: Alan is watching you wearing green shirt, then Sarah your daughter is sitting beside you wearing yellow dress

**Performance Optimization**
- Cloud Vision API calls batched for multiple detections
- Caching of recent scene analysis results
- Asynchronous processing to avoid blocking whisper delivery
- Fallback to basic description if Vision API fails

### 7.3 Google ML Kit Pose Detection for Activity Recognition

**Technology Stack**
- **Pose Estimation**: Google ML Kit Pose Detection API for real-time skeleton tracking
- **Activity Classification**: Custom LSTM model trained on activity datasets
- **Action Recognition**: Temporal analysis of pose keypoints for continuous action detection
- **Model Framework**: TensorFlow Lite for mobile, TensorFlow Serving for cloud\n
**Supported Activities**
- Standing (static upright posture)
- Sitting (seated posture with bent knees)
- Walking (leg movement with forward motion)
- Lying down (horizontal body position)
- Bending (torso flexion)\n- Reaching (arm extension)\n- Waving (repetitive arm motion)
- Talking (mouth movement and facial animation)
\n**Hybrid Processing**
- **On-Device**: Real-time pose estimation using Google ML Kit Pose Detection
- **Cloud**: Complex activity recognition and temporal analysis
- **Fallback**: Cloud processing for ambiguous activities
\n**Performance Optimization**
- Lightweight pose estimation models (MobileNet backbone)
- Activity classification caching for repeated actions
- GPU acceleration for cloud processing
- Frame sampling (process every 3-5 frames) to reduce computational load
- Activity smoothing to avoid jittery detection

**Robustness Features**
- Multi-person activity tracking with person ID association
- Occlusion handling (partial body visibility)
- View-invariant recognition (front, side, back views)
- Lighting-invariant detection
- Activity confidence scoring (0.0-1.0)
- Temporal filtering to reduce false positives

**Integration with Face Recognition**
- Activity detection synchronized with face recognition
- Combined output: identity + activity + contextual attributes in single whisper
- Activity context stored with face recognition events
- Multi-person tracking with face-activity pairing

### 7.4 Conversational AI\n
**Technology Stack**\n- **LLM**: OpenAI GPT-4 or Google PaLM 2\n- **Speech-to-Text**: Google Cloud Speech-to-Text or Whisper API
- **Text-to-Speech**: Google Cloud TTS or Amazon Polly
- **Context Management**: Custom vector database for conversation history

**AI Prompt Engineering**
- System prompt: You are a compassionate AI companion for an Alzheimer's patient. Provide clear, simple, reassuring responses. Use patient's name and current context including detected activities and contextual descriptions.
- Context injection: Recent tasks, location, time, recent interactions, face recognition events with contextual attributes, activity detection results\n- Response formatting: Short sentences, avoid complex vocabulary\n\n**Real-Time Processing**
- WebSocket connection for instant responses
- Streaming responses for natural conversation flow
- Context caching for faster follow-up queries
\n## 8. Security and Privacy

### 8.1 Data Protection
- End-to-end encryption (AES-256) for data at rest and in transit
- TLS 1.3 for all API communications
- Face encoding data, face photos, contact photos, and activity logs encrypted in cloud storage
- Database encryption at rest\n- Regular security audits and penetration testing

### 8.2 Authentication and Authorization
- Multi-factor authentication for caregiver accounts
- Device fingerprinting for patient devices
- Role-based access control (RBAC)
- JWT tokens with short expiration (15 minutes)
- Refresh token rotation
- Google OAuth 2.0 integration for secure login
- **Caregiver Permission System**: Granular permissions for contact and task management operations

### 8.3 Privacy Safeguards
- HIPAA compliance for health data\n- GDPR compliance for EU users
- Data anonymization for analytics
- User consent management
- Right to deletion and data export\n- Audit logs for all data access
\n### 8.4 Camera and Media Privacy
- Live camera feed access requires explicit caregiver justification
- All monitoring activities logged for transparency
- Face photos, contact photos, and activity data stored with consent
- Automatic deletion of old face snapshots and activity logs (90 days)
- No third-party access to media files
- Face recognition and activity detection processing compliant with biometric data regulations

## 9. Technical Implementation Requirements

### 9.1 Frontend Technology Stack

**iOS**
- Swift 5.9+
- SwiftUI for UI components
- Google ML Kit for iOS for face detection, recognition, and pose detection
- AVFoundation for camera access with real-time processing
- Vision framework for supplementary face and pose detection
- Core Location for GPS tracking
- HealthKit for health data integration

**Android**\n- Kotlin 1.9+
- Jetpack Compose for UI components
- Google ML Kit for Android for face detection, recognition, and pose detection
- CameraX for camera access with real-time processing
- Fused Location Provider for GPS tracking
- Google Fit API for health data integration

**Shared Libraries**
- Retrofit/Alamofire for API calls
- Socket.IO for real-time communication
- SQLite for local data caching
- Glide/Kingfisher for image loading
- ONNX Runtime for cross-platform model deployment (if needed)

### 9.2 Backend Technology Stack

**Core Framework**
- Node.js with Express.js or Python with FastAPI
- TypeScript for type safety
\n**AI Services**
- Google ML Kit SDK for face detection and recognition
- Google Cloud Vision API for contextual analysis
- Google ML Kit Pose Detection for activity recognition
- OpenAI API for conversational AI
- Google Cloud AI Platform for model hosting
- FAISS for face embedding similarity search

**Infrastructure**
- Docker for containerization
- Kubernetes for orchestration
- Nginx for load balancing
- AWS/GCP/Azure for cloud hosting
\n**Monitoring and Logging**
- Prometheus for metrics\n- Grafana for visualization\n- ELK Stack (Elasticsearch, Logstash, Kibana) for log management
- Sentry for error tracking
\n### 9.3 Required Outputs
- Complete app screen list and navigation flow
- UI wireframes for phone-screen interface
- Feature-wise code structure
- Fully functional real-time face recognition and activity detection pipeline architecture with Google ML Kit integration
- Contextual analysis pipeline with Google Cloud Vision AI integration
- Contact management system with photo capture and storage
- AI logic flow and prompt handling system
- Database schema and real-time sync logic
- Camera, face recognition, and activity detection integration logic with performance optimization
- Face photo and contact photo capture and storage system
- Photo gallery integration and image picker implementation
- Bluetooth audio whisper system implementation with low-latency delivery
- Alert and notification system architecture
- API documentation (OpenAPI/Swagger)\n- Deployment scripts and CI/CD pipeline
- Infrastructure as Code (Terraform/CloudFormation)
- Face recognition and activity detection accuracy testing and validation reports
- **First login to dashboard complete user flow documentation**
- **Device linking mechanism detailed specification**
- **Database reset API documentation and testing procedures**
- **Caregiver contact and task management API documentation**
- **Link status synchronization flow diagram**
- **Alert delivery reliability testing report**
\n### 9.4 Integration Points
- Google ML Kit SDK for face detection, recognition, and pose detection
- Google Cloud Vision API for contextual scene analysis
- OpenAI GPT-4 API for conversational AI
- Twilio for SMS alerts
- SendGrid for email notifications
- Firebase Cloud Messaging for push notifications
- Stripe for payment processing (if subscription model)
- Apple HealthKit and Google Fit APIs\n- Mapbox or Google Maps for location visualization
\n### 9.5 Performance Requirements
- Face detection latency: <500ms from frame capture to detection result
- Face recognition latency: <1.5 seconds from detection to identity match
- Contextual analysis latency: <2 seconds from detection to full description generation
- Total whisper delivery: <2.5 seconds from face detection to audio output
- Activity detection latency: <1 second from pose estimation to classification
- Combined face + activity + contextual recognition: <3 seconds total processing time
- Face recognition accuracy: >95% for known faces with Google ML Kit, <5% false positive rate
- Activity detection accuracy: >90% for common activities (standing, sitting, walking)
- Camera processing: 15-30 FPS for smooth real-time recognition
- Face photo and contact photo capture: instant snapshot with auto-focus (<1 second)
- Photo upload and sync: <5 seconds for standard resolution images
- Bluetooth audio delay: <500ms\n- API response time: <200ms for 95th percentile
- Database query time: <100ms for simple queries
- Real-time sync latency: <3 seconds for critical events
- System uptime: 99.9% availability
- Concurrent users: Support 10,000+ active patients
- Face database scalability: Support 100+ faces per patient with fast lookup
- Activity detection frame rate: 10-15 FPS for real-time tracking
- **Link status sync**: <3 seconds from caregiver link to patient display update
- **Alert delivery**: <5 seconds from trigger to caregiver notification (95th percentile)
- **Contact/task sync**: <3 seconds from caregiver action to patient device update
- **Database reset execution**: <30 seconds for complete data wipe

## 10. Design Style\n
### 10.1 Visual Design\n- **Color Scheme**: Calming blues (#4A90E2) and soft greens (#7ED321) for patient mode, professional grays (#F5F5F5) and whites (#FFFFFF) for caregiver mode
- **Typography**: Large San Francisco/Roboto fonts (24-32px) with high contrast for patient interface, standard 14-18px for caregiver dashboard
- **Layout**: Card-based layout with 16px padding for patient mode, grid-based dashboard with 8px spacing for caregiver mode
- **Icons**: Material Design icons with text labels for patient mode, standard system icons for caregiver mode
- **Photo Display**: Circular thumbnail images (48px diameter) with 2px border for contact list, larger square preview (200x200px) with 8px rounded corners in contact details, full-screen preview with pinch-to-zoom\n- **Photo Capture UI**: Clean camera interface with large circular capture button (80px), gallery access button, and preview confirmation screen with retake/confirm options
- **Real-time Indicators**: Subtle pulsing blue dot (8px) for active face recognition, green checkmark for whisper delivery confirmation, accuracy percentage display for recognized faces, activity badge (e.g., Sitting, Standing) with confidence indicator
- **Activity Visualization**: Small activity icon overlays on recognized faces in caregiver dashboard, color-coded activity badges (blue for standing, green for sitting, orange for walking)\n- **Link Status Display**: Green badge with caregiver count in patient mode header, expandable list showing caregiver names and link timestamps
- **Contextual Attribute Display**: Clothing and accessory tags displayed in face recognition event logs with color-coded labels

### 10.2 Interaction Design
- Large touch targets for patient interface (minimum 60px)\n- Smooth fade animations (300ms duration) to avoid confusion
- Persistent emergency button with red background (#FF3B30) and high visibility
- Minimal navigation depth for patient mode (maximum 2 levels)
- Photo capture flow: tap add photo → choose camera/gallery → capture/select → preview → confirm/retake → save
- Face photo preview in save dialog with confirm/retake options
- Contact photo editing with replace/remove options
- Comprehensive filtering and search for caregiver logs
- Instant visual feedback for photo save actions with thumbnail confirmation
- Real-time status indicators for camera, face recognition, and activity detection systems with accuracy metrics
- Activity detection feedback: subtle visual overlay showing detected activity on camera preview
- Pinch-to-zoom for photo preview in contact details
- Pull-to-refresh for caregiver dashboard\n- Swipe gestures for navigation in patient mode
- Visual feedback for face recognition events (subtle border highlight around recognized faces with activity label and contextual attributes)
- **Caregiver contact management**: Floating action button for add contact, swipe-to-edit/delete in contact list\n- **Caregiver task management**: Drag-and-drop task reordering, quick-add task button with time picker
- **Alert acknowledgment**: Swipe-to-acknowledge gesture, tap for details\n- **First launch flow**: Step-by-step wizard with progress indicator for mode selection, account creation, and device linking

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
- GPU instances for AI model inference (NVIDIA T4 or better)
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
- Face recognition and activity detection accuracy monitoring
- **Alert delivery monitoring**: Track alert delivery success rate and latency
- **Sync performance monitoring**: Monitor link status, contact, and task sync latency

**Infrastructure Monitoring**
- Server health checks
- Database performance metrics
- Network latency monitoring
- Storage usage tracking
\n**Alerting**
- PagerDuty/Opsgenie integration\n- Slack/Email notifications
- Escalation policies
- Incident response playbooks
\n### 11.4 Backup and Disaster Recovery
- Automated daily database backups
- Point-in-time recovery capability
- Cross-region replication
- Disaster recovery plan with RTO <4 hours, RPO <1 hour
- Regular disaster recovery drills

## 12. Compliance and Regulations

### 12.1 Healthcare Compliance
- HIPAA compliance for US deployment
- HITECH Act requirements\n- FDA medical device classification assessment
- Clinical validation and testing

### 12.2 Data Privacy Regulations
- GDPR compliance for EU users
- CCPA compliance for California users
- Data processing agreements
- Privacy impact assessments
- Biometric data regulations compliance (BIPA, GDPR Article 9)

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
- Accessibility testing\n- Face recognition accuracy testing with diverse datasets using Google ML Kit
- Activity detection accuracy testing with various scenarios (different lighting, angles, occlusions)\n- Contextual analysis accuracy testing with Google Cloud Vision API
- **First login flow testing**: Validate complete user journey from app launch to dashboard access
- **Device linking testing**: Test QR code generation, code validation, link establishment, and real-time sync
- **Database reset testing**: Verify complete data wipe and clean start functionality
- **Link status sync testing**: Verify real-time propagation of caregiver links to patient devices
- **Alert delivery testing**: Validate multi-channel alert delivery reliability and latency
- **Contact/task sync testing**: Test bidirectional synchronization with conflict scenarios
\n### 13.2 Testing Tools
- Jest/XCTest for unit testing
- Postman/Newman for API testing
- Selenium/Appium for e2e testing
- JMeter/Gatling for performance testing
- OWASP ZAP for security testing
- Custom face recognition and activity detection validation framework with Google ML Kit
\n## 14. Cost Estimation

### 14.1 Infrastructure Costs (Monthly)
- Cloud hosting: $2,500-6,000\n- Database services: $1,000-2,000
- AI API calls (OpenAI, Google Cloud Vision, Google ML Kit): $2,500-5,000
- CDN and storage: $500-1,000\n- Monitoring and logging: $300-500
- **Total**: $6,800-14,500/month

### 14.2 Development Costs (One-Time)
- Frontend development (iOS + Android): 7-9 months
- Backend development: 5-7 months
- AI integration and training (Google ML Kit face + activity + Cloud Vision contextual analysis): 3-4 months
- Testing and QA: 2-3 months
- Design and UX: 1-2 months
- **Total**: 18-25 months development time

## 15. Roadmap and Milestones

### Phase 1 (Months 1-3): Foundation
- Backend architecture setup
- Database schema implementation
- Authentication and device linking with Google OAuth
- Basic patient and caregiver UI\n- **Complete first login flow implementation**
- **Device linking mechanism with QR code and code validation**
- **Database reset functionality**
- **Link status sync implementation**
\n### Phase 2 (Months 4-7): Core Features
- Fully functional face detection and recognition with Google ML Kit
- Activity detection integration with Google ML Kit Pose Detection
- Contextual analysis integration with Google Cloud Vision AI
- Contact management with photos\n- Task and reminder system
- Location tracking\n- **Caregiver contact and task management APIs**
\n### Phase 3 (Months 8-11): AI and Real-Time\n- AI companion integration\n- Real-time sync implementation
- Bluetooth audio system\n- Alert and notification system
- Combined face + activity + contextual recognition whisper delivery
- Natural language description generation
- **Alert delivery reliability improvements**

### Phase 4 (Months 12-15): Advanced Features
- Health monitoring integration
- Live camera feed
- Advanced analytics and reporting
- Performance optimization
- Multi-person activity tracking with contextual attributes
- **Enhanced caregiver management features**
\n### Phase 5 (Months 16-18): Testing and Refinement
- Comprehensive testing\n- Security audits
- Usability testing with real users
- Bug fixes and optimization
- Face recognition and activity detection accuracy validation with Google ML Kit
- Contextual analysis accuracy validation with Google Cloud Vision API
- **First login flow and device linking testing**
- **Database reset testing**
- **Link status and alert delivery testing**

### Phase 6 (Months 19-21): Compliance and Launch
- HIPAA/GDPR compliance certification
- App store submission
- Marketing and user onboarding
- Production deployment
\n### Phase 7 (Months 22+): Post-Launch
- User feedback collection
- Feature enhancements\n- Scale infrastructure
- Continuous improvement
- Face recognition and activity detection model updates and optimization with Google ML Kit
- Contextual analysis model improvements with Google Cloud Vision API
\n## 16. Updates and Improvements Summary

### 16.1 Database Reset and Clean Start
- **Implementation**: Complete database wipe functionality to clear all existing data
- **Scope**: Truncate all PostgreSQL tables, flush Redis cache, delete S3/Cloud Storage objects
- **Purpose**: Enable clean testing environment for first login flow validation
- **API**: Admin-level endpoint for triggering database reset with audit logging

### 16.2 Complete First Login Flow
- **Welcome Screen**: App launch with RemZy branding\n- **Mode Selection**: User chooses Patient Mode or Caregiver Mode
- **Account Creation/Login**: Email/password registration or Google OAuth login
- **Mode Lock**: Selected mode locked and confirmed
- **Device Linking**: Patient generates code/QR, caregiver enters/scans code, link established
- **Dashboard Access**: User proceeds to respective dashboard
- **Testing**: End-to-end flow validation from app launch to dashboard\n
### 16.3 Proper Device Linking Mechanism
- **Patient Side**: Generate 6-digit alphanumeric code and QR code, display with instructions
- **Caregiver Side**: Input field for code entry or QR scanner\n- **Link Establishment**: Backend validates code, creates Device_Linking record, sends WebSocket notifications
- **Real-time Sync**: Both devices receive link confirmation within 3 seconds
- **UI Update**: Patient device displays caregiver count and list, caregiver device adds patient to dashboard
- **Multiple Links**: Support up to 5 caregivers per patient

### 16.4 Google ML Kit Integration for Face Detection and Recognition
- **Face Detection**: Google ML Kit Face Detection API with on-device real-time processing
- **Face Recognition**: Google ML Kit Face Recognition with 128-dimensional face embeddings
- **Hybrid Processing**: On-device detection and encoding, cloud matching and storage
- **Performance**: <500ms face detection, <1.5s face recognition, >95% accuracy
- **Robustness**: Multi-angle detection, lighting normalization, occlusion handling

### 16.5 AI-Enhanced Contextual Analysis with Google Cloud Vision
- **Scene Understanding**: Google Cloud Vision API for object detection and label detection
- **Clothing Recognition**: Custom model integrated with Vision API for clothing color and type detection
- **Behavioral Analysis**: Combination of Pose Detection and Vision API for action recognition
- **Natural Language Generation**: GPT-4 synthesis of all detected attributes into conversational descriptions
- **Output Examples**: \n  - Known person: Alan is watching you wearing green shirt
  - Unknown person: It is a new person he is watching you silently
- **Performance**: <2s contextual analysis, <2.5s total whisper delivery

### 16.6 Face Saving and Recognition Workflow
- **Unknown Face Detection**: System identifies unrecognized face and delivers contextual warning
- **Save Prompt**: Patient can tap Save button to add person\n- **Auto-Capture**: System automatically captures current face image with optimal quality
- **Face Encoding**: Google ML Kit generates face encoding from captured photo
- **Database Storage**: Face encoding and photo stored in Known_Faces and Contacts tables
- **Immediate Availability**: Newly saved face instantly available for recognition in future encounters
- **Sync**: Face data synced to cloud backend for cross-device access