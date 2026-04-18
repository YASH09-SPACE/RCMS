# RCMS Backend - Database Models Reference

> **Database**: MongoDB Atlas (Mongoose ODM)  
> **Connection**: `mongodb+srv://ybvyas786_db_user:Yash%40@cluster0.rlrs1tf.mongodb.net/rcms_db`  
> **Total Models**: 11

---

## 1. User (`models/User.js`)

**Purpose**: All user accounts across 4 roles.

| Field | Type | Notes |
|-------|------|-------|
| name | String | Required, max 100 |
| email | String | Required, unique, lowercase |
| mobile | String | Required, unique, 10 digits |
| password | String | Required, min 6, `select: false` (excluded from queries) |
| role | Enum | `citizen`, `constructor`, `admin`, `super_admin` |
| district | ObjectId → District | Nullable, for admin/constructor |
| ward | ObjectId → Ward | Nullable, for admin/constructor |
| isActive | Boolean | Default true |
| profileImage | String | Cloudinary URL |

**Special Features**:
- `pre('save')` hook: Auto-hashes password with bcrypt (10 rounds)
- `comparePassword(entered)` method: Compares plaintext vs hash
- Password NOT returned in queries by default (`select: false`)

---

## 2. District (`models/District.js`)

**Purpose**: 33 Gujarat districts.

| Field | Type | Notes |
|-------|------|-------|
| name | String | Required, e.g., "Ahmedabad" |
| code | String | Required, unique, uppercase, e.g., "AHM" |
| state | String | Default "Gujarat" |
| isActive | Boolean | Default true |

---

## 3. Ward (`models/Ward.js`)

**Purpose**: Municipal wards within districts.

| Field | Type | Notes |
|-------|------|-------|
| district | ObjectId → District | Required |
| wardNumber | String | Required, e.g., "1", "2" |
| wardName | String | e.g., "Navrangpura" |
| areaNames | [String] | Localities in this ward |
| isActive | Boolean | Default true |

**Index**: Compound unique on `{ district, wardNumber }`

---

## 4. ComplaintCategory (`models/ComplaintCategory.js`)

**Purpose**: Types of civic issues with SLA timelines.

| Field | Type | Notes |
|-------|------|-------|
| name | String | e.g., "Pothole", "Street Light" |
| icon | String | Icon identifier |
| description | String | Category description |
| defaultPriority | Enum | `low`, `medium`, `high` |
| slaHours | Number | Default 72, varies per category |
| isActive | Boolean | Default true |

**Seeded Categories**:
| Category | SLA Hours | Default Priority |
|----------|-----------|-----------------|
| Pothole | 24 | high |
| Street Light | 48 | medium |
| Drainage | 72 | high |
| Garbage Collection | 24 | medium |
| Water Supply | 48 | high |
| Park Maintenance | 168 | low |

---

## 5. Complaint (`models/Complaint.js`) ⭐ CORE MODEL

**Purpose**: Main complaint table — the central entity of the system.

| Field | Type | Notes |
|-------|------|-------|
| complaintNumber | String | Unique, auto-generated: `RCM-YYYY-XXXX` |
| user | ObjectId → User | Citizen who raised it |
| district | ObjectId → District | Required |
| ward | ObjectId → Ward | Required |
| locality | String | Specific locality name |
| address | String | Required, full address |
| latitude | Number | GPS coordinate |
| longitude | Number | GPS coordinate |
| category | ObjectId → ComplaintCategory | Required |
| title | String | Required, max 200 |
| description | String | Required |
| images | [String] | Cloudinary URLs |
| priority | Enum | `low`, `medium`, `high` |
| assignedAdmin | ObjectId → User | Ward admin handling this |
| assignedConstructor | ObjectId → User | Worker assigned |
| status | Enum | `pending`, `assigned`, `in_progress`, `completed`, `closed`, `reopened`, `escalated` |
| submittedAt | Date | When citizen submitted |
| assignedAt | Date | When admin assigned |
| startedAt | Date | When constructor started |
| completedAt | Date | When constructor finished |
| closedAt | Date | When admin approved |
| slaDueDate | Date | Calculated from category SLA hours |
| isSlaBreached | Boolean | Default false |
| isEscalated | Boolean | Default false |
| escalatedTo | ObjectId → User | Super admin |
| escalationReason | String | Why escalated |

**Indexes**: status, ward, district, priority, user, assignedAdmin, assignedConstructor, slaDueDate+isSlaBreached

---

## 6. ComplaintStatusHistory (`models/ComplaintStatusHistory.js`)

**Purpose**: Audit trail of every status change.

| Field | Type | Notes |
|-------|------|-------|
| complaint | ObjectId → Complaint | Required |
| status | String | Status at this point |
| updatedBy | ObjectId → User | Who made the change |
| progressPercentage | Number | 0-100 |
| comments | String | Notes about the update |
| images | [String] | Progress photos |

**Index**: `{ complaint: 1, createdAt: -1 }`

---

## 7. Feedback (`models/Feedback.js`)

**Purpose**: Citizen satisfaction rating after complaint resolution.

| Field | Type | Notes |
|-------|------|-------|
| complaint | ObjectId → Complaint | Required, **unique** (one feedback per complaint) |
| user | ObjectId → User | Citizen who gave feedback |
| rating | Number | 1-5 stars, required |
| comments | String | Optional text feedback |
| isSatisfied | Boolean | Default true |

---

## 8. Notification (`models/Notification.js`)

**Purpose**: In-app notifications for all users.

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId → User | Recipient |
| complaint | ObjectId → Complaint | Related complaint (optional) |
| type | Enum | `info`, `warning`, `success`, `error` |
| title | String | Required, max 200 |
| message | String | Required |
| isRead | Boolean | Default false |
| readAt | Date | When user read it |

**Index**: `{ user: 1, isRead: 1, createdAt: -1 }`

---

## 9. EmailLog (`models/EmailLog.js`)

**Purpose**: Track all sent/failed emails for audit.

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId → User | Recipient user |
| complaint | ObjectId → Complaint | Related complaint |
| toEmail | String | Email address |
| subject | String | Email subject |
| body | String | Email HTML content |
| status | Enum | `sent`, `failed`, `pending` |
| sentAt | Date | When successfully sent |
| errorMessage | String | Error details if failed |

---

## 10. AdminAssignment (`models/AdminAssignment.js`)

**Purpose**: Maps admins to wards (created by Super Admin).

| Field | Type | Notes |
|-------|------|-------|
| admin | ObjectId → User | Admin user |
| district | ObjectId → District | District |
| ward | ObjectId → Ward | Ward |
| assignedBy | ObjectId → User | Super admin who assigned |
| isActive | Boolean | Default true |
| deactivatedAt | Date | When deactivated |

**Index**: Unique on `{ admin, ward, isActive }`

---

## 11. ConstructorAssignment (`models/ConstructorAssignment.js`)

**Purpose**: Maps constructors to wards (created by Admin).

| Field | Type | Notes |
|-------|------|-------|
| constructor | ObjectId → User | Constructor user |
| district | ObjectId → District | District |
| ward | ObjectId → Ward | Ward |
| assignedBy | ObjectId → User | Admin who assigned |
| specialization | String | e.g., "Roads", "Drainage" |
| isActive | Boolean | Default true |

---

## Entity Relationship Diagram

```
User (4 roles)
 ├── Citizen → Complaints → Feedback
 ├── Admin ← AdminAssignment (ward)
 │    └── assigns → Constructor
 ├── Constructor ← ConstructorAssignment (ward)
 │    └── works on → Complaints
 └── Super Admin → manages Admins

Complaint
 ├── belongs to → User (citizen)
 ├── location → District → Ward
 ├── type → ComplaintCategory (SLA hours)
 ├── assigned to → User (admin) + User (constructor)
 ├── tracked by → ComplaintStatusHistory[]
 ├── rated by → Feedback
 └── generates → Notifications[] + EmailLogs[]
```
