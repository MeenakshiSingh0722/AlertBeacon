import asyncio
import logging
from celery.utils.log import get_task_logger
from app.tasks.celery_app import celery_app
from app.agents.pipeline import pipeline_service
from app.services.scraper_service import scraper_service
from app.database import AsyncSessionLocal
from sqlalchemy import delete, select
from app.models.agent_log import AgentLog
from datetime import datetime, timedelta

logger = get_task_logger(__name__)

@celery_app.task
def run_pipeline_task():
    """
    Task to run the full incident acquisition and analysis pipeline.
    """
    logger.info("Starting scheduled pipeline task...")
    try:
        # Since the pipeline is async, we run it in an event loop
        stats = asyncio.run(pipeline_service.run())
        logger.info(f"Pipeline task completed. Stats: {stats}")
        return stats
    except Exception as e:
        logger.error(f"Pipeline task failed: {str(e)}")
        return {"error": str(e)}

@celery_app.task
def health_check_sources_task():
    """
    Task to check the health of all data sources.
    Scraper service already does some of this, but this task ensures
    we check connectivity even if no data is being pulled.
    """
    logger.info("Starting source health check...")
    # For now, we can just trigger a scrape run which updates health
    try:
        stats = asyncio.run(scraper_service.scrape_active_sources())
        logger.info(f"Health check completed. Checked {len(stats)} items.")
        return {"status": "ok", "items_checked": len(stats)}
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {"error": str(e)}

@celery_app.task
def cleanup_old_logs_task():
    """
    Task to clean up agent logs older than 7 days.
    """
    logger.info("Cleaning up old agent logs...")
    async def _cleanup():
        async with AsyncSessionLocal() as session:
            seven_days_ago = datetime.utcnow() - timedelta(days=7)
            stmt = delete(AgentLog).where(AgentLog.created_at < seven_days_ago)
            result = await session.execute(stmt)
            await session.commit()
            return result.rowcount

    try:
        count = asyncio.run(_cleanup())
        logger.info(f"Cleaned up {count} old logs.")
        return {"deleted_count": count}
    except Exception as e:
        logger.error(f"Cleanup task failed: {str(e)}")
        return {"error": str(e)}

@celery_app.task
def retry_failed_alerts_task():
    """
    Task to retry failed alert broadcasts or processing.
    Placeholder for now.
    """
    logger.info("Retrying failed alerts (Placeholder)...")
    return {"status": "skipped", "reason": "Not implemented yet"}

@celery_app.task
def scrape_all_sources():
    """
    Separate task if needed to just scrape without full pipeline.
    Currently integrated into run_pipeline_task.
    """
    logger.info("Triggering scrape_all_sources...")
    asyncio.run(scraper_service.scrape_active_sources())
    return {"status": "done"}
