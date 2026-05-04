# Backend Connection Fix

## Problem Identified

The error `Failed to load map data: AxiosError: Network Error` was caused by a **CORS/proxy configuration issue**, not a Google Maps problem.

**Root Cause:**
- Frontend (Vite dev server on port 5174) was trying to connect directly to backend (port 5001)
- Browser was blocking the cross-origin request due to CORS policy
- CSP headers were too restrictive

## Solution Applied

### 1. Added Vite Proxy Configuration
**File**: `client/vite.config.js`

Added proxy to forward `/api` requests from frontend to backend:
```javascript
server: {
  port: 5174,
  proxy: {
    '/api': {
      target: 'http://localhost:5001',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

**What this does:**
- All requests to `http://localhost:5174/api/*` are forwarded to `http://localhost:5001/api/*`
- Eliminates CORS issues during development
- Browser thinks it's same-origin request

### 2. Updated API Service to Use Relative URLs
**File**: `client/src/services/api.js`

Changed from:
```javascript
baseURL: 'http://localhost:5001/api'
```

To:
```javascript
baseURL: '/api'  // Relative URL - proxy handles forwarding
```

**Why this works:**
- Relative URLs use the same origin as the page (localhost:5174)
- Vite proxy intercepts these requests and forwards to backend
- No CORS issues, no CSP violations

## Testing Instructions

### Step 1: Restart Frontend Dev Server
**IMPORTANT**: You MUST restart the dev server for proxy changes to take effect.

```bash
# Stop the current dev server (Ctrl+C in terminal)
# Then restart:
cd client
npm run dev
```

### Step 2: Hard Refresh Browser
Clear cache and reload:
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`
- Or: DevTools (F12) → Right-click refresh → "Empty Cache and Hard Reload"

### Step 3: Check Console
You should now see:
```
✓ Google Maps callback fired - API ready
✓ Google Map Viewer initialized successfully
Fetching map data from: /location/heatmap
Map data loaded: X points
```

### Step 4: Verify Map Shows Data
- Map should display Google Maps tiles
- Markers should appear on the map (colored dots)
- Clicking markers should show info windows
- No "Failed to load map data" error

## Verification

### Backend Status ✅
```bash
curl http://localhost:5001/api/health
# Should return: {"success":true,"message":"RCMS API is running"}
```

### Heatmap Endpoint ✅
```bash
curl http://localhost:5001/api/location/heatmap
# Should return: {"success":true,"data":[...]}
```

### Frontend Proxy ✅
After restarting dev server, open browser and check:
```
http://localhost:5174/api/health
# Should return same as backend (proxied through Vite)
```

## What Changed

| Before | After |
|--------|-------|
| Direct connection to backend | Proxied through Vite dev server |
| CORS errors | No CORS issues |
| CSP violations | CSP compliant |
| Network errors | Successful API calls |

## Files Modified

1. ✅ `client/vite.config.js` - Added proxy configuration
2. ✅ `client/src/services/api.js` - Changed to relative URLs

## Common Issues After Fix

### Issue: Still getting Network Error
**Solution**: Did you restart the dev server? Proxy changes require restart.
```bash
# Stop dev server (Ctrl+C)
cd client
npm run dev
```

### Issue: 404 Not Found
**Solution**: Backend not running. Start it:
```bash
cd backend
npm start
```

### Issue: Proxy not working
**Solution**: Check Vite dev server is on port 5174:
```bash
# Should show: Local: http://localhost:5174/
```

### Issue: CORS errors still appearing
**Solution**: Clear browser cache completely:
1. Open DevTools (F12)
2. Go to Application tab
3. Clear storage
4. Hard reload

## Production Deployment Note

This proxy configuration is for **development only**. In production:

1. **Option A**: Deploy frontend and backend on same domain
   - Frontend: `https://yourdomain.com`
   - Backend: `https://yourdomain.com/api`

2. **Option B**: Configure CORS on backend for production domain
   ```javascript
   // backend/server.js
   app.use(cors({
     origin: 'https://your-production-domain.com',
     credentials: true
   }));
   ```

3. **Option C**: Use environment variables
   ```javascript
   // client/src/services/api.js
   const API = axios.create({
     baseURL: import.meta.env.VITE_API_URL || '/api'
   });
   ```

## Success Indicators

✅ No "Network Error" in console
✅ Map displays Google Maps tiles
✅ Markers appear on map
✅ Console shows "Map data loaded: X points"
✅ Clicking markers opens info windows
✅ All panels show maps correctly

## Next Steps

1. **Restart dev server** (most important!)
2. **Hard refresh browser**
3. **Test all panels**: Home, Raise Complaint, Admin, Constructor, Super Admin
4. **Verify markers appear** on the map
5. **Test interactions**: Click markers, zoom, pan

---

**Expected Result**: Maps should now load data from backend and display markers correctly in all panels.
