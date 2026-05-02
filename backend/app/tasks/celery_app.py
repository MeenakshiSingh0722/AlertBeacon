from celery import Celery
from celery.schedules import crontab
from app.config import settings

celery_app = Celery(
    "alertbeacon",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks.scheduled_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "run-pipeline-every-5-minutes": {
            "task": "app.tasks.scheduled_tasks.run_pipeline_task",
            "schedule": 300.0, # 5 minutes
        },
        "health-check-sources-every-15-minutes": {
            "task": "app.tasks.scheduled_tasks.health_check_sources_task",
            "schedule": 900.0, # 15 minutes
        },
        "cleanup-old-logs-daily": {
            "task": "app.tasks.scheduled_tasks.cleanup_old_logs_task",
            "schedule": crontab(hour=0, minute=0), # Daily at midnight
        },
        "retry-failed-alerts-every-30-minutes": {
            "task": "app.tasks.scheduled_tasks.retry_failed_alerts_task",
            "schedule": 1800.0, # 30 minutes
        }
    }
)
