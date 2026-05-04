#!/bin/bash

# Test Backend Heatmap Endpoints
# Run this script to verify all heatmap endpoints are working

echo "=== Testing Backend Heatmap Endpoints ==="
echo ""

# Test public heatmap endpoint
echo "1. Testing Public Heatmap Endpoint..."
echo "   GET http://localhost:5000/api/location/heatmap"
curl -s -o /dev/null -w "   Status: %{http_code}\n" http://localhost:5000/api/location/heatmap
echo ""

# Test admin heatmap endpoint (requires auth token)
echo "2. Testing Admin Heatmap Endpoint..."
echo "   GET http://localhost:5000/api/admin/heatmap"
echo "   (Requires authentication - will return 401 without token)"
curl -s -o /dev/null -w "   Status: %{http_code}\n" http://localhost:5000/api/admin/heatmap
echo ""

# Test constructor heatmap endpoint (requires auth token)
echo "3. Testing Constructor Heatmap Endpoint..."
echo "   GET http://localhost:5000/api/constructor/heatmap"
echo "   (Requires authentication - will return 401 without token)"
curl -s -o /dev/null -w "   Status: %{http_code}\n" http://localhost:5000/api/constructor/heatmap
echo ""

# Test super admin heatmap endpoint (requires auth token)
echo "4. Testing Super Admin Heatmap Endpoint..."
echo "   GET http://localhost:5000/api/superadmin/heatmap"
echo "   (Requires authentication - will return 401 without token)"
curl -s -o /dev/null -w "   Status: %{http_code}\n" http://localhost:5000/api/superadmin/heatmap
echo ""

echo "=== Test Complete ==="
echo ""
echo "Expected Results:"
echo "  - Public endpoint: 200 (success)"
echo "  - Protected endpoints: 401 (unauthorized) or 200 (if logged in)"
echo ""
echo "If you see 'Connection refused', make sure backend is running:"
echo "  cd backend && npm start"
