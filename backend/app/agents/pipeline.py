import logging
import asyncio
import json
import time
from typing import Dict, Any
from datetime import datetime

from app.services.scraper_service import scraper_service
from app.services.dedup_service import dedup_service
from app.services.claude_service import claude_service
from app.services.geocoding_service import geocoding_service
from app.services.notification_service import notification_service
from app.utils.severity_scorer import score_from_claude_factors
from app.database import AsyncSessionLocal
from app.models.incident import Incident, IncidentStatus
from app.models.agent_log import AgentLog, AgentStatus
from redis.asyncio import Redis
from app.config import settings

logger = logging.getLogger(__name__)

class AlertBeaconPipeline:
    def __init__(self):
        self.redis_url = settings.REDIS_URL

    async def run(self) -> Dict[str, Any]:
        """
        Runs the full AlertBeacon pipeline: Scrape -> Dedup -> Classify -> Score -> Geocode -> Save.
        """
        stats = {
            "scraped": 0,
            "duplicates": 0,
            "classified": 0,
            "created_incidents": 0,
            "errors": 0
        }
        
        start_time = time.time()
        logger.info("Starting AlertBeacon Pipeline run...")

        # 1. Scrape active sources
        try:
            raw_items = await scraper_service.scrape_active_sources()
            stats["scraped"] = len(raw_items)
            await self._log_agent_step("Scraper", "scrape_sources", {"source_count": len(raw_items)}, AgentStatus.SUCCESS)
            logger.info(f"Step 1: Scraped {len(raw_items)} items.")
        except Exception as e:
            logger.error(f"Pipeline Scrape Error: {str(e)}")
            stats["errors"] += 1
            await self._log_agent_step("Scraper", "scrape_sources", {}, AgentStatus.FAILED, error=str(e))
            return stats

        # 2. Process items
        for item in raw_items:
            item_url = item.get("url")
            try:
                # Deduplicate by URL
                is_dup = await dedup_service.is_duplicate(item_url)
                if is_dup:
                    stats["duplicates"] += 1
                    logger.debug(f"Skipping duplicate URL: {item_url}")
                    continue
                
                # 3. Classify with Claude service
                ai_data = await claude_service.classify_incident(item["raw_text"], item_url)
                stats["classified"] += 1
                
                # 4. If is_crisis false, skip
                if not ai_data.get("is_crisis"):
                    logger.info(f"Skipping non-crisis item: {item_url}")
                    await dedup_service.mark_seen(item_url)
                    continue
                
                # 5. Calculate severity score and label
                # Note: severity_factors should be provided by Claude
                factors = ai_data.get("severity_factors", {})
                score, label = score_from_claude_factors(factors)
                
                # 6. Geocode location
                location_name = ai_data.get("location", {}).get("name", "Unknown")
                geo_data = await geocoding_service.geocode(location_name)
                
                # 7. Save incident to PostgreSQL
                async with AsyncSessionLocal() as session:
                    new_incident = Incident(
                        title=ai_data.get("title", item.get("title", "Untitled Incident")),
                        description=ai_data.get("ai_summary", item.get("raw_text", "")[:500]),
                        raw_content=item.get("raw_text"),
                        source_url=item_url,
                        source_type=item.get("source_type", "rss"),
                        category=ai_data.get("category", "other"),
                        severity_score=score,
                        severity_label=label,
                        status=IncidentStatus.NEW,
                        location_name=location_name,
                        latitude=geo_data.get("latitude"),
                        longitude=geo_data.get("longitude"),
                        affected_count=ai_data.get("affected_count"),
                        confidence_score=ai_data.get("confidence", 0.0),
                        ai_summary=ai_data.get("ai_summary")
                    )
                    session.add(new_incident)
                    await session.flush() # Get the ID before commit
                    
                    # 8. Write agent logs for each step (Final creation log)
                    agent_log = AgentLog(
                        agent_name="Pipeline",
                        action="create_incident",
                        input_data={"url": item_url, "location": location_name},
                        output_data={"incident_id": str(new_incident.id), "score": score, "label": str(label)},
                        status=AgentStatus.SUCCESS
                    )
                    session.add(agent_log)
                    
                    await session.commit()
                    stats["created_incidents"] += 1
                    
                    # Optional: Broadcast via Redis (as seen in previous version)
                    await self._broadcast_incident(new_incident)

                    # 9. Match and notify users
                    await notification_service.process_incident(new_incident)

                    # Mark as seen in Dedup
                    await dedup_service.mark_seen(item_url)
                    logger.info(f"Step 7: Created Incident - {new_incident.title}")

            except Exception as e:
                logger.error(f"Error processing item {item_url}: {str(e)}")
                stats["errors"] += 1
                await self._log_agent_step("Pipeline", "process_item", {"url": item_url}, AgentStatus.FAILED, error=str(e))
                
        total_time = round((time.time() - start_time) * 1000, 2)
        logger.info(f"Pipeline finished in {total_time}ms. Stats: {stats}")
        return stats

    async def _log_agent_step(self, agent: str, action: str, input_data: Any, status: AgentStatus, error: str = None):
        try:
            async with AsyncSessionLocal() as session:
                log = AgentLog(
                    agent_name=agent,
                    action=action,
                    input_data=input_data,
                    output_data={"error": error} if error else {},
                    status=status
                )
                session.add(log)
                await session.commit()
        except Exception as e:
            logger.error(f"Failed to write agent log: {str(e)}")

    async def _broadcast_incident(self, incident: Incident):
        try:
            redis = Redis.from_url(self.redis_url, decode_responses=True)
            event = {
                "event_type": "incident_created",
                "timestamp": datetime.utcnow().isoformat(),
                "data": {
                    "id": str(incident.id),
                    "title": incident.title,
                    "severity_label": str(incident.severity_label),
                    "severity_score": float(incident.severity_score),
                    "category": str(incident.category),
                    "location_name": incident.location_name,
                    "latitude": float(incident.latitude) if incident.latitude else None,
                    "longitude": float(incident.longitude) if incident.longitude else None,
                    "ai_summary": incident.ai_summary
                }
            }
            await redis.publish("incidents:live", json.dumps(event))
            await redis.close()
        except Exception as re:
            logger.error(f"Failed to publish to Redis: {str(re)}")

pipeline_service = AlertBeaconPipeline()
