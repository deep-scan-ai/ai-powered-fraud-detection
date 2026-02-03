# Fraud Detection Frontend

React dashboard for viewing fraud analysis results.

## Setup
```bash
npm install
npm run dev
```

## Environment

Create `.env` file:

#### View Logs
```bash
docker-compose logs -f backend      # Backend logs
docker-compose logs -f frontend     # Frontend logs
docker-compose logs -f postgres     # Database logs
docker-compose logs -f redis        # Cache logs
```

#### Restart Service
```bash
docker-compose restart backend
docker-compose restart frontend
docker-compose restart postgres
docker-compose restart redis
```

#### Stop All Containers (e.g. end of day)
```bash
docker-compose down            # Stop containers; database data stays safe
```

**Note:** Run the above from the **project root** (where `docker-compose.yml` is), not from `frontend/`.

### Connect to Database
```bash
# Open PowerShell in project root
docker exec -it fraud-db psql -U postgres -d frauddb


## Step: Check Code Quality

### Backend Code
```bash
cd backend

# Format code
poetry run black app/

# Check imports
poetry run isort app/

# Type check
poetry run mypy app/

# Run tests
poetry run pytest
```

**All should PASS** ✅

### Frontend Code
```bash
cd frontend

# Format code
npm run format

# Lint code
npm run lint

# All should PASS** ✅
```


```bash
# Test API endpoint
curl http://localhost:8000/api/transactions
```