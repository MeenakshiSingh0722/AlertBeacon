import asyncio
import sys
import os

# Add parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.dedup_service import dedup_service

async def test_dedup():
    print("Starting Deduplication Test...")
    
    test_url = "https://reliefweb.int/report/bihar-floods-2026"
    
    print(f"\n--- Round 1: Processing new URL ---")
    is_dup = await dedup_service.check_and_mark(test_url)
    print(f"URL: {test_url}")
    print(f"Result: {'Duplicate' if is_dup else 'New Item (Marked Seen)'}")
    
    print(f"\n--- Round 2: Processing SAME URL ---")
    is_dup = await dedup_service.check_and_mark(test_url)
    print(f"URL: {test_url}")
    print(f"Result: {'Duplicate' if is_dup else 'New Item'}")
    
    print(f"\n--- Round 3: Processing DIFFERENT URL ---")
    new_url = "https://ndma.gov.in/mumbai-emergency-news"
    is_dup = await dedup_service.check_and_mark(new_url)
    print(f"URL: {new_url}")
    print(f"Result: {'Duplicate' if is_dup else 'New Item (Marked Seen)'}")

if __name__ == "__main__":
    asyncio.run(test_dedup())
