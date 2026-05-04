# Google Maps Complete Fix - Step by Step

## Problem
Maps not loading in any panel - showing blank white area.

## Solution Applied

### 1. Created Custom Hook
**File**: `client/src/hooks/useGoogleMaps.js`
- Centralized Google Maps loading logic
- Polls for Google Maps availability
- 15-second timeout with error handling

### 2. Updated HTML with Callback
**File**: `client/index.html`
- Added Google Maps script with callback function
- Script loads once globally
- Callback confirms when loaded

### 3. Updated Both Map Components
**Files**: 
- `client/src/components/common/GoogleMapPicker.jsx`
- `client/src/components/common/GoogleMapViewer.jsx`

**Changes**:
- Use `useGoogleMaps()` hook instead of manual loading
- Added error state and error UI
- Added try-catch around map initialization
- Better loading messages

### 4. Created Test Page
**File**: `client/public/test-google-maps.html`
- Standalone test to verify API key works
- Access at: `http://localhost:5174/test-google-maps.html`

## How to Apply the Fix

### Step 1: Restart Development Server

```bash
# Stop current server (Ctrl+C)

# Start fresh
cd client
npm run dev
```

### Step 2: Clear Browser Cache

**Hard Refresh**:
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

**Or Clear All Cache**:
1. Press `F12` to open DevTools
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Step 3: Test the Standalone Page First

1. Open: `http://localhost:5174/test-google-maps.html`
2. You should see:
   - ✓ "Google Maps loaded successfully!" message
   - A map of Gujarat
   - A marker on Ahmedabad

**If this works**, your API key is fine and the issue is in React components.

**If this doesn't work**, there's an API key issue:
- Check browser console for specific error
- Verify API key in Google Cloud Console
- Check API restrictions

### Step 4: Test React Application

#### Test Raise Complaint Page:
1. Go to: `http://localhost:5174/citizen/raise-complaint`
2. Navigate to Step 2 (Location)
3. Wait 2-3 seconds for "Loading Google Maps..."
4. Map should appear with:
   - Search box
   - Pincode input
   - "Use My Location" button
   - Interactive Google Map

#### Test Dashboard Pages:
1. Go to: `http://localhost:5174/` (Home)
2. Click "Map" tab
3. Wait for map to load
4. Should show "Live Issue Map" with markers

### Step 5: Check Browser Console

Open DevTools (F12) and check Console tab for:

**Success Messages**:
```
Google Maps loaded successfully
Google Map initialized successfully
Google Map Viewer initialized successfully
```

**Error Messages** (and fixes):

#### Error: "RefererNotAllowedMapError"
**Cause**: API key restrictions too strict
**Fix**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services > Credentials
3. Click your API key
4. Under "Application restrictions":
   - Select "HTTP referrers"
   - Add: `http://localhost:*/*`
   - Add: `http://127.0.0.1:*/*`
5. Save and wait 5 minutes

#### Error: "ApiNotActivatedMapError"
**Cause**: Required APIs not enabled
**Fix**:
1. Go to Google Cloud Console
2. APIs & Services > Library
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API

#### Error: "Failed to load Google Maps after 15 seconds"
**Cause**: Network issue or API key invalid
**Fix**:
1. Check internet connection
2. Verify API key is correct in `client/index.html`
3. Try different network (mobile hotspot)

#### Error: "google is not defined"
**Cause**: Script not loaded before React components
**Fix**: Already fixed with callback - clear cache and retry

## Verification Checklist

Run through this checklist:

### API Key Verification
- [ ] API key is in `client/index.html` (line 10)
- [ ] API key format: `AIzaSy...` (39 characters)
- [ ] Maps JavaScript API enabled in Google Cloud
- [ ] Places API enabled
- [ ] Geocoding API enabled
- [ ] No billing issues in Google Cloud Console

### File Verification
- [ ] `client/src/hooks/useGoogleMaps.js` exists
- [ ] `client/index.html` has Google Maps script tag
- [ ] `GoogleMapPicker.jsx` imports `useGoogleMaps`
- [ ] `GoogleMapViewer.jsx` imports `useGoogleMaps`

### Browser Verification
- [ ] Browser cache cleared
- [ ] No ad blockers blocking Google Maps
- [ ] JavaScript enabled
- [ ] Cookies enabled
- [ ] Using modern browser (Chrome, Firefox, Edge)

### Network Verification
- [ ] Internet connection active
- [ ] Can access `https://maps.googleapis.com`
- [ ] No corporate firewall blocking Google APIs
- [ ] No VPN interfering

## Debugging Steps

### 1. Check Network Requests

1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Filter by "maps.googleapis.com"
5. Check status:
   - ✅ 200 OK = Good
   - ❌ 403 Forbidden = API key issue
   - ❌ 404 Not Found = Wrong URL
   - ❌ Failed = Network issue

### 2. Check Console Logs

Look for these logs in order:
```
1. "Google Maps loaded successfully" (from index.html)
2. "Google Map initialized successfully" (from GoogleMapPicker)
3. "Google Map Viewer initialized successfully" (from GoogleMapViewer)
```

If any are missing, that's where the problem is.

### 3. Check React Component State

Add this to browser console while on a page with map:
```javascript
// Check if Google Maps is loaded
console.log('Google Maps:', window.google?.maps ? 'Loaded' : 'Not loaded');

// Check if callback was called
console.log('Callback called:', window.googleMapsLoaded);
```

### 4. Test API Key Directly

Open this URL in browser:
```
https://maps.googleapis.com/maps/api/js?key=AIzaSyAmVous8WcNJsm_7XY0c8z00bnGlNoHroU&libraries=places
```

Should return JavaScript code (not an error page).

## Common Issues and Solutions

### Issue: Map shows gray tiles
**Cause**: Billing not enabled or quota exceeded
**Solution**: 
- Enable billing in Google Cloud Console
- Check quota usage
- Free tier: $200/month credit

### Issue: Map loads but features don't work
**Cause**: Missing API libraries
**Solution**: Verify `&libraries=places` in script URL

### Issue: "Loading Google Maps..." never finishes
**Cause**: Script blocked or failed to load
**Solution**:
1. Check browser console for errors
2. Disable ad blockers
3. Check network tab for failed requests
4. Try incognito mode

### Issue: Works on one page but not others
**Cause**: Component-specific issue
**Solution**:
1. Check which component has the issue
2. Look for console errors on that page
3. Verify component imports `useGoogleMaps`

### Issue: Works locally but not in production
**Cause**: API key restrictions
**Solution**:
- Add production domain to API key restrictions
- Update script URL if using environment variables

## Emergency Fallback

If nothing works, temporarily use unrestricted API key:

1. Go to Google Cloud Console
2. Create new API key
3. Don't add any restrictions
4. Replace key in `client/index.html`
5. Test if it works
6. If yes, issue was with restrictions
7. Add restrictions back one by one to find problem

## Success Indicators

✅ **Everything is working if you see:**

1. **Test page** (`/test-google-maps.html`):
   - Green success message
   - Map of Gujarat
   - Marker on Ahmedabad

2. **Raise Complaint page**:
   - Map loads within 3 seconds
   - Can click to place marker
   - Address and pincode appear
   - GPS button works

3. **Dashboard pages**:
   - Map loads with colored markers
   - Can click markers for info
   - "Detect Nearby" button works

4. **Browser console**:
   - No red errors
   - Success messages appear
   - No "google is not defined" errors

## Still Not Working?

If you've tried everything and maps still don't load:

### Last Resort Steps:

1. **Verify API Key is Active**:
   ```bash
   curl "https://maps.googleapis.com/maps/api/js?key=AIzaSyAmVous8WcNJsm_7XY0c8z00bnGlNoHroU"
   ```
   Should return JavaScript code, not error.

2. **Create Fresh API Key**:
   - Go to Google Cloud Console
   - Create brand new API key
   - No restrictions
   - Replace in `index.html`
   - Test again

3. **Check Google Cloud Status**:
   - Visit: https://status.cloud.google.com/
   - Verify Maps API is operational

4. **Try Different Browser**:
   - Chrome → Firefox
   - Regular → Incognito
   - Desktop → Mobile

5. **Check System Time**:
   - Ensure system clock is correct
   - Google APIs can fail with wrong time

## Contact Information

If issue persists, provide these details:
1. Screenshot of browser console errors
2. Screenshot of Network tab (maps.googleapis.com request)
3. Screenshot of Google Cloud Console (APIs enabled)
4. Browser and version
5. Operating system
6. Whether test page works

---

**Status**: ✅ Fix Applied
**Next Step**: Restart server and test
**Expected Result**: Maps load in 2-3 seconds on all pages
