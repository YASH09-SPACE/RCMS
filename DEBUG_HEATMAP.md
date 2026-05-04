# Debug Live Heatmap Not Working

## Enhanced Logging Added

I've added detailed console logging to help diagnose the issue. After refreshing, you should see these messages in the console:

### Expected Console Output

```
✓ Google Maps callback fired - API ready
✓ Google Maps already loaded
GoogleMapViewer: Initializing map...
GoogleMapViewer: mapRef dimensions = { width: XXX, height: 500, display: 'block' }
✓ Google Map Viewer initialized successfully
GoogleMapViewer: Fetching map points, user: admin authenticated: true
GoogleMapViewer: Fetching map data from: /admin/heatmap
GoogleMapViewer: User role: admin Authenticated: true
GoogleMapViewer: API response: { success: true, data: [...] }
✓ Map data loaded: 3 points
GoogleMapViewer: Updating markers, points count: 3
GoogleMapViewer: Creating marker 1: { lat: 22.xxx, lng: 71.xxx, priority: 'high', title: '...' }
GoogleMapViewer: Creating marker 2: { lat: 22.xxx, lng: 71.xxx, priority: 'medium', title: '...' }
GoogleMapViewer: Creating marker 3: { lat: 22.xxx, lng: 71.xxx, priority: 'low', title: '...' }
✓ GoogleMapViewer: Markers updated, total: 3
```

## Diagnostic Steps

### Step 1: Check Console Output

Open browser console (F12) and look for:

**1. Is Google Maps loading?**
- Look for: `✓ Google Maps callback fired`
- Look for: `✓ Google Map Viewer initialized successfully`

**2. Is data being fetched?**
- Look for: `GoogleMapViewer: Fetching map data from: /xxx/heatmap`
- Look for: `✓ Map data loaded: X points`

**3. Are markers being created?**
- Look for: `GoogleMapViewer: Creating marker X:`
- Look for: `✓ GoogleMapViewer: Markers updated, total: X`

### Step 2: Identify the Problem

#### Problem A: Google Maps Not Loading
**Symptoms:**
- No "✓ Google Maps callback fired" message
- Map shows gray background

**Solution:**
1. Check internet connection
2. Verify API key is correct
3. Check browser console for API key errors
4. Try refreshing page (Ctrl+Shift+R)

#### Problem B: API Request Failing
**Symptoms:**
- See: `✗ Failed to load map data:`
- See error details in console

**Common Causes:**

**1. Backend Not Running**
```bash
# Check if backend is running
curl http://localhost:5001/api/health
```

If error, start backend:
```bash
cd backend
npm start
```

**2. Proxy Not Working**
```bash
# Test proxy in browser
http://localhost:5174/api/health
```

If 404, restart frontend dev server:
```bash
cd client
npm run dev
```

**3. Authentication Issue**
- Check if you're logged in
- Check user role in console: `GoogleMapViewer: User role: XXX`
- Try logging out and back in

**4. Wrong Endpoint**
Check which endpoint is being called:
- Citizen/Public: `/location/heatmap`
- Admin: `/admin/heatmap`
- Constructor: `/constructor/heatmap`
- Super Admin: `/superadmin/heatmap`

#### Problem C: No Data in Database
**Symptoms:**
- See: `✓ Map data loaded: 0 points`
- Map shows but no markers

**Solution:**
Create test complaints in the system:
1. Go to "Raise Complaint" page
2. Fill out form and submit
3. Go back to dashboard
4. Map should now show markers

#### Problem D: Markers Not Displaying
**Symptoms:**
- See: `✓ Map data loaded: X points` (X > 0)
- But no markers visible on map

**Possible Causes:**

**1. Coordinates Outside Gujarat**
Check marker coordinates in console:
```
GoogleMapViewer: Creating marker 1: { lat: 22.xxx, lng: 71.xxx, ... }
```

Gujarat coordinates range:
- Latitude: 20.0 to 24.7
- Longitude: 68.0 to 74.5

If coordinates are outside this range, zoom out to see them.

**2. Map Zoom Too Far Out**
Try zooming in on the map manually.

**3. Marker Color Same as Background**
Check priority colors in console. Markers should be:
- High priority: Red (#ef4444)
- Medium priority: Orange (#f59e0b)
- Low priority: Blue (#3b82f6)

### Step 3: Test Each Panel

#### 1. Citizen Home (`/citizen/home`)
- Login as citizen
- Go to Home page
- Click "Map" tab
- Check console for: `GoogleMapViewer: Fetching map data from: /location/heatmap`

#### 2. Admin Dashboard (`/admin/dashboard`)
- Login as admin
- Go to Dashboard
- Scroll down to map section
- Check console for: `GoogleMapViewer: Fetching map data from: /admin/heatmap`

#### 3. Constructor Dashboard (`/constructor/dashboard`)
- Login as constructor
- Go to Dashboard
- Scroll down to map section
- Check console for: `GoogleMapViewer: Fetching map data from: /constructor/heatmap`

#### 4. Super Admin Heatmap (`/superadmin/gujarat-heatmap`)
- Login as super admin
- Go to Gujarat Heatmap page
- Check console for: `GoogleMapViewer: Fetching map data from: /superadmin/heatmap`

## Quick Fixes

### Fix 1: Restart Everything
```bash
# Terminal 1: Stop and restart backend
cd backend
npm start

# Terminal 2: Stop and restart frontend
cd client
npm run dev

# Browser: Hard refresh
Ctrl + Shift + R
```

### Fix 2: Clear Browser Cache
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Clear storage"
4. Click "Clear site data"
5. Refresh page

### Fix 3: Check Database Has Data
```bash
# Connect to MongoDB
mongosh

# Use RCMS database
use rcms

# Count complaints
db.complaints.countDocuments()

# Show sample complaint
db.complaints.findOne()
```

If no complaints, create some through the UI.

### Fix 4: Test Backend Endpoints Directly

**Public endpoint:**
```bash
curl http://localhost:5001/api/location/heatmap
```

**Admin endpoint (requires auth token):**
```bash
# Get token from browser localStorage: rcms_token
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5001/api/admin/heatmap
```

## What to Report

If still not working, provide:

1. **Full console output** (copy all messages)
2. **Which panel** is affected (citizen, admin, constructor, super_admin)
3. **User role** you're logged in as
4. **Backend status** (is it running? any errors?)
5. **Screenshot** of the map area
6. **Network tab** (F12 → Network → filter by "heatmap")

## Common Error Messages

### "Network Error"
- Backend not running or proxy not configured
- Solution: Restart backend and frontend dev server

### "401 Unauthorized"
- Not logged in or token expired
- Solution: Log out and log back in

### "404 Not Found"
- Endpoint doesn't exist or proxy not working
- Solution: Restart frontend dev server

### "500 Internal Server Error"
- Backend error (check backend console)
- Solution: Check backend terminal for error details

## Success Indicators

✅ Console shows: `✓ Google Map Viewer initialized successfully`
✅ Console shows: `✓ Map data loaded: X points` (X > 0)
✅ Console shows: `✓ GoogleMapViewer: Markers updated, total: X` (X > 0)
✅ Map displays Google Maps tiles (not gray)
✅ Colored markers visible on map
✅ Can click markers to see info windows
✅ Map works in all panels

---

**Next Step**: Refresh the page and copy the full console output to help diagnose the issue.
