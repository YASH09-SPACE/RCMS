# 🚀 RoadCare Management System (RCMS) - Complete System Design

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [User Roles & Hierarchical Structure](#user-roles)
4. [Complete Workflow](#complete-workflow)
5. [Database Design](#database-design)
6. [MVC Architecture](#mvc-architecture)
7. [API Design](#api-design)
8. [Notification System](#notification-system)
9. [Gujarat Location Hierarchy](#gujarat-location-hierarchy)
10. [Advanced Features](#advanced-features)

---

## 📌 Project Overview

### 1.1 Project Title
**RoadCare Management System (RCMS)** - Gujarat State

### 1.2 Objective
A hierarchical complaint management system for Gujarat where:
- Citizens can report civic issues (potholes, street lights, garbage, etc.)
- Complaints flow through a 3-tier administrative structure
- Physical workers (contractors) execute ground-level work
- Real-time tracking and notifications at every level

### 1.3 Scope
- **Geographic Coverage**: Gujarat State only
- **Districts**: All 33 districts of Gujarat
- **Wards**: Municipal corporation wards within districts
- **Issue Types**: Roads, Street Lights, Drainage, Garbage, Water Supply, Parks, etc.

---

## 👥 User Roles & Hierarchical Structure

### 1. 👤 **Citizen Panel**
**Purpose**: Report and track civic issues

**Capabilities**:
- Register/Login with mobile verification
- Raise complaint with:
  - Issue type (dropdown)
  - Description
  - Photo upload (multiple images)
  - Auto-detect location (Gujarat only)
  - Manual address selection (District → City → Ward)
- Track complaint status in real-time
- View complaint history
- Receive notifications (email + in-app)
- Rate service after completion
- Re-open complaint if unsatisfied

---

### 2. 🏗️ **Constructor Panel** (Physical Worker/Contractor)
**Purpose**: Execute ground-level maintenance work

**Capabilities**:
- Login with assigned credentials
- View assigned tasks (ward-specific)
- Accept/Reject task with reason
- Update work status:
  - Not Started
  - In Progress (with %)
  - Waiting for Materials
  - Completed
- Upload before/after photos
- Mark completion with proof
- Request material/resources from Admin
- View work history and performance metrics

**Assignment Logic**:
- Assigned by Ward-level Admin
- Can handle multiple tasks simultaneously
- GPS tracking during work (optional)

---

### 3. 🧑‍💼 **Admin Panel** (Ward-Level Manager)
**Purpose**: Manage complaints at ward level

**Hierarchy**: Assigned by Super Admin to specific ward(s)

**Capabilities**:
- Dashboard showing:
  - Pending complaints (ward-specific)
  - Active tasks
  - Completed tasks
  - Constructor performance
  - Response time metrics
- View all complaints in assigned ward(s)
- Assign priority (High/Medium/Low)
- Assign tasks to Constructors
- Approve/Reject completion
- Send notifications to citizens
- Request escalation to Super Admin
- Manage constructor workers
- Generate ward-level reports
- Receive email + in-app notifications

**Notification Triggers**:
- New complaint in ward
- Constructor completes task
- Citizen reopens complaint
- SLA breach alert

---

### 4. 👑 **Super Admin Panel** (District/State Level)
**Purpose**: State-level oversight and admin management

**Hierarchy**: Top-level authority

**Capabilities**:
- **Admin Management**:
  - Create ward-level Admins
  - Assign Admins to Districts → Wards
  - View all Admins across Gujarat
  - Deactivate/Transfer Admins
  
- **District/Ward Management**:
  - Manage district boundaries
  - Create/modify ward mappings
  - View Gujarat map with complaint heatmap
  
- **Complaint Oversight**:
  - View all complaints (state-wide)
  - Filter by District/Ward/Status
  - Escalated complaints dashboard
  - SLA monitoring (district-wise)
  
- **Analytics & Reporting**:
  - State-wide complaint trends
  - District-wise performance comparison
  - Constructor efficiency metrics
  - Issue type distribution
  - Response time analytics
  
- **System Configuration**:
  - Manage complaint categories
  - Set SLA timelines
  - Configure notification templates
  - User role permissions
  
- **Notifications**:
  - Critical SLA breaches
  - Escalated complaints
  - Daily/Weekly reports (email)
  - In-app dashboard alerts

---

## 🔄 Complete System Workflow

### **Workflow A: Standard Complaint Flow**

```
1. CITIZEN RAISES COMPLAINT
   ├─ Selects issue type
   ├─ Uploads photo
   ├─ Auto-detects location (Gujarat only)
   └─ Submits complaint
        ↓
   [Email Notification: "Complaint Registered #12345"]
        ↓
        
2. SYSTEM AUTO-ROUTES
   ├─ Extracts District from location
   ├─ Extracts Ward from location
   └─ Routes to Ward Admin
        ↓
   [In-App Notification to Admin: "New Complaint in Ward 12"]
   [Email to Admin: "Pending Complaint Requires Action"]
        ↓
        
3. ADMIN REVIEWS
   ├─ Verifies complaint validity
   ├─ Sets priority (High/Medium/Low)
   └─ Assigns to available Constructor
        ↓
   [Email to Constructor: "New Task Assigned #12345"]
   [Email to Citizen: "Your complaint has been assigned"]
        ↓
        
4. CONSTRUCTOR RECEIVES TASK
   ├─ Reviews task details
   ├─ Accepts task
   └─ Updates status to "In Progress"
        ↓
   [Email to Citizen: "Work has started on your complaint"]
   [In-App notification to Admin: "Constructor accepted task"]
        ↓
        
5. CONSTRUCTOR WORKS
   ├─ Updates progress (25% → 50% → 75%)
   ├─ Uploads work-in-progress photos
   └─ Marks as "Completed" with proof
        ↓
   [Email to Admin: "Task completed, pending approval"]
   [In-App notification to Citizen: "Your complaint has been resolved"]
        ↓
        
6. ADMIN APPROVES
   ├─ Verifies completion proof
   └─ Marks as "Closed"
        ↓
   [Email to Citizen: "Please rate the service"]
        ↓
        
7. CITIZEN PROVIDES FEEDBACK
   ├─ Views before/after photos
   ├─ Rates service (1-5 stars)
   └─ Writes feedback
        ↓
   [System records feedback]
   [Constructor performance updated]
```

### **Workflow B: Escalation Flow**

```
1. CITIZEN REOPENS COMPLAINT
   (If unsatisfied with resolution)
        ↓
   [Email to Admin: "Complaint reopened by citizen"]
        ↓
        
2. ADMIN INVESTIGATES
   ├─ If resolvable → Reassigns to Constructor
   └─ If complex → Escalates to Super Admin
        ↓
   [Email to Super Admin: "Escalated Complaint from Ward 12"]
        ↓
        
3. SUPER ADMIN INTERVENES
   ├─ Reviews complaint history
   ├─ May transfer to different Admin
   └─ May assign to senior Constructor
        ↓
   [System tracks escalation metrics]
```

### **Workflow C: SLA Monitoring**

```
1. SYSTEM MONITORS TIMELINES
   ├─ High Priority: 24 hours
   ├─ Medium Priority: 72 hours
   └─ Low Priority: 7 days
        ↓
        
2. SLA BREACH ALERTS
   ├─ At 80% of SLA: Warning to Admin (email + in-app)
   ├─ At 100% of SLA: Alert to Super Admin (email)
   └─ System auto-escalates if no action
```

---

## 🗄️ Database Design

### **1. users**
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  mobile VARCHAR(10) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('citizen', 'constructor', 'admin', 'super_admin') NOT NULL,
  district_id INT NULL, -- For admin/constructor
  ward_id INT NULL, -- For admin/constructor
  is_active BOOLEAN DEFAULT TRUE,
  profile_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (district_id) REFERENCES districts(id),
  FOREIGN KEY (ward_id) REFERENCES wards(id)
);
```

### **2. districts** (Gujarat Specific)
```sql
CREATE TABLE districts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL, -- e.g., 'AHM' for Ahmedabad
  state VARCHAR(50) DEFAULT 'Gujarat',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Data
INSERT INTO districts (name, code) VALUES
('Ahmedabad', 'AHM'),
('Surat', 'SUR'),
('Vadodara', 'VAD'),
('Rajkot', 'RAJ'),
('Bhavnagar', 'BHA'),
-- ... all 33 districts
```

### **3. wards**
```sql
CREATE TABLE wards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  district_id INT NOT NULL,
  ward_number VARCHAR(10) NOT NULL,
  ward_name VARCHAR(100),
  area_names TEXT, -- JSON array of locality names
  boundaries POLYGON, -- Geographic boundaries (optional)
  population INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (district_id) REFERENCES districts(id),
  UNIQUE KEY unique_ward (district_id, ward_number)
);
```

### **4. complaint_categories**
```sql
CREATE TABLE complaint_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  description TEXT,
  default_priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  sla_hours INT DEFAULT 72, -- Default SLA
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Data
INSERT INTO complaint_categories (name, icon, sla_hours) VALUES
('Pothole', 'road', 24),
('Street Light', 'lightbulb', 48),
('Drainage', 'water', 72),
('Garbage Collection', 'trash', 24),
('Water Supply', 'droplet', 48),
('Park Maintenance', 'tree', 168);
```

### **5. complaints**
```sql
CREATE TABLE complaints (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_number VARCHAR(20) UNIQUE NOT NULL, -- Auto: RCM-2024-0001
  
  -- Citizen Info
  user_id INT NOT NULL,
  
  -- Location Info
  district_id INT NOT NULL,
  ward_id INT NOT NULL,
  locality VARCHAR(200),
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Complaint Details
  category_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  images JSON, -- Array of image URLs
  
  -- Assignment
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  assigned_admin_id INT NULL,
  assigned_constructor_id INT NULL,
  
  -- Status Tracking
  status ENUM(
    'pending',
    'assigned',
    'in_progress',
    'completed',
    'closed',
    'reopened',
    'escalated'
  ) DEFAULT 'pending',
  
  -- Timeline
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_at TIMESTAMP NULL,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  closed_at TIMESTAMP NULL,
  
  -- SLA
  sla_due_date TIMESTAMP,
  is_sla_breached BOOLEAN DEFAULT FALSE,
  
  -- Escalation
  is_escalated BOOLEAN DEFAULT FALSE,
  escalated_to INT NULL, -- Super admin
  escalation_reason TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (district_id) REFERENCES districts(id),
  FOREIGN KEY (ward_id) REFERENCES wards(id),
  FOREIGN KEY (category_id) REFERENCES complaint_categories(id),
  FOREIGN KEY (assigned_admin_id) REFERENCES users(id),
  FOREIGN KEY (assigned_constructor_id) REFERENCES users(id),
  FOREIGN KEY (escalated_to) REFERENCES users(id),
  
  INDEX idx_status (status),
  INDEX idx_ward (ward_id),
  INDEX idx_district (district_id),
  INDEX idx_priority (priority)
);
```

### **6. complaint_status_history**
```sql
CREATE TABLE complaint_status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  updated_by INT NOT NULL, -- User ID
  progress_percentage INT DEFAULT 0,
  comments TEXT,
  images JSON, -- Progress photos
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (complaint_id) REFERENCES complaints(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

### **7. feedback**
```sql
CREATE TABLE feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  is_satisfied BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (complaint_id) REFERENCES complaints(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_feedback (complaint_id)
);
```

### **8. notifications**
```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  complaint_id INT NULL,
  type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (complaint_id) REFERENCES complaints(id),
  
  INDEX idx_user_unread (user_id, is_read)
);
```

### **9. email_logs**
```sql
CREATE TABLE email_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  complaint_id INT NULL,
  to_email VARCHAR(100) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
  sent_at TIMESTAMP NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (complaint_id) REFERENCES complaints(id)
);
```

### **10. admin_assignments**
```sql
CREATE TABLE admin_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_id INT NOT NULL,
  district_id INT NOT NULL,
  ward_id INT NOT NULL,
  assigned_by INT NOT NULL, -- Super admin
  is_active BOOLEAN DEFAULT TRUE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deactivated_at TIMESTAMP NULL,
  
  FOREIGN KEY (admin_id) REFERENCES users(id),
  FOREIGN KEY (district_id) REFERENCES districts(id),
  FOREIGN KEY (ward_id) REFERENCES wards(id),
  FOREIGN KEY (assigned_by) REFERENCES users(id),
  
  UNIQUE KEY unique_assignment (admin_id, ward_id, is_active)
);
```

### **11. constructor_assignments**
```sql
CREATE TABLE constructor_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  constructor_id INT NOT NULL,
  district_id INT NOT NULL,
  ward_id INT NOT NULL,
  assigned_by INT NOT NULL, -- Admin
  specialization VARCHAR(100), -- e.g., 'Roads', 'Drainage'
  is_active BOOLEAN DEFAULT TRUE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (constructor_id) REFERENCES users(id),
  FOREIGN KEY (district_id) REFERENCES districts(id),
  FOREIGN KEY (ward_id) REFERENCES wards(id),
  FOREIGN KEY (assigned_by) REFERENCES users(id)
);
```

### **12. sla_configurations**
```sql
CREATE TABLE sla_configurations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT NOT NULL,
  priority VARCHAR(20) NOT NULL,
  response_hours INT NOT NULL,
  resolution_hours INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (category_id) REFERENCES complaint_categories(id),
  UNIQUE KEY unique_sla (category_id, priority)
);
```

---

## 🏗️ MVC Architecture

### **Backend Structure** (Node.js + Express + MySQL)

```
backend/
├── config/
│   ├── db.js                    # MySQL connection
│   ├── email.js                 # Nodemailer config (App Password)
│   ├── cloudinary.js            # Image upload
│   └── constants.js             # Gujarat districts/wards data
│
├── models/
│   ├── User.js
│   ├── District.js
│   ├── Ward.js
│   ├── Complaint.js
│   ├── ComplaintCategory.js
│   ├── Feedback.js
│   ├── Notification.js
│   └── EmailLog.js
│
├── controllers/
│   ├── authController.js        # Login, Register, JWT
│   ├── citizenController.js     # Raise complaint, track
│   ├── constructorController.js # Tasks, update status
│   ├── adminController.js       # Assign, approve
│   ├── superAdminController.js  # Manage admins, analytics
│   ├── notificationController.js
│   └── locationController.js    # Gujarat districts/wards
│
├── routes/
│   ├── authRoutes.js
│   ├── citizenRoutes.js
│   ├── constructorRoutes.js
│   ├── adminRoutes.js
│   ├── superAdminRoutes.js
│   └── locationRoutes.js
│
├── middleware/
│   ├── authMiddleware.js        # JWT verification
│   ├── roleMiddleware.js        # Role-based access
│   ├── validationMiddleware.js  # Input validation
│   ├── uploadMiddleware.js      # Multer (image)
│   └── gujaratLocationCheck.js  # Validate Gujarat only
│
├── services/
│   ├── emailService.js          # Send emails
│   ├── notificationService.js   # In-app notifications
│   ├── slaService.js            # SLA monitoring (cron)
│   ├── autoRouteService.js      # Auto-assign to ward
│   └── analyticsService.js      # Reports
│
├── utils/
│   ├── complaintNumberGenerator.js
│   ├── slaCalculator.js
│   ├── errorHandler.js
│   └── logger.js
│
├── cron/
│   ├── slaMonitor.js            # Check SLA every hour
│   └── dailyReports.js          # Send daily emails
│
├── server.js
└── package.json
```

### **Frontend Structure** (React + React Router + Axios)

```
client/
├── public/
│   ├── index.html
│   └── favicon.ico
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── NotificationBell.jsx
│   │   │   └── Toast.jsx
│   │   │
│   │   ├── maps/
│   │   │   ├── GujaratMap.jsx       # Interactive map
│   │   │   ├── LocationPicker.jsx   # District → Ward selector
│   │   │   └── ComplaintMarkers.jsx
│   │   │
│   │   └── cards/
│   │       ├── ComplaintCard.jsx
│   │       ├── TaskCard.jsx
│   │       └── StatsCard.jsx
│   │
│   ├── pages/
│   │   ├── citizen/
│   │   │   ├── CitizenDashboard.jsx
│   │   │   ├── RaiseComplaint.jsx
│   │   │   ├── MyComplaints.jsx
│   │   │   ├── ComplaintDetails.jsx
│   │   │   └── ProvideFeedback.jsx
│   │   │
│   │   ├── constructor/
│   │   │   ├── ConstructorDashboard.jsx
│   │   │   ├── MyTasks.jsx
│   │   │   ├── TaskDetails.jsx
│   │   │   └── UpdateProgress.jsx
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── PendingComplaints.jsx
│   │   │   ├── AssignTask.jsx
│   │   │   ├── ManageConstructors.jsx
│   │   │   └── WardReports.jsx
│   │   │
│   │   ├── superadmin/
│   │   │   ├── SuperAdminDashboard.jsx
│   │   │   ├── ManageAdmins.jsx
│   │   │   ├── CreateAdmin.jsx
│   │   │   ├── DistrictAnalytics.jsx
│   │   │   ├── SLAMonitor.jsx
│   │   │   ├── GujaratHeatmap.jsx
│   │   │   └── SystemSettings.jsx
│   │   │
│   │   └── auth/
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       └── ForgotPassword.jsx
│   │
│   ├── services/
│   │   ├── api.js               # Axios instance
│   │   ├── authService.js
│   │   ├── complaintService.js
│   │   ├── notificationService.js
│   │   └── locationService.js
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── NotificationContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── utils/
│   │   ├── constants.js         # Gujarat districts data
│   │   ├── helpers.js
│   │   └── validators.js
│   │
│   ├── routes/
│   │   ├── ProtectedRoute.jsx
│   │   ├── RoleBasedRoute.jsx
│   │   └── AppRoutes.jsx
│   │
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── styles/
│   │   ├── global.css
│   │   └── variables.css
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── package.json
```

---

## 🔌 API Design

### **Authentication**
```
POST   /api/auth/register       # Citizen registration
POST   /api/auth/login          # All roles
POST   /api/auth/forgot-password
POST   /api/auth/verify-otp
```

### **Citizen APIs**
```
GET    /api/citizen/dashboard           # Stats
POST   /api/citizen/complaint           # Raise complaint
GET    /api/citizen/complaints          # My complaints
GET    /api/citizen/complaint/:id       # Details
POST   /api/citizen/feedback            # Submit feedback
PUT    /api/citizen/reopen/:id          # Reopen complaint
```

### **Constructor APIs**
```
GET    /api/constructor/dashboard       # Stats
GET    /api/constructor/tasks           # Assigned tasks
PUT    /api/constructor/accept/:id      # Accept task
PUT    /api/constructor/update/:id      # Update progress
POST   /api/constructor/complete/:id    # Mark complete
```

### **Admin APIs**
```
GET    /api/admin/dashboard             # Ward stats
GET    /api/admin/complaints            # Ward complaints
PUT    /api/admin/assign/:id            # Assign to constructor
PUT    /api/admin/priority/:id          # Set priority
PUT    /api/admin/approve/:id           # Approve completion
POST   /api/admin/escalate/:id          # Escalate to super admin
GET    /api/admin/constructors          # Ward constructors
POST   /api/admin/constructor           # Add constructor
```

### **Super Admin APIs**
```
GET    /api/superadmin/dashboard        # State-wide stats
POST   /api/superadmin/admin            # Create admin
GET    /api/superadmin/admins           # All admins
PUT    /api/superadmin/assign-ward      # Assign admin to ward
DELETE /api/superadmin/admin/:id        # Deactivate admin
GET    /api/superadmin/analytics        # District analytics
GET    /api/superadmin/sla-breaches     # SLA monitoring
GET    /api/superadmin/heatmap          # Gujarat complaint map
```

### **Location APIs**
```
GET    /api/location/districts          # All Gujarat districts
GET    /api/location/wards/:districtId  # Wards in district
POST   /api/location/validate           # Validate Gujarat location
```

### **Notification APIs**
```
GET    /api/notifications               # User notifications
PUT    /api/notifications/read/:id      # Mark as read
PUT    /api/notifications/read-all      # Mark all as read
DELETE /api/notifications/:id           # Delete notification
```

---

## 📧 Notification System

### **Email Configuration** (Using Gmail App Password)

```javascript
// config/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,      // your-email@gmail.com
    pass: process.env.EMAIL_APP_PASSWORD // 16-char app password
  }
});

module.exports = transporter;
```

### **Notification Triggers**

| Event | Recipient | Email | In-App |
|-------|-----------|-------|--------|
| Complaint registered | Citizen | ✅ | ✅ |
| Complaint assigned to admin | Admin | ✅ | ✅ |
| Task assigned to constructor | Constructor | ✅ | ✅ |
| Work started | Citizen, Admin | ✅ | ✅ |
| Progress updated | Citizen, Admin | ❌ | ✅ |
| Work completed | Citizen, Admin | ✅ | ✅ |
| Complaint closed | Citizen | ✅ | ✅ |
| Complaint reopened | Admin | ✅ | ✅ |
| SLA 80% warning | Admin | ✅ | ✅ |
| SLA breached | Admin, Super Admin | ✅ | ✅ |
| Escalated | Super Admin | ✅ | ✅ |
| Daily report | Admin, Super Admin | ✅ | ❌ |

### **Email Templates**

```javascript
// services/emailService.js

const templates = {
  complaintRegistered: (complaint) => ({
    subject: `Complaint Registered - ${complaint.complaint_number}`,
    html: `
      <h2>Thank you for reporting!</h2>
      <p>Your complaint has been registered successfully.</p>
      <p><strong>Complaint Number:</strong> ${complaint.complaint_number}</p>
      <p><strong>Issue:</strong> ${complaint.title}</p>
      <p><strong>Location:</strong> ${complaint.address}</p>
      <p>We will update you soon.</p>
    `
  }),
  
  taskAssigned: (task, constructor) => ({
    subject: `New Task Assigned - ${task.complaint_number}`,
    html: `
      <h2>New Task Assigned</h2>
      <p>Dear ${constructor.name},</p>
      <p>A new task has been assigned to you:</p>
      <p><strong>Task ID:</strong> ${task.complaint_number}</p>
      <p><strong>Location:</strong> ${task.address}</p>
      <p><strong>Priority:</strong> ${task.priority}</p>
      <p>Please login to view details.</p>
    `
  }),
  
  slaWarning: (complaint, admin) => ({
    subject: `⚠️ SLA Warning - ${complaint.complaint_number}`,
    html: `
      <h2 style="color: orange;">SLA Warning</h2>
      <p>Dear ${admin.name},</p>
      <p>The following complaint is approaching SLA breach:</p>
      <p><strong>Complaint:</strong> ${complaint.complaint_number}</p>
      <p><strong>Due:</strong> ${complaint.sla_due_date}</p>
      <p><strong>Time Remaining:</strong> 20% of SLA</p>
      <p>Please take immediate action.</p>
    `
  })
};

const sendEmail = async (to, template, data) => {
  const { subject, html } = templates[template](data);
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  });
  
  // Log to database
  await EmailLog.create({ to, subject, status: 'sent' });
};
```

---

## 🗺️ Gujarat Location Hierarchy

### **33 Districts of Gujarat**

```javascript
// config/constants.js

const GUJARAT_DISTRICTS = [
  { id: 1, name: 'Ahmedabad', code: 'AHM' },
  { id: 2, name: 'Surat', code: 'SUR' },
  { id: 3, name: 'Vadodara', code: 'VAD' },
  { id: 4, name: 'Rajkot', code: 'RAJ' },
  { id: 5, name: 'Bhavnagar', code: 'BHA' },
  { id: 6, name: 'Jamnagar', code: 'JAM' },
  { id: 7, name: 'Junagadh', code: 'JUN' },
  { id: 8, name: 'Gandhinagar', code: 'GAN' },
  { id: 9, name: 'Anand', code: 'ANA' },
  { id: 10, name: 'Bharuch', code: 'BHR' },
  { id: 11, name: 'Mehsana', code: 'MEH' },
  { id: 12, name: 'Kheda', code: 'KHE' },
  { id: 13, name: 'Panchmahal', code: 'PAN' },
  { id: 14, name: 'Sabarkantha', code: 'SAB' },
  { id: 15, name: 'Banaskantha', code: 'BAN' },
  { id: 16, name: 'Kutch', code: 'KUT' },
  { id: 17, name: 'Amreli', code: 'AMR' },
  { id: 18, name: 'Porbandar', code: 'POR' },
  { id: 19, name: 'Navsari', code: 'NAV' },
  { id: 20, name: 'Valsad', code: 'VAL' },
  { id: 21, name: 'Tapi', code: 'TAP' },
  { id: 22, name: 'Narmada', code: 'NAR' },
  { id: 23, name: 'Dang', code: 'DAN' },
  { id: 24, name: 'Patan', code: 'PAT' },
  { id: 25, name: 'Surendranagar', code: 'SUR' },
  { id: 26, name: 'Botad', code: 'BOT' },
  { id: 27, name: 'Morbi', code: 'MOR' },
  { id: 28, name: 'Devbhoomi Dwarka', code: 'DEV' },
  { id: 29, name: 'Gir Somnath', code: 'GIR' },
  { id: 30, name: 'Mahisagar', code: 'MAH' },
  { id: 31, name: 'Aravalli', code: 'ARA' },
  { id: 32, name: 'Chhota Udaipur', code: 'CHH' },
  { id: 33, name: 'Dahod', code: 'DAH' }
];
```

### **Location Validation Middleware**

```javascript
// middleware/gujaratLocationCheck.js

const validateGujaratLocation = async (req, res, next) => {
  const { latitude, longitude, district_id } = req.body;
  
  // Check if coordinates are within Gujarat
  const gujaratBounds = {
    north: 24.7,
    south: 20.1,
    east: 74.5,
    west: 68.1
  };
  
  if (
    latitude < gujaratBounds.south || 
    latitude > gujaratBounds.north ||
    longitude < gujaratBounds.west || 
    longitude > gujaratBounds.east
  ) {
    return res.status(400).json({
      success: false,
      message: 'Location must be within Gujarat state'
    });
  }
  
  // Verify district exists
  const district = await District.findById(district_id);
  if (!district) {
    return res.status(400).json({
      success: false,
      message: 'Invalid district'
    });
  }
  
  next();
};
```

---

## 🚀 Advanced Features

### 1. **Real-time Dashboard Updates**
- Use Socket.io for live complaint count updates
- Real-time status changes visible to all panels

### 2. **Complaint Heatmap**
- Gujarat map showing complaint density by district
- Color-coded by severity/priority

### 3. **Performance Metrics**
- Constructor efficiency score
- Admin response time
- District-wise comparison charts

### 4. **Mobile App Support**
- PWA (Progressive Web App)
- Push notifications

### 5. **AI/ML Integration** (Future)
- Auto-categorize complaints from images
- Predict resolution time
- Suggest priority based on location history

### 6. **Bulk Operations**
- Super admin can assign multiple admins at once
- Batch complaint approval

### 7. **Reports Export**
- PDF reports (district-wise, ward-wise)
- Excel export of complaints
- Analytics dashboards

### 8. **SLA Automation**
- Auto-escalate if SLA breached
- Auto-assign to backup constructor if no response

---

## 📊 Key Performance Indicators (KPIs)

| Metric | Target | Measured For |
|--------|--------|--------------|
| Complaint Registration Time | < 2 minutes | Citizen |
| Admin Response Time | < 2 hours | Admin |
| Constructor Assignment | < 4 hours | Admin |
| Average Resolution Time | < 72 hours | Constructor |
| Citizen Satisfaction | > 4.0/5 | Overall |
| SLA Compliance | > 90% | System |

---

## 🔐 Security Features

1. **JWT Authentication** with role-based access
2. **Password Hashing** (bcrypt)
3. **Input Validation** (express-validator)
4. **Rate Limiting** (prevent spam complaints)
5. **File Upload Validation** (only images, max 5MB)
6. **SQL Injection Prevention** (parameterized queries)
7. **CORS Configuration** (whitelist frontend domain)

---

## 📦 Tech Stack Summary

### **Frontend**
- React 18
- React Router v6
- Axios
- React Leaflet (maps)
- Chart.js (analytics)
- Tailwind CSS / Material-UI

### **Backend**
- Node.js 18+
- Express.js
- MySQL / PostgreSQL
- JWT (jsonwebtoken)
- Nodemailer (email)
- Multer (file upload)
- Cloudinary (image storage)

### **DevOps**
- Docker
- Nginx (reverse proxy)
- PM2 (process manager)
- GitHub Actions (CI/CD)

---

## 📝 Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rcms_db

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d

# Email (Gmail App Password)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=abcd efgh ijkl mnop

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Maps API (Optional)
GOOGLE_MAPS_API_KEY=your_key
```

---

## ✅ Implementation Checklist

### **Phase 1: Foundation** (Week 1-2)
- [ ] Database schema creation
- [ ] User authentication (JWT)
- [ ] Role-based middleware
- [ ] Gujarat districts/wards seeding

### **Phase 2: Core Features** (Week 3-4)
- [ ] Citizen complaint submission
- [ ] Admin complaint management
- [ ] Constructor task management
- [ ] Email notification system

### **Phase 3: Advanced** (Week 5-6)
- [ ] Super admin panel
- [ ] Analytics dashboard
- [ ] SLA monitoring (cron jobs)
- [ ] In-app notifications

### **Phase 4: Polish** (Week 7-8)
- [ ] Gujarat map integration
- [ ] Performance optimization
- [ ] Testing (unit + integration)
- [ ] Deployment

---

**END OF SYSTEM DESIGN DOCUMENT**
