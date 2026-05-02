import asyncio
import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import AsyncSessionLocal
from app.models.source import DataSource

async def seed_sources():
    async with AsyncSessionLocal() as session:
        sources = [
            DataSource(
                name="GDACS - Global Disaster Alert and Coordination System",
                url="https://www.gdacs.org/xml/rss.xml",
                source_type="rss",
                is_active=True
            ),
            DataSource(
                name="BBC News - World",
                url="https://feeds.bbci.co.uk/news/world/rss.xml",
                source_type="rss",
                is_active=True
            )
        ]
        
        for source in sources:
            session.add(source)
        
        await session.commit()
        print("Successfully seeded data sources.")

if __name__ == "__main__":
    asyncio.run(seed_sources())
