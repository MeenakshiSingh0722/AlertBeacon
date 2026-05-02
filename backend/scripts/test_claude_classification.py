import asyncio
import sys
import os

# Add parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.claude_service import claude_service

async def test_classification():
    test_texts = [
        "Massive flooding reported in North Bihar. Over 10,000 people displaced and urgent need for food and clean water.",
        "Local election results announced in New Delhi. No disturbances reported.",
        "Major earthquake hits Tokyo. Infrastructure damage and power outages across the city."
    ]
    
    print("Starting Claude Classification Test...")
    if not claude_service.api_key:
        print("WARN: No API Key found. Running in MOCK mode.")
    else:
        print("OK: API Key found. Running in REAL Claude mode.")
        
    for i, text in enumerate(test_texts):
        print(f"\n--- Test Case {i+1} ---")
        print(f"Input: {text}")
        result = await claude_service.classify_incident(text)
        print(f"Result: {result['is_crisis']} | Category: {result['category']} | Confidence: {result['confidence']}")
        print(f"Summary: {result['ai_summary']}")
        print(f"Factors: {result['severity_factors']}")

if __name__ == "__main__":
    asyncio.run(test_classification())
