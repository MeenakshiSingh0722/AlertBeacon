# AlertBeacon: Project Blueprint
### Visual Architecture & Decision Map for Builders
**Version:** 1.0 | **Type:** Project Blueprint

---

## Blueprint 1 — The Big Picture (What You're Building)

```
╔══════════════════════════════════════════════════════════════════════╗
║                        ALERTBEACON SYSTEM                           ║
║                   "Crisis Detection → Action"                        ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║   THE WORLD             YOUR SYSTEM              YOUR USERS          ║
║   ─────────             ────────────             ────────────        ║
║                                                                      ║
║  📰 News Sites    ──▶                        ──▶  🏥 Medical NGOs    ║
║  📡 RSS Feeds     ──▶   ┌─────────────┐     ──▶  🍞 Food Banks      ║
║  🐦 Social Media  ──▶   │  ALERTBEACON│     ──▶  🏠 Shelter Orgs    ║
║  📻 Gov Portals   ──▶   │   ENGINE    │     ──▶  🚒 First Responders ║
║  📱 Local Reports ──▶   └─────────────┘     ──▶  🏛️  Local Govt      ║
║                                                                      ║
║              INPUT: Noisy, fragmented, unstructured                  ║
║              OUTPUT: Ranked, located, actionable alerts              ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## Blueprint 2 — System Layers (How It's Organized)

```
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 5: PRESENTATION                                              │
│  React Dashboard · Map View · Alert Feed · Incident Detail          │
│  [What NGOs see and interact with]                                  │
├─────────────────────────────────────────────────────────────────────┤
│  LAYER 4: REAL-TIME TRANSPORT                                       │
│  WebSocket Server · Redis Pub/Sub · Event Broadcaster               │
│  [How live updates reach the browser instantly]                     │
├─────────────────────────────────────────────────────────────────────┤
│  LAYER 3: API GATEWAY                                               │
│  FastAPI · JWT Auth · Rate Limiter · REST Endpoints                 │
│  [The contract between frontend and backend]                        │
├─────────────────────────────────────────────────────────────────────┤
│  LAYER 2: INTELLIGENCE (The Core)                                   │
│  CrewAI Orchestrator · 5 Specialized Agents · Claude 3.5 Sonnet    │
│  [Where raw data becomes actionable crisis intelligence]            │
├─────────────────────────────────────────────────────────────────────┤
│  LAYER 1: DATA INGESTION                                            │
│  RSS Scrapers · Web Scrapers · News APIs · Celery Beat              │
│  [Continuous, automated data collection]                            │
├─────────────────────────────────────────────────────────────────────┤
│  LAYER 0: INFRASTRUCTURE                                            │
│  PostgreSQL · Redis · Docker · Nginx                                │
│  [The foundation everything runs on]                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Blueprint 3 — Agent Pipeline (The Intelligence Engine)

```
                         ┌─────────────────────┐
                         │   CELERY BEAT        │
                         │  Triggers every 5min │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │   CREWAI            │
                         │   ORCHESTRATOR      │
                         │   crew_orchestrator  │
                         └──────────┬──────────┘
                                    │
               ┌────────────────────┼────────────────────┐
               │                    │                     │
    ┌──────────▼──────────┐         │          ┌──────────▼──────────┐
    │   SCRAPER AGENT     │         │          │   SOURCE HEALTH     │
    │                     │         │          │   MONITOR           │
    │  Tools:             │         │          │                     │
    │  • feedparser       │         │          │  Marks sources as:  │
    │  • httpx            │         │          │  healthy/degraded   │
    │  • playwright       │         │          │  /down              │
    │                     │         │          └─────────────────────┘
    │  Output:            │         │
    │  {url, raw_text,    │         │
    │   source, timestamp}│         │
    └──────────┬──────────┘         │
               │                    │
    ┌──────────▼──────────┐         │
    │   DEDUP AGENT       │         │
    │                     │         │
    │  Checks:            │         │
    │  1. URL hash        │         │
    │     in Redis        │         │
    │  2. Semantic sim    │         │
    │     vs recent DB    │         │
    │                     │         │
    │  ✅ New → Continue  │         │
    │  ❌ Dup → Discard   │         │
    └──────────┬──────────┘         │
               │                    │
    ┌──────────▼──────────┐         │
    │  CLASSIFIER AGENT   │◀────────┘
    │                     │
    │  Calls:             │
    │  Claude 3.5 Sonnet  │
    │                     │
    │  Extracts:          │
    │  • Category         │
    │  • Location name    │
    │  • Affected count   │
    │  • Confidence score │
    │  • AI summary       │
    │  • Is crisis? T/F   │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │   SEVERITY AGENT    │
    │                     │
    │  Scores 0–10:       │
    │  population × 3     │
    │  immediacy × 3      │
    │  infra damage × 2   │
    │  vulnerability × 2  │
    │  ÷ 30 × 10          │
    │                     │
    │  Labels:            │
    │  ≥8.0 → CRITICAL    │
    │  ≥6.0 → HIGH        │
    │  ≥4.0 → MEDIUM      │
    │   <4.0 → LOW        │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │   GEOCODER AGENT    │
    │                     │
    │  Tools:             │
    │  • geopy            │
    │  • Nominatim API    │
    │  • spaCy NER        │
    │                     │
    │  Output:            │
    │  {lat, lng,         │
    │   precision,        │
    │   confidence}       │
    │                     │
    │  Fallback: null     │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐     ┌──────────────────────┐
    │   NOTIFIER AGENT    │────▶│  NGO NOTIFICATION    │
    │                     │     │                      │
    │  Checks:            │     │  • Email (SendGrid)  │
    │  • User prefs       │     │  • SMS (Twilio)      │
    │  • Coverage area    │     │  • WebPush           │
    │  • Severity thresh  │     │  • Webhook           │
    │                     │     └──────────────────────┘
    │  Broadcasts:        │
    │  Redis → WebSocket  │────▶ Live Dashboard Update
    └─────────────────────┘
               │
    ┌──────────▼──────────┐
    │   POSTGRESQL        │
    │   incidents table   │
    │   alerts table      │
    │   agent_logs table  │
    └─────────────────────┘
```

---

## Blueprint 4 — Data Flow (Request Lifecycle)

```
SCENARIO: A news article about a flood is published

  t=0:00  Celery Beat triggers scheduled task
            │
  t=0:01  Scraper Agent fetches RSS feed
          raw_text = "Floods in Bihar displace 10,000 families..."
            │
  t=0:02  Dedup Agent checks Redis
          URL hash not found → NEW item → proceed
          URL hash saved to Redis (TTL: 48h)
            │
  t=0:03  Classifier Agent calls Claude API
          POST /v1/messages → {category: "food", location: "Bihar"}
          confidence: 0.91, affected_count: 10000
            │
  t=0:05  Severity Agent scores the incident
          population(3) + immediacy(2) + infra(1) + vuln(2) = 8
          normalized: 8/30 × 10 = 2.67 ... wait, recalculate
          score = (3×3)+(3×3)+(2×1)+(2×2) = 9+9+2+4 = 24
          normalized: 24/30 × 10 = 8.0 → HIGH
            │
  t=0:06  Geocoder Agent calls Nominatim
          "Bihar, India" → lat: 25.0961, lng: 85.3131
            │
  t=0:07  Incident written to PostgreSQL
          id: uuid, severity: HIGH, score: 8.0
            │
  t=0:07  Notifier Agent queries matching NGOs
          WHERE coverage_area overlaps Bihar
          AND notification_prefs includes 'food'
          AND severity_threshold <= 'high'
            │
  t=0:08  Redis PUBLISH → "incidents:live" channel
            │
  t=0:08  FastAPI WebSocket Manager receives event
            │
  t=0:08  All connected dashboard clients receive:
          {event_type: "incident_created", data: {...}}
            │
  t=0:08  React dashboard:
          → New pin appears on map (Bihar)
          → Alert card appears in live feed
          → Stats counter increments
          → Toast notification shown
          → 3 NGOs receive email + SMS
```

---

## Blueprint 5 — Database Relationships

```
┌─────────────────┐       ┌─────────────────┐
│  DATA_SOURCES   │       │     USERS        │
│─────────────────│       │─────────────────│
│ id (PK)         │       │ id (PK)          │
│ name            │       │ org_name         │
│ url             │       │ email            │
│ source_type     │       │ role             │
│ is_active       │       │ notification_    │
│ scrape_interval │       │   prefs (JSONB)  │
│ last_scraped    │       │ coverage_area    │
│ health_status   │       │   (JSONB)        │
└────────┬────────┘       └────────┬────────┘
         │                         │
         │ 1:many                  │ 1:many
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│   INCIDENTS     │       │     ALERTS      │
│─────────────────│       │─────────────────│
│ id (PK)         │◀──────│ id (PK)          │
│ title           │ 1:many│ incident_id (FK) │
│ description     │       │ user_id (FK)     │
│ raw_content     │       │ alert_type       │
│ source_url      │       │ sent_at          │
│ source_type     │       │ status           │
│ category        │       │ response_action  │
│ severity_score  │       └─────────────────┘
│ severity_label  │
│ status          │       ┌─────────────────┐
│ location_name   │       │   AGENT_LOGS    │
│ latitude        │       │─────────────────│
│ longitude       │       │ id (PK)          │
│ affected_count  │       │ agent_name       │
│ confidence_score│       │ action           │
│ tags (JSONB)    │       │ input_data       │
│ ai_summary      │       │   (JSONB)        │
│ created_at      │       │ output_data      │
│ updated_at      │       │   (JSONB)        │
│ resolved_at     │       │ processing_ms    │
└─────────────────┘       │ status           │
                          │ created_at       │
                          └─────────────────┘
```

---

## Blueprint 6 — Frontend Component Tree

```
App.jsx
│
├── Router
│   ├── /login ──────────────── Login.jsx
│   │
│   └── Layout.jsx (authenticated)
│       ├── Sidebar.jsx
│       │   ├── NavLink (Dashboard)
│       │   ├── NavLink (Map)
│       │   ├── NavLink (Alerts)
│       │   ├── NavLink (Analytics)
│       │   └── NavLink (Settings)
│       │
│       ├── Navbar.jsx
│       │   ├── SearchBar.jsx
│       │   ├── AlertBell.jsx ←── useNotifications()
│       │   └── UserMenu.jsx
│       │
│       └── <Outlet /> (page content)
│           │
│           ├── /dashboard ── Dashboard.jsx
│           │   ├── StatsCards.jsx ←── /api/v1/dashboard/overview
│           │   ├── SeverityChart.jsx ←── /api/v1/dashboard/trends
│           │   ├── CategoryBreakdown.jsx ←── /api/v1/dashboard/categories
│           │   └── AlertFeed.jsx ←── useWebSocket() + useAlerts()
│           │       └── AlertCard.jsx (×N)
│           │           └── AlertBadge.jsx
│           │
│           ├── /map ──────── MapView.jsx
│           │   ├── MapFilters.jsx ←── useFilters()
│           │   └── AlertMap.jsx ←── /api/v1/incidents/map
│           │       ├── AlertPin.jsx (×N) ←── useWebSocket()
│           │       └── AlertPopup.jsx
│           │
│           ├── /alerts ───── AlertsPage.jsx
│           │   ├── AlertFilters.jsx
│           │   └── AlertCard.jsx (×N, paginated)
│           │
│           ├── /incidents/:id ── IncidentDetail.jsx
│           │   ├── AISummaryCard.jsx
│           │   ├── SeverityBreakdown.jsx
│           │   ├── LocationMiniMap.jsx
│           │   ├── QuickActions.jsx
│           │   └── ActivityLog.jsx
│           │
│           ├── /analytics ── Analytics.jsx
│           │   ├── TrendCharts.jsx
│           │   └── SourceHealthTable.jsx
│           │
│           └── /settings ─── Settings.jsx
│               ├── NotificationPrefs.jsx
│               └── CoverageAreaEditor.jsx
```

---

## Blueprint 7 — WebSocket Architecture

```
BROWSER                     SERVER                      REDIS
───────                     ──────                      ─────

connect()──────────────▶ WS Manager
                         register conn
                         subscribe to ──────────────▶ SUBSCRIBE
                         channel                       "incidents:live"

                                        ◀──────────── PUBLISH event
                                                       (from Celery worker)
                         receive event
broadcast to ◀────────── all connections
all clients

[Dashboard updates]

disconnect() ──────────▶ WS Manager
                         unregister conn
                         cleanup sub ──────────────▶ UNSUBSCRIBE
```

**Connection State Machine:**

```
DISCONNECTED
    │
    │ mount / page load
    ▼
CONNECTING ──── timeout/error ──▶ RETRY (exponential backoff)
    │                                   │
    │ success                           │ max retries
    ▼                                   ▼
CONNECTED ◀──────────────────── FAILED (show banner)
    │
    │ receive message
    ▼
PROCESSING ──▶ dispatch to Zustand ──▶ CONNECTED
    │
    │ server close / network drop
    ▼
RECONNECTING (auto, silent)
```

---

## Blueprint 8 — Authentication Flow

```
USER                    FRONTEND                BACKEND
────                    ────────                ───────

Enter credentials ──▶ POST /auth/login ──────▶ Verify hash
                                               Generate JWT
                                               (access: 15min)
                                               (refresh: 7days)

                    ◀── {access_token,
                          refresh_token}

Store in memory
(NOT localStorage)

Make API request ──▶ Authorization:
                     Bearer <access_token> ──▶ Validate JWT
                                          ◀── 200 OK + data

Token expires ──────▶ 401 Unauthorized  ◀──
                    POST /auth/refresh ──────▶ Validate refresh
                    {refresh_token}      ◀──   New access token

                    Retry original ──────────▶ 200 OK
                    request

Logout ────────────▶ DELETE /auth/logout ────▶ Blacklist token
                                               Clear server session
```

---

## Blueprint 9 — Deployment Stack

```
INTERNET
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  CLOUDFLARE (DNS + DDoS protection)                 │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS :443
                       ▼
┌─────────────────────────────────────────────────────┐
│  NGINX (Reverse Proxy)                              │
│                                                     │
│  location / {                                       │
│    serve React static files                         │
│  }                                                  │
│                                                     │
│  location /api/ {                                   │
│    proxy_pass http://fastapi:8000                   │
│  }                                                  │
│                                                     │
│  location /ws/ {                                    │
│    proxy_pass http://fastapi:8000                   │
│    proxy_set_header Upgrade websocket               │
│  }                                                  │
└──────────────────────┬──────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
   ┌───────────┐  ┌──────────┐  ┌──────────┐
   │  FastAPI  │  │PostgreSQL│  │  Redis   │
   │  :8000    │  │  :5432   │  │  :6379   │
   └─────┬─────┘  └──────────┘  └──────────┘
         │                            ▲
         ▼                            │
   ┌───────────┐                      │
   │  Celery   │──── pub/sub ─────────┘
   │  Worker   │
   └─────┬─────┘
         │
         ▼
   ┌───────────┐
   │  Celery   │
   │   Beat    │
   │ (Scheduler│
   └───────────┘
```

---

## Blueprint 10 — Environment Configuration Map

```
File: .env (never commit to git)

┌─────────────────────────────────────────────────────────┐
│  CORE                                                   │
│  SECRET_KEY=<random 64 char hex>                        │
│  ENVIRONMENT=development|production                     │
│  DEBUG=true|false                                       │
├─────────────────────────────────────────────────────────┤
│  DATABASE                                               │
│  DATABASE_URL=postgresql+asyncpg://                     │
│    user:password@localhost:5432/alertbeacon             │
├─────────────────────────────────────────────────────────┤
│  REDIS                                                  │
│  REDIS_URL=redis://localhost:6379/0                     │
│  CELERY_BROKER_URL=redis://localhost:6379/1             │
│  CELERY_RESULT_BACKEND=redis://localhost:6379/2         │
├─────────────────────────────────────────────────────────┤
│  AI / CLAUDE                                            │
│  ANTHROPIC_API_KEY=sk-ant-api03-...                     │
│  CLAUDE_MODEL=claude-sonnet-4-20250514                  │
│  CLAUDE_MAX_TOKENS=1000                                 │
│  CLAUDE_RATE_LIMIT_RPM=50                               │
├─────────────────────────────────────────────────────────┤
│  MAPS                                                   │
│  MAPBOX_TOKEN=pk.eyJ1...                                │
│  NOMINATIM_USER_AGENT=alertbeacon/1.0                   │
├─────────────────────────────────────────────────────────┤
│  NOTIFICATIONS                                          │
│  SENDGRID_API_KEY=SG....                                │
│  SENDGRID_FROM_EMAIL=alerts@alertbeacon.org             │
│  TWILIO_SID=AC...                                       │
│  TWILIO_AUTH_TOKEN=...                                  │
│  TWILIO_FROM_NUMBER=+1...                               │
├─────────────────────────────────────────────────────────┤
│  SCRAPING                                               │
│  SCRAPE_INTERVAL_MINUTES=5                              │
│  MAX_ARTICLES_PER_RUN=50                                │
│  REQUEST_TIMEOUT_SECONDS=10                             │
│  DEDUP_TTL_HOURS=48                                     │
├─────────────────────────────────────────────────────────┤
│  SEVERITY THRESHOLDS                                    │
│  NOTIFY_THRESHOLD=HIGH        ← Don't alert on LOW      │
│  CRITICAL_THRESHOLD=8.0                                 │
│  HIGH_THRESHOLD=6.0                                     │
│  MEDIUM_THRESHOLD=4.0                                   │
└─────────────────────────────────────────────────────────┘
```

---

## Blueprint 11 — Decision Tree: Should This Be an Alert?

```
New scraped item arrives
         │
         ▼
   Is it duplicate? ──── YES ──▶ DISCARD (save API costs)
         │ NO
         ▼
   Does Claude classify
   is_crisis = true? ──── NO ──▶ DISCARD (not a crisis)
         │ YES
         ▼
   confidence_score
     >= 0.70? ────────── NO ──▶ STORE with LOW flag,
         │                       no notification sent
         │ YES
         ▼
   severity_score
     >= NOTIFY_THRESHOLD? ─ NO ──▶ STORE, no notification
         │ YES
         ▼
   Does any NGO have:
   • coverage_area overlap AND
   • category in prefs AND
   • active account? ───── NO ──▶ STORE, no notification
         │ YES
         ▼
   SEND ALERT ──────────────────▶ Email + SMS + Push
         │
         ▼
   BROADCAST ───────────────────▶ WebSocket → Dashboard
         │
         ▼
   LOG in agent_logs ───────────▶ Full audit trail
```

---

## Blueprint 12 — Celery Task Schedule

```
┌─────────────────────────────────────────────────────────────┐
│  CELERY BEAT SCHEDULE                                       │
├──────────────┬──────────────────────┬───────────────────────┤
│  Task        │  Interval            │  Purpose              │
├──────────────┼──────────────────────┼───────────────────────┤
│ scrape_all   │ Every 5 minutes      │ Fetch all active      │
│ _sources     │                      │ RSS/news sources      │
├──────────────┼──────────────────────┼───────────────────────┤
│ process_     │ Every 5 minutes      │ Run agent pipeline    │
│ queue        │ (offset +2min)       │ on scraped items      │
├──────────────┼──────────────────────┼───────────────────────┤
│ health_check │ Every 15 minutes     │ Ping all sources,     │
│ _sources     │                      │ update health status  │
├──────────────┼──────────────────────┼───────────────────────┤
│ cleanup_     │ Daily at 2:00 AM     │ Archive resolved       │
│ old_logs     │                      │ incidents > 30 days   │
├──────────────┼──────────────────────┼───────────────────────┤
│ send_        │ Daily at 8:00 AM     │ Email digest to all   │
│ daily_digest │                      │ subscribed NGOs       │
├──────────────┼──────────────────────┼───────────────────────┤
│ retry_failed │ Every 30 minutes     │ Retry failed          │
│ _alerts      │                      │ notification sends    │
└──────────────┴──────────────────────┴───────────────────────┘
```

---

## Blueprint 13 — Error Handling Strategy

```
ERROR TYPE          WHERE IT HAPPENS        HOW TO HANDLE
──────────────────────────────────────────────────────────

Scraper timeout     scraper_service.py      tenacity retry
                                            max 3 attempts
                                            exponential backoff
                                            mark source degraded

Claude API error    claude_service.py       catch 429 → wait
                                            catch 500 → retry x2
                                            catch 400 → log + skip
                                            never crash pipeline

Geocoding fail      geocoding_service.py    return null lat/lng
                                            store incident anyway
                                            flag for manual review

DB write fail       any agent              log to agent_logs
                                            retry once
                                            dead letter queue

WebSocket drop      websocket_service.py    auto-reconnect (client)
                                            exponential backoff
                                            show "reconnecting" banner

Auth failure        auth_middleware.py      return 401
                                            client auto-refresh
                                            redirect to login

Celery task fail    any task               log full traceback
                                            alert admin if critical
                                            mark source as down
```

---

## Blueprint 14 — Performance Optimization Points

```
BOTTLENECK              SOLUTION
─────────────────────────────────────────────────────────────

Claude API latency      Batch classify 5 items per API call
(2-4 sec per call)      Use async/await throughout
                        Cache classifications for 1hr

RSS feed timeouts       httpx async with 10s timeout
                        Run source fetches in parallel
                        Skip offline sources gracefully

Map with 1000+ pins     Use leaflet.markercluster
                        Endpoint returns ONLY lat/lng/severity
                        Paginate — don't load all at once

DB query slowness       Index on: severity_label, category,
                          created_at, latitude+longitude
                        Use PostGIS for geo queries
                        Redis cache dashboard stats (60s TTL)

WebSocket fan-out       Redis pub/sub (not in-memory dict)
to many clients         Handles multiple server instances
                        Room-based channels per severity

Frontend re-renders     Zustand selectors (not whole store)
                        React.memo on AlertCard
                        Virtualize long alert lists
```

---

*AlertBeacon Blueprint v1.0 — Visual Architecture Reference*
