# RCMS Project - Current State & Architecture

> **Last Updated**: April 18, 2026  
> **Status**: Backend Foundation Complete, Frontend Not Started  
> **Server**: Running on `http://localhost:5001/api`

---

## 📍 What Is RCMS?

**RoadCare Management System (RCMS)** is a hierarchical civic complaint management system for **Gujarat State, India**. Citizens report road/infrastructure issues, which flow through a 3-tier administrative structure to physical workers who fix them.

### Core Workflow
```
CITIZEN submits complaint (photo + GPS)
  → SYSTEM auto-routes to correct ward admin
    → ADMIN assigns to constructor (physical worker)
      → CONSTRUCTOR fixes issue, uploads proof
        → ADMIN approves completion
          → CITIZEN provides feedback (1-5 stars)
            → SYSTEM closes complaint
```

---

## 👥 4 User Roles

| Role | Level | What They Do |
|------|-------|-------------|
| **Citizen** | Public | Report issues, track status, give feedback, reopen if unsatisfied |
| **Constructor** | Ward-level | Accept tasks, update progress (0-100%), upload before/after photos |
| **Admin** | Ward-level | Review complaints, set priority, assign to constructors, approve work |
| **Super Admin** | State-level | Create admins, assign to wards, monitor SLA, view analytics & heatmap |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend Runtime** | Node.js 24+ |
| **Backend Framework** | Express.js 4.21 |
| **Database** | MongoDB Atlas (Mongoose 8.7) |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs |
| **Email** | Nodemailer + Gmail App Password |
| **Image Upload** | Multer + Cloudinary |
| **Validation** | express-validator |
| **Scheduled Jobs** | node-cron (for SLA monitoring) |
| **Frontend** | React 18 + React Router v6 + Tailwind CSS (NOT YET BUILT) |
| **Maps** | React Leaflet (planned) |
| **Charts** | Chart.js (planned) |

---

## 📂 Project Location

```
C:\RCMS\
├── backend\          ← Node.js/Express API (BUILT ✅)
├── AI_Agent_Master_Prompt.md      ← Original spec with MySQL (reference only)
├── Quick_Reference_Guide.md       ← Quick-look reference doc
├── RCMS_Complete_System_Design.md ← Full system design doc
└── System_Workflow_Diagram.md     ← Workflow & notification matrix
```

> **IMPORTANT**: The 4 original `.md` files in `C:\RCMS\` reference MySQL. 
> We migrated to **MongoDB** — the backend code uses Mongoose, NOT MySQL/Sequelize.

---

## 🔑 Credentials & Config

### MongoDB Atlas
```
URI: mongodb+srv://ybvyas786_db_user:Yash%40@cluster0.rlrs1tf.mongodb.net/rcms_db?appName=Cluster0
```
- Password contains `@` → URL-encoded as `%40`
- Database name: `rcms_db`

### Gmail (for sending emails)
```
Email: ybvyas786@gmail.com
App Password: hvyh khgg wdty ryrm
```

### Cloudinary (for image uploads)
```
Cloud Name: RCMS
API Key: 852168534923641
API Secret: O_vW6X0yutH-pPSL14UDDjFn9co
```

### JWT
```
Secret: rcms_gujarat_super_secret_key_2026
Expiry: 7 days
```

### Default Super Admin Account
```
Email: superadmin@rcms.com
Password: admin123
Role: super_admin
```

### Server
```
Port: 5001 (changed from 5000 because Postgres occupies 5000)
Host: 0.0.0.0 (explicitly bound)
```

---

## 📊 Database State (MongoDB Atlas)

### Seeded Collections
| Collection | Count | Description |
|-----------|-------|-------------|
| `districts` | 33 | All Gujarat districts with codes (AHM, SUR, VAD, etc.) |
| `wards` | 30 | Sample wards for 5 major cities (Ahmedabad 10, Surat 5, Vadodara 5, Rajkot 5, Gandhinagar 5) |
| `complaintcategories` | 6 | Pothole (24h), Street Light (48h), Drainage (72h), Garbage (24h), Water Supply (48h), Park (168h) |
| `users` | 1 | Super Admin (superadmin@rcms.com) |

---

## ✅ What's Been Built

### Backend Structure
```
C:\RCMS\backend\
├── config/
│   ├── db.js                      # MongoDB Atlas connection via Mongoose
│   ├── email.js                   # Nodemailer Gmail transporter
│   └── cloudinary.js              # Cloudinary v2 config
├── models/                        # 11 Mongoose schemas
│   ├── User.js                    # 4 roles, bcrypt pre-save, comparePassword()
│   ├── District.js                # Gujarat districts with unique code
│   ├── Ward.js                    # Wards with compound index (district+wardNumber)
│   ├── ComplaintCategory.js       # Categories with SLA hours
│   ├── Complaint.js               # Core table - 8 indexes for performance
│   ├── ComplaintStatusHistory.js   # Status change audit trail
│   ├── Feedback.js                # 1-5 rating, one per complaint (unique index)
│   ├── Notification.js            # In-app notifications with read tracking
│   ├── EmailLog.js                # Email audit trail (sent/failed)
│   ├── AdminAssignment.js         # Admin → Ward mapping
│   └── ConstructorAssignment.js   # Constructor → Ward mapping
├── controllers/
│   ├── authController.js          # register (citizen), login (all), getMe
│   └── locationController.js      # getDistricts, getWards
├── routes/
│   ├── authRoutes.js              # /api/auth/*
│   └── locationRoutes.js          # /api/location/*
├── middleware/
│   ├── authMiddleware.js          # JWT verify → req.user
│   ├── roleMiddleware.js          # authorize('admin', 'super_admin')
│   ├── gujaratLocationCheck.js    # Lat/lng within Gujarat bounds
│   ├── uploadMiddleware.js        # Multer + Cloudinary storage
│   └── errorHandler.js            # Global error handler (Mongoose, JWT, Multer errors)
├── services/
│   ├── emailService.js            # 8 HTML email templates + send + log
│   └── notificationService.js     # create, bulk create, unread count
├── utils/
│   └── complaintNumberGenerator.js  # RCM-YYYY-XXXX auto-increment
├── seed/
│   └── seedData.js                # Seeds districts, wards, categories, super admin
├── .env                           # All credentials (port 5001)
├── .gitignore
├── server.js                      # Express app entry point
└── package.json
```

### Working API Endpoints (Verified ✅)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Citizen registration |
| POST | `/api/auth/login` | No | Login (all roles) |
| GET | `/api/auth/me` | JWT | Get current user profile |
| GET | `/api/location/districts` | No | All 33 Gujarat districts |
| GET | `/api/location/wards/:districtId` | No | Wards for a district |

---

## ❌ What's NOT Built Yet

### Backend (remaining APIs)
- [ ] **Citizen APIs**: raise complaint, my complaints, complaint details, feedback, reopen
- [ ] **Constructor APIs**: dashboard, tasks, accept, update progress, complete
- [ ] **Admin APIs**: dashboard, ward complaints, assign to constructor, set priority, approve, escalate
- [ ] **Super Admin APIs**: create admin, manage admins, assign to ward, analytics, heatmap, SLA breaches
- [ ] **Notification APIs**: get notifications, mark read, mark all read
- [ ] **SLA Cron Job**: hourly check for 80%/90%/100% breaches

### Frontend (not started)
- [ ] React project initialization
- [ ] All 4 panel dashboards and pages
- [ ] Auth pages (login, register)
- [ ] Map integration (React Leaflet)
- [ ] Charts (Chart.js)
- [ ] Notification bell component

> **Plan**: User will provide **Figma designs** → build frontend panel by panel → then complete remaining backend APIs

---

## 🔄 Development Approach (Agreed with User)
1. ✅ Backend foundation first (DB, models, auth, middleware, services)
2. ⏳ Frontend next (user provides Figma designs, panel by panel)
3. ⏳ Remaining backend APIs (as frontend panels need them)
