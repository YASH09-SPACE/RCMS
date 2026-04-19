# RCMS - Citizen Panel Implementation Status

This document serves as a knowledge transfer artifact for future AI assistants, outlining the completed work, architecture, logic, and pending tasks for the **Citizen Panel** of the RoadCare Management System (RCMS).

## 1. System Architecture & Tech Stack
*   **Backend**: Node.js, Express, MongoDB (Mongoose). Running on `http://localhost:5001`.
*   **Frontend**: React (Vite). Running on `http://localhost:5173`.
*   **Styling**: Pure CSS with a fully functional **Light/Dark Theme System** (`ThemeContext`, CSS custom properties). *No Tailwind CSS is used*.
*   **Authentication**: JWT-based authentication. Roles include `citizen`, `constructor`, `admin`, `superadmin`. Guest users have limited access.

## 2. Completed Features (Citizen Panel)

### Full Light / Dark Theme Support
*   `ThemeContext` implemented utilizing localStorage for persistence.
*   Theme toggle completely functional and integrated into all headers/layouts.
*   Custom CSS (`citizen.css`, `auth.css`) defines semantic color variables (e.g., `--bg-card`, `--text-primary`) for seamless switching between day and night modes.

### Form Elements & UI Components
*   Replaced native HTML `<select>` dropdowns with a **CustomSelect** React component. It supports search filtering for long lists (e.g., Districts), pill variants, icon integration, and is fully styled for both light and dark themes.
*   Implemented a custom, visually appealing file upload area with dashed borders.

### Authentication Flow (`/login`, `/register`, `/forgot-password`)
*   Fully styled, responsive, and theme-aware pages.
*   Integration with backend `authController` is complete.

### Home / Public Issues Grid (`/`)
*   **Hero Section**: Dynamic search bar to search complaints by title, description, or ID.
*   **Tabs & Filters**: Users can toggle between "All Issues", "Nearby", and "My Issues". Pill-shaped filter dropdowns (CustomSelect) for District, Status, and Sort logic.
*   **Issue Cards**: Visual grid displaying uploaded images (with fallback dynamic emoji-based category placeholders), status badges, location, and timestamps.
*   Fully functional backend endpoint (`/api/complaints`) powers paginated results with dynamic filtering.

### Raise Complaint (`/citizen/raise`)
*   Multi-step form implementation (Category -> Location -> Details -> Review).
*   **Category**: Dynamically fetched from the backend (`/api/complaints/categories`).
*   **Location**: Selecting a District unlocks the corresponding Ward selection (dynamically fetched). Backend validates that coordinates are within Gujarat (currently bypassed if lat/lng are missing manually).
*   **Image Upload**: Backend uses Multer. **Crucial Note:** Cloudinary isn't configured correctly in the backend `.env` (the name is erroneously set to `RCMS`). The backend `uploadMiddleware` handles this by falling back to local storage (`/uploads/` directory on the server). The frontend uses a helper `getImageUrl` to append `http://localhost:5001` to local file paths so images render correctly on `localhost:5173`.

### My Complaints Dashboard (`/citizen/my-complaints`)
*   Requires citizen authentication.
*   Top-level statistical cards summarizing Total, Pending, In Progress, and Completed complaints.
*   Grid showing only the authenticated user's complaints, filterable by status.

### Issue Detail & Community Interaction (`/issue/:id`)
*   Publicly viewable URL. Shows full complaint details.
*   **Status Timeline**: Visual timeline pulling from `ComplaintStatusHistory`, tracking updates and SLA breaches.
*   **Community Comments**: Any logged-in citizen can comment. Non-logged-in users see a prompt to log in/register.
*   **Feedback Mechanism**: If the complaint owner is viewing the page, and the status is "completed" or "closed", a feedback form (star rating + comment) appears allowing them to rate the resolution or Reopen it.

## 3. Immediate Bug Fixes Addressed
1.  **Image Upload Failing (Cloudinary)**: Due to invalid Cloudinary credentials, file uploads were returning 500. Handled by creating a fallback to local disk storage in `backend/middleware/uploadMiddleware.js`, exposing `backend/uploads` as static files in `server.js`, and creating a URL helper in the frontend.
2.  **Ugly Select Dropdowns**: Standard HTML drop-downs looked poor and disjointed from the rich aesthetic. Replaced all selects with a custom `CustomSelect` React component.

## 4. Pending Features & Next Steps
*   **Cloudinary Integration**: Once real Cloudinary credentials are provided, update `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `backend/.env`. The system will automatically switch from local storage to Cloudinary storage.
*   **Map Integration**: The `RaiseComplaint` form currently asks for text-based location input. The next phase requires integrating Leaflet.js or Google Maps so users can drop a pin to fetch accurate Latitude/Longitude and reverse-geocode to find District/Ward automatically.
*   **Constructor / Admin Panels**: The Citizen panel is largely complete. The logical next phase is to build out the Constructor panel (to receive assigned complaints, update statuses, upload proof of work) and Admin panel.

## 5. File Structure Navigation
*   `client/src/pages/citizen/`: Contains `Home.jsx`, `RaiseComplaint.jsx`, `MyComplaints.jsx`, `IssueDetail.jsx`, etc.
*   `client/src/components/`: Contains shared UI like `CitizenLayout.jsx` and `CustomSelect.jsx`.
*   `client/src/styles/`: Contains `citizen.css` (primary stylesheet for citizen panel, fully documented with layout/theme CSS variables).
*   `backend/controllers/complaintController.js`: Primary logic for creating, fetching, and updating complaints. Ensure you refer to this file for any new endpoints required.
