
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import ForecastRequest
from ..services.forecast_service import get_forecast

router = APIRouter(tags=["Forecast"])


@router.post("/forecast")
def forecast(
    payload: ForecastRequest,
    db: Session = Depends(get_db),
):
    return get_forecast(
        db,
        metric=payload.metric.value,
        n_points=payload.n_points,
    )
