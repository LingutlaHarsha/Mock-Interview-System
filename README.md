# MOCK INTERVIEW SYSTEM

An end-to-end web platform designed to streamline mock interviews, technical coding assessments, and performance evaluations for college placement preparation. The system connects students, faculty interviewers, and placement administrators into a unified, collaborative ecosystem.

---

## 📌 Table of Contents
- [Project Introduction](#-project-introduction)
- [Project Objectives](#-project-objectives)
- [Key Features](#-key-features)
- [Technologies Used](#-technologies-used)
- [Project Structure](#-project-structure)
- [Installation Steps](#-installation-steps)
- [How to Run the Project](#-how-to-run-the-project)
- [Default Testing Credentials](#-default-testing-credentials)
- [Deployment](#-deployment)
- [Future Enhancements](#-future-enhancements)

---

## 📖 Project Introduction

Placement interviews demand technical rigor, structured problem solving, and effective communication. The **Mock Interview System** provides students with a simulated interview environment where they can schedule mock interview sessions with faculty mentors, take timed technical coding assessments with automated test case evaluation, upload their resumes, and receive actionable, structured feedback across key hiring dimensions.

---

## 🎯 Project Objectives

- **Bridge the Preparation Gap**: Enable students to experience realistic technical and HR interview rounds before campus placement drives.
- **Automate Interview Scheduling**: Eliminate manual coordination by providing dynamic slot creation, slot booking, and conflict prevention.
- **Hands-on Technical Assessment**: Provide a built-in coding platform supporting multiple programming languages with automated test case execution.
- **Actionable Feedback & Analytics**: Deliver standardized evaluation metrics (technical skills, communication, problem-solving, placement readiness) to track student improvement over time.
- **Centralized Administration**: Allow placement administrators to manage faculty approvals, review student rosters, broadcast notifications, and track overall placement readiness.

---

## ✨ Features

### 🎓 Student Portal
- **Dashboard & Analytics**: Real-time overview of upcoming interviews, assessment progress, and profile completion status.
- **Resume Management**: Secure PDF resume upload with instant viewer and download capabilities.
- **Slot Booking**: Browse available faculty slots filtered by date, time, and faculty member, with immediate confirmation.
- **Technical Coding Platform**:
  - Timed coding tests with automated submission judging.
  - Multi-language code evaluation with custom test cases.
  - Detailed submission history and pass/fail execution results.
- **Detailed Feedback History**: View comprehensive ratings and recommendations from faculty evaluators.
- **In-App Notifications**: Real-time alerts for booking confirmations, slot updates, and announcements.

### 👨‍🏫 Faculty Portal
- **Slot Management**: Create, view, and manage available interview slots with customizable durations.
- **Applicant Review**: Access booked student details, academic profiles, and uploaded resumes prior to interviews.
- **Structured Evaluation**: Grade students on technical proficiency, problem-solving, communication skills, and final placement readiness recommendations.
- **Interview History**: Review past feedback provided to track candidate trajectory.

### 🛡️ Admin Portal
- **Faculty Approval Workflow**: Review and approve or reject pending faculty registrations.
- **Roster & Account Management**: Create, edit, and reset passwords for student and faculty accounts.
- **System Broadcasts**: Dispatch site-wide notifications and announcements to students and faculty.
- **Placement Insights**: High-level overview of total interviews completed, feedback metrics, and student readiness.

---

## 🛠️ Technologies Used

### Frontend
- **Framework**: React 19 + Vite
- **Routing**: React Router DOM (v7)
- **Styling**: Bootstrap 5 + Custom Modern CSS Design System
- **Icons**: React Icons (FontAwesome)
- **HTTP Client**: Axios with JWT Interceptors & Token Auto-refresh handling

### Backend
- **Framework**: Django 4.2+ & Django REST Framework (DRF)
- **Authentication**: SimpleJWT (JSON Web Tokens) with custom claims and role-based permissions
- **Database**: SQLite (Development) / PostgreSQL compatible (Production)
- **Static Asset Serving**: WhiteNoise
- **CORS Handling**: `django-cors-headers`
- **WSGI Server**: Gunicorn

---

## 📁 Project Structure

```text
MOCK INTERVIEW SYSTEM/
├── backend/
│   ├── accounts/             # User authentication, roles (Student, Faculty, Admin), profile views
│   ├── bookings/             # Interview booking models, slot assignment, status tracking
│   ├── coding/               # Coding assessments, questions, test case evaluation engine
│   ├── config/               # Django root project settings, WSGI, URLs
│   ├── dashboard/            # Role-specific analytics and metric endpoints
│   ├── faculty/              # Faculty profile and slot creation views
│   ├── feedback/             # Post-interview evaluation records and scoring
│   ├── notifications/        # In-app notification dispatch and management
│   ├── students/             # Student profiles, academic details, and resume handling
│   ├── initial_data.json     # Pre-seeded database fixtures (admin user, coding questions, test cases)
│   ├── manage.py             # Django management CLI
│   └── requirements.txt      # Python backend dependencies
│
├── frontend/
│   ├── public/               # Static images and public assets
│   ├── src/
│   │   ├── components/       # Shared UI components (Navbar, Sidebar, Modals, Cards)
│   │   ├── pages/            # Role-based pages (Student, Faculty, Admin, Auth, Home)
│   │   │   ├── Admin/        # Administration and approval dashboards
│   │   │   ├── Auth/         # Login, Register, Role Selector
│   │   │   ├── Faculty/      # Slot management, candidate evaluation, interview rosters
│   │   │   └── Student/      # Student dashboard, slots, coding tests, profile, feedback
│   │   ├── services/         # Axios API clients with auto JWT attachment
│   │   ├── styles/           # Custom CSS stylesheets
│   │   ├── App.jsx           # Master route configuration
│   │   └── main.jsx          # React DOM entrypoint
│   ├── index.html            # Main HTML document
│   ├── package.json          # Frontend packages and scripts
│   ├── vercel.json           # Vercel SPA routing configuration
│   └── vite.config.js        # Vite build tool and development proxy setup
│
├── .gitignore                # Git exclusions (venv, node_modules, secrets, cache)
├── DEPLOYMENT.md             # Complete cloud deployment guide (Render & Vercel)
├── render.yaml               # 1-Click Render blueprint configuration
└── README.md                 # Project documentation
```

---

## ⚙️ Installation Steps

### Prerequisites
- **Python**: 3.10+ installed
- **Node.js**: 18+ and npm installed
- **Git**: Installed on your system

### 1. Clone the Repository
```bash
git clone https://github.com/LingutlaHarsha/Mock-Interview-System.git
cd Mock-Interview-System
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Load initial database fixture (admin account, coding questions, test cases)
python manage.py loaddata initial_data.json
```

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install npm packages
npm install
```

---

## 🚀 How to Run the Project

### Start the Backend Server
```bash
cd backend
# Make sure your virtual environment is active
python manage.py runserver 127.0.0.1:8000
```
- Django API will run at: `http://127.0.0.1:8000/api/`
- Django Admin panel will run at: `http://127.0.0.1:8000/admin/`

### Start the Frontend Server
```bash
cd frontend
npm run dev
```
- Frontend application will run at: `http://localhost:5173/`

Open **`http://localhost:5173/`** in your browser. All API requests are automatically proxied to `http://127.0.0.1:8000`.

---

## 🔑 Default Testing Credentials

The initial fixture pre-configures default accounts for easy testing:

| Role | Username | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin1234` | Full system oversight, faculty approvals, student management |
| **Student** | Self-register | Set during registration | Slot booking, coding test, resume upload, feedback |
| **Faculty** | Self-register *(requires Admin approval)* | Set during registration | Slot creation, student evaluation |

---

## ☁️ Deployment

- **Backend**: Pre-configured for deployment on **[Render.com](https://render.com/)** using Gunicorn and WhiteNoise (`render.yaml`).
- **Frontend**: Pre-configured for deployment on **[Vercel](https://vercel.com/)** or **Render Static Site** with SPA client-side rewrite handling (`vercel.json`).
- Detailed deployment instructions are documented in [DEPLOYMENT.md](DEPLOYMENT.md).

---

## 🔮 Future Enhancements

- **AI-Powered Mock Interviewer**: Integrated LLM interviewer to conduct simulated conversational voice/video interviews with real-time follow-up questions.
- **Computer Vision Body Language Feedback**: Real-time webcam analysis measuring eye contact, posture, and facial confidence during sessions.
- **Automated Resume Scoring**: NLP-based ATS resume scanner comparing uploaded PDF resumes against target job descriptions.
- **Calendar Integrations**: Sync scheduled mock interviews directly with Google Calendar and Outlook.
- **Live Peer Interviews**: WebRTC-based video conferencing rooms directly inside the browser for remote faculty interviews.
