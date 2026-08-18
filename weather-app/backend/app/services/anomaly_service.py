from sqlalchemy.orm import Session
from sqlalchemy import desc
import pandas as pd

from ..models import Measurement
from ..utils.units import get_unit


def get_anomalies(
    db: Session,
    metric: str = "temperature",
    threshold: float = 2.0
):

    metric = str(metric)


    # Get last 50 measurements
    records = (
        db.query(Measurement)
        .filter(Measurement.metric == metric)
        .order_by(desc(Measurement.recorded_at))
        .limit(50)
        .all()
    )


    # Not enough data
    if len(records) < 5:
        return {
            "metric": metric,
            "unit": get_unit(metric),
            "threshold": threshold,
            "mean": None,
            "std": None,
            "total_points": len(records),
            "anomalies": [],
            "message": "Not enough data"
        }


    # Create dataframe
    df = pd.DataFrame(
        [
            {
                "value": r.value,
                "recorded_at": r.recorded_at
            }
            for r in records
        ]
    )


    mean = df["value"].mean()
    std = df["value"].std()


    # Avoid division by zero
    if std == 0 or pd.isna(std):

        return {
            "metric": metric,
            "unit": get_unit(metric),
            "threshold": threshold,
            "mean": round(float(mean),2),
            "std": 0,
            "total_points": len(records),
            "anomalies": []
        }



    anomalies = []


    # Calculate z-score
    for _, row in df.iterrows():

        z_score = (row["value"] - mean) / std


        if abs(z_score) > threshold:

            anomalies.append(
                {
                    "value": row["value"],
                    "recorded_at": row["recorded_at"].isoformat(),
                    "z_score": round(float(z_score),2)
                }
            )



    return {

        "metric": metric,

        "unit": get_unit(metric),

        "threshold": threshold,

        "mean": round(float(mean),2),

        "std": round(float(std),2),

        "total_points": len(records),

        "anomalies": anomalies[-10:]

    }