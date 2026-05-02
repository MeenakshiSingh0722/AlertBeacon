from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.agents.pipeline import pipeline_service
from typing import Dict, Any

from app.api.deps import require_admin

router = APIRouter(prefix="/pipeline", tags=["Pipeline"])

@router.post("/run-once")
async def run_pipeline_once(current_user: any = Depends(require_admin)):
    """
    Triggers a manual run of the data acquisition and analysis pipeline.
    Returns the processing summary once complete.
    """
    try:
        # Run the pipeline and wait for results to return summary as requested
        stats = await pipeline_service.run()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline execution failed: {str(e)}")

@router.get("/status")
async def get_pipeline_status():
    """
    Returns the current status of the pipeline (placeholder).
    """
    return {"status": "idle", "last_run": None}
