# ProofPath (MVP)

> **Tagline:** Prove your skills, not your privilege.

ProofPath is a full-stack web application designed to reduce hiring biases by initially hiding candidate background identifiers (Name, Photo, University, Gender, Address) from recruiters. Employers can evaluate applicants strictly based on their projects, skills, and verified work history. Candidate identity details are only revealed after the candidate has been shortlisted.

---

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS v3, Axios, Lucide Icons, React Router DOM v6
- **Backend:** Django 5, Django REST Framework, Django CORS Headers, SimpleJWT (JSON Web Token)
- **Database:** SQLite
- **Authentication:** JWT (JSON Web Tokens) with auto-refresh mechanism

---

## Directory Structure

```
proofpath/
├── backend/                # Django REST Framework backend
│   ├── manage.py
│   ├── proofpath_backend/  # Config
│   └── api/                # Core business logic, models, serializers, views
├── frontend/               # React frontend
│   ├── src/                # Components, pages, contexts, services
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

---

## Quick Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

---

### 1. Backend Setup

1. Open a terminal in the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install required packages:
   ```bash
   pip install django djangorestframework django-cors-headers djangorestframework-simplejwt
   ```
4. Run migrations to setup SQLite:
   ```bash
   python manage.py makemigrations api
   python manage.py migrate
   ```
5. Seed the database with realistic sample data (includes mock skills, students, projects, jobs, applications, and work record verification requests):
   ```bash
   python manage.py seed_data
   ```
6. Run unit tests to verify:
   ```bash
   python manage.py test api
   ```
7. Start the backend development server:
   ```bash
   python manage.py runserver
   ```
   *The API will be live at `http://127.0.0.1:8000/api/`.*

---

### 2. Frontend Setup

1. Open a terminal in the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend dashboard will be running at `http://localhost:5173/`.*

---

## Sample Accounts for Testing (Pre-seeded)

Use these credentials to login and test different roles and bias-free mechanics:

### Students
1. **Alex Mercer** (Full-Stack Student)
   - **Email:** `alex@student.com`
   - **Password:** `password123`
   - **Pre-seeded Portfolio:** React, Python, Django, Tailwind CSS, Git. (100% Match for TechCorp's Python role)
   - **Status:** Already has a Pending job application, a Shortlisted application, and a Verified work record.
2. **Sarah Jenkins** (UI/UX Student)
   - **Email:** `sarah@student.com`
   - **Password:** `password123`
   - **Pre-seeded Portfolio:** React, Figma, Tailwind CSS. (100% Match for DesignHub's UI/UX role)

### Employers
1. **TechCorp Inc. Recruiter**
   - **Email:** `recruiter@techcorp.com`
   - **Password:** `password123`
   - **Features:** Has active job listings (React Developer, Python Backend Intern) and has applicants waiting.
2. **DesignHub Studio Recruiter**
   - **Email:** `recruiter@designhub.com`
   - **Password:** `password123`
   - **Features:** Has active volunteer role (Junior UI/UX Engineer) and Sarah applied.

---

## Key Features Implemented

### 1. Bias-Free Applicant Review
When an employer logs in and reviews candidates for their job post:
- If status is **Pending**, the API serializer overrides the user profile:
  - Name is replaced with `Candidate #<id>`
  - University shows `Hidden until Shortlisted & Identity Revealed`
  - Gender/Address is returned as `Hidden`
  - Photo is null/hidden.
- The employer can see **Skills**, **Projects**, **Verified Work Records**, and **Match Percentage**.
- Clicking **Shortlist** puts the candidate on the shortlisting track.
- Once Shortlisted, the **Reveal Identity** button is unlocked. Clicking it makes a backend call to transition the application to **Revealed**, which immediately exposes the candidate's real name, school, photo, and bio!

### 2. Real-Time Skill Matching
- Opporunities query matching student profiles.
- Match score is calculated on-the-fly: `Match % = (Matching Student Skills ÷ Required Skills) * 100`
- Lists exact **Matched Skills** (green badges) and **Missing Skills** (slate badges), allowing students to immediately identify skill gaps.

### 3. Work Verification requests
- Students submit tasks/roles they performed.
- Employers can verify work records from their dashboard and leave custom remarks.
- Verified work records receive a shiny badge on the student's profile.
