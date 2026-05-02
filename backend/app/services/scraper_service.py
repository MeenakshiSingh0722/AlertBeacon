import asyncio
import httpx
import feedparser
import logging
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from tenacity import retry, stop_after_attempt, wait_exponential

from app.models.source import DataSource, SourceHealthStatus
from app.database import AsyncSessionLocal

logger = logging.getLogger(__name__)

class ScraperService:
    def __init__(self):
        self.timeout = 10.0
        self.user_agent = "AlertBeacon/1.0"

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def fetch_rss(self, url: str) -> List[Dict[str, Any]]:
        """
        Fetches and parses an RSS feed.
        """
        async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
            headers = {"User-Agent": self.user_agent}
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            
            feed = feedparser.parse(response.text)
            
            items = []
            for entry in feed.entries:
                items.append({
                    "url": entry.get("link"),
                    "title": entry.get("title"),
                    "raw_text": f"{entry.get('title', '')} {entry.get('summary', '')} {entry.get('description', '')}",
                    "source": feed.feed.get("title", url),
                    "source_type": "rss",
                    "timestamp": datetime.now().isoformat()
                })
            return items

    async def scrape_active_sources(self) -> List[Dict[str, Any]]:
        """
        Orchestrates scraping for all active sources in the DB.
        """
        all_items = []
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(DataSource).where(DataSource.is_active == True)
            )
            sources = result.scalars().all()
            
            for source in sources:
                try:
                    logger.info(f"Scraping source: {source.name}")
                    items = await self.fetch_rss(source.url)
                    all_items.extend(items)
                    
                    # Update health and last scraped
                    source.health_status = SourceHealthStatus.HEALTHY
                    source.last_scraped = datetime.utcnow()
                    
                except Exception as e:
                    logger.error(f"Failed to scrape {source.name}: {str(e)}")
                    source.health_status = SourceHealthStatus.DEGRADED
                
            await session.commit()
        return all_items

scraper_service = ScraperService()
