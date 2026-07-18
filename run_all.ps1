Write-Host "Starting ProofPath Full-Stack Application..." -ForegroundColor Cyan

# 1. Start Django Backend in a new terminal window
Write-Host "Launching Django Backend server in a separate window..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\activate; python manage.py runserver"

# 2. Start React Frontend in a new terminal window
Write-Host "Launching React Frontend dev server in a separate window..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; `$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User'); npm run dev"

Write-Host "`nAll systems launched successfully!" -ForegroundColor Green
Write-Host "• Frontend Portal: http://localhost:5173" -ForegroundColor Green
Write-Host "• Backend REST API: http://127.0.0.1:8000/api/" -ForegroundColor Green
