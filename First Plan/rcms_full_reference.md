# RCMS - RoadCare Management System - Complete Knowledge Base

## Project Overview
**RoadCare Management System (RCMS)** - Gujarat State
A hierarchical complaint management system for civic issues (potholes, street lights, garbage, drainage, water supply, parks) with 4 user panels, email + in-app notifications, SLA monitoring, and Gujarat-only location validation.

---

## 4 User Panels

### 1. Citizen Panel (Public)
- Register/Login, raise complaints with photo + GPS
- Track status, view history, provide feedback (1-5 stars)
- Reopen complaints if unsatisfied
- Receives email + in-app notifications

### 2. Constructor Panel (Ward-level Physical Workers)
- View/accept assigned tasks
- Update progress (0-100%) with photos
- Mark completion with before/after proof
- Request materials from Admin

### 3. Admin Panel (Ward-level Managers)
- Dashboard: pending, active, completed, SLA warnings
- Assign priority, assign to constructors
- Approve/reject completion
- Escalate to Super Admin
- Manage ward constructors

### 4. Super Admin Panel (State-level)
- Create/manage ward admins, assign to districts/wards
- State-wide analytics, district comparison
- Gujarat heatmap with complaint density
- SLA breach monitoring, handle escalations
- System configuration

---

## Tech Stack

### Backend
- Node.js 18+ / Express.js
- MySQL (mysql2, sequelize)
- JWT (jsonwebtoken) + bcryptjs
- Nodemailer (Gmail App Password)
- Multer + Cloudinary (image upload)
- express-validator, cors, dotenv
- node-cron (SLA monitoring)

### Frontend
- React 18 + React Router v6
- Axios, React Leaflet, Chart.js
- Tailwind CSS / Material-UI
- Lucide React icons, React Hot Toast
- Vite build tool

---

## Database Schema (12 Tables)

1. **users** - id, name, email, mobile, password, role (citizen/constructor/admin/super_admin), district_id, ward_id, is_active, profile_image
2. **districts** - 33 Gujarat districts with code (e.g., 'AHM')
3. **wards** - district_id, ward_number, ward_name, area_names
4. **complaint_categories** - name, icon, default_priority, sla_hours
5. **complaints** - complaint_number (RCM-2024-XXXX), user_id, district_id, ward_id, locality, address, lat/lng, category_id, title, description, images (JSON), priority, assigned_admin_id, assigned_constructor_id, status (pending/assigned/in_progress/completed/closed/reopened/escalated), timestamps, SLA fields, escalation fields
6. **complaint_status_history** - complaint_id, status, updated_by, progress_percentage, comments, images
7. **feedback** - complaint_id, user_id, rating (1-5), comments, is_satisfied
8. **notifications** - user_id, complaint_id, type (info/warning/success/error), title, message, is_read
9. **email_logs** - user_id, complaint_id, to_email, subject, body, status (sent/failed/pending)
10. **admin_assignments** - admin_id, district_id, ward_id, assigned_by
11. **constructor_assignments** - constructor_id, district_id, ward_id, assigned_by, specialization
12. **sla_configurations** - category_id, priority, response_hours, resolution_hours

---

## API Endpoints (28+)

### Authentication (3)
- POST /api/auth/register, /login, /forgot-password

### Citizen (6)
- GET /api/citizen/dashboard, /complaints, /complaint/:id
- POST /api/citizen/complaint (image upload + GPS), /feedback
- PUT /api/citizen/reopen/:id

### Constructor (5)
- GET /api/constructor/dashboard, /tasks
- PUT /api/constructor/accept/:id, /update/:id (progress + photos)
- POST /api/constructor/complete/:id

### Admin (7)
- GET /api/admin/dashboard (ward-specific), /complaints, /constructors
- PUT /api/admin/assign/:id, /priority/:id, /approve/:id
- POST /api/admin/escalate/:id

### Super Admin (6+)
- GET /api/superadmin/dashboard (state-wide), /admins, /analytics, /sla-breaches, /heatmap
- POST /api/superadmin/admin
- PUT /api/superadmin/assign-ward
- DELETE /api/superadmin/admin/:id

### Location (2)
- GET /api/location/districts, /wards/:districtId

### Notifications (3-4)
- GET /api/notifications
- PUT /api/notifications/read/:id, /read-all

---

## Complaint Workflow

```
CITIZEN submits → SYSTEM auto-routes to ward admin → ADMIN assigns to constructor → CONSTRUCTOR completes work → ADMIN approves → CITIZEN provides feedback → SYSTEM closes
```

### Escalation Flow
Citizen reopens → Admin investigates → Escalates to Super Admin → Super Admin reassigns

### SLA Monitoring (Cron every hour)
- 80% consumed → Warning to Admin
- 90% consumed → Critical to Admin + Super Admin  
- 100% breach → Auto-escalate, mark breached

---

## 11 Email Notification Events
1. Complaint registered → Citizen
2. Auto-routed to ward → Admin
3. Task assigned → Constructor
4. Task assigned → Citizen
5. Work started → Citizen
6. Work completed → Admin
7. Work completed → Citizen
8. Complaint closed → Citizen
9. Complaint reopened → Admin
10. SLA 80% warning → Admin
11. SLA breached → Super Admin

---

## Gujarat Location Validation
- 33 districts, coordinates bounded: N:24.7, S:20.1, E:74.5, W:68.1
- Middleware validates all complaint locations are within Gujarat
- District → Ward hierarchical selection

---

## Project Structure

### Backend
```
backend/
├── config/ (db, email, cloudinary, constants)
├── models/ (User, Complaint, Notification, etc.)
├── controllers/ (auth, citizen, constructor, admin, superAdmin)
├── routes/ (auth, citizen, constructor, admin, superAdmin, location)
├── middleware/ (auth, role, validation, upload, gujaratLocationCheck)
├── services/ (email, notification, SLA, autoRoute, analytics)
├── utils/ (complaintNumberGenerator, slaCalculator, errorHandler)
├── cron/ (slaMonitor, dailyReports)
└── server.js
```

### Frontend
```
client/src/
├── components/ (common/, maps/, cards/)
├── pages/ (citizen/, constructor/, admin/, superadmin/, auth/)
├── services/ (api, auth, complaint, notification)
├── context/ (Auth, Notification, Theme)
├── routes/ (ProtectedRoute, RoleBasedRoute)
└── App.jsx
```

---

## Environment Variables
```
NODE_ENV, PORT, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
JWT_SECRET, JWT_EXPIRE
EMAIL_USER, EMAIL_APP_PASSWORD
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
FRONTEND_URL
```

---

## Implementation Phases
1. Database & Auth (tables, seed data, JWT, role middleware)
2. Core Complaint Flow (citizen submit, auto-route, admin assign, constructor work)
3. Notification System (email + in-app, templates, logging)
4. Super Admin Panel (admin CRUD, district analytics, heatmap)
5. Advanced Features (SLA cron, escalation, feedback, reopen)
6. Frontend Polish (responsive, loading states, error handling)
7. Testing & Deployment

## Seed Data
- 33 Gujarat districts
- 6 complaint categories (Pothole 24h, Street Light 48h, Drainage 72h, Garbage 24h, Water Supply 48h, Park 168h)
- Default Super Admin (superadmin@rcms.com)
