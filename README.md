# AI-Powered Financial Fraud Detection System

> Real-time fraud detection using Machine Learning with FastAPI backend, React dashboard, and cloud deployment.

## 🎯 Project Overview

This system detects fraudulent financial transactions in real-time using AI/ML algorithms. Banks and payment systems can integrate via REST API to receive instant fraud risk assessments.

## 🏗️ Architecture

```
fraud-detection/
├── backend/          # FastAPI + ML engine
├── frontend/         # React admin dashboard
├── ml/              # ML training & datasets
├── infra/           # Docker, configs
├── docs/            # Documentation
└── .github/         # CI/CD workflows
```

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- Docker & Docker Compose
- Poetry

### Installation

**Backend:**
```bash
cd backend
poetry install
poetry run start
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

**Full Stack (Docker):**
```bash
docker-compose up
```

## 👥 Team Members & Roles

- **ML Engineer**: Train fraud detection models
- **Backend Developer**: FastAPI endpoints & ML integration
- **Frontend Developer**: React dashboard & visualizations
- **DevOps Engineer**: Docker, CI/CD, AWS deployment
- **Security Engineer**: API security & payment gateway integration

## 📖 Documentation

See `/docs` folder for:
- API documentation
- ML model architecture
- Deployment guides
- Integration examples

## 🔐 Security

This system uses JWT authentication, HTTPS encryption, and follows OWASP best practices.

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ by UVA WELLASSA UNIVERSITY**