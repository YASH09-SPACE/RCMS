# 🔄 RCMS Complete System Workflow Diagram

## 📊 Panel Hierarchy
```
┌─────────────────────────────────────────────────────────┐
│                    SUPER ADMIN PANEL                    │
│              (State-level oversight)                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │ • Manage All Admins (33 districts)              │   │
│  │ • Assign Admins to Wards                        │   │
│  │ • Monitor SLA Breaches (state-wide)             │   │
│  │ • View Gujarat Heatmap                          │   │
│  │ • District Analytics                            │   │
│  │ • Handle Escalations                            │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Creates & Assigns
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      ADMIN PANEL                        │
│                (Ward-level managers)                    │
│                    33 districts                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Assigned to: District X → Ward Y                │   │
│  │ • View Ward Complaints                          │   │
│  │ • Set Priority                                  │   │
│  │ • Assign to Constructors                        │   │
│  │ • Approve Completion                            │   │
│  │ • Escalate to Super Admin                       │   │
│  │ • Manage Ward Constructors                      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Assigns Tasks
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  CONSTRUCTOR PANEL                      │
│                (Physical workers)                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Assigned to: Ward Z                             │   │
│  │ • View Assigned Tasks                           │   │
│  │ • Accept/Reject Task                            │   │
│  │ • Update Progress (0-100%)                      │   │
│  │ • Upload Work Photos                            │   │
│  │ • Mark Completed                                │   │
│  │ • Request Materials                             │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           ▲
                           │ Reports Issues
                           │
┌─────────────────────────────────────────────────────────┐
│                    CITIZEN PANEL                        │
│                  (General public)                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │ • Raise Complaint (Photo + GPS)                 │   │
│  │ • Track Status                                  │   │
│  │ • View History                                  │   │
│  │ • Provide Feedback                              │   │
│  │ • Reopen Complaint                              │   │
│  │ • Receive Notifications                         │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🌊 Complete Complaint Lifecycle

### **SCENARIO 1: Standard Flow (Happy Path)**

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: CITIZEN SUBMITS COMPLAINT                                  │
└─────────────────────────────────────────────────────────────────────┘
  
  Citizen (Rajkot)
    │
    ├─ Selects: "Pothole" category
    ├─ Uploads: 3 photos
    ├─ Location: Auto-detected (Rajkot, Ward 5)
    └─ Submits complaint
         │
         ├─→ System generates: RCM-2024-0001
         ├─→ Stores in database
         └─→ Auto-calculates SLA due date (24 hours for pothole)

  📧 EMAIL SENT:
     To: citizen@email.com
     Subject: "Complaint Registered - RCM-2024-0001"
  
  🔔 IN-APP NOTIFICATION:
     "Your complaint has been registered"

         │
         ▼

┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: AUTO-ROUTING TO WARD ADMIN                                 │
└─────────────────────────────────────────────────────────────────────┘

  System
    │
    ├─ Extracts: District = Rajkot (ID: 4)
    ├─ Extracts: Ward = Ward 5
    ├─ Finds: Admin assigned to Rajkot → Ward 5
    └─ Updates complaint: assigned_admin_id = Admin_12

  📧 EMAIL SENT:
     To: admin_ward5@rcms.com
     Subject: "New Complaint in Your Ward - RCM-2024-0001"
  
  🔔 IN-APP NOTIFICATION:
     To: Admin (Ward 5)
     "New pothole complaint in your ward"

         │
         ▼

┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: ADMIN REVIEWS & ASSIGNS                                    │
└─────────────────────────────────────────────────────────────────────┘

  Admin (Ward 5)
    │
    ├─ Views complaint details
    ├─ Verifies location (on map)
    ├─ Sets priority: HIGH (main road)
    ├─ Selects constructor: "Road Repair Co."
    └─ Assigns task
         │
         └─→ Updates: assigned_constructor_id = Constructor_45
         │
         └─→ Updates: status = 'assigned'

  📧 EMAIL SENT:
     To: constructor_45@rcms.com
     Subject: "New Task Assigned - RCM-2024-0001"
     Details: Priority: HIGH, Location: Ward 5, SLA: 20 hours remaining
  
  📧 EMAIL SENT:
     To: citizen@email.com
     Subject: "Your complaint has been assigned"
  
  🔔 IN-APP NOTIFICATION:
     To: Constructor
     "High priority task assigned in Ward 5"
  
  🔔 IN-APP NOTIFICATION:
     To: Citizen
     "Work will start soon on your complaint"

         │
         ▼

┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: CONSTRUCTOR ACCEPTS & WORKS                                │
└─────────────────────────────────────────────────────────────────────┘

  Constructor
    │
    ├─ Views task in mobile app
    ├─ Reviews location on map
    ├─ Clicks "Accept Task"
    │   └─→ Updates: status = 'in_progress'
    │   └─→ Records: started_at = NOW()
    │
    ├─ Starts work
    ├─ Updates progress: 25%
    │   └─→ Uploads photo: "Excavation started"
    ├─ Updates progress: 50%
    │   └─→ Uploads photo: "Filling in progress"
    ├─ Updates progress: 75%
    │   └─→ Uploads photo: "Compaction done"
    └─ Marks complete: 100%
        └─→ Uploads: Before/After photos
        └─→ Updates: status = 'completed'
        └─→ Records: completed_at = NOW()

  📧 EMAIL SENT (on start):
     To: citizen@email.com
     "Work has started on your complaint"
  
  🔔 IN-APP NOTIFICATIONS (progress updates):
     To: Admin
     "Constructor updated progress: 25%, 50%, 75%"
  
  📧 EMAIL SENT (on completion):
     To: admin_ward5@rcms.com
     Subject: "Task Completed - Pending Approval"
  
  🔔 IN-APP NOTIFICATION:
     To: Citizen
     "Your complaint has been resolved"

         │
         ▼

┌─────────────────────────────────────────────────────────────────────┐
│ STEP 5: ADMIN APPROVES                                             │
└─────────────────────────────────────────────────────────────────────┘

  Admin (Ward 5)
    │
    ├─ Views before/after photos
    ├─ Verifies work quality
    └─ Approves completion
        └─→ Updates: status = 'closed'
        └─→ Records: closed_at = NOW()

  📧 EMAIL SENT:
     To: citizen@email.com
     Subject: "Complaint Closed - Please Rate Service"
  
  🔔 IN-APP NOTIFICATION:
     To: Citizen
     "Your complaint has been closed. Rate the service!"

         │
         ▼

┌─────────────────────────────────────────────────────────────────────┐
│ STEP 6: CITIZEN PROVIDES FEEDBACK                                  │
└─────────────────────────────────────────────────────────────────────┘

  Citizen
    │
    ├─ Views complaint resolution
    ├─ Sees before/after photos
    ├─ Rates service: ★★★★★ (5 stars)
    └─ Writes comment: "Excellent work, thank you!"
        └─→ Stores in feedback table
        └─→ Updates constructor performance metrics

  🎉 COMPLAINT LIFECYCLE COMPLETE
```

---

### **SCENARIO 2: Escalation Flow**

```
┌─────────────────────────────────────────────────────────────────────┐
│ CITIZEN REOPENS COMPLAINT                                          │
└─────────────────────────────────────────────────────────────────────┘

  Citizen (unhappy with resolution)
    │
    ├─ Clicks "Reopen Complaint"
    ├─ Reason: "Pothole reappeared after 2 days"
    └─ Uploads new photo
        └─→ Updates: status = 'reopened'

  📧 EMAIL SENT:
     To: admin_ward5@rcms.com
     Subject: "⚠️ Complaint Reopened - RCM-2024-0001"
  
  🔔 IN-APP NOTIFICATION:
     To: Admin
     "Citizen reopened complaint - investigate"

         │
         ▼

┌─────────────────────────────────────────────────────────────────────┐
│ ADMIN ESCALATES TO SUPER ADMIN                                     │
└─────────────────────────────────────────────────────────────────────┘

  Admin (Ward 5)
    │
    ├─ Investigates complaint
    ├─ Finds: Work quality issue
    ├─ Decides: Need better constructor
    └─ Clicks "Escalate to Super Admin"
        │
        ├─→ Updates: is_escalated = TRUE
        ├─→ Updates: escalated_to = super_admin_id
        └─→ Adds escalation_reason

  📧 EMAIL SENT:
     To: superadmin@rcms.com
     Subject: "🚨 Escalated Complaint - RCM-2024-0001"
     Details: Ward 5, Rajkot - Work quality issue
  
  🔔 IN-APP NOTIFICATION:
     To: Super Admin
     "High priority escalation from Ward 5"

         │
         ▼

┌─────────────────────────────────────────────────────────────────────┐
│ SUPER ADMIN INTERVENES                                             │
└─────────────────────────────────────────────────────────────────────┘

  Super Admin
    │
    ├─ Reviews complaint history
    ├─ Checks constructor performance
    ├─ Decision: Assign to different constructor
    └─ Reassigns to "Premium Road Services"
        └─→ Updates: assigned_constructor_id = Constructor_89
        └─→ Adds note: "Use better materials"

  📧 EMAIL SENT:
     To: constructor_89@rcms.com
     Subject: "Escalated Task - High Priority"
  
  📧 EMAIL SENT:
     To: citizen@email.com
     "We're addressing your concern with priority"

  🔄 CONTINUES WITH STANDARD FLOW
```

---

### **SCENARIO 3: SLA Breach & Auto-Escalation**

```
┌─────────────────────────────────────────────────────────────────────┐
│ SLA MONITORING (Cron Job - Runs Every Hour)                        │
└─────────────────────────────────────────────────────────────────────┘

  System (Background Service)
    │
    ├─ Checks all active complaints
    ├─ Finds: RCM-2024-0050
    │   ├─ SLA due: 2024-11-15 18:00
    │   ├─ Current time: 2024-11-15 14:00
    │   └─ Remaining: 4 hours (80% consumed)
    └─ Triggers 80% WARNING

  📧 EMAIL SENT:
     To: admin_ward12@rcms.com
     Subject: "⚠️ SLA Warning - 80% Time Consumed"
     Body: "Only 4 hours remaining for RCM-2024-0050"
  
  🔔 IN-APP NOTIFICATION:
     To: Admin (Ward 12)
     Type: WARNING
     "SLA warning: Take immediate action on RCM-2024-0050"

         │
         │ (Admin doesn't take action)
         │
         ▼  (2 hours later)

  System (Background Service)
    │
    ├─ Current time: 2024-11-15 16:00
    ├─ Remaining: 2 hours (90% consumed)
    └─ Triggers 90% CRITICAL WARNING

  📧 EMAIL SENT:
     To: admin_ward12@rcms.com, superadmin@rcms.com
     Subject: "🚨 CRITICAL SLA Warning - 90% Consumed"
  
  🔔 IN-APP NOTIFICATION:
     To: Admin + Super Admin
     Type: ERROR
     "CRITICAL: Only 2 hours left on RCM-2024-0050"

         │
         │ (Still no action)
         │
         ▼  (2 hours later)

  System (Background Service)
    │
    ├─ Current time: 2024-11-15 18:05
    ├─ SLA BREACHED!
    └─ Auto-actions:
        ├─→ Updates: is_sla_breached = TRUE
        ├─→ Updates: is_escalated = TRUE
        ├─→ Updates: escalated_to = super_admin
        └─→ Creates performance log (against admin)

  📧 EMAIL SENT:
     To: superadmin@rcms.com
     Subject: "🔴 SLA BREACHED - RCM-2024-0050"
     Body: "Ward 12, Surat - Admin failed to respond"
  
  🔔 IN-APP NOTIFICATION:
     To: Super Admin
     Type: ERROR
     "SLA breach in Ward 12 - Immediate intervention required"

  📊 ANALYTICS UPDATED:
     - Ward 12 SLA compliance: 92% → 88%
     - Admin performance score decreased
     - District report flagged
```

---

## 🔔 Notification Matrix

| Event | Citizen | Constructor | Admin | Super Admin |
|-------|---------|-------------|-------|-------------|
| Complaint registered | ✅ Email + App | ❌ | ❌ | ❌ |
| Auto-routed to ward | ❌ | ❌ | ✅ Email + App | ❌ |
| Priority set | ❌ | ❌ | ❌ | ❌ |
| Task assigned | ✅ Email + App | ✅ Email + App | ❌ | ❌ |
| Constructor accepts | ✅ App | ❌ | ✅ App | ❌ |
| Work started | ✅ Email + App | ❌ | ✅ App | ❌ |
| Progress updated (25/50/75%) | ✅ App | ❌ | ✅ App | ❌ |
| Work completed | ✅ Email + App | ❌ | ✅ Email + App | ❌ |
| Completion approved | ✅ Email + App | ✅ App | ❌ | ❌ |
| Complaint closed | ✅ Email + App | ❌ | ❌ | ❌ |
| Feedback received | ❌ | ✅ App | ✅ App | ❌ |
| Complaint reopened | ❌ | ❌ | ✅ Email + App | ❌ |
| Admin escalates | ❌ | ❌ | ❌ | ✅ Email + App |
| SLA 80% warning | ❌ | ❌ | ✅ Email + App | ❌ |
| SLA 90% critical | ❌ | ❌ | ✅ Email + App | ✅ Email + App |
| SLA breached | ❌ | ❌ | ✅ Email + App | ✅ Email + App |
| Daily summary | ❌ | ❌ | ✅ Email | ✅ Email |

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   CITIZEN   │
│   (Web/App) │
└──────┬──────┘
       │ POST /api/citizen/complaint
       │ {title, description, images, location}
       ▼
┌─────────────────────────────────────┐
│         BACKEND API                 │
│  ┌───────────────────────────────┐  │
│  │ 1. Validate Gujarat Location │  │
│  │ 2. Upload Images to Cloudinary│  │
│  │ 3. Generate Complaint Number  │  │
│  │ 4. Calculate SLA Due Date     │  │
│  │ 5. Save to Database           │  │
│  └───────────────────────────────┘  │
└────────────┬────────────────────────┘
             │
             ├─→ MySQL Database
             │   └─ complaints table
             │
             ├─→ Email Service
             │   └─ Send to citizen
             │
             ├─→ Notification Service
             │   └─ Create in-app notification
             │
             └─→ Auto-Routing Service
                 │
                 ├─ Find district from location
                 ├─ Find ward from location
                 ├─ Find assigned admin
                 └─ Update complaint.assigned_admin_id
                     │
                     └─→ Email Service
                         └─ Send to admin
```

---

## 🗺️ Gujarat Location Hierarchy

```
GUJARAT (State)
  │
  ├─ AHMEDABAD (District)
  │   ├─ Ward 1
  │   ├─ Ward 2
  │   └─ ... (192 wards)
  │
  ├─ SURAT (District)
  │   ├─ Ward 1
  │   ├─ Ward 2
  │   └─ ... (120 wards)
  │
  ├─ RAJKOT (District)
  │   ├─ Ward 1
  │   ├─ Ward 2
  │   ├─ Ward 3
  │   ├─ Ward 4
  │   ├─ Ward 5  ← Admin_12 assigned here
  │   └─ ... (72 wards)
  │
  └─ ... (33 districts total)
```

---

## 🎯 Key System Features

### **1. Auto-Routing Intelligence**
```javascript
// How it works:
1. Citizen submits complaint with GPS coordinates
2. System validates: Is location in Gujarat?
3. System finds: Which district? (using lat/lng)
4. System finds: Which ward? (using lat/lng + ward boundaries)
5. System queries: Which admin is assigned to this ward?
6. System updates: complaint.assigned_admin_id
7. System notifies: Admin via email + in-app
```

### **2. SLA Calculation**
```javascript
// Formula:
SLA Due Date = Submitted Time + Category SLA Hours

// Example:
- Complaint submitted: 2024-11-15 10:00
- Category: Pothole (24 hours SLA)
- SLA Due: 2024-11-16 10:00

// Monitoring:
- 80% warning: 2024-11-16 05:12 (4.8 hours left)
- 90% critical: 2024-11-16 07:36 (2.4 hours left)
- 100% breach: 2024-11-16 10:01
```

### **3. Role-Based Dashboard**

```javascript
// What each role sees on login:

CITIZEN:
  - My complaints count
  - Pending vs Resolved
  - Recent complaints
  - Map of my complaints

CONSTRUCTOR:
  - Today's tasks
  - Pending acceptance
  - In-progress tasks
  - Completed this week
  - Performance score

ADMIN:
  - Ward: X, District: Y
  - Pending complaints (ward)
  - Active tasks (ward)
  - SLA warnings (ward)
  - Constructor performance
  - Ward map with complaints

SUPER ADMIN:
  - Total complaints (Gujarat)
  - District-wise breakdown
  - SLA compliance (%)
  - Top performing districts
  - Worst performing districts
  - Gujarat heatmap
  - All admins list
```

---

## 🚀 Critical Success Factors

### **Must-Have Features**
1. ✅ Gujarat-only location validation
2. ✅ Auto-routing to correct ward
3. ✅ Email notifications at all stages
4. ✅ In-app notification bell
5. ✅ SLA monitoring with auto-escalation
6. ✅ Before/after photo comparison
7. ✅ Role-based access control
8. ✅ Mobile-responsive design

### **Nice-to-Have Features**
- Real-time updates (WebSocket)
- Mobile app (React Native)
- Offline mode
- Voice complaint recording
- AI image classification
- Predictive analytics

---

**This workflow diagram provides the complete picture of how all 4 panels interact! 🎉**
