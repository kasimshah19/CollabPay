# Project: CollabPay — Phase 5 Verification

$ErrorActionPreference = "Stop"

Write-Host "Starting Phase 5 Verification..." -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\.."

Write-Host "Running compilation check..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Error "TypeScript compilation failed."
}

Write-Host "Running tests..." -ForegroundColor Yellow
npm run test
if ($LASTEXITCODE -ne 0) {
    Write-Error "Tests failed."
}

Write-Host "Phase 5 Verification Passed successfully!" -ForegroundColor Green
