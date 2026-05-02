import asyncio
import sys
import os

# Add parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.scraper_service import scraper_service

async def test_scraper():
    print("Starting Scraper Test...")
    
    # Test with a known stable RSS feed if DB is empty
    test_urls = [
        "https://reliefweb.int/updates/rss.xml",
        "https://ndma.gov.in/rss"
    ]
    
    print("\n--- Testing Direct RSS Fetch ---")
    for url in test_urls:
        try:
            print(f"Fetching: {url}")
            items = await scraper_service.fetch_rss(url)
            print(f"OK: Success! Found {len(items)} items.")
            if items:
                print(f"Latest Item: {items[0]['title'][:70]}...")
        except Exception as e:
            print(f"ERR: Failed to fetch {url}: {str(e)}")

    print("\n--- Testing DB-Integrated Scrape ---")
    # This will use the sources seeded in the database
    try:
        items = await scraper_service.scrape_active_sources()
        print(f"OK: DB Scrape completed. Total items found: {len(items)}")
    except Exception as e:
        print(f"ERR: DB Scrape failed: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_scraper())
