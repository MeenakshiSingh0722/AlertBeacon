import json
import logging
from typing import Dict, Any, Optional
from anthropic import AsyncAnthropic
from tenacity import retry, stop_after_attempt, wait_exponential
from app.config import settings

logger = logging.getLogger(__name__)

class ClaudeService:
    def __init__(self):
        self.api_key = settings.ANTHROPIC_API_KEY
        self.client = AsyncAnthropic(api_key=self.api_key) if self.api_key else None
        self.model = settings.CLAUDE_MODEL

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def classify_incident(self, raw_text: str, source_url: str = "") -> Dict[str, Any]:
        """
        Classifies raw text into a structured crisis incident using Claude.
        """
        if not self.client:
            return self._mock_classification(raw_text)

        prompt = f"""
        Analyze the following text and determine if it describes a crisis or emergency.
        Text: {raw_text[:2000]}
        Source: {source_url}

        Return ONLY a JSON object in this EXACT format:
        {{
          "category": "medical|food|shelter|infrastructure|safety|other",
          "is_crisis": true/false,
          "confidence": 0.0-1.0,
          "location": {{
            "name": "full location name",
            "city": "city if mentioned",
            "country": "country if mentioned",
            "precision": "exact|approximate|unknown"
          }},
          "affected_count": integer or null,
          "urgency_keywords": ["keyword1", "keyword2"],
          "ai_summary": "one sentence summary",
          "severity_factors": {{
            "population_impact": 0-3,
            "immediacy": 0-3,
            "infrastructure_damage": 0-3,
            "vulnerability_level": 0-3
          }}
        }}
        """

        try:
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            content = response.content[0].text
            return self._parse_json_response(content)
            
        except Exception as e:
            logger.error(f"Claude API Error: {str(e)}")
            return self._mock_classification(raw_text, error=True)

    def _parse_json_response(self, content: str) -> Dict[str, Any]:
        try:
            # Clean up potential extra text from AI
            start = content.find('{')
            end = content.rfind('}') + 1
            if start != -1 and end != -1:
                return json.loads(content[start:end])
            return json.loads(content)
        except Exception:
            logger.error("Failed to parse Claude JSON response")
            return self._get_fallback_response()

    def _mock_classification(self, text: str, error: bool = False) -> Dict[str, Any]:
        """Deterministic mock for local dev/demo."""
        text_lower = text.lower()
        is_crisis = any(k in text_lower for k in ["flood", "emergency", "crisis", "accident", "dead", "injured"])
        
        category = "other"
        if "medical" in text_lower or "injured" in text_lower: category = "medical"
        elif "food" in text_lower: category = "food"
        elif "flood" in text_lower or "storm" in text_lower: category = "shelter"
        
        return {
            "category": category,
            "is_crisis": is_crisis,
            "confidence": 0.5 if not error else 0.1,
            "location": {
                "name": "Detected Location" if is_crisis else "Unknown",
                "city": None,
                "country": None,
                "precision": "approximate"
            },
            "affected_count": 0,
            "urgency_keywords": ["mock", "demo"],
            "ai_summary": f"[MOCK] {text[:100]}..." if not error else "Error fallback summary",
            "severity_factors": {
                "population_impact": 1 if is_crisis else 0,
                "immediacy": 2 if is_crisis else 0,
                "infrastructure_damage": 1 if is_crisis else 0,
                "vulnerability_level": 1 if is_crisis else 0
            }
        }

    def _get_fallback_response(self) -> Dict[str, Any]:
        return {
            "category": "other",
            "is_crisis": False,
            "confidence": 0.0,
            "location": {"name": "Unknown", "precision": "unknown"},
            "affected_count": None,
            "urgency_keywords": [],
            "ai_summary": "Failed to analyze text.",
            "severity_factors": {"population_impact": 0, "immediacy": 0, "infrastructure_damage": 0, "vulnerability_level": 0}
        }

claude_service = ClaudeService()
