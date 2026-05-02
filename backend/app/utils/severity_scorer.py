from typing import Dict, Tuple
from app.models.incident import SeverityLabel

def calculate_severity_score(
    population_impact: int,  # 0-3
    immediacy: int,          # 0-3
    infrastructure_damage: int, # 0-2
    vulnerability_level: int    # 0-2
) -> float:
    """
    Calculates a normalized severity score (0.0 to 10.0) based on weighted factors.
    Formula: score = (population_impact * 3) + (immediacy * 3) + (infrastructure_damage * 2) + (vulnerability_level * 2)
    Max Raw Score = 30
    Normalized = (score / 30) * 10
    """
    # Clamp inputs to valid ranges
    pop = max(0, min(3, population_impact))
    imm = max(0, min(3, immediacy))
    infra = max(0, min(2, infrastructure_damage))
    vuln = max(0, min(2, vulnerability_level))
    
    raw_score = (pop * 3) + (imm * 3) + (infra * 2) + (vuln * 2)
    normalized_score = round((raw_score / 30) * 10, 1)
    
    return normalized_score

def get_severity_label(score: float) -> SeverityLabel:
    """
    Maps a normalized score (0.0-10.0) to a SeverityLabel.
    
    Labels:
    - 8.0 to 10.0 = critical
    - 6.0 to 7.9 = high
    - 4.0 to 5.9 = medium
    - below 4.0 = low
    """
    if score >= 8.0:
        return SeverityLabel.CRITICAL
    elif score >= 6.0:
        return SeverityLabel.HIGH
    elif score >= 4.0:
        return SeverityLabel.MEDIUM
    else:
        return SeverityLabel.LOW

def score_from_ai_factors(factors: Dict[str, int]) -> Tuple[float, SeverityLabel]:
    """
    Wrapper to calculate score and label from AI analysis factors.
    
    Args:
        factors: Dict with keys 'population_impact', 'immediacy', 'infrastructure_damage', 'vulnerability_level'
    
    Returns:
        Tuple of (severity_score, severity_label)
    """
    score = calculate_severity_score(
        population_impact=factors.get("population_impact", 0),
        immediacy=factors.get("immediacy", 0),
        infrastructure_damage=factors.get("infrastructure_damage", 0),
        vulnerability_level=factors.get("vulnerability_level", 0)
    )
    label = get_severity_label(score)
    return score, label
