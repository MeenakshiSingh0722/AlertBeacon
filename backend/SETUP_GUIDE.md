# AlertBeacon Backend Setup Guide

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- PostgreSQL 13+ (or SQLite for development)
- Redis (optional, for WebSocket support)
- Node.js 18+ (for frontend)

### Installation

1. **Clone and navigate to backend**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Database Setup**

**For PostgreSQL:**
```bash
# Create database
createdb alertbeacon_db

# Run migrations
alembic upgrade head
```

**For SQLite (development):**
```bash
# Update .env with SQLite URL
DATABASE_URL=sqlite+aiosqlite:///./alertbeacon.db

# Run migrations
alembic upgrade head
```

6. **Start the server**
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## 📊 Database Models

### Incident
- **id**: UUID primary key
- **title**: String (max 500)
- **description**: Text
- **raw_content**: Text
- **source_url**: String (optional)
- **source_type**: Enum (rss, news, social, manual, demo)
- **category**: Enum (medical, food, shelter, infrastructure, safety, other)
- **severity_score**: Float (0-10)
- **severity_label**: Enum (low, medium, high, critical)
- **status**: Enum (new, active, responding, resolved)
- **location_name**: String (optional)
- **latitude**: Decimal (optional)
- **longitude**: Decimal (optional)
- **affected_count**: Integer (optional)
- **confidence_score**: Float (optional)
- **urgency_keywords**: JSONB list
- **ai_summary**: Text (optional)
- **created_at**: DateTime
- **updated_at**: DateTime
- **resolved_at**: DateTime (optional)

### DataSource
- **id**: UUID primary key
- **name**: String
- **url**: String (optional)
- **source_type**: String
- **is_active**: Boolean
- **health_status**: Enum (healthy, degraded, down)
- **last_scraped**: DateTime (optional)
- **created_at**: DateTime

### AgentLog
- **id**: UUID primary key
- **agent_name**: String
- **action**: String
- **input_data**: JSON
- **output_data**: JSON
- **processing_time_ms**: Integer
- **status**: Enum (success, failed)
- **created_at**: DateTime

### AlertNotification
- **id**: UUID primary key
- **incident_id**: UUID (foreign key)
- **alert_type**: Enum (popup, email, sms, dashboard)
- **status**: Enum (pending, sent, failed, read)
- **message**: Text
- **created_at**: DateTime

## 🧠 AI Analysis Service

The AI Analysis Service processes raw text to detect and classify crises:

```python
# Example usage
from app.services.ai_analysis_service import ai_analysis_service

result = await ai_analysis_service.analyze_crisis_text(
    raw_text="Flood reported in Mumbai affecting 5000 people",
    source_url="https://example.com/news"
)

# Returns:
{
    "is_crisis": true,
    "title": "Flood Crisis in Mumbai",
    "category": "shelter",
    "confidence_score": 0.85,
    "location_name": "Mumbai",
    "affected_count": 5000,
    "urgency_keywords": ["flood", "mumbai", "affected"],
    "ai_summary": "Major flood affecting 5000 people in Mumbai requiring immediate response",
    "severity_factors": {
        "population_impact": 3,
        "immediacy": 2,
        "infrastructure_damage": 1,
        "vulnerability_level": 2
    }
}
```

## 🎯 Severity Scoring

The severity scoring system uses weighted factors:

```python
from app.utils.severity_scorer import score_from_ai_factors

score, label = score_from_ai_factors({
    "population_impact": 3,    # 0-3 scale
    "immediacy": 2,           # 0-3 scale  
    "infrastructure_damage": 1, # 0-2 scale
    "vulnerability_level": 2   # 0-2 scale
})

# Formula: (pop*3) + (imm*3) + (infra*2) + (vuln*2)
# Max score: 30, Normalized: (score/30) * 10
# Labels: 8.0-10.0=critical, 6.0-7.9=high, 4.0-5.9=medium, <4.0=low
```

## 🔄 Incident Processing Pipeline

The complete pipeline processes raw crisis input:

```python
from app.services.incident_pipeline import process_raw_crisis_input

incident = await process_raw_crisis_input(
    raw_text="Medical emergency at hospital - oxygen shortage",
    source_url="https://news.example.com",
    source_type="manual"
)

# Pipeline steps:
# 1. AI analysis
# 2. Crisis detection
# 3. Severity scoring  
# 4. Database creation
# 5. Agent logging
# 6. Alert generation (high/critical)
# 7. WebSocket broadcast
```

## 🌐 API Endpoints

### Core Endpoints

#### Analyze Crisis
```bash
curl -X POST "http://localhost:8000/api/v1/incidents/analyze" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "raw_text": "Flood reported in Bihar affecting 5000 people",
    "source_url": "https://example.com/news",
    "source_type": "manual"
  }'
```

#### Get Incidents
```bash
curl "http://localhost:8000/api/v1/incidents?page=1&limit=20&severity_label=high" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Incident by ID
```bash
curl "http://localhost:8000/api/v1/incidents/{incident_id}" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Update Incident Status
```bash
curl -X PATCH "http://localhost:8000/api/v1/incidents/{incident_id}/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status": "responding"}'
```

#### Get Map Incidents
```bash
curl "http://localhost:8000/api/v1/incidents/map" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Incident Stats
```bash
curl "http://localhost:8000/api/v1/incidents/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Alerts
```bash
curl "http://localhost:8000/api/v1/alerts" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Mark Alert as Read
```bash
curl -X PATCH "http://localhost:8000/api/v1/alerts/{alert_id}/read" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Demo Endpoints

#### Seed Demo Data
```bash
curl -X POST "http://localhost:8000/api/v1/demo/seed" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Simulate Crisis
```bash
curl -X POST "http://localhost:8000/api/v1/demo/simulate-crisis" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Dashboard Endpoints

#### Dashboard Overview
```bash
curl "http://localhost:8000/api/v1/dashboard/overview" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Categories Breakdown
```bash
curl "http://localhost:8000/api/v1/dashboard/categories" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Trends Data
```bash
curl "http://localhost:8000/api/v1/dashboard/trends" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔌 WebSocket

Connect to WebSocket for real-time alerts:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/incidents');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received:', data);
};

// Events:
// - critical_alert: High/critical incidents
// - incident_created: All new incidents
// - incident_status_updated: Status changes
```

## 🧪 Testing

### Run Tests
```bash
pytest tests/
```

### Test Individual Endpoint
```bash
pytest tests/test_incidents.py::test_analyze_crisis -v
```

## 🔧 Development

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "Add new field"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Logging
Logs are configured with different levels:
- `DEBUG`: Detailed debugging information
- `INFO`: General information (default)
- `WARNING`: Warning messages
- `ERROR`: Error messages

Set in `.env`:
```
LOG_LEVEL=INFO
```

## 🚀 Production Deployment

### Environment Variables
```bash
# Production settings
DEBUG=false
DEMO_MODE=false
DATABASE_URL=postgresql+asyncpg://user:pass@prod-host:5432/alertbeacon_prod
SECRET_KEY=your-production-secret-key
ALLOWED_ORIGINS=https://yourdomain.com
```

### Docker Deployment
```bash
# Build image
docker build -t alertbeacon-backend .

# Run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Performance Monitoring
- Monitor database connection pool
- Track AI service response times
- Monitor WebSocket connections
- Set up health checks

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL in `.env`
   - Ensure PostgreSQL is running
   - Verify database exists

2. **AI Service Not Working**
   - Check ANTHROPIC_API_KEY or OPENAI_API_KEY
   - Will fallback to mock AI if no key provided
   - Mock AI still provides realistic analysis

3. **WebSocket Not Connecting**
   - Check Redis is running if using Redis
   - Verify WEBSOCKET_ENABLED=true
   - Check CORS settings

4. **Migration Errors**
   - Ensure database is created
   - Check Alembic configuration
   - Verify models are correctly defined

### Debug Mode
Set `DEBUG=true` in `.env` for:
- Detailed error messages
- SQL query logging
- Request/response debugging

## 📚 API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI).

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review logs for error details
- Create an issue in the repository
