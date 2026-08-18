from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..models import Measurement
from ..utils.units import get_unit


def get_forecast(
    db: Session,
    metric: str,
    n_points: int = 5
):

    metric = str(metric)


    records = (
        db.query(Measurement)
        .filter(Measurement.metric == metric)
        .order_by(desc(Measurement.recorded_at))
        .limit(n_points)
        .all()
    )


    if len(records) < 2:

        return {
            "metric": metric,
            "forecast": None,
            "unit": get_unit(metric),
            "based_on": len(records),
            "last_values": [],
            "last_update": None,
            "message": "Not enough data"
        }



    values = [
        record.value
        for record in reversed(records)
    ]



    forecast = sum(values) / len(values)



    last_measurement = records[0]



    return {

        "metric": metric,

        "forecast": round(forecast, 2),

        "unit": get_unit(metric),

        "based_on": len(values),

        "last_values": values,

        "last_update":
            last_measurement.recorded_at.isoformat()

    }