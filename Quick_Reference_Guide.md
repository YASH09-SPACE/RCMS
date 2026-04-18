# 📚 RCMS Quick Reference Guide

## 🎯 Project Overview
**RoadCare Management System (RCMS)** - Gujarat State  
A hierarchical complaint management system with 4 user panels and full notification infrastructure.

---

## 👥 4 User Panels

| Panel | Access Level | Key Functions |
|-------|--------------|---------------|
| **Citizen** | Public | Raise complaints, track status, provide feedback |
| **Constructor** | Ward-level | Accept tasks, update progress, upload photos |
| **Admin** | Ward-level | Manage ward complaints, assign tasks, approve work |
| **Super Admin** | State-level | Manage admins, district analytics, escalations |

---

## 🗄️ Database Tables (12 Total)

### Core Tables
1. **users** - All user accounts (4 roles)
2. **districts** - 33 Gujarat districts
3. **wards** - Municipal wards within districts
4. **complaints** - Main complaint table
5. **complaint_categories** - Issue types (Pothole, Street Light, etc.)

### Supporting Tables
6. **complaint_status_history** - Status change tracking
7. **feedback** - Citizen ratings
8. **notifications** - In-app notifications
9. **email_logs** - Email tracking
10. **admin_assignments** - Admin → Ward mapping
11. **constructor_assignments** - Constructor → Ward mapping
12. **sla_configurations** - SLA rules (optional)

---

## 🔌 API Endpoints (28 Total)

### Authentication (3)
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
```

### Citizen (6)
```
GET  /api/citizen/dashboard
POST /api/citizen/complaint          ← Image upload + GPS
GET  /api/citizen/complaints
GET  /api/citizen/complaint/:id
POST /api/citizen/feedback
PUT  /api/citizen/reopen/:id
```

### Constructor (5)
```
GET  /api/constructor/dashboard
GET  /api/constructor/tasks
PUT  /api/constructor/accept/:id
PUT  /api/constructor/update/:id     ← Progress + photos
POST /api/constructor/complete/:id
```

### Admin (7)
```
GET  /api/admin/dashboard            ← Ward-specific
GET  /api/admin/complaints
PUT  /api/admin/assign/:id
PUT  /api/admin/priority/:id
PUT  /api/admin/approve/:id
POST /api/admin/escalate/:id
GET  /api/admin/constructors
```

### Super Admin (6)
```
GET    /api/superadmin/dashboard     ← State-wide
POST   /api/superadmin/admin
GET    /api/superadmin/admins
PUT    /api/superadmin/assign-ward
GET    /api/superadmin/analytics
GET    /api/superadmin/heatmap
```

### Location (2)
```
GET  /api/location/districts
GET  /api/location/wards/:districtId
```

### Notifications (4)
```
GET    /api/notifications
PUT    /api/notifications/read/:id
PUT    /api/notifications/read-all
DELETE /api/notifications/:id
```

---

## 📧 Email Configuration (Gmail App Password)

### Setup Steps
1. Go to [Google Account Settings](https://myaccount.google.com)
2. Security → 2-Step Verification (enable)
3. Security → App Passwords
4. Generate password for "Mail" → "Other (Custom name)"
5. Copy 16-character password (e.g., `abcd efgh ijkl mnop`)

### Environment Variables
```env
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

### Nodemailer Config
```javascript
// config/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});
```

---

## 🔔 Notification Triggers (11 Email Events)

| Event | Recipient | Email Subject |
|-------|-----------|---------------|
| Complaint registered | Citizen | "Complaint Registered - RCM-2024-XXXX" |
| Auto-routed to ward | Admin | "New Complaint in Your Ward" |
| Task assigned | Constructor | "New Task Assigned - HIGH PRIORITY" |
| Task assigned | Citizen | "Your complaint has been assigned" |
| Work started | Citizen | "Work has started on your complaint" |
| Work completed | Admin | "Task Completed - Pending Approval" |
| Work completed | Citizen | "Your complaint has been resolved" |
| Complaint closed | Citizen | "Complaint Closed - Please Rate Service" |
| Complaint reopened | Admin | "⚠️ Complaint Reopened - Investigate" |
| SLA 80% warning | Admin | "⚠️ SLA Warning - 80% Time Consumed" |
| SLA breached | Super Admin | "🔴 SLA BREACHED - Immediate Action" |

---

## 🗺️ Gujarat Districts (33 Total)

### Major Districts
- Ahmedabad (Capital region)
- Surat (South Gujarat)
- Vadodara (Central Gujarat)
- Rajkot (Saurashtra)
- Gandhinagar (Capital)

### All Districts
```javascript
const DISTRICTS = [
  'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar',
  'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Bharuch',
  'Mehsana', 'Kheda', 'Panchmahal', 'Sabarkantha', 'Banaskantha',
  'Kutch', 'Amreli', 'Porbandar', 'Navsari', 'Valsad',
  'Tapi', 'Narmada', 'Dang', 'Patan', 'Surendranagar',
  'Botad', 'Morbi', 'Devbhoomi Dwarka', 'Gir Somnath',
  'Mahisagar', 'Aravalli', 'Chhota Udaipur', 'Dahod'
];
```

### Gujarat Coordinates (for validation)
```javascript
const GUJARAT_BOUNDS = {
  north: 24.7,   // Northernmost point
  south: 20.1,   // Southernmost point
  east: 74.5,    // Easternmost point
  west: 68.1     // Westernmost point
};
```

---

## 🏗️ Tech Stack

### Backend
```json
{
  "runtime": "Node.js 18+",
  "framework": "Express.js",
  "database": "MySQL / PostgreSQL",
  "auth": "JWT (jsonwebtoken)",
  "email": "Nodemailer",
  "file_upload": "Multer",
  "image_storage": "Cloudinary",
  "validation": "express-validator",
  "cron": "node-cron"
}
```

### Frontend
```json
{
  "library": "React 18",
  "router": "React Router v6",
  "http": "Axios",
  "maps": "React Leaflet",
  "charts": "Chart.js",
  "notifications": "React Hot Toast",
  "styling": "Tailwind CSS / Material-UI",
  "icons": "Lucide React"
}
```

---

## 📂 Project Structure

### Backend
```
backend/
├── config/           # DB, Email, Cloudinary
├── models/           # Database models
├── controllers/      # Business logic
├── routes/           # API routes
├── middleware/       # Auth, validation
├── services/         # Email, notifications, SLA
├── utils/            # Helpers
├── cron/             # Scheduled jobs
└── server.js         # Entry point
```

### Frontend
```
client/
├── src/
│   ├── components/   # Reusable UI
│   ├── pages/        # 4 panel pages
│   ├── services/     # API calls
│   ├── context/      # Global state
│   ├── routes/       # Protected routes
│   └── App.jsx       # Main app
```

---

## 🔐 Security Checklist

- [ ] Password hashing (bcrypt, 10 rounds)
- [ ] JWT token with expiration (7 days)
- [ ] Role-based middleware
- [ ] Input validation (express-validator)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection (sanitize inputs)
- [ ] CORS configuration (whitelist frontend)
- [ ] Rate limiting (100 requests/hour per IP)
- [ ] File upload validation (images only, max 5MB)
- [ ] HTTPS in production

---

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] All environment variables set
- [ ] Database schema created
- [ ] Seed data inserted (districts, categories, super admin)
- [ ] Email credentials tested
- [ ] Cloudinary account configured
- [ ] All API endpoints tested

### Production
- [ ] Server: Ubuntu 20.04+ / AWS EC2 / DigitalOcean
- [ ] Node.js: PM2 process manager
- [ ] Database: MySQL 8.0+ (RDS recommended)
- [ ] Web Server: Nginx (reverse proxy)
- [ ] SSL: Let's Encrypt
- [ ] Domain: rcms.gujarat.gov.in (example)

---

## 📊 Performance Targets

| Metric | Target | How to Achieve |
|--------|--------|----------------|
| API response time | < 200ms | Database indexing, caching |
| Image upload time | < 3s | Cloudinary CDN, compression |
| Dashboard load time | < 2s | Lazy loading, code splitting |
| Email delivery time | < 5s | Async processing, queue |
| SLA monitoring accuracy | 100% | Cron job every hour |
| Uptime | 99.9% | Load balancer, monitoring |

---

## 🧪 Testing Strategy

### Backend Testing
```javascript
// Example test
describe('Complaint API', () => {
  it('should create complaint with valid Gujarat location', async () => {
    const response = await request(app)
      .post('/api/citizen/complaint')
      .set('Authorization', `Bearer ${token}`)
      .send({
        category_id: 1,
        title: 'Pothole on Main Road',
        description: 'Large pothole causing accidents',
        latitude: 23.0225,  // Ahmedabad
        longitude: 72.5714,
        district_id: 1,
        ward_id: 5
      });
    
    expect(response.status).toBe(201);
    expect(response.body.complaint_number).toMatch(/RCM-\d{4}-\d{4}/);
  });
  
  it('should reject complaint outside Gujarat', async () => {
    const response = await request(app)
      .post('/api/citizen/complaint')
      .send({
        latitude: 19.0760,  // Mumbai (outside Gujarat)
        longitude: 72.8777
      });
    
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Location must be within Gujarat state');
  });
});
```

### Frontend Testing
- Unit tests: React Testing Library
- E2E tests: Cypress
- Visual regression: Percy

---

## 📈 Analytics & Reports

### Admin Reports (Ward-level)
- Total complaints (this month)
- Pending vs Resolved
- Average resolution time
- Constructor performance
- SLA compliance %

### Super Admin Reports (State-level)
- District-wise complaint count
- Category-wise distribution
- SLA breach trends
- Top performing wards
- Worst performing wards
- Monthly comparison (YoY)

---

## 🔄 Workflow Summary

```
CITIZEN submits complaint
    ↓
SYSTEM auto-routes to ward admin
    ↓
ADMIN assigns to constructor
    ↓
CONSTRUCTOR completes work
    ↓
ADMIN approves completion
    ↓
CITIZEN provides feedback
    ↓
SYSTEM closes complaint
```

---

## 🎯 Key Success Metrics

| KPI | Target | Current | Status |
|-----|--------|---------|--------|
| Average resolution time | < 48 hours | - | - |
| SLA compliance | > 90% | - | - |
| Citizen satisfaction | > 4.0/5 | - | - |
| Constructor response time | < 4 hours | - | - |
| Admin approval time | < 2 hours | - | - |
| System uptime | 99.9% | - | - |

---

## 🛠️ Troubleshooting Guide

### Email not sending
```bash
# Check environment variables
echo $EMAIL_USER
echo $EMAIL_APP_PASSWORD

# Test nodemailer
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});
transporter.verify().then(console.log).catch(console.error);
"
```

### Database connection failed
```javascript
// Check MySQL connection
mysql -u root -p -h localhost rcms_db

// Test connection in code
const mysql = require('mysql2/promise');
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'rcms_db'
});
console.log('Connected!');
```

### Image upload failing
```javascript
// Test Cloudinary
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

cloudinary.api.ping((error, result) => {
  if (error) console.error(error);
  else console.log('Cloudinary connected!', result);
});
```

---

## 📞 Support Resources

### Documentation
- [Node.js Docs](https://nodejs.org/docs)
- [React Docs](https://react.dev)
- [MySQL Docs](https://dev.mysql.com/doc)
- [Nodemailer](https://nodemailer.com)
- [Cloudinary](https://cloudinary.com/documentation)

### Community
- Stack Overflow: Tag `rcms` or `gujarat-complaint-system`
- GitHub Issues: Report bugs
- Email: support@rcms.com (example)

---

## 🎓 Learning Resources

### For Interviews
- **System Design**: Explain the hierarchical structure
- **Scalability**: How would you handle 1M users?
- **Security**: What measures are in place?
- **Performance**: How to optimize database queries?

### Demo Points
1. Show live complaint flow from citizen to constructor
2. Demonstrate auto-routing based on location
3. Show email notifications in inbox
4. Display Gujarat heatmap with complaint density
5. Explain SLA monitoring and escalation

---

## 📋 Final Checklist

### Before Launch
- [ ] All 12 database tables created
- [ ] 33 Gujarat districts seeded
- [ ] Complaint categories seeded
- [ ] Super admin account created
- [ ] JWT secret generated
- [ ] Email credentials working
- [ ] Cloudinary configured
- [ ] All API endpoints tested
- [ ] Role-based access working
- [ ] Gujarat location validation working
- [ ] SLA cron job running
- [ ] Notifications working (email + in-app)
- [ ] Frontend deployed
- [ ] Backend deployed
- [ ] Domain configured
- [ ] SSL certificate installed

### Post-Launch
- [ ] Monitor error logs
- [ ] Track SLA compliance
- [ ] Gather user feedback
- [ ] Plan v2 features
- [ ] Regular backups configured

---

**You're now ready to build a production-grade RoadCare Management System! 🚀**

**Next Steps:**
1. Review the complete system design document
2. Use the AI Agent Master Prompt to build the application
3. Follow the workflow diagram for implementation
4. Use this quick reference for daily development

Good luck! 💪
