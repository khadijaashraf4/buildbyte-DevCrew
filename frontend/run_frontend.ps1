Write-Host "Starting React Frontend Developer Server..." -ForegroundColor Cyan

# Reload PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is not recognized. Please ensure Node.js is on the environment path."
    exit 1
}

# Run dev server
npm run dev
