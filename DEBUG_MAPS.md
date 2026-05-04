# Debug Google Maps - Follow These Steps

## Step 1: Restart Everything

```bash
# Stop the dev server (Ctrl+C)

# Start fresh
cd client
npm run dev
```

## Step 2: Clear Browser Cache

**Option A - Hard Refresh:**
- Press `Ctrl + Shift + R` (Windows/Linux)
- Press `Cmd + Shift + R` (Mac)

**Option B - Clear All:**
1. Press `F12` to open DevTools
2. Right-click the Refresh button
3. Select "Empty Cache and Hard Reload"

## Step 3: Open Browser Console

1. Press `F12` to open DevTools
2. Click on "Console" tab
3. Keep it open

## Step 4: Navigate to Home Page

Go to: `http://localhost:5174/`

## Step 5: Check Console Messages

You should see these messages in order:

```
✓ Google Maps already loaded
(or)
✓ Google Maps loaded after XXX ms

GoogleMapViewer: Initializing map...
GoogleMapViewer: window.google = [object Object]
GoogleMapViewer: window.google.maps = [object Object]
✓ Google Map Viewer initialized successfully
```

## What the Messages Mean

### ✅ Good Messages:
- `✓ Google Maps already loaded` = API loaded successfully
- `✓ Google Maps loaded after XXX ms` = API loaded after waiting
- `✓ Google Map Viewer initialized successfully` = Map created successfully

### ❌ Bad Messages (and what to do):

#### "GoogleMapViewer: Waiting for Google Maps to load..."
**Stays on this message forever**

**Cause**: Google Maps script not loading
**Check**:
1. Open Network tab in DevTools
2. Look for request to `maps.googleapis.com`
3. Check if it's Status 200 or failed

**Fix**:
- If 403 Forbidden: API key restrictions issue
- If Failed: Internet connection issue
- If Missing: Script tag not in HTML

#### "window.google = undefined"
**Cause**: Google Maps script didn't load at all

**Fix**:
1. Check `client/index.html` has the script tag
2. Check internet connection
3. Try accessing: `http://localhost:5174/test-google-maps.html`

#### "Error initializing Google Map Viewer: ..."
**Cause**: Map initialization failed

**Fix**: Read the error message - it will tell you what's wrong

## Step 6: Test the Standalone Page

Go to: `http://localhost:5174/test-google-maps.html`

**Should see**:
- ✓ "Google Maps loaded successfully!" (green)
- A map of Gujarat
- A marker on Ahmedabad

**If this works but React doesn't**:
- Issue is with React components
- Check console for React-specific errors

**If this doesn't work**:
- Issue is with API key or network
- Check Google Cloud Console
- Verify APIs are enabled

## Step 7: Check Network Tab

1. In DevTools, click "Network" tab
2. Refresh the page
3. Filter by "maps.googleapis"
4. Look for the request

**Should see**:
- Request to `maps.googleapis.com/maps/api/js?key=...`
- Status: 200 OK
- Type: script
- Size: ~300KB

**If you see**:
- 403 Forbidden: API key restrictions
- 404 Not Found: Wrong URL
- Failed: Network issue
- (blocked): Ad blocker or firewall

## Step 8: Verify API Key

Open this URL in a new tab:
```
https://maps.googleapis.com/maps/api/js?key=AIzaSyAmVous8WcNJsm_7XY0c8z00bnGlNoHroU&libraries=places
```

**Should see**: JavaScript code (lots of it)
**Should NOT see**: Error page or "API key not valid"

## Step 9: Check Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. Select your project
3. Go to: APIs & Services > Credentials
4. Find your API key
5. Check:
   - ✅ Key is enabled
   - ✅ No restrictions (or localhost is allowed)
   - ✅ Maps JavaScript API is enabled
   - ✅ Places API is enabled
   - ✅ Geocoding API is enabled

## Step 10: Try Incognito Mode

1. Open browser in Incognito/Private mode
2. Go to `http://localhost:5174/`
3. Check if map loads

**If it works in incognito**:
- Issue is browser cache or extension
- Clear all browser data
- Disable extensions

**If it still doesn't work**:
- Issue is with code or API key
- Continue debugging

## Common Issues

### Issue: "Loading Google Maps..." never finishes

**Cause**: Script not loading
**Solution**:
1. Check Network tab for failed request
2. Check browser console for errors
3. Verify internet connection
4. Try different network (mobile hotspot)

### Issue: Map shows but is blank/white

**Cause**: Map container has no height
**Solution**: Already fixed in code (height: 500px)

### Issue: "google is not defined"

**Cause**: Script loaded after React tried to use it
**Solution**: Already fixed - script loads before React

### Issue: Works sometimes, not others

**Cause**: Race condition - script loading timing
**Solution**: Already fixed with polling in useGoogleMaps hook

## What to Tell Me

If it still doesn't work, copy and paste from console:

1. **All console messages** (especially errors in red)
2. **Network tab** - screenshot of maps.googleapis.com request
3. **What you see** - "Loading..." or blank or error?
4. **Test page** - Does `/test-google-maps.html` work?

## Quick Test Commands

Run these in browser console (F12):

```javascript
// Check if Google Maps is loaded
console.log('Google Maps:', window.google?.maps ? 'LOADED ✓' : 'NOT LOADED ✗');

// Check if script tag exists
console.log('Script tags:', document.querySelectorAll('script[src*="maps.googleapis"]').length);

// Check map container
console.log('Map containers:', document.querySelectorAll('[style*="height: 500px"]').length);
```

## Expected Results

**After following all steps, you should see:**

1. ✅ Console shows "Google Maps loaded"
2. ✅ Console shows "Map initialized successfully"
3. ✅ Map appears on page (not blank)
4. ✅ Can see Gujarat region
5. ✅ Can zoom and pan
6. ✅ Google logo in bottom left
7. ✅ Zoom controls on right

---

**Next**: After restart and hard refresh, check console and tell me what messages you see.
