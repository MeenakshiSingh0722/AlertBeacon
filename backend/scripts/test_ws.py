import asyncio
import websockets
import json

async def test_ws():
    uri = "ws://localhost:8000/api/v1/ws/incidents"
    print(f"Connecting to {uri}...")
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected! Waiting for live incident updates...")
            while True:
                message = await websocket.recv()
                data = json.loads(message)
                print("\n[LIVE UPDATE RECEIVED]")
                print(f"Event: {data.get('event_type')}")
                print(f"Title: {data['data'].get('title')}")
                print(f"Severity: {data['data'].get('severity_label')} ({data['data'].get('severity_score')})")
                print(f"Location: {data['data'].get('location_name')}")
                print("-" * 30)
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_ws())
