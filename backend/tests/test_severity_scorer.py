import pytest
from app.utils.severity_scorer import calculate_severity_score, get_severity_label
from app.models.incident import SeverityLabel

def test_critical_score():
    # Maxed out factors
    score = calculate_severity_score(3, 3, 3, 3)
    assert score == 10.0
    assert get_severity_label(score) == SeverityLabel.CRITICAL

def test_high_score():
    # High impact (3, 2, 2, 2) -> (9+6+4+4)/30 * 10 = 7.7
    score = calculate_severity_score(3, 2, 2, 2)
    assert score == 7.7
    assert get_severity_label(score) == SeverityLabel.HIGH

def test_medium_score():
    # Medium impact (2, 1, 1, 1) -> (6+3+2+2)/30 * 10 = 4.3
    score = calculate_severity_score(2, 1, 1, 1)
    assert score == 4.3
    assert get_severity_label(score) == SeverityLabel.MEDIUM

def test_low_score():
    # Low impact (1, 0, 0, 1) -> (3+0+0+2)/30 * 10 = 1.7
    score = calculate_severity_score(1, 0, 0, 1)
    assert score == 1.7
    assert get_severity_label(score) == SeverityLabel.LOW

def test_boundary_critical():
    # Boundary for critical (score 8.0)
    # (3*3) + (3*3) + (1*2) + (2*2) = 9+9+2+4 = 24. 24/30 * 10 = 8.0
    score = calculate_severity_score(3, 3, 1, 2)
    assert score == 8.0
    assert get_severity_label(score) == SeverityLabel.CRITICAL

def test_rounding():
    # (2, 2, 2, 2) -> (6+6+4+4)/30 * 10 = 6.66... -> 6.7
    score = calculate_severity_score(2, 2, 2, 2)
    assert score == 6.7
