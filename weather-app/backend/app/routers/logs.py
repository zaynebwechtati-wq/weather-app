from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import LogStatus
from ..services.logs_service import get_collector_logs


router = APIRouter(tags=["Logs"])


@router.get("/logs")
def collector_logs(
    limit: int = Query(50, ge=1, le=500),
    status: LogStatus | None = Query(None),
    db: Session = Depends(get_db),
):

    return get_collector_logs(
        db,
        limit=limit,
        status=status.value if status else None,
    )
