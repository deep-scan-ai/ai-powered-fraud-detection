# AI-Powered Financial Fraud Detection System

> Real-time fraud detection using Machine Learning with FastAPI backend, React dashboard, and cloud deployment.

## Project Overview

This system detects fraudulent financial transactions in real-time using AI/ML algorithms. Banks and payment systems can integrate via REST API to receive instant fraud risk assessments.

### Features:
-  Real-time transaction analysis
-  Machine learning fraud detection
-  REST API with automatic documentation
-  React dashboard for visualization
-  PostgreSQL database for data persistence
-  Redis caching for performance
-  Docker containerization
-  Easy deployment


##  Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Python 3.12** - Programming language
- **SQLAlchemy** - ORM for database
- **PostgreSQL** - Relational database
- **Redis** - In-memory cache
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

### Frontend
- **React 18** - UI framework
- **Node.js** - JavaScript runtime
- **npm** - Package manager

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

---

##  👨🏼‍💻Quick Start with Docker

### Prerequisites
- Docker Desktop installed
- Git installed
- 2-3 GB free disk space

### Step 1: Clone Repository
```bash
git clone https://github.com/deep-scan-ai/ai-powered-fraud-detection.git
cd ai-powered-fraud-detection
```
🐳Make sure **Docker Desktop** Application are running!

### Step 2: .env Files Setup
Before running Docker, you need to create these file:

**FILE 1: backend/.env (IMPORTANT!)**
```bash
Location: x:\Git Project\ai-powered-fraud-detection\backend\.env
```
**FILE 2: frontend/.env (IMPORTANT!)**
```bash
Location: x:\Git Project\ai-powered-fraud-detection\frontend\.env
```

### Step 3: Start All Services
```bash
docker-compose up -d --build
```

**Wait 2-3 minutes for everything to start...**

### Step 4: Verify Services
```bash
docker-compose ps
```

You should see:
```
NAME             STATUS
fraud-backend    Up
fraud-cache      Up (healthy)
fraud-db         Up (healthy)
fraud-frontend   Up
```

### Step 5: Access Services

**API Documentation (Testing):**
```
http://localhost:8000/docs
```

**Frontend Dashboard:**
```
http://localhost:3000
```
---

### Step 6: Test the API

1. Open: `http://localhost:8000/docs`
2. Click: `POST /api/transactions`
3. Click: "Try it out"
4. Enter test data:
```json
{
  "transaction_id": "TXN001",
  "amount": 100.50,
  "merchant": "Amazon",
  "card_type": "credit"
}
```
5. Click: "Execute"
6. See response with fraud detection results ✅

---

## 📁 Project Structure
```
ai-powered-fraud-detection/
│
├── README.md                    # This file
├── docker-compose.yml           # Docker configuration
├── .gitignore                   # Git ignore rules
│
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI main app
│   │   ├── config.py           # Settings
│   │   ├── database.py         # Database connection
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── transaction.py  # Transaction model
│   │   │   └── user.py         # User model
│   │   ├── api/
│   │   │   ├── admin.py        # Admin routes
│   │   │   ├── auth.py         # Auth routes
│   │   │   ├── routes.py       # General routes
│   │   │   └── transactions.py # Transaction routes
│   │   ├── services/
│   │   │   ├── fraud_detector.py
│   │   │   ├── alert_service.py
│   │   │   └── cache_service.py
│   │   ├── utils/
│   │   │   ├── logger.py
│   │   │   └── security.py
│   │   ├── ml/
│   │   │   ├── fraud_model.pkl
│   │   │   ├── model_loader.py
│   │   │   └── preprocessor.py
│   │   └── __init__.py
│   ├── pyproject.toml          # Python dependencies
│   ├── poetry.lock             # Locked versions
│   ├── Dockerfile              # Docker setup
│   ├── .dockerignore
│   ├── .env                    # Backend env file (Environment variables)
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main component
│   │   ├── main.jsx            # Entry point
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles/
│   ├── package.json            # Node dependencies
│   ├── vite.config.js          # Vite config
│   ├── Dockerfile              # Docker setup
│   ├── .dockerignore
│   ├── .env                    # Frontend env file (Environment variables)
│   └── README.md
│
└── infra/                       # (not used - kept for reference)
```

---

## 👨‍💻 Development Guide

### Code Structure

### Backend - Python/FastAPI

**Models** (`app/models/`)
```python
# transaction.py contains:
- TransactionDB: SQLAlchemy database model
- Transaction: Pydantic request model
- TransactionResponse: Pydantic response model
```

**Routes** (`app/api/`)
- Define all API endpoints
- Handle requests and responses
- Business logic lives here

**Services** (`app/services/`)
- Fraud detection logic
- Database operations
- External service calls

**Database** (`app/database.py`)
- Database connection setup
- Session management
- Async operations

---

### Frontend - React

**Components** (`src/components/`)
- Reusable UI components
- Button, Card, Table, etc.

**Pages** (`src/pages/`)
- Full page components
- Dashboard, Home, etc.

**API Calls**
- Use `axios`
- Call `http://localhost:8000` endpoints

---
### Development Workflow

#### Editing Backend Code

1. Edit files in `backend/app/`
2. Save the file
3. Backend auto-reloads (hot reload enabled)
4. Refresh browser to see changes

**No restart needed!** ✅

#### Editing Frontend Code

1. Edit files in `frontend/src/`
2. Save the file
3. Frontend auto-reloads
4. Browser auto-refreshes

**No restart needed!** ✅

#### Adding New API Endpoint

1. Create function in `backend/app/main.py` or `backend/app/api/routes.py`
2. Add `@app.get()` or `@app.post()` decorator
3. Save file
4. Check `http://localhost:8000/docs` - endpoint appears automatically!


---

### ⚠️Git Workflow

#### Before Starting Work
```bash
git pull origin main
```
```bash
git pull origin dev
```

#### Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

#### Make Changes
```bash
# Edit code
# Test locally
```

#### Commit Changes
```bash
git add .
git commit -m "Add feature description"
```

#### Push to Remote
```bash
git push origin feature/your-feature-name
```

#### Create Pull Request
1. Go to GitHub
2. Click "Compare & pull request"
3. Compare your branch with `dev`
4. Fill out pull request template (see below)
5. Request review from team
6. Wait for approval

#### After Approval
```bash
# Merge on GitHub
# Then pull updates locally
git checkout dev
git pull origin dev
```

---

# Team Workflow & Standards

## 📝 Commit Message Convention

We use **Conventional Commits** for clear, consistent commit messages.

### Format
```
<type>: <description>
```

### Types (Naming)

- **`feat:`** - New feature
- **`fix:`** - Bug fix
- **`docs:`** - Documentation changes
- **`style:`** - Code style/formatting (no logic change)
- **`refactor:`** - Code refactoring (no feature/bug change)
- **`test:`** - Adding or updating tests
- **`chore:`** - Build/config/dependency changes

### Examples
✅ **Good:**
```bash
git commit -m "fix: prevent race condition in transaction processing"
git commit -m "feat: add fraud probability scoring to dashboard"
git commit -m "docs: add setup instructions for new developers"
```





## 📋 Pull Request Template


```markdown
## Title
add the suitable matching title with type
Title Example:
feat: add fraud detection dashboard

## Description

Brief description of what this PR does. Explain the changes and why they were needed.

### Related Issue
Closes #(issue number)

---

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update
- [ ] Other (please describe):

---

## Changes Made

- Change 1
- Change 2
- Change 3

---

## Testing

Describe how you tested these changes:

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

### Test Steps

1. Step to reproduce/test
2. Step 2
3. Expected result

---

## Screenshots (if applicable)

Add screenshots if UI changes were made.

---

## Checklist

- [ ] My code follows the project style guidelines
- [ ] I have self-reviewed my own code
- [ ] I have commented complex or tricky code sections
- [ ] I have updated related documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally

---

## Additional Context

Add any other context about the PR here.
```

---


## 👥 Code Review Guidelines

### For Reviewers

### Review Checklist
```
Code Quality:
- [ ] Code is readable and maintainable
- [ ] No unnecessary complexity
- [ ] Follows project conventions

Functionality:
- [ ] Changes work as described
- [ ] No breaking changes
- [ ] Edge cases handled

Testing:
- [ ] Tests are included
- [ ] Tests cover the changes
- [ ] Tests pass

Documentation:
- [ ] README updated if needed
- [ ] Code commented where needed
- [ ] API docs updated if needed

Security:
- [ ] No security vulnerabilities
- [ ] No sensitive data exposed
- [ ] Input validation present
```

### Approval Process

1. **Minimum 1 approval required** before merging
2. Team lead can merge after approval
3. Use "Squash and merge" to keep history clean

---

## 📅 Daily Standup (Async)

Post daily updates on **Group** (or team communication tool):

### Format
```
🌅 YESTERDAY
- Completed task 1
- Completed task 2
- Fixed bug with X

📋 TODAY
- Working on feature Y
- Will review PR #123
- Planning to finish task Z

🚧 BLOCKERS
- Issue with database connection (investigating)
  → Can't test API because database won't connect
```

### When

- **Post by:** 10 AM (your timezone)
- **Read by:** Team lead reviews during day
- **Response by:** 5 PM same day


## 👥 Team Members

- **Mr.W.M.S.D. Wanasinghe** : Project Manager / FullStack Developer
- **Mr.M.D. Shanilka Hirushan** : FullStack Developer / Tester
- **Mr.W.M.I.S. Wanninayaka** : FullStack Developer / Tester
- **Mr.R.A. Lakmal** : FullStack Developer
- **Mr.D.M.T.N.Dissanayake** : Full-Stack Developer


## 🎓 Learning Resources

- **FastAPI:** https://fastapi.tiangolo.com/
- **React:** https://react.dev/
- **PostgreSQL:** https://www.postgresql.org/docs/
- **Docker:** https://docs.docker.com/
- **SQLAlchemy:** https://docs.sqlalchemy.org/

## 🎉 You're Ready!

Your fraud detection system is now set up and ready to use!

**Happy coding!** 🚀

**Built with ❤️ by UVA WELLASSA UNIVERSITY**
