# RCMS Backend - API & Services Reference

> **Base URL**: `http://localhost:5001/api`  
> **Auth**: Bearer JWT token in `Authorization` header  
> **Port**: 5001 (not 5000 — Postgres uses 5000 on this machine)

---

## 🟢 BUILT & WORKING APIs

### Health Check
```
GET /api/health
→ { success: true, message: "RCMS API is running", timestamp }
```

### Authentication (`routes/authRoutes.js` → `controllers/authController.js`)

```
POST /api/auth/register
Body: { name, email, mobile, password }
→ Creates citizen user, returns JWT token + user data
Validation: name required, valid email, 10-digit mobile, min 6 char password

POST /api/auth/login  
Body: { email, password }
→ Validates credentials, checks isActive, returns JWT + user data (all roles)

GET /api/auth/me  [AUTH REQUIRED]
→ Returns current user with populated district/ward
```

### Location (`routes/locationRoutes.js` → `controllers/locationController.js`)

```
GET /api/location/districts
→ { success, count: 33, data: [{ _id, name, code }] } sorted alphabetically

GET /api/location/wards/:districtId
→ { success, count, district: "name", data: [{ _id, wardNumber, wardName, areaNames }] }
```

---

## 🔴 NOT YET BUILT APIs

### Citizen APIs (6 endpoints)
```
GET  /api/citizen/dashboard        # Stats (my complaints count, pending, resolved)
POST /api/citizen/complaint        # Raise complaint (image upload + GPS + Gujarat validation)
GET  /api/citizen/complaints       # My complaints list
GET  /api/citizen/complaint/:id    # Single complaint details
POST /api/citizen/feedback         # Submit rating + comments
PUT  /api/citizen/reopen/:id       # Reopen resolved complaint
```

### Constructor APIs (5 endpoints)
```
GET  /api/constructor/dashboard    # Stats (today's tasks, pending, completed)
GET  /api/constructor/tasks        # Assigned tasks list
PUT  /api/constructor/accept/:id   # Accept task → status: in_progress
PUT  /api/constructor/update/:id   # Update progress (%) + upload photos
POST /api/constructor/complete/:id # Mark completed with proof photos
```

### Admin APIs (7 endpoints)
```
GET  /api/admin/dashboard          # Ward-specific stats
GET  /api/admin/complaints         # Ward complaints
PUT  /api/admin/assign/:id         # Assign complaint to constructor
PUT  /api/admin/priority/:id       # Set priority (low/medium/high)
PUT  /api/admin/approve/:id        # Approve completion → close complaint
POST /api/admin/escalate/:id       # Escalate to super admin
GET  /api/admin/constructors       # Ward constructors list
```

### Super Admin APIs (6+ endpoints)
```
GET    /api/superadmin/dashboard   # State-wide stats
POST   /api/superadmin/admin       # Create new admin user
GET    /api/superadmin/admins      # All admins list
PUT    /api/superadmin/assign-ward # Assign admin to district/ward
DELETE /api/superadmin/admin/:id   # Deactivate admin
GET    /api/superadmin/analytics   # District-wise analytics
GET    /api/superadmin/sla-breaches # SLA breach list
GET    /api/superadmin/heatmap     # Gujarat complaint density map data
```

### Notification APIs (3 endpoints)
```
GET /api/notifications             # User's notifications (sorted newest first)
PUT /api/notifications/read/:id    # Mark single as read
PUT /api/notifications/read-all    # Mark all as read
```

---

## 🔧 Middleware (`middleware/`)

### authMiddleware.js — `{ protect }`
- Extracts Bearer token from `Authorization` header
- Verifies JWT → attaches `req.user` (User document without password)
- Checks user exists and `isActive === true`
- Returns 401 on any failure

### roleMiddleware.js — `{ authorize }`
- Usage: `authorize('admin', 'super_admin')`
- Checks `req.user.role` against allowed roles
- Returns 403 if not authorized

### gujaratLocationCheck.js — `{ validateGujaratLocation }`
- Validates `req.body.latitude/longitude` within Gujarat bounds
- Bounds: North 24.7°, South 20.1°, East 74.5°, West 68.1°
- Skips validation if no coordinates provided (allows manual address)
- Returns 400 if outside Gujarat

### uploadMiddleware.js — `upload`
- Multer with Cloudinary storage (auto-uploads to `rcms/` folder)
- Allowed formats: jpg, jpeg, png, webp
- Max file size: 5MB
- Auto-transforms: 1200x1200 max, auto quality
- Usage: `upload.array('images', 5)` for multiple images

### errorHandler.js
- Catches all errors thrown in controllers
- Handles: Mongoose CastError, duplicate key (11000), ValidationError
- Handles: JWT errors, Multer file size errors  
- Returns clean JSON: `{ success: false, message }` + stack in dev mode

---

## 📧 Email Service (`services/emailService.js`)

### Usage
```javascript
const { sendEmail } = require('../services/emailService');
await sendEmail(toEmail, templateName, data, userId, complaintId);
```

### 8 Email Templates
| Template Name | Sent To | Trigger |
|--------------|---------|---------|
| `complaintRegistered` | Citizen | Complaint submitted |
| `newComplaintForAdmin` | Admin | Complaint auto-routed to ward |
| `taskAssigned` | Constructor | Admin assigns task |
| `statusUpdate` | Citizen | Any status change |
| `complaintClosed` | Citizen | Admin approves completion |
| `slaWarning` | Admin | 80% SLA time consumed |
| `slaBreached` | Super Admin | SLA deadline exceeded |
| `complaintReopened` | Admin | Citizen reopens complaint |

All emails are **styled HTML** with RCMS branding, color-coded headers, and action buttons.
Every send attempt (success or failure) is logged to the `EmailLog` collection.

---

## 🔔 Notification Service (`services/notificationService.js`)

### Functions
```javascript
const { createNotification, createBulkNotifications, getUnreadCount } = require('../services/notificationService');

// Single notification
await createNotification(userId, title, message, type, complaintId);

// Bulk (multiple users, same notification)
await createBulkNotifications([userId1, userId2], title, message, type, complaintId);

// Unread count
const count = await getUnreadCount(userId);
```

Types: `info`, `warning`, `success`, `error`

---

## 🔢 Complaint Number Generator (`utils/complaintNumberGenerator.js`)

```javascript
const { generateComplaintNumber } = require('../utils/complaintNumberGenerator');
const number = await generateComplaintNumber(); // "RCM-2026-0001"
```

- Format: `RCM-{YEAR}-{SEQUENCE}` (4-digit zero-padded)
- Auto-increments by querying the latest complaint number for the current year

---

## 📁 File Structure Summary

```
C:\RCMS\backend\
├── config/          → db.js, email.js, cloudinary.js
├── models/          → 11 Mongoose schemas
├── controllers/     → authController.js, locationController.js (+ more to come)
├── routes/          → authRoutes.js, locationRoutes.js (+ more to come)
├── middleware/      → auth, role, gujaratCheck, upload, errorHandler
├── services/        → emailService.js (8 templates), notificationService.js
├── utils/           → complaintNumberGenerator.js
├── seed/            → seedData.js (33 districts, 30 wards, 6 categories, super admin)
├── .env             → All credentials
├── server.js        → Express entry point (port 5001, bound to 0.0.0.0)
└── package.json     → Dependencies installed
```
