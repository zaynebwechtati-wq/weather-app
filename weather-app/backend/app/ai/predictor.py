from sqlalchemy.orm import Session
import numpy as np
from statsmodels.tsa.holtwinters import ExponentialSmoothing

from ..models import Measurement


def predict_weather(
    db: Session,
    metric: str,
    future_step: int = 1
):

    records = (
        db.query(Measurement)
        .filter(
            Measurement.metric == metric
        )
        .order_by(
            Measurement.recorded_at.asc()
        )
        .all()
    )

    # Not enough data
    if len(records) < 5:

        return {
            "metric": metric,
            "prediction": None,
            "message": "Not enough data"
        }

    # Get measurement values
    values = np.array(
        [
            r.value
            for r in records
        ],
        dtype=float
    )

    try:

        # Holt Exponential Smoothing
        model = ExponentialSmoothing(
            values,
            trend="add",
            seasonal=None,
            initialization_method="estimated"
        )

        fitted_model = model.fit(
            optimized=True
        )

        # Forecast
        forecast = fitted_model.forecast(
            future_step
        )

        prediction = forecast[
            future_step - 1
        ]

        return {
            "metric": metric,
            "prediction": round(
                float(prediction),
                2
            ),
            "model": "Holt Exponential Smoothing",
            "trained_on": len(values)
        }

    except Exception as error:

        return {
            "metric": metric,
            "prediction": None,
            "message": f"Prediction error: {str(error)}"
        }