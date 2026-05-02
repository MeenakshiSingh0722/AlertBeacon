# AlertBeacon Monorepo

Autonomous AI-driven crisis detection and alerting platform.

## Project Structure
- `backend/`: FastAPI, SQLAlchemy, CrewAI, and Claude AI agents.
- `frontend/`: React + Vite dashboard with Leaflet maps.
- `docker-compose.yml`: Infrastructure orchestration.
- `nginx.conf`: Reverse proxy for routing API and Frontend.

## Quick Start

### 1. Setup Environment
Copy `.env.example` to `.env` in the root and fill in your API keys (Anthropic, Mapbox, etc.).

### 2. Start Services
```bash
docker-compose up --build
```

### 3. Access the Platform
- **Frontend:** `http://localhost`
- **API Docs:** `http://localhost/api/v1/docs`
- **Task Monitor (Flower):** `http://localhost:5555`

## Background Tasks (Celery)
The system uses Celery for periodic tasks:
- **Pipeline:** Runs every 5 minutes to scrape and analyze data.
- **Health Checks:** Validates data sources every 15 minutes.
- **Cleanup:** Removes old agent logs daily.

To run Celery locally without Docker (requires Redis):
```bash
cd backend
# Start Worker
celery -A app.tasks.celery_app worker --loglevel=info
# Start Beat
celery -A app.tasks.celery_app beat --loglevel=info
```

## Features
- **Autonomous Scraping:** Periodic RSS/News data collection.
- **AI Intelligence:** Claude-powered classification and severity scoring.
- **Real-time Map:** Live incident updates via WebSockets.
- **NGO Notifications:** Targeted alerts based on organization preferences.
