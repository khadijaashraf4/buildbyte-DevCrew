Write-Host "Starting Django Backend Setup..." -ForegroundColor Cyan

# 1. Create Virtual Environment
if (-not (Test-Path "venv")) {
    Write-Host "Creating python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# 2. Install Dependencies
Write-Host "Installing dependencies (Django, DRF, CORS Headers, SimpleJWT)..." -ForegroundColor Yellow
.\venv\Scripts\pip install django djangorestframework django-cors-headers djangorestframework-simplejwt --quiet

# 3. Create migrations and migrate
Write-Host "Running migrations..." -ForegroundColor Yellow
.\venv\Scripts\python manage.py makemigrations api
.\venv\Scripts\python manage.py migrate

# 4. Seed sample data
Write-Host "Seeding sqlite database with sample data..." -ForegroundColor Yellow
.\venv\Scripts\python manage.py seed_data

# 5. Run tests
Write-Host "Running backend unit tests..." -ForegroundColor Yellow
.\venv\Scripts\python manage.py test
