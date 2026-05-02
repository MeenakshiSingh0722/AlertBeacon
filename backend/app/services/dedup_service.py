import hashlib
import logging
from typing import Optional
from redis.asyncio import Redis
from sqlalchemy import select
from app.config import settings
from app.database import AsyncSessionLocal
from app.models.incident import Incident

logger = logging.getLogger(__name__)

class DedupService:
    def __init__(self):
        self.redis_url = settings.REDIS_URL
        self.ttl = 48 * 3600  # 48 hours in seconds
        self.redis: Optional[Redis] = None
        self._init_redis()

    def _init_redis(self):
        try:
            self.redis = Redis.from_url(self.redis_url, decode_responses=True)
        except Exception as e:
            logger.warning(f"Redis connection failed: {str(e)}. Falling back to DB deduplication.")
            self.redis = None

    def _get_hash(self, url: str) -> str:
        return hashlib.sha256(url.encode()).hexdigest()

    async def is_duplicate(self, url: str) -> bool:
        """
        Checks if a URL has already been processed.
        """
        if not url:
            return False
            
        url_hash = self._get_hash(url)
        
        # 1. Try Redis
        if self.redis:
            try:
                exists = await self.redis.exists(f"dedup:{url_hash}")
                if exists:
                    return True
            except Exception as e:
                logger.error(f"Redis error: {str(e)}")
                # Fallback to DB below
        
        # 2. Fallback to DB
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(Incident).where(Incident.source_url == url)
            )
            return result.scalar_one_or_none() is not None

    async def mark_seen(self, url: str):
        """
        Marks a URL as processed in Redis.
        """
        if not url or not self.redis:
            return
            
        url_hash = self._get_hash(url)
        try:
            await self.redis.setex(f"dedup:{url_hash}", self.ttl, "1")
        except Exception as e:
            logger.error(f"Redis mark_seen error: {str(e)}")

    async def check_and_mark(self, url: str) -> bool:
        """
        Returns True if duplicate, otherwise marks as seen and returns False.
        """
        if await self.is_duplicate(url):
            return True
        
        await self.mark_seen(url)
        return False

dedup_service = DedupService()
