from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.incident import Incident, IncidentStatus, SeverityLabel, Category
from app.models.source import DataSource
from app.schemas.dashboard_schema import (
    DashboardOverview,
    SeverityTrendItem,
    CategoryBreakdownItem,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/overview", response_model=DashboardOverview)
async def get_dashboard_overview(db: AsyncSession = Depends(get_db)):
    critical_count = await db.execute(
        select(func.count(Incident.id)).where(Incident.severity_label == SeverityLabel.CRITICAL)
    )
    high_count = await db.execute(
        select(func.count(Incident.id)).where(Incident.severity_label == SeverityLabel.HIGH)
    )
    active_count = await db.execute(
        select(func.count(Incident.id)).where(Incident.status == IncidentStatus.ACTIVE)
    )
    resolved_count = await db.execute(
        select(func.count(Incident.id)).where(Incident.status == IncidentStatus.RESOLVED)
    )
    total_count = await db.execute(select(func.count(Incident.id)))
    
    # Simple count for active data sources
    sources_online = await db.execute(
        select(func.count(DataSource.id)).where(DataSource.is_active == True)
    )

    return {
        "critical": critical_count.scalar_one() or 0,
        "high": high_count.scalar_one() or 0,
        "active": active_count.scalar_one() or 0,
        "resolved": resolved_count.scalar_one() or 0,
        "total": total_count.scalar_one() or 0,
        "sources_online": sources_online.scalar_one() or 0,
    }

@router.get("/trends", response_model=list[SeverityTrendItem])
async def get_dashboard_trends(db: AsyncSession = Depends(get_db)):
    today = datetime.utcnow().date()
    start_date = today - timedelta(days=6)
    query = (
        select(
            func.date(Incident.created_at).label("created_date"),
            Incident.severity_label,
            func.count(Incident.id).label("count"),
        )
        .where(Incident.created_at >= start_date)
        .group_by(func.date(Incident.created_at), Incident.severity_label)
        .order_by(func.date(Incident.created_at))
    )
    result = await db.execute(query)

    trend_map = {}
    for record in result.all():
        record_date = record.created_date
        if record_date is None:
            continue
        date_key = record_date.isoformat() if hasattr(record_date, 'isoformat') else str(record_date)
        trend_map.setdefault(date_key, {
            "date": date_key,
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0,
        })
        # Handle enum value or string
        sev_val = record.severity_label.value if hasattr(record.severity_label, 'value') else str(record.severity_label)
        trend_map[date_key][sev_val.lower()] = record.count

    response = []
    for offset in range(7):
        day = start_date + timedelta(days=offset)
        date_key = day.isoformat()
        response.append(trend_map.get(date_key, {
            "date": date_key,
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0,
        }))

    return response

@router.get("/categories", response_model=list[CategoryBreakdownItem])
async def get_dashboard_categories(db: AsyncSession = Depends(get_db)):
    categories_query = (
        select(Incident.category, func.count(Incident.id).label("count"))
        .group_by(Incident.category)
        .order_by(func.count(Incident.id).desc())
    )
    result = await db.execute(categories_query)

    rows = []
    for category, count in result.all():
        label = category.value if hasattr(category, 'value') else (str(category) if category is not None else "uncategorized")
        rows.append({"category": label.lower(), "count": count})

    return rows
