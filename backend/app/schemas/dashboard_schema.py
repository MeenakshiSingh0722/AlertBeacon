from pydantic import BaseModel
from typing import List

class DashboardOverview(BaseModel):
    critical: int
    high: int
    active: int
    resolved: int
    total: int
    sources_online: int

class SeverityTrendItem(BaseModel):
    date: str
    critical: int
    high: int
    medium: int
    low: int

class CategoryBreakdownItem(BaseModel):
    category: str
    count: int

class DashboardCategoryResponse(BaseModel):
    categories: List[CategoryBreakdownItem]
