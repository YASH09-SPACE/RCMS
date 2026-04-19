# RCMS Project Memory & Architectural Memo

**Version**: 2.0 (Gujarat Hierarchy & Geospatial Reform Phase)  
**Project**: RoadCare Management System (RCMS)  
**State**: Gujarat, India  

---

## 🚀 1. Strategic Objective
The core objective of this development cycle was to transition the RCMS platform from a generic "Ward-based" prototype into a real-world, production-ready infrastructure management tool mapped specifically to the **33 Districts and 250+ Talukas/Wards of Gujarat**.

## 🛠️ 2. Core Transitions & Accomplishments

### A. Administrative Hierarchy Overhaul
- **Database Reform**: Migrated from a single-tier Ward system to a **District -> Taluka/Ward** relational model.
- **Micro-regional Seeding**: Rewrote `seedGujarat.js` to populate exactly 33 real districts. It dynamically generates specific Talukas (rural) and City Wards (urban) for every district, assigning a unique Admin and Constructor to each.
- **Terminology Synchronization**: Globally updated UI labels across Admin, Constructor, and SuperAdmin panels to reflect "Taluka/Ward" nomenclature while preserving the underlying `Ward` Mongoose model for stability.

### B. Geospatial Intelligence
- **Interactive Global Map**: Implemented `<GlobalMap />` using React-Leaflet.
  - **Heatmaps**: Visualizes complaint density state-wide.
  - **GPS Detection**: Integrated HTML5 Geolocation to detect "Nearby Issues" within a radius.
  - **Role-based Geofencing**: Admins and Constructors are restricted to viewing only issues within their assigned District/Taluka coordinates.
- **Advanced Reverse Geocoding**: Integrated the **OpenStreetMap (OSM) Nominatim API**. Users now drop a pin to report issues; the system automatically queries OSM to detect the District name and matches it to the internal database for automatic assignment.

### C. Security & User Management Lifecycle
- **OTP Verification**: Implemented a 2-step registration wizard. Users receive a **6-digit code via email** (via Nodemailer) which must be verified before account creation.
- **Suspension System**: Replaced the destructive "Delete User" function with an **`isActive` Suspension Logic**. 
  - Super Admins can freeze accounts with a Shield icon.
  - Suspended users are blocked at the Auth Middleware level and receive a redirect to contact support.
- **Auth Persistence**: Stabilized token handling and dark-mode contrast for registration/login views.

### D. Super Admin Control Center
- **Granular Filtering**: Re-added District and Taluka filters specifically for the **User Management** screen to allow state-wide staff tracking.
- **Global Overview**: Maintained the main dashboard as a unified "State Executive" view for global stats and SLA monitoring.

---

## 📦 3. Technical Stack Summary
- **Frontend**: React.js, Tailwind-inspired Vanilla CSS, Lucide-React Icons, Leaflet.js.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose) with TTL indices for OTP expiration.
- **Email**: NodeMailer with 9+ distinct templates (Registration, OTP, Assignment, SLA Breach).
- **External APIs**: OSM Nominatim (Reverse Geocoding), Leaflet TileLayers.

---

## 🗺️ 4. Future Roadmap & Handover Points
1. **Automated Assignation Logic**: Ensure the system can handle edge-case locations where OSM returns a district name slightly differently than our DB (Partial regex matching is implemented, but could be refined).
2. **Citizen Analytics**: Build the "Citizen Impact" section of the Super Admin dashboard to show community engagement metrics.
3. **Escalation Path**: Refine the SLA Monitor crontab to handle complex hierarchy-based escalations (Taluka Admin -> District Collector level simulation).

---

## 📁 5. Important File Index
- `backend/controllers/locationController.js`: Contains the OSM Geocoding logic.
- `backend/services/emailService.js`: Master template hub for all system notifications.
- `client/src/components/common/GlobalMap.jsx`: The core mapping engine.
- `backend/scripts/seedGujarat.js`: The state-wide demographic generator.

---
> [!NOTE]
> This project has evolved from a generic CRUD app to a Location-Aware Enterprise Resource Planning (ERP) tool for government infrastructure. Any future AI model should respect the **District-Taluka** dependency chain in both the `Ward` model and the `Complaint` storage.
