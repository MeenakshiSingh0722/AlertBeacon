import pytest
from httpx import AsyncClient
from app.main import app
from app.utils.severity_scorer import calculate_severity
from app.services.claude_service import claude_service
from app.services.geocoding_service import geocoding_service

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "alertbeacon-api"}

def test_severity_scorer():
    # Test high impact
    score, label = calculate_severity(
        population_impact=3,
        immediacy=3,
        infrastructure_damage=3,
        vulnerability_level=3
    )
    assert score >= 0.9
    assert label == "critical"

    # Test low impact
    score, label = calculate_severity(
        population_impact=0,
        immediacy=0,
        infrastructure_damage=0,
        vulnerability_level=0
    )
    assert score <= 0.2
    assert label == "low"

@pytest.mark.asyncio
async def test_geocoding_fallback():
    # Test known fallback
    result = await geocoding_service.geocode("Mumbai, India")
    assert result["latitude"] == 19.0760
    assert result["longitude"] == 72.8777
    assert result["precision"] == "approximate"

    # Test unknown
    result = await geocoding_service.geocode("NonExistentPlace12345")
    assert result["latitude"] is None
    assert result["precision"] == "unknown"

@pytest.mark.asyncio
async def test_claude_mock_classification():
    # Ensure it falls back to mock if no client/error
    result = await claude_service.classify_incident("Major flood in Bihar")
    assert "category" in result
    assert "is_crisis" in result
    assert result["is_crisis"] is True
