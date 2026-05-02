from typing import Dict, Tuple
from app.models.incident import SeverityLabel

def calculate_severity_score(
    population_impact: int,  # 0-3
    immediacy: int,          # 0-3
    infrastructure_damage: int, # 0-3
    vulnerability_level: int    # 0-3
) -> float:
    """
    Calculates a normalized severity score (0.0 to 10.0) based on weighted factors.
    Formula: score = (pop*3) + (imm*3) + (infra*2) + (vuln*2)
    Max Raw Score = 30
    """
    # Clamp inputs to 0-3 range
    pop = max(0, min(3, population_impact))
    imm = max(0, min(3, immediacy))
    infra = max(0, min(3, infrastructure_damage))
    vuln = max(0, min(3, vulnerability_level))
    
    raw_score = (pop * 3) + (imm * 3) + (infra * 2) + (vuln * 2)
    normalized_score = round((raw_score / 30) * 10, 1)
    
    return normalized_score

def get_severity_label(score: float) -> SeverityLabel:
    """
    Maps a normalized score (0.0-10.0) to a SeverityLabel.
    """
    if score >= 8.0:
        return SeverityLabel.CRITICAL
    elif score >= 6.0:
        return SeverityLabel.HIGH
    elif score >= 4.0:
        return SeverityLabel.MEDIUM
    else:
        return SeverityLabel.LOW

def score_from_claude_factors(factors: Dict[str, int]) -> Tuple[float, SeverityLabel]:
    """
    Wrapper to calculate score and label from a dictionary of factors (usually from AI output).
    """
    score = calculate_severity_score(
        population_impact=factors.get("population_impact", 0),
        immediacy=factors.get("immediacy", 0),
        infrastructure_damage=factors.get("infrastructure_damage", 0),
        vulnerability_level=factors.get("vulnerability_level", 0)
    )
    label = get_severity_label(score)
    return score, label
