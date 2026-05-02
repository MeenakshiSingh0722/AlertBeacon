# AlertBeacon: Product Requirements Document (PRD)
### Autonomous Crisis & Need Response Agent
**Version:** 1.0 | **Type:** Hackathon Build Plan | **Status:** Planning

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Solution Summary](#3-solution-summary)
4. [System Architecture](#4-system-architecture)
5. [Project Folder Structure](#5-project-folder-structure)
6. [Database Schema](#6-database-schema)
7. [Backend Implementation Plan](#7-backend-implementation-plan)
8. [Frontend UI/UX Plan](#8-frontend-uiux-plan)
9. [Real-time Architecture](#9-real-time-architecture)
10. [Implementation Sequence](#10-implementation-sequence)
11. [Technology Stack](#11-technology-stack)
12. [API Endpoints Reference](#12-api-endpoints-reference)
13. [Severity Scoring Formula](#13-severity-scoring-formula)
14. [Deployment Architecture](#14-deployment-architecture)
15. [Pitfalls to Avoid](#15-pitfalls-to-avoid)
16. [Quick Start Checklist](#16-quick-start-checklist)

---

## 1. Project Overview

**AlertBeacon** is an autonomous AI-driven research and alerting system designed to bridge the gap between community crises and immediate aid. Instead of relying on manual monitoring, the system uses a multi-agent architecture (orchestrated by CrewAI) to continuously observe real-time data streams — such as local news, RSS feeds, and social media — to identify, filter, and rank critical community needs.

| Attribute | Detail |
|-----------|--------|
| Project Name | AlertBeacon |
| Type | AI Multi-Agent Crisis Detection System |
| Primary Users | NGOs, Relief Organizations, First Responders |
| Core AI | Claude 3.5 Sonnet via Anthropic API |
| Orchestration | CrewAI Multi-Agent Framework |
| Frontend | React 18 + Vite Dashboard |
| Backend | FastAPI + PostgreSQL + Redis |

---

## 2. Problem Statement

Information regarding critical needs (medical emergencies, food scarcity, infrastructure damage) is often buried in fragmented, unstructured, and high-noise data environments.

**The latency problem:**

- News articles and social media posts surface crises in scattered, unstructured formats
- Non-profits and local authorities must manually monitor dozens of sources
- By the time an alert is manually identified and dispatched, the window for efficient intervention has often passed
- Alert fatigue from irrelevant notifications causes responders to ignore automated systems

**AlertBeacon eliminates this latency** by autonomously surfacing actionable, severity-ranked insights and triggering instant notifications for those who can provide help — with zero manual monitoring required.

---

## 3. Solution Summary

```
Raw Data Streams (RSS, News APIs, Social)
        │
        ▼
Scraper Agent → Dedup Agent → Classifier Agent (Claude 3.5 Sonnet)
        │
        ▼
Severity Agent → Geocoder Agent → Notifier Agent
        │
        ▼
PostgreSQL + Redis → WebSocket → React Dashboard (Map + Feed)
        │
        ▼
NGOs Receive Real-time Alerts via Email / SMS / Push
```

**Core capabilities:**

- Autonomous 24/7 monitoring of configurable data sources
- AI-powered classification into crisis categories (medical, food, shelter, infrastructure, safety)
- Severity scoring from 0–10 with labeled thresholds (Critical / High / Medium / Low)
- Geographic extraction and map-pin visualization
- Real-time WebSocket push to dashboard
- Targeted NGO notifications based on coverage area and category preferences

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        ALERTBEACON                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  DATA SOURCES          BACKEND CORE         FRONTEND        │
│  ┌──────────┐         ┌──────────┐         ┌──────────┐    │
│  │ RSS Feeds│────────▶│ FastAPI  │◀────────│  React   │    │
│  │ News API │         │ Server   │         │Dashboard │    │
│  │ Social   │         └────┬─────┘         └──────────┘    │
│  │ Feeds    │              │                                │
│  └──────────┘         ┌────▼─────┐                         │
│                       │  CrewAI  │                         │
│                       │  Agents  │                         │
│                       └────┬─────┘                         │
│                            │                               │
│                  ┌─────────▼──────────┐                    │
│                  │  Claude 3.5 Sonnet  │                    │
│                  │  (Classification)   │                    │
│                  └─────────┬──────────┘                    │
│                            │                               │
│                       ┌────▼─────┐                         │
│                       │PostgreSQL│                         │
│                       │  + Redis │                         │
│                       └──────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

**Core Challenges to Engineer Around:**

- Real-time data ingestion without overwhelming APIs
- Multi-agent coordination without bottlenecks
- Map visualization with live-updating pins
- Alert fatigue management (too many alerts = ignored alerts)
- Severity scoring that is accurate and contextual

---

## 5. Project Folder Structure

```
alertbeacon/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI entry point
│   │   ├── config.py                  # Environment & settings
│   │   ├── database.py                # DB connection & session
│   │   │
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── alerts.py          # Alert CRUD endpoints
│   │   │   │   ├── incidents.py       # Incident management
│   │   │   │   ├── dashboard.py       # Dashboard data endpoints
│   │   │   │   ├── notifications.py   # Notification preferences
│   │   │   │   └── auth.py            # Authentication routes
│   │   │   └── middleware/
│   │   │       ├── auth_middleware.py
│   │   │       └── rate_limiter.py
│   │   │
│   │   ├── agents/
│   │   │   ├── crew_orchestrator.py   # CrewAI main orchestrator
│   │   │   ├── scraper_agent.py       # Data collection agent
│   │   │   ├── classifier_agent.py    # Claude-powered classifier
│   │   │   ├── severity_agent.py      # Severity scoring agent
│   │   │   ├── dedup_agent.py         # Deduplication agent
│   │   │   └── notifier_agent.py      # Alert dispatching agent
│   │   │
│   │   ├── models/
│   │   │   ├── alert.py               # Alert SQLAlchemy model
│   │   │   ├── incident.py            # Incident model
│   │   │   ├── user.py                # User/NGO model
│   │   │   └── notification.py        # Notification log model
│   │   │
│   │   ├── schemas/
│   │   │   ├── alert_schema.py        # Pydantic schemas
│   │   │   ├── incident_schema.py
│   │   │   └── user_schema.py
│   │   │
│   │   ├── services/
│   │   │   ├── claude_service.py      # Anthropic API wrapper
│   │   │   ├── scraper_service.py     # BS4 + Playwright scrapers
│   │   │   ├── geocoding_service.py   # Location extraction
│   │   │   ├── notification_service.py # Email/SMS/WebPush
│   │   │   └── websocket_service.py   # Real-time WS manager
│   │   │
│   │   ├── tasks/
│   │   │   ├── celery_app.py          # Celery configuration
│   │   │   ├── scheduled_tasks.py     # Periodic scraping tasks
│   │   │   └── alert_tasks.py         # Alert processing tasks
│   │   │
│   │   └── utils/
│   │       ├── severity_scorer.py     # Scoring algorithms
│   │       ├── text_processor.py      # NLP utilities
│   │       └── location_extractor.py  # Geo parsing
│   │
│   ├── migrations/                    # Alembic migrations
│   │   └── versions/
│   ├── tests/
│   │   ├── test_agents.py
│   │   ├── test_api.py
│   │   └── test_services.py
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Layout.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── StatsCards.jsx     # KPI metric cards
│   │   │   │   ├── AlertFeed.jsx      # Live alert list
│   │   │   │   ├── SeverityChart.jsx  # Recharts severity graph
│   │   │   │   └── CategoryBreakdown.jsx
│   │   │   ├── map/
│   │   │   │   ├── AlertMap.jsx       # Leaflet main map
│   │   │   │   ├── AlertPin.jsx       # Custom map markers
│   │   │   │   ├── AlertPopup.jsx     # Popup info card
│   │   │   │   └── MapFilters.jsx
│   │   │   ├── alerts/
│   │   │   │   ├── AlertCard.jsx
│   │   │   │   ├── AlertDetail.jsx
│   │   │   │   └── AlertBadge.jsx
│   │   │   └── common/
│   │   │       ├── Button.jsx
│   │   │       ├── Badge.jsx
│   │   │       ├── Modal.jsx
│   │   │       ├── Spinner.jsx
│   │   │       └── Toast.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MapView.jsx
│   │   │   ├── AlertsPage.jsx
│   │   │   ├── IncidentDetail.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── Login.jsx
│   │   ├── hooks/
│   │   │   ├── useWebSocket.js
│   │   │   ├── useAlerts.js
│   │   │   ├── useMap.js
│   │   │   └── useFilters.js
│   │   ├── store/
│   │   │   ├── index.js               # Zustand store
│   │   │   ├── alertSlice.js
│   │   │   ├── mapSlice.js
│   │   │   └── userSlice.js
│   │   └── services/
│   │       ├── api.js                 # Axios API client
│   │       ├── alertService.js
│   │       └── websocketClient.js
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── docker-compose.yml
├── nginx.conf
└── README.md
```

---

## 6. Database Schema

### Incidents Table *(Core crisis events)*

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Unique identifier |
| title | VARCHAR(500) | Short crisis title |
| description | TEXT | Full description |
| raw_content | TEXT | Original scraped text |
| source_url | VARCHAR(1000) | Origin URL |
| source_type | ENUM | rss / news / social / manual |
| category | ENUM | medical / food / shelter / infra / safety |
| severity_score | FLOAT | 0.0 – 10.0 numeric score |
| severity_label | ENUM | low / medium / high / critical |
| status | ENUM | new / active / resolved |
| location_name | VARCHAR | Human-readable location |
| latitude | DECIMAL | Geo coordinate |
| longitude | DECIMAL | Geo coordinate |
| affected_count | INTEGER | Estimated people affected |
| confidence_score | FLOAT | AI confidence 0–1 |
| tags | JSONB | Flexible keyword tags |
| ai_summary | TEXT | Claude-generated summary |
| created_at | TIMESTAMP | Detection time |
| updated_at | TIMESTAMP | Last modified |
| resolved_at | TIMESTAMP | Resolution time |

### Alerts Table *(Notifications sent to NGOs)*

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | |
| incident_id | FK → incidents | |
| user_id | FK → users | |
| alert_type | ENUM | email / sms / push / webhook |
| sent_at | TIMESTAMP | |
| status | ENUM | sent / failed / read |
| response_action | VARCHAR | NGO response logged |

### Users Table *(NGOs / Relief Organizations)*

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | |
| org_name | VARCHAR | Organization name |
| email | VARCHAR UNIQUE | |
| role | ENUM | admin / ngo / responder |
| notification_prefs | JSONB | Category subscriptions |
| coverage_area | JSONB | Geographic boundaries |
| api_key | VARCHAR | For webhook integrations |
| created_at | TIMESTAMP | |

### Data Sources Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | |
| name | VARCHAR | Source display name |
| url | VARCHAR | Feed or scrape URL |
| source_type | ENUM | rss / scrape / api |
| is_active | BOOLEAN | Enable/disable toggle |
| scrape_interval | INTEGER | Minutes between scrapes |
| last_scraped | TIMESTAMP | |
| health_status | ENUM | healthy / degraded / down |

### Agent Logs Table *(Audit trail)*

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | |
| agent_name | VARCHAR | Which agent acted |
| action | VARCHAR | What was done |
| input_data | JSONB | Input payload |
| output_data | JSONB | Output result |
| processing_time_ms | INTEGER | Performance metric |
| status | ENUM | success / failed |
| created_at | TIMESTAMP | |

---

## 7. Backend Implementation Plan

### 7.1 Agent Pipeline Flow

```
Raw Data Source
     │
     ▼
┌─────────────┐
│   SCRAPER   │  → Collects raw text from RSS/News/Social
│    AGENT    │  → Runs every 5–15 minutes via Celery
│             │  → Output: {url, raw_text, source, timestamp}
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    DEDUP    │  → Checks Redis cache + DB for duplicates
│    AGENT    │  → Compares URL hash + semantic similarity
│             │  → Drops duplicates, merges related items
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ CLASSIFIER  │  → Sends to Claude 3.5 Sonnet
│    AGENT    │  → Extracts: category, location, affected count
│             │  → Categories: medical/food/shelter/infra/safety
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  SEVERITY   │  → Scores 0–10 based on:
│    AGENT    │    • Affected population count
│             │    • Urgency keywords
│             │    • Source credibility
│             │    • Geographic spread
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  GEOCODER   │  → Extracts location from text
│    AGENT    │  → Converts to lat/lng via OpenStreetMap Nominatim
│             │  → Falls back to null if unresolvable
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  NOTIFIER   │  → Checks user notification preferences
│    AGENT    │  → Sends alerts based on severity threshold
│             │  → Broadcasts via WebSocket to dashboard
└─────────────┘
```

### 7.2 Claude Prompt Architecture

**System Prompt (Persistent):**
```
You are AlertBeacon's crisis intelligence analyst. Your role is to:
1. Classify community crisis reports by category
2. Extract location information with precision
3. Estimate affected population when possible
4. Score urgency on defined criteria
5. Generate concise actionable summaries for first responders
Always respond in valid JSON format.
```

**Classification Prompt Template:**
```json
{
  "task": "classify_incident",
  "text": "{raw_scraped_text}",
  "source": "{source_url}",
  "timestamp": "{scraped_at}",
  "required_output": {
    "category": "medical|food|shelter|infrastructure|safety|other",
    "is_crisis": "boolean",
    "confidence": "0.0-1.0",
    "location": {
      "name": "string",
      "city": "string",
      "country": "string",
      "precision": "exact|approximate|unknown"
    },
    "affected_count": "integer or null",
    "urgency_keywords": ["array of strings"],
    "ai_summary": "2-3 sentence actionable summary",
    "severity_factors": {
      "population_impact": "0-3",
      "immediacy": "0-3",
      "infrastructure_damage": "0-2",
      "vulnerability_level": "0-2"
    }
  }
}
```

### 7.3 CrewAI Orchestrator Structure

```python
# crew_orchestrator.py — conceptual structure

class AlertBeaconCrew:

    def define_agents(self):
        """
        scraperAgent:
          role: "Data Collector"
          goal: "Scrape RSS feeds and news sources for crisis signals"
          tools: [RSSScraperTool, WebScraperTool]

        classifierAgent:
          role: "Crisis Analyst"
          goal: "Classify incidents and extract entities using Claude"
          tools: [ClaudeClassificationTool, GeocoderTool]

        severityAgent:
          role: "Severity Assessor"
          goal: "Score incidents by urgency and impact"
          tools: [SeverityScorerTool]

        notifierAgent:
          role: "Alert Dispatcher"
          goal: "Send targeted alerts to relevant NGOs"
          tools: [EmailTool, SMSTool, WebSocketTool]
        """

    def define_tasks(self):
        """
        Task 1: Scrape all active data sources
        Task 2: Classify each collected item
        Task 3: Score severity for classified crises
        Task 4: Store results in PostgreSQL
        Task 5: Send notifications for high severity events
        """

    def run(self):
        """
        Process: Sequential pipeline
        Schedule: Every 5 minutes via Celery Beat
        Output: Written to PostgreSQL
        Broadcast: Events published to Redis → WebSocket
        """
```

---

## 8. Frontend UI/UX Plan

### 8.1 Design System

**Color Tokens:**

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#0A0E1A` | Page background (deep navy) |
| Surface | `#111827` | Card backgrounds |
| Border | `#1F2937` | Subtle borders |
| Critical | `#EF4444` | Red — immediate danger |
| High | `#F97316` | Orange — urgent response |
| Medium | `#EAB308` | Yellow — monitor closely |
| Low | `#22C55E` | Green — informational |
| Accent | `#3B82F6` | Blue — interactive elements |
| AI Indicator | `#8B5CF6` | Purple — agent activity |
| Text Primary | `#F9FAFB` | Main readable text |
| Text Secondary | `#9CA3AF` | Subtext |
| Text Muted | `#6B7280` | Timestamps, labels |

**Typography:**

| Role | Font |
|------|------|
| UI Text | Inter |
| Monospace / Data | JetBrains Mono |
| Headings | Space Grotesk |

**Spacing:** 4px base unit (4, 8, 12, 16, 24, 32, 48, 64px)

**Border Radius:** 8px cards · 4px small elements · 16px large panels

---

### 8.2 Page-by-Page UI Breakdown

#### Page 1 — Main Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ ◉ ALERTBEACON          [Search...]    [🔔 3] [NGO Name ▾]  │
├────────────┬────────────────────────────────────────────────┤
│            │  OVERVIEW                              [Live●] │
│  🏠 Dash  │ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│            │ │CRITICAL  │ │ ACTIVE   │ │RESOLVED  │        │
│  🗺  Map  │ │   🔴 4   │ │  🟡 23  │ │  ✅ 156  │        │
│            │ │↑12% today│ │last 24h  │ │this week │        │
│  🚨 Alerts│ └──────────┘ └──────────┘ └──────────┘        │
│            │                                                │
│  📊 Analytics                                               │
│            │ ┌───────────────────────────┐ ┌─────────────┐ │
│  ⚙️  Settings          │   SEVERITY TREND (7 days) │ │  CATEGORY   │ │
│            │ │  [Recharts Line Chart]    │ │  BREAKDOWN  │ │
│            │ │  Critical ─── High ───   │ │ [Donut chart]│ │
│            │ └───────────────────────────┘ └─────────────┘ │
│            │                                                │
│            │  LIVE ALERT FEED                [Filter ▾]    │
│            │ ─────────────────────────────────────────────  │
│            │ 🔴 CRITICAL • Medical Emergency • 2min ago     │
│            │    "Mass casualty incident reported near..."   │
│            │    📍 Mumbai, Maharashtra    [View] [Assign]   │
│            │ 🟠 HIGH • Food Scarcity • 15min ago            │
│            │    "Flood displaced families need..."          │
│            │    📍 Bihar, India           [View] [Assign]   │
└────────────┴────────────────────────────────────────────────┘
```

**Component list:**
- `StatsCards.jsx` — 4 KPI cards with live counters
- `SeverityChart.jsx` — Recharts multi-line time series
- `CategoryBreakdown.jsx` — Recharts Donut chart
- `AlertFeed.jsx` — WebSocket-driven scrolling list
- `AlertBell.jsx` — Notification badge in navbar

---

#### Page 2 — Map View *(Most Critical Feature)*

```
┌─────────────────────────────────────────────────────────────┐
│ ← Dashboard     CRISIS MAP                    [🔴 Live]    │
├────────────┬────────────────────────────────────────────────┤
│ FILTERS    │                                                │
│ ─────────  │                                                │
│ Severity:  │      ┌─ Popup Card ─────────────┐             │
│ ☑ Critical │      │ 🔴 CRITICAL ALERT         │             │
│ ☑ High     │      │ Medical Emergency         │             │
│ ☑ Medium   │      │ 📍 Mumbai Central         │             │
│ ☐ Low      │      │ Severity: 9.2/10          │             │
│            │   ●  │ Affected: ~2,000 people   │             │
│ Category:  │ ●    │ Source: Local News API    │             │
│ ☑ Medical  │  ●   │ Reported: 8 min ago       │             │
│ ☑ Food     │  ●   │                           │             │
│ ☑ Shelter  │ ●    │ [View Full] [Assign NGO]  │             │
│ ☑ Infra    │      └───────────────────────────┘             │
│ ☑ Safety   │  ●                                             │
│            │●    ●          [Dark Map Tiles - Leaflet]      │
│ Time:      │         ●                                      │
│ [Last 24h▾]│    ●                                           │
│            │                                                │
│ [Heatmap]  │                                                │
│ [Clusters] │                                                │
│            ├────────────────────────────────────────────────│
│ 23 Active  │ 🔴 Mumbai Medical  🟠 Bihar Food  🟡 Kerala Infra│
│ Incidents  │                                     [+ 20 more]│
└────────────┴────────────────────────────────────────────────┘
```

**Component list:**
- `AlertMap.jsx` — Leaflet map with dark tiles
- `AlertPin.jsx` — Severity-colored custom SVG markers
- `AlertPopup.jsx` — On-click popup info card
- `MapFilters.jsx` — Left panel filter controls
- Cluster layer for dense areas via `leaflet.markercluster`

---

#### Page 3 — Incident Detail

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back       INCIDENT #INC-2847                🔴 CRITICAL │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Mass Medical Emergency — Mumbai Central Station             │
│                                                             │
│ ┌──────────────────────────────┐ ┌─────────────────────────┐│
│ │ 🤖 AI SUMMARY                │ │ SEVERITY BREAKDOWN      ││
│ │                              │ │ Overall: ████████░░ 8.7 ││
│ │ Reports indicate a stampede  │ │ Population: ████████░ 8 ││
│ │ at Mumbai Central involving  │ │ Immediacy:  █████████░ 9││
│ │ ~200 people. Emergency       │ │ Infra:      ████░░░░░░ 4││
│ │ services notified but        │ │ Vulnerability: ███████░7││
│ │ capacity overflow expected.  │ │                         ││
│ │                              │ │ Category: 🏥 Medical    ││
│ │ Confidence: 94%              │ └─────────────────────────┘│
│ └──────────────────────────────┘                            │
│                                                             │
│ ┌──────────────────────────────┐ ┌─────────────────────────┐│
│ │ 📍 LOCATION                  │ │ ⚡ QUICK ACTIONS         ││
│ │ Mumbai, Maharashtra, India   │ │ [Mark as Responding]    ││
│ │ [Mini Map Preview]           │ │ [Assign to NGO Team]    ││
│ │ Lat: 18.9387° N              │ │ [Request More Info]     ││
│ │ Lng: 72.8354° E              │ │ [Mark Resolved]         ││
│ │ Precision: Approximate       │ │ [Share Alert]           ││
│ └──────────────────────────────┘ └─────────────────────────┘│
│                                                             │
│ ACTIVITY LOG                                                │
│ 14:32 - Incident detected by Scraper Agent                 │
│ 14:32 - Classified as CRITICAL by Claude 3.5 Sonnet        │
│ 14:33 - Geocoded to Mumbai (confidence 94%)                │
│ 14:33 - 3 NGOs notified via email + SMS                    │
│ 14:45 - Red Cross Mumbai marked "Responding"               │
└─────────────────────────────────────────────────────────────┘
```

---

### 8.3 Frontend State Structure (Zustand)

```javascript
alertStore = {
  // State
  incidents: [],
  selectedIncident: null,
  filters: {
    severity: ['critical', 'high', 'medium', 'low'],
    categories: ['medical', 'food', 'shelter', 'infrastructure', 'safety'],
    timeRange: '24h',
    status: ['new', 'active']
  },
  stats: {
    critical: 0,
    active: 0,
    resolved: 0,
    sourcesOnline: 0
  },
  wsConnected: false,
  loading: false,

  // Actions
  fetchIncidents: async (filters) => {},
  setFilter: (key, value) => {},
  handleWSMessage: (event) => {},
  markResolved: async (id) => {},
  selectIncident: (incident) => {}
}
```

---

## 9. Real-time Architecture

### WebSocket Flow

```
Browser Client
     │
     │  WS Connect: /ws/incidents?token=JWT
     ▼
FastAPI WebSocket Manager
     │  Connection registered in:
     │  → active_connections dict
     │  → Redis pub/sub channel subscription
     ▼
Redis Pub/Sub Channel: "incidents:live"
     ▲
     │  Publish event when:
     │  → New incident created (severity > threshold)
     │  → Incident status changed
     │  → Agent processing complete
     │
Celery Worker / CrewAI Agent
```

### WebSocket Event Payload

```json
{
  "event_type": "incident_created|updated|resolved",
  "timestamp": "ISO 8601 string",
  "data": {
    "id": "UUID",
    "title": "string",
    "severity_label": "critical|high|medium|low",
    "severity_score": 8.7,
    "category": "medical",
    "location_name": "Mumbai, India",
    "latitude": 18.9387,
    "longitude": 72.8354,
    "ai_summary": "string"
  }
}
```

### Frontend Event Handling Chain

```
useWebSocket hook
    │ receives event
    ▼
Zustand store dispatch
    ├── Toast notification appears
    ├── Map pin appears / updates
    ├── Alert feed list updates
    └── Stats cards refresh
```

---

## 10. Implementation Sequence

### Week 1 — Foundation

| Day | Tasks |
|-----|-------|
| 1–2 | Initialize project structure · Docker Compose (PostgreSQL + Redis) · FastAPI skeleton with health check · Alembic setup |
| 3–4 | Build SQLAlchemy models · Pydantic schemas · Basic CRUD for incidents · Test with Postman |
| 5–7 | RSS scraper service · Claude API integration test · Classification with sample data · Store results in DB |

### Week 2 — Agents & Intelligence

| Day | Tasks |
|-----|-------|
| 8–10 | CrewAI orchestrator · Scraper Agent · Classifier Agent · Severity Agent |
| 11–12 | Dedup Agent (Redis-based) · Geocoding service · Notifier Agent · Celery scheduled tasks |
| 13–14 | End-to-end pipeline test · WebSocket server · Redis pub/sub · Bug fixes |

### Week 3 — Frontend

| Day | Tasks |
|-----|-------|
| 15–16 | React + Vite init · Install all dependencies · Layout + Sidebar + Navbar · React Router setup |
| 17–18 | Dashboard page (stats + charts) · Axios API connection · AlertFeed with WebSocket · Toast notifications |
| 19–20 | Leaflet map · Custom severity pins · Popup cards · Filter panel |
| 21 | Incident Detail page · Alerts + Settings pages · Polish, animations, loading states |

### Week 4 — Production Ready

| Day | Tasks |
|-----|-------|
| 22–23 | JWT auth · User preferences · Email notifications · Rate limiting |
| 24–25 | Docker production builds · Nginx config · Performance optimization |
| 26–27 | Pytest backend testing · Error handling · Documentation · Demo data seeding |
| 28 | Deploy to VPS · DNS + SSL · Final demo prep |

---

## 11. Technology Stack

### Backend (Python)

| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | 0.109.0 | API framework |
| uvicorn[standard] | 0.27.0 | ASGI server |
| pydantic | 2.5.0 | Data validation |
| sqlalchemy | 2.0.25 | ORM |
| asyncpg | 0.29.0 | Async PostgreSQL driver |
| alembic | 1.13.1 | DB migrations |
| redis | 5.0.1 | Cache + pub/sub |
| anthropic | 0.16.0 | Claude API |
| crewai | 0.28.0 | Agent orchestration |
| langchain | 0.1.0 | Agent utilities |
| beautifulsoup4 | 4.12.3 | HTML scraping |
| playwright | 1.41.0 | JS-rendered pages |
| feedparser | 6.0.11 | RSS parsing |
| httpx | 0.26.0 | Async HTTP client |
| celery | 5.3.6 | Task queue |
| geopy | 2.4.1 | Geocoding |
| loguru | 0.7.2 | Structured logging |
| tenacity | 8.2.3 | Retry logic |

### Frontend (Node.js)

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.2.0 | UI framework |
| react-router-dom | ^6.21.0 | Client routing |
| vite | ^5.0.0 | Build tool |
| zustand | ^4.4.7 | State management |
| tailwindcss | ^3.4.0 | Utility CSS |
| @headlessui/react | ^1.7.17 | Accessible primitives |
| lucide-react | ^0.309.0 | Icon library |
| framer-motion | ^10.18.0 | Animations |
| axios | ^1.6.5 | HTTP client |
| @tanstack/react-query | ^5.17.0 | Server state |
| recharts | ^2.10.3 | Dashboard charts |
| leaflet | ^1.9.4 | Interactive maps |
| react-leaflet | ^4.2.1 | React map bindings |
| socket.io-client | ^4.6.0 | WebSocket client |
| react-hot-toast | ^2.4.1 | Toast notifications |
| date-fns | ^3.3.0 | Date formatting |
| zod | ^3.22.4 | Schema validation |

### DevOps

| Tool | Purpose |
|------|---------|
| Docker + Docker Compose | Containerization |
| Nginx | Reverse proxy + static file serving |
| GitHub Actions | CI/CD pipeline |
| PostgreSQL 15 | Primary database |
| Redis 7 | Cache + Celery broker + pub/sub |

---

## 12. API Endpoints Reference

### Authentication

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/auth/login` | Login and receive JWT |
| POST | `/api/v1/auth/register` | Register NGO account |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| DELETE | `/api/v1/auth/logout` | Invalidate session |

### Incidents

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/incidents` | List with filters + pagination |
| GET | `/api/v1/incidents/{id}` | Single incident detail |
| POST | `/api/v1/incidents` | Manual incident creation |
| PATCH | `/api/v1/incidents/{id}` | Update status |
| DELETE | `/api/v1/incidents/{id}` | Admin only |
| GET | `/api/v1/incidents/map` | Map-optimized (lat/lng only) |
| GET | `/api/v1/incidents/stats` | Aggregate KPIs |
| GET | `/api/v1/incidents/heatmap` | Density data |

### Dashboard

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/dashboard/overview` | KPI summary cards |
| GET | `/api/v1/dashboard/trends` | Time-series chart data |
| GET | `/api/v1/dashboard/categories` | Category breakdown |

### WebSocket

| Protocol | Endpoint | Purpose |
|----------|----------|---------|
| WS | `/ws/incidents` | Live incident stream |
| WS | `/ws/alerts` | Personal alert stream |

### Data Sources

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/sources` | List all configured sources |
| POST | `/api/v1/sources` | Add new source |
| PATCH | `/api/v1/sources/{id}/toggle` | Enable / disable |
| GET | `/api/v1/sources/{id}/health` | Source health status |

---

## 13. Severity Scoring Formula

```
score = (population_impact × 3) + (immediacy × 3)
      + (infrastructure_damage × 2) + (vulnerability_level × 2)

max_score = 30
normalized = (score / 30) × 10
```

**Factor ranges:**

| Factor | Max Points | Description |
|--------|-----------|-------------|
| population_impact | 3 | Estimated people affected |
| immediacy | 3 | How urgent/active the crisis is |
| infrastructure_damage | 2 | Damage to critical systems |
| vulnerability_level | 2 | Presence of vulnerable populations |

**Severity Labels:**

| Score Range | Label | Color |
|-------------|-------|-------|
| 8.0 – 10.0 | CRITICAL | `#EF4444` Red |
| 6.0 – 7.9 | HIGH | `#F97316` Orange |
| 4.0 – 5.9 | MEDIUM | `#EAB308` Yellow |
| 0.0 – 3.9 | LOW | `#22C55E` Green |

---

## 14. Deployment Architecture

```
                    [Cloudflare DNS]
                          │
                    [Nginx Proxy]
                    ┌─────┴─────┐
                    │           │
               [React SPA]  [FastAPI :8000]
               (Static)
                               │
                ┌──────────────┼──────────────┐
                │              │              │
           [PostgreSQL]    [Redis]        [Celery]
           :5432          :6379          Workers + Beat
```

**Docker Compose Services:**

| Service | Description |
|---------|-------------|
| nginx | Reverse proxy + static React serving |
| fastapi | Main application server |
| postgres | Primary database |
| redis | Cache + pub/sub + Celery broker |
| celery-worker | Agent task execution |
| celery-beat | Scheduled task scheduler |
| flower | Celery monitoring UI (optional) |

**Recommended VPS Specs:**

| Resource | Minimum |
|----------|---------|
| CPU | 4 cores |
| RAM | 8 GB |
| Storage | 50 GB SSD |
| OS | Ubuntu 22.04 LTS |
| Providers | DigitalOcean / Hetzner / Railway |

---

## 15. Pitfalls to Avoid

1. **Don't build all agents simultaneously** — test one at a time, get each working in isolation first
2. **Rate limit Claude API calls** — add delays between batches; deduplicate BEFORE classifying to save API costs
3. **Always deduplicate first** — dedup before sending to Claude (major cost saving)
4. **Test WebSocket with multiple browser tabs** — parallel connections expose race conditions early
5. **Geocoding fails often** — always handle null lat/lng gracefully; never assume resolution succeeds
6. **RSS feeds go down** — build retry logic (use `tenacity`) from day one
7. **Don't hardcode location strings** — always store lat/lng pairs, not just place names
8. **Add pagination to the incidents list from day 1** — retrofitting it later breaks clients
9. **Set severity thresholds for notifications** — sending alerts for every LOW incident causes alert fatigue
10. **Never expose your Anthropic API key on the frontend** — all Claude calls must go through the FastAPI backend

---

## 16. Quick Start Checklist

### Prerequisites

- [ ] Python 3.11+
- [ ] Node.js 18+
- [ ] Docker Desktop installed and running
- [ ] Anthropic API key (for Claude 3.5 Sonnet)
- [ ] Mapbox API key (free tier available at mapbox.com)

### Environment Variables

```env
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/alertbeacon
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-jwt-secret-key-here
MAPBOX_TOKEN=pk.eyJ1...
SENDGRID_API_KEY=SG....
```

### Strict Recommended Build Order

1. `docker-compose up -d postgres redis` — get infrastructure running
2. FastAPI health check endpoint responding at `/health`
3. One working Alembic migration with incidents table
4. Incidents CRUD API tested end-to-end
5. Claude classification tested in isolation with a sample text
6. RSS scraper fetching real data with `feedparser`
7. CrewAI pipeline running end-to-end (even with mock data)
8. WebSocket broadcasting events to a test client
9. React app scaffolded with routing working
10. Dashboard connected to real API data via Axios
11. Leaflet map rendering with real incident pins
12. WebSocket hooked into React store (live updates working)
13. JWT authentication layer added
14. Email notifications wired up
15. Deploy to VPS with Docker Compose

---

## Appendix: Data Source Suggestions

### RSS Feeds to Start With

- NDMA India: `https://ndma.gov.in/rss`
- ReliefWeb: `https://reliefweb.int/updates/rss.xml`
- WHO Disease Outbreak News: `https://www.who.int/feeds/entity/csr/don/en/rss.xml`
- UN OCHA: `https://www.unocha.org/rss.xml`
- Local state disaster management portals

### News APIs

- NewsAPI.org (free tier: 100 req/day)
- GNews API (free tier available)
- The Guardian Open Platform (free for non-commercial)

---

*AlertBeacon PRD v1.0 — Hackathon Development Build Plan*
