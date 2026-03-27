# Competitive Exam Coaching Platform

Django + React.js + PostgreSQL + Claude AI

## Quick Start

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure .env (update DB credentials and ANTHROPIC_API_KEY)
cp .env .env.local

# Run migrations
python manage.py migrate

# Seed exam data (EAMCET, DSC, Civils, Groups, CEEP, ECET)
python manage.py seed_data

# Create admin user
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register/ | Register student |
| POST | /api/auth/login/ | Login (JWT) |
| GET | /api/auth/profile/ | Get/Update profile |
| GET | /api/exam-types/ | List all exam types |
| GET | /api/subjects/?exam_type=1 | Subjects for exam |
| GET | /api/chapters/?subject=1 | Chapters for subject |
| GET/POST | /api/enrollments/ | Student enrollments |
| GET | /api/materials/ | Study materials |
| POST | /api/papers/generate/ | AI generate paper |
| POST | /api/sessions/ | Start exam session |
| POST | /api/sessions/{id}/submit/ | Submit + AI evaluate |
| GET | /api/results/ | Exam results |
| GET | /api/results/dashboard/ | Performance summary |

## Project Structure
```
compititive-exam/
├── backend/
│   ├── users/          # Auth & user profiles
│   ├── exams/          # ExamType, Subject, Chapter, Topic
│   ├── enrollments/    # Student enrollments
│   ├── materials/      # Study materials
│   ├── papers/         # AI paper generation
│   ├── exam_sessions/  # Exam taking & answers
│   ├── results/        # Scoring & analysis
│   └── ai_service/     # Claude AI integration
└── frontend/
    └── src/
        ├── pages/      # React pages
        ├── components/ # Reusable components
        ├── context/    # Auth context
        └── api/        # Axios client
```

## Supported Exams
- EAMCET (Engineering & Agriculture)
- DSC (District Selection Committee - Teachers)
- Civil Services (UPSC/APPSC)
- Group Services (APPSC Groups 1/2/3/4)
- CEEP (Polytechnic)
- ECET (Engineering Common Entrance)
