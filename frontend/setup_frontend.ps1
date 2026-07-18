Write-Host "Starting Frontend Setup & Verification..." -ForegroundColor Cyan

# Reload PATH in current PowerShell session
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is still not recognized. Please make sure Node.js is installed and restart your shell."
    exit 1
}

Write-Host "Running npm install..." -ForegroundColor Yellow
npm install

Write-Host "Verifying frontend build..." -ForegroundColor Yellow
npm run build

Write-Host "Frontend compiled successfully!" -ForegroundColor Green
