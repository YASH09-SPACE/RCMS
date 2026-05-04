# PowerShell script to test all heatmap endpoints
# Run this with: .\test-heatmap-endpoints.ps1

Write-Host "=== Testing Heatmap Endpoints ===" -ForegroundColor Cyan
Write-Host ""

# Test if backend is running
Write-Host "1. Testing Backend Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5001/api/health" -Method Get
    Write-Host "   ✓ Backend is running" -ForegroundColor Green
    Write-Host "   Message: $($health.message)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Backend is NOT running!" -ForegroundColor Red
    Write-Host "   Start backend with: cd backend && npm start" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test public heatmap endpoint
Write-Host "2. Testing Public Heatmap Endpoint..." -ForegroundColor Yellow
Write-Host "   GET /api/location/heatmap" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5001/api/location/heatmap" -Method Get
    if ($response.success) {
        Write-Host "   ✓ Success! Found $($response.data.Count) complaints" -ForegroundColor Green
        if ($response.data.Count -gt 0) {
            $sample = $response.data[0]
            Write-Host "   Sample: $($sample.title) at ($($sample.latitude), $($sample.longitude))" -ForegroundColor Gray
        } else {
            Write-Host "   ⚠️  No complaints in database" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ✗ Response not successful" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test admin heatmap endpoint (will fail without auth)
Write-Host "3. Testing Admin Heatmap Endpoint..." -ForegroundColor Yellow
Write-Host "   GET /api/admin/heatmap" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5001/api/admin/heatmap" -Method Get
    Write-Host "   ✓ Success! Found $($response.data.Count) complaints" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   ⚠️  401 Unauthorized (expected - requires login)" -ForegroundColor Yellow
    } else {
        Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test constructor heatmap endpoint (will fail without auth)
Write-Host "4. Testing Constructor Heatmap Endpoint..." -ForegroundColor Yellow
Write-Host "   GET /api/constructor/heatmap" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5001/api/constructor/heatmap" -Method Get
    Write-Host "   ✓ Success! Found $($response.data.Count) complaints" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   ⚠️  401 Unauthorized (expected - requires login)" -ForegroundColor Yellow
    } else {
        Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test super admin heatmap endpoint (will fail without auth)
Write-Host "5. Testing Super Admin Heatmap Endpoint..." -ForegroundColor Yellow
Write-Host "   GET /api/superadmin/heatmap" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5001/api/superadmin/heatmap" -Method Get
    Write-Host "   ✓ Success! Found $($response.data.Count) complaints" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   ⚠️  401 Unauthorized (expected - requires login)" -ForegroundColor Yellow
    } else {
        Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor White
Write-Host "  - Public endpoint should return data" -ForegroundColor Gray
Write-Host "  - Protected endpoints should return 401 (unless you have a token)" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "  1. If backend not running: cd backend && npm start" -ForegroundColor Gray
Write-Host "  2. If no complaints: Create some through the UI" -ForegroundColor Gray
Write-Host "  3. Check frontend console for detailed logs" -ForegroundColor Gray
