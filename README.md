# 🚨 AlertBeacon: Autonomous AI Crisis Command Center

AlertBeacon is a state-of-the-art, real-time emergency management dashboard designed to provide instantaneous intelligence during global and local crises. Powered by Gemini LLMs and a high-frequency data harvesting pipeline, AlertBeacon transforms raw sensor data into actionable life-saving insights.


## 🌟 Key Features

### 🧠 Sentinel AI Pipeline
*   **Data Harvesting:** Scrapes USGS, Google News, and social feeds every 500ms.
*   **LLM Classification:** Uses Google Gemini models to categorize incidents by category (Safety, Health, Shelter) and severity (Critical, High, Medium, Low).
*   **Autonomous Analysis:** High-impact analysis sequence that simulates satellite syncing and sentiment scanning for every local detection.

### 📍 Intelligent Geolocation
*   **Near Me:** Proximity-based monitoring that focuses on threats within a 5km radius of the user's GPS coordinates.
*   **India National Feed:** Specialized tracking for major Indian metros and disaster-prone zones.
*   **Global Command Map:** Real-time leaflet-based visualization of worldwide emergencies with high-contrast "Dark Matter" styling.

### 🌑 Professional "Systemic" UI
*   **High-Contrast Mode:** Optimized for emergency command rooms with a strict Pure Black (#000000) and Pure White (#ffffff) aesthetic.
*   **Dynamic Notification Engine:** Instant visual and audio cues for high-severity threats.
*   **Fully Responsive:** Seamlessly scales from desktop command walls to mobile field devices.

## 🚀 Tech Stack

*   **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Leaflet Maps.
*   **Backend:** FastAPI (Python), SQLAlchemy, PostgreSQL.
*   **AI Engine:** Google Gemini (Generative AI), NLTK.
*   **Real-time:** WebSockets for instant incident propagation.
*   **Infrastructure:** Docker, Celery (for background scraping), Redis.

## 🛠️ Installation

### Prerequisites
*   Docker & Docker Compose
*   Python 3.10+
*   Node.js 18+

### Quick Start (Docker)
1. Clone the repository:
   ```bash
   git clone https://github.com/MeenakshiSingh0722/AlertBeacon.git
   cd AlertBeacon
   ```
2. Build and run the stack:
   ```bash
   docker-compose up --build
   ```
3. Access the dashboard at `http://localhost:5173`.

## 📖 How It Works

1.  **Ingestion:** Sentinel agents pull raw data from global sensors.
2.  **AI Analysis:** The raw text is passed through the LLM Analysis Pipeline.
3.  **Broadcast:** Verified crises are pushed via WebSockets to all active Command Centers.
4.  **Action:** Users receive localized alerts and can initiate SOS protocols.


demo video of project AlertBeacon:




https://github.com/user-attachments/assets/e0b3917f-d544-4ef3-99e4-58a218fada03



