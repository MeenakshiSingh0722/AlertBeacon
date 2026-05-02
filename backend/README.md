# AlertBeacon Backend

Autonomous AI-driven crisis detection and alerting system.

## Tech Stack
- **FastAPI**: API Framework
- **PostgreSQL**: Primary Database
- **Redis**: Caching, Pub/Sub, and Celery Broker
- **SQLAlchemy 2.0 (Async)**: ORM
- **Alembic**: Database Migrations
- **CrewAI**: Agent Orchestration
- **Claude 3.5 Sonnet**: AI Classification & Severity Scoring

## Setup Instructions

### 1. Prerequisites
- Docker & Docker Compose
- Python 3.11+

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in the required values:
```bash
cp .env.example .env
```

### 3. Spin up Infrastructure
```bash
docker-compose up -d db redis
```

### 4. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 5. Run Database Migrations
```bash
cd backend
python -m alembic upgrade head
```

### 6. Seed Demo Data
```bash
cd backend
python scripts/seed_demo.py
```

### 7. Start the Server
```bash
cd backend
uvicorn app.main:app --reload
```

## API Documentation
Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- Redoc: `http://localhost:8000/redoc`
