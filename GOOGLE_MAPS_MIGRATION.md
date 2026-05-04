# Google Maps Integration - Migration Guide

## Overview
This document outlines the migration from Leaflet/OpenStreetMap to Google Maps API for the RCMS (RoadCare Management System) application.

## Changes Made

### 1. New Components Created

#### `GoogleMapPicker.jsx`
- **Location**: `client/src/components/common/GoogleMapPicker.jsx`
- **Purpose**: Interactive map for selecting complaint locations
- **Features**:
  - Click anywhere on map to select location
  - GPS location detection (current location button)
  - Address search with Google Places Autocomplete
  - Pincode/zipcode search and input
  - Automatic reverse geocoding to get address and pincode
  - Gujarat state validation
  - Real-time address and pincode display
  - Ward/district fetching via backend API

#### `GoogleMapViewer.jsx`
- **Location**: `client/src/components/common/GoogleMapViewer.jsx`
- **Purpose**: Display all complaints on map with markers
- **Features**:
  - Priority-based color-coded markers (High=Red, Medium=Orange, Low=Blue)
  - Info windows with complaint details
  - User location detection
  - Click markers to view complaint details
  - Role-based navigation (citizen/admin/constructor/super_admin)
  - Real-time complaint data fetching

### 2. Files Updated

#### Pages Updated to Use Google Maps:
1. **`client/src/pages/citizen/RaiseComplaint.jsx`**
   - Replaced `LocationPickerMap` with `GoogleMapPicker`
   - Updated `handleLocationSelect` to receive location object with pincode

2. **`client/src/pages/admin/AdminDashboard.jsx`**
   - Replaced `GlobalMap` with `GoogleMapViewer`

3. **`client/src/pages/constructor/ConstructorDashboard.jsx`**
   - Replaced `GlobalMap` with `GoogleMapViewer`

4. **`client/src/pages/citizen/Home.jsx`**
   - Replaced `GlobalMap` with `GoogleMapViewer`

5. **`client/src/pages/superadmin/GujaratHeatmap.jsx`**
   - Completely rewritten to use `GoogleMapViewer`
   - Removed all Leaflet dependencies

#### Configuration Files:
1. **`client/src/main.jsx`**
   - Removed `import 'leaflet/dist/leaflet.css';`

2. **`client/package.json`**
   - Removed `leaflet` dependency
   - Removed `react-leaflet` dependency

### 3. Old Components (Can be Deleted)
- `client/src/components/common/LocationPickerMap.jsx` (Leaflet-based)
- `client/src/components/common/GlobalMap.jsx` (Leaflet-based)

## Google Maps API Configuration

### API Key
```
AIzaSyAmVous8WcNJsm_7XY0c8z00bnGlNoHroU
```

### APIs Enabled (Required):
1. **Maps JavaScript API** - For displaying maps
2. **Places API** - For address autocomplete
3. **Geocoding API** - For converting coordinates to addresses
4. **Geolocation API** - For user location detection (browser-based)

### API Restrictions (Recommended):
- **Application restrictions**: HTTP referrers (websites)
- **Allowed referrers**: 
  - `http://localhost:*/*`
  - `http://localhost:5173/*` (Vite dev server)
  - `https://yourdomain.com/*` (production)

## Features Implemented

### Location Selection Methods
1. **Click on Map**: Click anywhere on the map to select a location
2. **GPS Detection**: Use "Use My Location" button to detect current GPS coordinates
3. **Address Search**: Type address or landmark in search box with autocomplete
4. **Pincode Search**: Enter 6-digit pincode and click "Go" to center map

### Location Validation
- Validates that selected location is within Gujarat state
- Shows error if location is outside Gujarat
- Extracts pincode from selected location
- Fetches ward/district information from backend API

### Map Display Features
- Priority-based color-coded markers for complaints
- Info windows showing complaint details
- User location marker (blue dot)
- Responsive design for mobile and desktop
- Legend showing priority colors

## Backend Integration

### Existing APIs Used (No Changes Required)
1. **`POST /api/location/reverse-geocode`**
   - Input: `{ latitude, longitude }`
   - Output: `{ districtId, districtName, wardId, wardName }`
   - Used to fetch ward/district from coordinates

2. **Heatmap Endpoints** (Role-based):
   - `/api/location/heatmap` - Public/Citizen
   - `/api/admin/heatmap` - Admin
   - `/api/constructor/heatmap` - Constructor
   - `/api/superadmin/heatmap` - Super Admin

## Installation Steps

### 1. Remove Old Dependencies
```bash
cd client
npm uninstall leaflet react-leaflet
```

### 2. Install Dependencies (if needed)
No new npm packages required - Google Maps loads via CDN script tag.

### 3. Test the Application
```bash
npm run dev
```

### 4. Test Scenarios
1. **Raise Complaint Page**:
   - Click on map to select location
   - Use GPS button to detect current location
   - Search by address
   - Search by pincode
   - Verify Gujarat validation works

2. **Dashboard Maps**:
   - Verify complaints display with correct colors
   - Click markers to see info windows
   - Test "Detect Nearby" button
   - Verify navigation to complaint details works

3. **Mobile Testing**:
   - Test on mobile browser
   - Verify touch interactions work
   - Test GPS detection on mobile

## Migration Checklist

- [x] Create `GoogleMapPicker` component
- [x] Create `GoogleMapViewer` component
- [x] Update `RaiseComplaint.jsx`
- [x] Update `AdminDashboard.jsx`
- [x] Update `ConstructorDashboard.jsx`
- [x] Update `Home.jsx`
- [x] Update `GujaratHeatmap.jsx`
- [x] Remove Leaflet CSS import from `main.jsx`
- [x] Remove Leaflet dependencies from `package.json`
- [ ] Delete old `LocationPickerMap.jsx` (optional)
- [ ] Delete old `GlobalMap.jsx` (optional)
- [ ] Test all map functionality
- [ ] Test on mobile devices
- [ ] Configure API key restrictions in Google Cloud Console

## Troubleshooting

### Map Not Loading
- Check browser console for errors
- Verify API key is correct
- Ensure Google Maps JavaScript API is enabled in Google Cloud Console
- Check network tab for failed API requests

### Location Not Detected
- Ensure HTTPS is used (required for geolocation)
- Check browser permissions for location access
- Verify user granted location permission

### Pincode Search Not Working
- Verify pincode is 6 digits
- Ensure Geocoding API is enabled
- Check that pincode exists in Gujarat

### Ward/District Not Fetching
- Verify backend `/api/location/reverse-geocode` endpoint is working
- Check that coordinates are within Gujarat boundaries
- Verify ward/district data is seeded in database

## Future Enhancements

1. **Dark Mode Support**: Add custom map styles for dark theme
2. **Clustering**: Add marker clustering for better performance with many complaints
3. **Drawing Tools**: Allow users to draw areas for bulk reporting
4. **Street View**: Integrate Street View for better location verification
5. **Directions**: Add directions from user location to complaint location
6. **Offline Support**: Cache map tiles for offline viewing

## Notes

- Google Maps API has usage limits on free tier
- Monitor API usage in Google Cloud Console
- Consider implementing API key rotation for production
- Keep API key secure and never commit to public repositories
- The existing ward/district/constructor assignment logic remains unchanged
- Backend APIs require no modifications
