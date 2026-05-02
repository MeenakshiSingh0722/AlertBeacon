# 🐳 AlertBeacon Docker Guide

This project uses Docker to orchestrate the API, Database, Redis broker, and Autonomous AI Workers.

## 🚀 Getting Started

### 1. Prerequisites
- Ensure **Docker Desktop** is installed and running.
- Ensure your `.env` file in the root has your `ANTHROPIC_API_KEY`.

### 2. Start Services
Run this from the project root:
```powershell
docker compose up --build -d
```
*The `-d` flag runs it in the background.*

### 3. Setup Database
Inside the Docker environment, you must run migrations and seeding:
```powershell
# Run Migrations
docker compose exec backend python -m alembic upgrade head

# Seed Demo Data
docker compose exec backend python scripts/seed_demo.py
```

---

## 🛠️ Common Commands

| Action | Command |
| :--- | :--- |
| **Stop All** | `docker compose down` |
| **View API Logs** | `docker compose logs -f backend` |
| **View AI Worker Logs** | `docker compose logs -f celery_worker` |
| **Restart One Service** | `docker compose restart backend` |
| **Check Container Status**| `docker compose ps` |

---

## 🌐 Service Access
- **FastAPI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Flower (Celery Monitor):** [http://localhost:5555](http://localhost:5555)
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **PostgreSQL:** `localhost:5432` (User/Pass: `postgres/postgres`)
- **Redis:** `localhost:6379`

---

## ❓ Troubleshooting

### "Failed to connect to Docker API"
**Cause:** Docker Desktop is closed.
**Fix:** Open Docker Desktop and wait for the "Green Whale" icon.

### "Port 8000 is already in use"
**Cause:** You are running `uvicorn` locally.
**Fix:** Stop your local terminal processes (Ctrl+C) before running Docker.

### "No module named 'app'"
**Cause:** Python path issues inside the container.
**Fix:** Always use `docker compose exec backend` to run commands inside the environment.
