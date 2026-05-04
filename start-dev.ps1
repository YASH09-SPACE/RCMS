# PowerShell script to start both backend and frontend servers
# Run this with: .\start-dev.ps1

Write-Host "🚀 Starting RCMS Development Servers..." -ForegroundColor Cyan
Write-Host ""

# Check if backend node_modules exists
if (-not (Test-Path "backend/node_modules")) {
    Write-Host "⚠️  Backend dependencies not installed. Installing..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

# Check if frontend node_modules exists
if (-not (Test-Path "client/node_modules")) {
    Write-Host "⚠️  Frontend dependencies not installed. Installing..." -ForegroundColor Yellow
    Set-Location client
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "📦 Starting Backend Server (Port 5001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm start"

Write-Host "⏳ Waiting 3 seconds for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "🎨 Starting Frontend Server (Port 5174)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\client'; npm run dev"

Write-Host ""
Write-Host "✅ Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "📡 Backend API: http://localhost:5001/api" -ForegroundColor Cyan
Write-Host "🌐 Frontend App: http://localhost:5174" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop the servers" -ForegroundColor Yellow
