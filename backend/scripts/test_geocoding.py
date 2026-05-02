import asyncio
import sys
import os

# Add parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.geocoding_service import geocoding_service

async def test_geocoding():
    print("Starting Geocoding Test...")
    
    test_locations = [
        "Mumbai, Maharashtra",
        "Wayanad, Kerala",
        "Darbhanga, Bihar",
        "New York City",
        "UnknownPlace_123"
    ]
    
    for loc in test_locations:
        print(f"\nGeocoding: {loc}")
        result = await geocoding_service.geocode(loc)
        print(f"Result: {result['latitude']}, {result['longitude']} | Precision: {result['precision']}")

if __name__ == "__main__":
    asyncio.run(test_geocoding())
