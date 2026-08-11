from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import AnomalyRequest
from ..services.anomaly_service import get_anomalies


router = APIRouter(
    tags=["Anomalies"]
)



@router.post("/anomalies")
def anomalies(
    payload: AnomalyRequest,
    db: Session = Depends(get_db)
):

    return get_anomalies(
        db,
        metric=payload.metric.value,
        threshold=payload.threshold
    )
