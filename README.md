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

## Production Deployment

For production environments, use the dedicated production compose file:

1. Prepare your production environment variables:
   ```bash
   cp .env.prod.example .env.prod
   # Edit .env.prod with your production keys and passwords
   ```

2. Start the production stack:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

3. Initialize the database:
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
   ```

The production setup includes:
- **Nginx:** Serving built static frontend files and proxying API/WS requests.
- **Gunicorn:** Production-grade WSGI server for the FastAPI backend.
- **PostgreSQL:** Persistent database for incidents and user data.
- **Redis:** Message broker for Celery and WebSocket broadcasting.
- **Health Checks:** Automatic service monitoring.

