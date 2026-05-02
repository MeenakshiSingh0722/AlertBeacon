import time
import logging
from typing import Dict, Any, Optional, Tuple
from geopy.geocoders import Nominatim
from geopy.exc import GeopyError
from app.config import settings

logger = logging.getLogger(__name__)

class GeocodingService:
    def __init__(self):
        self.user_agent = settings.NOMINATIM_USER_AGENT
        self.geocoder = Nominatim(user_agent=self.user_agent)
        
        # Fallback map for common regions (lat, lng)
        self.FALLBACK_MAP = {
            "bihar": (25.0961, 85.3131),
            "mumbai": (19.0760, 72.8777),
            "delhi": (28.6139, 77.2090),
            "kerala": (10.8505, 76.2711),
            "assam": (26.2006, 92.9376),
            "india": (20.5937, 78.9629)
        }

    async def geocode(self, location_name: str) -> Dict[str, Any]:
        """
        Translates a location string into coordinates.
        """
        if not location_name:
            return self._empty_result()

        try:
            # Rate limiting compliance (Nominatim requires 1s between requests)
            # In a real async production env, you'd use a more sophisticated rate limiter
            # but for this foundation, a simple small sleep or direct call is okay for testing
            
            location = self.geocoder.geocode(location_name, timeout=10)
            
            if location:
                return {
                    "latitude": float(location.latitude),
                    "longitude": float(location.longitude),
                    "precision": "exact",
                    "confidence": 0.9
                }
            
        except (GeopyError, Exception) as e:
            logger.error(f"Geocoding API error: {str(e)}")

        # Fallback logic
        return self._try_fallback(location_name)

    def _try_fallback(self, location_name: str) -> Dict[str, Any]:
        name_lower = location_name.lower()
        for key, coords in self.FALLBACK_MAP.items():
            if key in name_lower:
                return {
                    "latitude": coords[0],
                    "longitude": coords[1],
                    "precision": "approximate",
                    "confidence": 0.5
                }
        
        return self._empty_result()

    def _empty_result(self) -> Dict[str, Any]:
        return {
            "latitude": None,
            "longitude": None,
            "precision": "unknown",
            "confidence": 0.0
        }

geocoding_service = GeocodingService()
