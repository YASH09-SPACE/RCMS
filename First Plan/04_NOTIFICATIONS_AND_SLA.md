# RCMS - Notification & Email System Design

> This document describes the complete notification system including all 11 email triggers,
> the in-app notification matrix, and the SLA monitoring workflow.

---

## 📧 Email System

### Configuration
- **Provider**: Gmail via Nodemailer
- **Auth**: Gmail App Password (not OAuth)
- **Sender**: `ybvyas786@gmail.com`
- **App Password**: `hvyh khgg wdty ryrm`
- **Config file**: `backend/config/email.js`
- **Service file**: `backend/services/emailService.js`

### Email Verification
The transporter verifies the connection on server startup:
```
✅ Email service ready   ← success
❌ Email service error   ← credentials issue
```

### Email Logging
Every email attempt (sent OR failed) is logged to the `emaillogs` MongoDB collection with:
- Recipient, subject, body, status (sent/failed/pending), error message if failed

---

## 🔔 Complete Notification Matrix

### Who Gets Notified When

| Event | Citizen | Constructor | Admin | Super Admin |
|-------|---------|-------------|-------|-------------|
| Complaint registered | ✅ Email + App | ❌ | ❌ | ❌ |
| Auto-routed to ward | ❌ | ❌ | ✅ Email + App | ❌ |
| Task assigned | ✅ Email + App | ✅ Email + App | ❌ | ❌ |
| Constructor accepts | ✅ App | ❌ | ✅ App | ❌ |
| Work started | ✅ Email + App | ❌ | ✅ App | ❌ |
| Progress updated | ✅ App | ❌ | ✅ App | ❌ |
| Work completed | ✅ Email + App | ❌ | ✅ Email + App | ❌ |
| Completion approved | ✅ Email + App | ✅ App | ❌ | ❌ |
| Complaint closed | ✅ Email + App | ❌ | ❌ | ❌ |
| Feedback received | ❌ | ✅ App | ✅ App | ❌ |
| Complaint reopened | ❌ | ❌ | ✅ Email + App | ❌ |
| Admin escalates | ❌ | ❌ | ❌ | ✅ Email + App |
| SLA 80% warning | ❌ | ❌ | ✅ Email + App | ❌ |
| SLA 90% critical | ❌ | ❌ | ✅ Email + App | ✅ Email + App |
| SLA breached | ❌ | ❌ | ✅ Email + App | ✅ Email + App |

---

## ⏰ SLA Monitoring System (NOT YET IMPLEMENTED)

### SLA Timeline Rules
| Category | SLA Hours |
|----------|-----------|
| Pothole | 24 hours |
| Garbage Collection | 24 hours |
| Street Light | 48 hours |
| Water Supply | 48 hours |
| Drainage | 72 hours |
| Park Maintenance | 168 hours (7 days) |

### SLA Calculation
```
SLA Due Date = Complaint Submitted Time + Category SLA Hours
```

### Monitoring Flow (Cron job - every hour)
```
1. All active complaints (pending/assigned/in_progress) checked
2. Time consumed > 80% → WARNING email+notification to Admin
3. Time consumed > 90% → CRITICAL email to Admin + Super Admin
4. Time consumed = 100% → BREACHED:
   - Mark complaint: isSlaBreached = true
   - Auto-escalate: isEscalated = true, escalatedTo = super_admin
   - Email Super Admin with breach details
   - Update analytics
```

### Implementation (to be built)
```
File: backend/cron/slaMonitor.js
Schedule: node-cron '0 * * * *' (every hour on the hour)
```

---

## 🔄 Complaint Status Flow

```
pending → assigned → in_progress → completed → closed
   ↓                                    ↓         ↓
   └→ escalated (SLA breach)      reopened ←──┘
                                      ↓
                                  assigned (re-assigned)
```

### Status Meanings
| Status | Set By | Meaning |
|--------|--------|---------|
| `pending` | System | Just submitted, no admin action yet |
| `assigned` | Admin | Admin assigned to constructor |
| `in_progress` | Constructor | Constructor accepted and started work |
| `completed` | Constructor | Constructor says work is done |
| `closed` | Admin | Admin approved the completion |
| `reopened` | Citizen | Citizen not satisfied, reopened |
| `escalated` | System/Admin | SLA breached or admin escalated to super admin |
