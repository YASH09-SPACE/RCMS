# 🤖 AI AGENT PROMPT - RoadCare Management System (RCMS)

## 🎯 MASTER PROMPT FOR AI AGENT

You are tasked with building a **complete production-ready RoadCare Management System (RCMS)** for Gujarat State. This is a hierarchical complaint management system with 4 user panels and full notification infrastructure.

---

## 📋 CORE REQUIREMENTS

### **Project Scope**
Build a full-stack web application with:
- **Backend**: Node.js + Express + MySQL
- **Frontend**: React 18 + React Router + Tailwind CSS
- **Authentication**: JWT-based with role-based access control
- **Notifications**: Email (Gmail App Password) + In-app notifications
- **Location**: Gujarat-only with 33 districts and ward-level management
- **File Upload**: Cloudinary for images

### **4 User Panels**
1. **Citizen Panel** - Report and track civic issues
2. **Constructor Panel** - Physical workers executing tasks
3. **Admin Panel** - Ward-level managers
4. **Super Admin Panel** - State-level oversight

---

## 🏗️ DATABASE SCHEMA

### **Tables to Create** (MySQL)

```sql
-- 1. users
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  mobile VARCHAR(10) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('citizen', 'constructor', 'admin', 'super_admin') NOT NULL,
  district_id INT NULL,
  ward_id INT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  profile_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id),
  FOREIGN KEY (ward_id) REFERENCES wards(id)
);

-- 2. districts (Gujarat specific)
CREATE TABLE districts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  state VARCHAR(50) DEFAULT 'Gujarat',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. wards
CREATE TABLE wards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  district_id INT NOT NULL,
  ward_number VARCHAR(10) NOT NULL,
  ward_name VARCHAR(100),
  area_names TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id),
  UNIQUE KEY unique_ward (district_id, ward_number)
);

-- 4. complaint_categories
CREATE TABLE complaint_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  description TEXT,
  default_priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  sla_hours INT DEFAULT 72,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. complaints (MAIN TABLE)
CREATE TABLE complaints (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_number VARCHAR(20) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  district_id INT NOT NULL,
  ward_id INT NOT NULL,
  locality VARCHAR(200),
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  category_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  images JSON,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  assigned_admin_id INT NULL,
  assigned_constructor_id INT NULL,
  status ENUM('pending', 'assigned', 'in_progress', 'completed', 'closed', 'reopened', 'escalated') DEFAULT 'pending',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_at TIMESTAMP NULL,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  closed_at TIMESTAMP NULL,
  sla_due_date TIMESTAMP,
  is_sla_breached BOOLEAN DEFAULT FALSE,
  is_escalated BOOLEAN DEFAULT FALSE,
  escalated_to INT NULL,
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
  INDEX idx_district (district_id)
);

-- 6. complaint_status_history
CREATE TABLE complaint_status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  updated_by INT NOT NULL,
  progress_percentage INT DEFAULT 0,
  comments TEXT,
  images JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- 7. feedback
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

-- 8. notifications
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

-- 9. email_logs
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

-- 10. admin_assignments
CREATE TABLE admin_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_id INT NOT NULL,
  district_id INT NOT NULL,
  ward_id INT NOT NULL,
  assigned_by INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deactivated_at TIMESTAMP NULL,
  FOREIGN KEY (admin_id) REFERENCES users(id),
  FOREIGN KEY (district_id) REFERENCES districts(id),
  FOREIGN KEY (ward_id) REFERENCES wards(id),
  FOREIGN KEY (assigned_by) REFERENCES users(id),
  UNIQUE KEY unique_assignment (admin_id, ward_id, is_active)
);

-- 11. constructor_assignments
CREATE TABLE constructor_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  constructor_id INT NOT NULL,
  district_id INT NOT NULL,
  ward_id INT NOT NULL,
  assigned_by INT NOT NULL,
  specialization VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (constructor_id) REFERENCES users(id),
  FOREIGN KEY (district_id) REFERENCES districts(id),
  FOREIGN KEY (ward_id) REFERENCES wards(id),
  FOREIGN KEY (assigned_by) REFERENCES users(id)
);
```

### **Seed Data to Insert**

```sql
-- Insert Gujarat Districts (All 33)
INSERT INTO districts (name, code) VALUES
('Ahmedabad', 'AHM'),
('Surat', 'SUR'),
('Vadodara', 'VAD'),
('Rajkot', 'RAJ'),
('Bhavnagar', 'BHA'),
('Jamnagar', 'JAM'),
('Junagadh', 'JUN'),
('Gandhinagar', 'GAN'),
('Anand', 'ANA'),
('Bharuch', 'BHR'),
('Mehsana', 'MEH'),
('Kheda', 'KHE'),
('Panchmahal', 'PAN'),
('Sabarkantha', 'SAB'),
('Banaskantha', 'BAN'),
('Kutch', 'KUT'),
('Amreli', 'AMR'),
('Porbandar', 'POR'),
('Navsari', 'NAV'),
('Valsad', 'VAL'),
('Tapi', 'TAP'),
('Narmada', 'NAR'),
('Dang', 'DAN'),
('Patan', 'PAT'),
('Surendranagar', 'SUR'),
('Botad', 'BOT'),
('Morbi', 'MOR'),
('Devbhoomi Dwarka', 'DEV'),
('Gir Somnath', 'GIR'),
('Mahisagar', 'MAH'),
('Aravalli', 'ARA'),
('Chhota Udaipur', 'CHH'),
('Dahod', 'DAH');

-- Insert Complaint Categories
INSERT INTO complaint_categories (name, icon, sla_hours) VALUES
('Pothole', 'road', 24),
('Street Light', 'lightbulb', 48),
('Drainage', 'water', 72),
('Garbage Collection', 'trash', 24),
('Water Supply', 'droplet', 48),
('Park Maintenance', 'tree', 168);

-- Create Super Admin (default user)
INSERT INTO users (name, email, mobile, password, role) VALUES
('Super Admin', 'superadmin@rcms.com', '9999999999', '$2a$10$hashed_password', 'super_admin');
```

---

## 🔐 BACKEND IMPLEMENTATION

### **Project Structure**
```
backend/
├── config/
│   ├── db.js                    # MySQL connection
│   ├── email.js                 # Nodemailer config
│   └── cloudinary.js            # Image upload
├── models/
│   ├── User.js
│   ├── Complaint.js
│   ├── Notification.js
│   └── ... (all other models)
├── controllers/
│   ├── authController.js
│   ├── citizenController.js
│   ├── constructorController.js
│   ├── adminController.js
│   └── superAdminController.js
├── routes/
│   ├── authRoutes.js
│   ├── citizenRoutes.js
│   ├── constructorRoutes.js
│   ├── adminRoutes.js
│   └── superAdminRoutes.js
├── middleware/
│   ├── authMiddleware.js        # JWT verification
│   ├── roleMiddleware.js        # Role-based access
│   └── gujaratLocationCheck.js  # Validate Gujarat only
├── services/
│   ├── emailService.js          # Send emails
│   ├── notificationService.js   # In-app notifications
│   └── slaService.js            # SLA monitoring
├── utils/
│   ├── complaintNumberGenerator.js
│   └── errorHandler.js
├── server.js
└── package.json
```

### **Key Backend Features to Implement**

#### 1. **Authentication System**
```javascript
// controllers/authController.js
const register = async (req, res) => {
  // 1. Validate input
  // 2. Check if user exists
  // 3. Hash password (bcrypt)
  // 4. Create user
  // 5. Generate JWT token
  // 6. Send welcome email
  // 7. Return token + user data
};

const login = async (req, res) => {
  // 1. Validate credentials
  // 2. Check user exists and is active
  // 3. Verify password
  // 4. Generate JWT token
  // 5. Return token + user data
};
```

#### 2. **Complaint Routing System** (CRITICAL)
```javascript
// services/autoRouteService.js
const autoAssignToWard = async (complaint) => {
  // 1. Extract district from location
  // 2. Extract ward from location
  // 3. Find admin assigned to that ward
  // 4. Update complaint with admin_id
  // 5. Send notification to admin
  // 6. Send confirmation to citizen
};
```

#### 3. **Notification System** (CRITICAL)

**Email Service**:
```javascript
// services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD  // Gmail App Password
  }
});

const sendComplaintRegistered = async (user, complaint) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Complaint Registered - ${complaint.complaint_number}`,
    html: `
      <h2>Thank you for reporting!</h2>
      <p>Your complaint has been registered.</p>
      <p><strong>Complaint Number:</strong> ${complaint.complaint_number}</p>
      <p><strong>Location:</strong> ${complaint.address}</p>
      <p>Track status at: ${process.env.FRONTEND_URL}/complaints/${complaint.id}</p>
    `
  });
  
  // Log email
  await EmailLog.create({
    user_id: user.id,
    complaint_id: complaint.id,
    to_email: user.email,
    subject: `Complaint Registered - ${complaint.complaint_number}`,
    status: 'sent'
  });
};

const sendTaskAssigned = async (constructor, complaint) => {
  // Similar email logic
};

const sendSLAWarning = async (admin, complaint) => {
  // SLA warning email
};
```

**In-App Notification Service**:
```javascript
// services/notificationService.js
const createNotification = async (userId, complaintId, type, title, message) => {
  await Notification.create({
    user_id: userId,
    complaint_id: complaintId,
    type,  // 'info', 'warning', 'success', 'error'
    title,
    message,
    is_read: false
  });
  
  // Optional: Real-time push via Socket.io
  io.to(`user_${userId}`).emit('notification', {
    title,
    message,
    type
  });
};
```

#### 4. **SLA Monitoring** (Cron Job)
```javascript
// cron/slaMonitor.js
const cron = require('node-cron');

// Run every hour
cron.schedule('0 * * * *', async () => {
  const now = new Date();
  
  // Find complaints approaching SLA (80%)
  const warningComplaints = await Complaint.findAll({
    where: {
      status: ['pending', 'assigned', 'in_progress'],
      sla_due_date: {
        [Op.lte]: new Date(now.getTime() + 0.2 * slaHours * 3600000)
      }
    }
  });
  
  for (const complaint of warningComplaints) {
    // Send warning to admin
    await emailService.sendSLAWarning(complaint.admin, complaint);
  }
  
  // Find breached complaints
  const breachedComplaints = await Complaint.findAll({
    where: {
      sla_due_date: { [Op.lte]: now },
      is_sla_breached: false
    }
  });
  
  for (const complaint of breachedComplaints) {
    // Mark as breached
    await complaint.update({ is_sla_breached: true });
    
    // Escalate to super admin
    await notificationService.createNotification(
      superAdminId,
      complaint.id,
      'error',
      'SLA Breached',
      `Complaint ${complaint.complaint_number} has breached SLA`
    );
  }
});
```

#### 5. **Gujarat Location Validation**
```javascript
// middleware/gujaratLocationCheck.js
const validateGujaratLocation = async (req, res, next) => {
  const { latitude, longitude } = req.body;
  
  // Gujarat boundaries
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
  
  next();
};
```

### **API Endpoints to Implement**

```javascript
// Authentication
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/forgot-password

// Citizen
GET    /api/citizen/dashboard
POST   /api/citizen/complaint         # With image upload + location validation
GET    /api/citizen/complaints        # User's complaints
GET    /api/citizen/complaint/:id
POST   /api/citizen/feedback
PUT    /api/citizen/reopen/:id

// Constructor
GET    /api/constructor/dashboard
GET    /api/constructor/tasks         # Assigned tasks
PUT    /api/constructor/accept/:id
PUT    /api/constructor/update/:id    # Update progress with photos
POST   /api/constructor/complete/:id

// Admin
GET    /api/admin/dashboard           # Ward-specific stats
GET    /api/admin/complaints          # Ward complaints
PUT    /api/admin/assign/:id          # Assign to constructor
PUT    /api/admin/priority/:id
PUT    /api/admin/approve/:id
POST   /api/admin/escalate/:id        # Escalate to super admin
GET    /api/admin/constructors        # Ward constructors
POST   /api/admin/constructor         # Add new constructor

// Super Admin
GET    /api/superadmin/dashboard      # State-wide stats
POST   /api/superadmin/admin          # Create ward admin
GET    /api/superadmin/admins
PUT    /api/superadmin/assign-ward    # Assign admin to district/ward
DELETE /api/superadmin/admin/:id
GET    /api/superadmin/analytics      # District comparison
GET    /api/superadmin/sla-breaches
GET    /api/superadmin/heatmap        # Gujarat complaint map

// Locations
GET    /api/location/districts        # All 33 districts
GET    /api/location/wards/:districtId

// Notifications
GET    /api/notifications             # User's notifications
PUT    /api/notifications/read/:id
PUT    /api/notifications/read-all
```

---

## 💻 FRONTEND IMPLEMENTATION

### **Project Structure**
```
client/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── NotificationBell.jsx  # Real-time notifications
│   │   │   ├── Loader.jsx
│   │   │   └── Toast.jsx
│   │   ├── maps/
│   │   │   ├── LocationPicker.jsx    # District → Ward dropdown
│   │   │   └── GujaratMap.jsx        # Leaflet map
│   │   └── cards/
│   │       ├── ComplaintCard.jsx
│   │       └── TaskCard.jsx
│   ├── pages/
│   │   ├── citizen/
│   │   │   ├── CitizenDashboard.jsx
│   │   │   ├── RaiseComplaint.jsx    # Form with image upload
│   │   │   ├── MyComplaints.jsx
│   │   │   └── ProvideFeedback.jsx
│   │   ├── constructor/
│   │   │   ├── ConstructorDashboard.jsx
│   │   │   ├── MyTasks.jsx
│   │   │   └── UpdateProgress.jsx    # Progress slider + photos
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx    # Ward-specific
│   │   │   ├── PendingComplaints.jsx
│   │   │   ├── AssignTask.jsx
│   │   │   └── ManageConstructors.jsx
│   │   ├── superadmin/
│   │   │   ├── SuperAdminDashboard.jsx
│   │   │   ├── ManageAdmins.jsx
│   │   │   ├── CreateAdmin.jsx       # Assign to district/ward
│   │   │   ├── DistrictAnalytics.jsx
│   │   │   └── GujaratHeatmap.jsx    # Leaflet with complaint density
│   │   └── auth/
│   │       ├── Login.jsx
│   │       └── Register.jsx
│   ├── services/
│   │   ├── api.js                    # Axios instance with JWT
│   │   ├── authService.js
│   │   ├── complaintService.js
│   │   └── notificationService.js
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── NotificationContext.jsx
│   ├── routes/
│   │   ├── ProtectedRoute.jsx
│   │   └── RoleBasedRoute.jsx        # Redirect based on role
│   ├── App.jsx
│   └── main.jsx
```

### **Key Frontend Features to Implement**

#### 1. **Raise Complaint Form** (Citizen)
```jsx
// pages/citizen/RaiseComplaint.jsx
const RaiseComplaint = () => {
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    description: '',
    district_id: '',
    ward_id: '',
    address: '',
    latitude: '',
    longitude: '',
    images: []
  });
  
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  useEffect(() => {
    // Fetch districts
    fetchDistricts();
    
    // Get user's current location
    navigator.geolocation.getCurrentPosition((position) => {
      setFormData({
        ...formData,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    });
  }, []);
  
  const handleDistrictChange = async (districtId) => {
    setFormData({ ...formData, district_id: districtId });
    const wardData = await fetchWards(districtId);
    setWards(wardData);
  };
  
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // Upload to Cloudinary and get URLs
    uploadImagesToCloudinary(files);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate Gujarat location
    if (!isGujaratLocation(formData.latitude, formData.longitude)) {
      toast.error('Location must be in Gujarat');
      return;
    }
    
    const response = await complaintService.raiseComplaint(formData);
    
    if (response.success) {
      toast.success(`Complaint registered: ${response.complaint_number}`);
      navigate('/citizen/complaints');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Category dropdown */}
      {/* District dropdown */}
      {/* Ward dropdown (based on district) */}
      {/* Title input */}
      {/* Description textarea */}
      {/* Image upload (multiple) */}
      {/* Location (auto-detected or manual) */}
      {/* Submit button */}
    </form>
  );
};
```

#### 2. **Notification Bell** (All Roles)
```jsx
// components/common/NotificationBell.jsx
const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    fetchNotifications();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const fetchNotifications = async () => {
    const data = await notificationService.getNotifications();
    setNotifications(data);
    setUnreadCount(data.filter(n => !n.is_read).length);
  };
  
  const markAsRead = async (id) => {
    await notificationService.markAsRead(id);
    fetchNotifications();
  };
  
  return (
    <div className="relative">
      <Bell className="cursor-pointer" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-1 text-xs">
          {unreadCount}
        </span>
      )}
      
      {/* Dropdown with notifications */}
      <div className="dropdown">
        {notifications.map(notif => (
          <NotificationItem 
            key={notif.id} 
            notification={notif} 
            onRead={() => markAsRead(notif.id)}
          />
        ))}
      </div>
    </div>
  );
};
```

#### 3. **Admin Dashboard** (Ward-specific)
```jsx
// pages/admin/AdminDashboard.jsx
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    slaBreached: 0
  });
  
  const [wardInfo, setWardInfo] = useState(null);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    const data = await adminService.getDashboard();
    setStats(data.stats);
    setWardInfo(data.wardInfo);
  };
  
  return (
    <div className="dashboard">
      <h1>Ward {wardInfo?.ward_number} - {wardInfo?.district_name}</h1>
      
      <div className="stats-grid">
        <StatCard title="Pending" value={stats.pending} color="yellow" />
        <StatCard title="In Progress" value={stats.inProgress} color="blue" />
        <StatCard title="Completed" value={stats.completed} color="green" />
        <StatCard title="SLA Breached" value={stats.slaBreached} color="red" />
      </div>
      
      <RecentComplaintsTable />
      <ConstructorPerformance />
    </div>
  );
};
```

#### 4. **Super Admin - Create Admin**
```jsx
// pages/superadmin/CreateAdmin.jsx
const CreateAdmin = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    district_id: '',
    ward_id: ''
  });
  
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  const handleDistrictChange = async (districtId) => {
    const wardData = await fetchWards(districtId);
    setWards(wardData);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await superAdminService.createAdmin(formData);
    
    if (response.success) {
      toast.success(`Admin created and assigned to Ward ${formData.ward_id}`);
      // Send email to new admin with credentials
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Name, Email, Mobile, Password */}
      {/* District dropdown */}
      {/* Ward dropdown */}
      {/* Submit */}
    </form>
  );
};
```

#### 5. **Gujarat Heatmap**
```jsx
// pages/superadmin/GujaratHeatmap.jsx
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

const GujaratHeatmap = () => {
  const [complaints, setComplaints] = useState([]);
  
  useEffect(() => {
    fetchAllComplaints();
  }, []);
  
  const getColorByCount = (count) => {
    if (count > 50) return 'red';
    if (count > 20) return 'orange';
    return 'green';
  };
  
  return (
    <MapContainer center={[22.2587, 71.1924]} zoom={7}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {complaints.map(complaint => (
        <CircleMarker
          key={complaint.id}
          center={[complaint.latitude, complaint.longitude]}
          radius={10}
          fillColor={getColorByCount(complaint.count)}
          color={getColorByCount(complaint.count)}
        >
          <Popup>
            <strong>{complaint.title}</strong><br />
            Status: {complaint.status}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};
```

---

## 📧 EMAIL CONFIGURATION

### **Gmail App Password Setup**

1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate password for "Mail" on "Other (Custom name)"
5. Use the 16-character password in `.env`:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

### **Email Templates to Implement**

1. **Complaint Registered** - Sent to Citizen
2. **Task Assigned** - Sent to Constructor
3. **Status Updated** - Sent to Citizen
4. **Completion Approval** - Sent to Citizen
5. **SLA Warning** - Sent to Admin
6. **SLA Breached** - Sent to Super Admin
7. **Escalation Alert** - Sent to Super Admin
8. **Daily Summary** - Sent to Admin/Super Admin

---

## 🚀 DEPLOYMENT REQUIREMENTS

### **Environment Variables**
```env
NODE_ENV=production
PORT=5000
DB_HOST=your-db-host
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=rcms_db
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
FRONTEND_URL=https://rcms.com
```

### **Packages to Install**

**Backend**:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "sequelize": "^6.33.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "nodemailer": "^6.9.6",
    "multer": "^1.4.5-lts.1",
    "cloudinary": "^1.41.0",
    "express-validator": "^7.0.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "node-cron": "^3.0.2"
  }
}
```

**Frontend**:
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.16.0",
    "axios": "^1.5.1",
    "react-leaflet": "^4.2.1",
    "leaflet": "^1.9.4",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.3",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "vite": "^4.5.0"
  }
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### **Phase 1: Database & Auth (Day 1-3)**
- [ ] Create all 12 database tables
- [ ] Seed Gujarat districts (33)
- [ ] Seed complaint categories
- [ ] Create super admin account
- [ ] Implement JWT authentication
- [ ] Role-based middleware

### **Phase 2: Core Complaint Flow (Day 4-7)**
- [ ] Citizen: Raise complaint API
- [ ] Auto-route to ward admin
- [ ] Admin: View ward complaints
- [ ] Admin: Assign to constructor
- [ ] Constructor: Accept/update task
- [ ] Status history tracking

### **Phase 3: Notification System (Day 8-10)**
- [ ] Email service with Gmail
- [ ] In-app notification system
- [ ] Notification bell component
- [ ] Email templates (8 types)
- [ ] Email logging

### **Phase 4: Super Admin Panel (Day 11-13)**
- [ ] Create ward admin
- [ ] Assign admin to district/ward
- [ ] View all admins
- [ ] State-wide analytics
- [ ] Gujarat heatmap

### **Phase 5: Advanced Features (Day 14-16)**
- [ ] SLA monitoring (cron job)
- [ ] Escalation workflow
- [ ] Feedback system
- [ ] Complaint reopening
- [ ] Performance metrics

### **Phase 6: Frontend Polish (Day 17-19)**
- [ ] Responsive design
- [ ] Loading states
- [ ] Error handling
- [ ] Toast notifications
- [ ] Image preview

### **Phase 7: Testing & Deployment (Day 20-21)**
- [ ] API testing
- [ ] Role-based access testing
- [ ] Email testing
- [ ] Production deployment
- [ ] Documentation

---

## 🎯 SUCCESS CRITERIA

The application is complete when:

1. ✅ All 4 panels are functional with role-based access
2. ✅ Complaints flow from Citizen → Admin → Constructor
3. ✅ Email notifications sent at all key events
4. ✅ In-app notifications work in real-time
5. ✅ Gujarat-only location validation works
6. ✅ Super Admin can create and assign ward admins
7. ✅ SLA monitoring and escalation functional
8. ✅ Heatmap shows complaint distribution
9. ✅ Mobile-responsive UI
10. ✅ Production deployment successful

---

## 📝 ADDITIONAL NOTES

### **Security Checklist**
- [ ] Password hashing with bcrypt
- [ ] JWT token expiration
- [ ] Input validation on all forms
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] Rate limiting on APIs
- [ ] File upload size limits
- [ ] CORS configuration

### **Performance Optimization**
- [ ] Database indexing
- [ ] Image compression
- [ ] API response caching
- [ ] Lazy loading on frontend
- [ ] Code splitting

### **Error Handling**
- [ ] Global error handler
- [ ] User-friendly error messages
- [ ] Error logging
- [ ] Email failure retry mechanism

---

## 🚀 START BUILDING

**Important**: Follow the implementation checklist in order. Each phase builds on the previous one.

**First Step**: Set up the database schema and seed data.

**Questions to Ask**:
1. Do you have a MySQL database ready?
2. Have you created Gmail app password?
3. Do you have Cloudinary account for image uploads?

**Ready to build this production-grade RCMS system! 🎉**
