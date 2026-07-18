# buildbyte-DevCrew
ProofPath is a skills-first platform that enables students to build verified portfolios, earn verified work records, and connect with employers through a fair and transparent hiring process.
# 🚀 ProofPath

> **ProofPath** is a skills-first platform that enables students to build verified portfolios, complete skill assessments, receive verified work records, and connect with employers through a fair and transparent hiring process.

---

# 👥 Team Information

**Team Name:** DevCrew

## Team Members

- **Khadija Ashraf**
- **Ifrah Zulfiqar**
- **Iqra Syed**

---

# 📖 Solution Overview

ProofPath is a web platform that helps bridge the gap between students and employers by focusing on **verified skills instead of traditional resumes**.

Students can showcase their abilities through verified portfolios, skill assessments, certifications, and work records. Employers can browse these verified profiles, evaluate candidates based on demonstrated skills, and hire with greater confidence.

The platform encourages merit-based hiring while helping students build a professional digital identity from the beginning of their careers.

---

# 💡 Conceptual Explanation

Many students have the skills required for jobs but struggle to demonstrate them through a traditional resume, especially when they have little or no work experience. At the same time, employers often find it difficult to identify capable candidates because resumes alone do not accurately reflect practical abilities.

ProofPath was designed to solve this problem by shifting the focus from credentials to verified skills. Students can complete assessments, build portfolios, upload projects, and maintain verified work records that provide evidence of their abilities. Employers can then evaluate candidates based on these verified achievements instead of relying solely on academic qualifications or previous job experience.

Our goal is to create a transparent and fair hiring ecosystem where talent is recognized through demonstrated skills, helping students gain opportunities while enabling employers to make informed hiring decisions.

---

# ✨ Features

## Student Features

- Student registration and secure login
- Create and manage a professional profile
- Upload projects and certifications
- Build a verified portfolio
- Select skills from the Skill Cloud
- View work verification status
- Browse recommended job opportunities
- View job matching scores
- Apply for jobs

---

## Employer Features

- Employer registration and login
- Employer dashboard
- Browse verified student profiles
- View portfolios and assessment results
- Search students based on skills
- Review applicants
- Connect with qualified candidates

---

## General Features

- Role-based authentication
- Responsive user interface
- Secure session management
- Database-driven application
- Modern dashboard experience

---

# 🧪 Sample Accounts

The application includes pre-configured demo accounts for testing.

| Role | Email | Password |
|------|-------|----------|
| **Student (Alex Mercer)** | `alex@student.com` | `password123` |
| **Student (Sarah Jenkins)** | `sarah@student.com` | `password123` |
| **Employer (TechCorp Inc. Recruiter)** | `recruiter@techcorp.com` | `password123` |

---

## 👨‍🎓 Student Demo Account (Alex Mercer)

**Email:** `alex@student.com`

**Password:** `password123`

### Explore:

- Student Dashboard
- Manage Projects
- View Portfolio
- Check Work Verification Status
- Select Skills from the Skill Cloud
- Browse Jobs
- View Job Match Scores
- Apply for Jobs

---

## 👩‍🎓 Student Demo Account (Sarah Jenkins)

**Email:** `sarah@student.com`

**Password:** `password123`

Use this account to explore the platform from another student's perspective.

---

## 🏢 Employer Demo Account

**Company:** TechCorp Inc.

**Email:** `recruiter@techcorp.com`

**Password:** `password123`

### Explore:

- Employer Dashboard
- Browse Student Profiles
- Review Portfolios
- View Skill Assessments
- Search Candidates
- Review Applicants

---

# 🛠 Technology Stack
## Frontend

- React.js
- JavaScript 
- HTML5
- CSS3
- Tailwind CSS
- React Router DOM
- Lucide React

## Backend

- Python
- Django
- Django REST Framework (DRF)

## Database

- SQLite

## Authentication

- Django Authentication
- Token/JWT Authentication

## Development Tools

- Git
- GitHub
- Visual Studio Code
- Vite
- npm
- pip


---

# ⚙️ Installation Instructions

## 1. Clone the repository

```bash
git clone https://github.com/your-username/proofpath.git
```

---

## 2. Navigate into the project

```bash
cd proofpath
```

---

## 3. Install dependencies

```bash
npm install
```

---

## 4. Configure Environment Variables

Create a `.env` file in the root directory.

Example:

```env
DATABASE_URL=your_database_url
SESSION_SECRET=your_secret_key
PORT=5000
```

> **Never commit your actual secrets to GitHub.**

---

## 5. Start the development server

```bash
npm run dev
```

The application will run at:

```
http://localhost:5000
```

---

# 📂 Project Structure

```
ProofPath
│
├── client/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── hooks/
│
├── server/
│
├── shared/
│
├── attached_assets/
│
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── drizzle.config.ts
├── README.md
└── .env
```

---

# 🔐 Environment Variables

The following environment variables are required.

| Variable | Description |
|-----------|-------------|
| DATABASE_URL | Database connection string |
| SESSION_SECRET | Secret used for authentication |
| PORT | Application server port |

**Example**

```env
DATABASE_URL=your_database_url
SESSION_SECRET=your_secret_key
PORT=5000
```

# 🚀 Future Improvements

- AI-powered skill recommendations
- AI-assisted resume builder
- Interview scheduling
- Real-time messaging
- Company verification system
- Advanced analytics dashboard
- Blockchain-based certificate verification
- Integrated job recommendation engine


---

# 📄 License

This project was developed by **DevCrew** as part of a hackathon submission and is intended for educational and demonstration purposes.