import json
import asyncio
from typing import Dict, Any, Optional
from loguru import logger
from app.config import settings
from anthropic import AsyncAnthropic
from tenacity import retry, stop_after_attempt, wait_exponential

class AIAnalysisService:
    def __init__(self):
        self.api_key = settings.ANTHROPIC_API_KEY
        self.client = AsyncAnthropic(api_key=self.api_key) if self.api_key else None
        self.model = getattr(settings, 'CLAUDE_MODEL', 'claude-3-sonnet-20240229')

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def analyze_crisis_text(self, raw_text: str, source_url: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyzes raw text for crisis detection and classification.
        
        Returns:
            {
                "is_crisis": true,
                "title": "...",
                "category": "medical|food|shelter|infrastructure|safety|other",
                "confidence_score": 0.0-1.0,
                "location_name": "...",
                "affected_count": 100,
                "urgency_keywords": ["urgent", "flood", "hospital"],
                "ai_summary": "Short actionable summary for responders.",
                "severity_factors": {
                    "population_impact": 0-3,
                    "immediacy": 0-3,
                    "infrastructure_damage": 0-2,
                    "vulnerability_level": 0-2
                }
            }
        """
        try:
            if self.client:
                return await self._analyze_with_claude(raw_text, source_url)
            else:
                return self._mock_analysis(raw_text, source_url)
        except Exception as e:
            logger.error(f"AI analysis failed: {str(e)}")
            return self._mock_analysis(raw_text, source_url, error=True)

    async def _analyze_with_claude(self, raw_text: str, source_url: Optional[str] = None) -> Dict[str, Any]:
        """Use Claude AI for real analysis."""
        prompt = f"""
        Analyze the following text and determine if it describes a crisis or emergency situation.
        
        Text: {raw_text[:2000]}
        Source: {source_url or "Unknown"}
        
        Return ONLY a JSON object in this EXACT format:
        {{
            "is_crisis": true/false,
            "title": "Brief descriptive title (max 100 chars)",
            "category": "medical|food|shelter|infrastructure|safety|other",
            "confidence_score": 0.0-1.0,
            "location_name": "Location if mentioned, otherwise null",
            "affected_count": number or null,
            "urgency_keywords": ["keyword1", "keyword2", "keyword3"],
            "ai_summary": "Short actionable summary for responders (max 200 chars)",
            "severity_factors": {{
                "population_impact": 0-3,
                "immediacy": 0-3,
                "infrastructure_damage": 0-2,
                "vulnerability_level": 0-2
            }}
        }}
        
        Guidelines:
        - population_impact: 0=none, 1=few, 2=dozens, 3=hundreds+
        - immediacy: 0=ongoing, 1=hours, 2=immediate, 3=minutes
        - infrastructure_damage: 0=none, 1=minor, 2=major
        - vulnerability_level: 0=low, 1=medium, 2=high
        """

        response = await self.client.messages.create(
            model=self.model,
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        
        content = response.content[0].text
        return self._parse_json_response(content)

    def _parse_json_response(self, content: str) -> Dict[str, Any]:
        """Parse and validate JSON response from AI."""
        try:
            # Clean up potential extra text from AI
            start = content.find('{')
            end = content.rfind('}') + 1
            if start != -1 and end != -1:
                json_str = content[start:end]
                result = json.loads(json_str)
            else:
                result = json.loads(content)
            
            # Validate required fields
            required_fields = ["is_crisis", "title", "category", "confidence_score", 
                             "urgency_keywords", "ai_summary", "severity_factors"]
            
            for field in required_fields:
                if field not in result:
                    raise ValueError(f"Missing required field: {field}")
            
            # Validate severity factors
            severity_factors = result["severity_factors"]
            required_factors = ["population_impact", "immediacy", "infrastructure_damage", "vulnerability_level"]
            for factor in required_factors:
                if factor not in severity_factors:
                    raise ValueError(f"Missing severity factor: {factor}")
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to parse AI JSON response: {str(e)}")
            return self._get_fallback_response()

    def _mock_analysis(self, text: str, source_url: Optional[str] = None, error: bool = False) -> Dict[str, Any]:
        """Mock analysis for development/demo when no AI key available."""
        text_lower = text.lower()
        
        # Crisis detection keywords
        crisis_keywords = [
            "flood", "fire", "explosion", "hospital", "injured", "shortage", 
            "trapped", "collapsed", "outbreak", "emergency", "disaster", 
            "accident", "evacuation", "rescue", "critical", "urgent"
        ]
        
        is_crisis = any(keyword in text_lower for keyword in crisis_keywords)
        
        # Category detection
        category = "other"
        if any(keyword in text_lower for keyword in ["medical", "hospital", "injured", "health", "doctor"]):
            category = "medical"
        elif any(keyword in text_lower for keyword in ["food", "shortage", "hunger", "famine"]):
            category = "food"
        elif any(keyword in text_lower for keyword in ["shelter", "homeless", "displaced", "evacuation"]):
            category = "shelter"
        elif any(keyword in text_lower for keyword in ["infrastructure", "bridge", "road", "power", "water"]):
            category = "infrastructure"
        elif any(keyword in text_lower for keyword in ["safety", "security", "violence", "crime"]):
            category = "safety"
        
        # Location extraction (simple keyword matching)
        location_name = None
        indian_cities = ["mumbai", "delhi", "bangalore", "chennai", "kolkata", "hyderabad", 
                         "pune", "ahmedabad", "surat", "jaipur", "lucknow", "kanpur", 
                         "nagpur", "indore", "patna", "bhopal", "bihar", "kerala", "assam"]
        
        for city in indian_cities:
            if city in text_lower:
                location_name = city.title()
                break
        
        # Affected count estimation
        affected_count = None
        if "hundred" in text_lower or "hundreds" in text_lower:
            affected_count = 500
        elif "thousand" in text_lower or "thousands" in text_lower:
            affected_count = 5000
        elif "dozen" in text_lower or "dozens" in text_lower:
            affected_count = 50
        elif is_crisis:
            affected_count = 100  # Default for crisis
        
        # Urgency keywords extraction
        urgency_keywords = [kw for kw in crisis_keywords if kw in text_lower][:5]
        
        # Title generation
        if is_crisis:
            title = f"Crisis: {text[:50]}..." if len(text) > 50 else f"Crisis: {text}"
        else:
            title = text[:50] + "..." if len(text) > 50 else text
        
        # AI summary
        if error:
            ai_summary = "AI analysis failed - using fallback classification"
        elif is_crisis:
            ai_summary = f"Emergency situation detected in {location_name or 'unknown location'}. Immediate response required."
        else:
            ai_summary = "No crisis detected in the provided text."
        
        # Severity factors
        severity_factors = {
            "population_impact": 0,
            "immediacy": 0,
            "infrastructure_damage": 0,
            "vulnerability_level": 0
        }
        
        if is_crisis:
            # Population impact
            if affected_count and affected_count >= 1000:
                severity_factors["population_impact"] = 3
            elif affected_count and affected_count >= 100:
                severity_factors["population_impact"] = 2
            elif affected_count and affected_count >= 10:
                severity_factors["population_impact"] = 1
            
            # Immediacy
            if any(word in text_lower for word in ["immediate", "urgent", "critical", "minutes"]):
                severity_factors["immediacy"] = 3
            elif any(word in text_lower for word in ["hours", "soon", "quickly"]):
                severity_factors["immediacy"] = 2
            elif any(word in text_lower for word in ["ongoing", "currently"]):
                severity_factors["immediacy"] = 1
            
            # Infrastructure damage
            if any(word in text_lower for word in ["destroyed", "collapsed", "major", "severe"]):
                severity_factors["infrastructure_damage"] = 2
            elif any(word in text_lower for word in ["damaged", "affected", "partial"]):
                severity_factors["infrastructure_damage"] = 1
            
            # Vulnerability level
            if any(word in text_lower for word in ["children", "elderly", "vulnerable", "disabled"]):
                severity_factors["vulnerability_level"] = 2
            elif any(word in text_lower for word in ["hospital", "school", "crowded"]):
                severity_factors["vulnerability_level"] = 1
        
        confidence_score = 0.1 if error else (0.8 if is_crisis else 0.2)
        
        return {
            "is_crisis": is_crisis,
            "title": title,
            "category": category,
            "confidence_score": confidence_score,
            "location_name": location_name,
            "affected_count": affected_count,
            "urgency_keywords": urgency_keywords,
            "ai_summary": ai_summary,
            "severity_factors": severity_factors
        }

    def _get_fallback_response(self) -> Dict[str, Any]:
        """Fallback response when all analysis fails."""
        return {
            "is_crisis": False,
            "title": "Analysis Failed",
            "category": "other",
            "confidence_score": 0.0,
            "location_name": None,
            "affected_count": None,
            "urgency_keywords": [],
            "ai_summary": "Failed to analyze text due to technical issues.",
            "severity_factors": {
                "population_impact": 0,
                "immediacy": 0,
                "infrastructure_damage": 0,
                "vulnerability_level": 0
            }
        }

# Global instance
ai_analysis_service = AIAnalysisService()
