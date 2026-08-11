from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class MetricName(str, Enum):
    """Metrics collected from Open-Meteo and stored in `measurements`."""

    TEMPERATURE = "temperature"

    HUMIDITY = "humidity"

    WINDSPEED = "windspeed"

    PRESSURE = "pressure"


class LogStatus(str, Enum):
    """Terminal statuses written by the collector (see collector.save_weather)."""

    SUCCESS = "success"

    ERROR = "error"


class ForecastRequest(BaseModel):

    metric: MetricName = MetricName.TEMPERATURE

    n_points: int = Field(
        default=5,
        ge=2,
        le=100,
        description="How many recent measurements feed the moving average"
    )


class AnomalyRequest(BaseModel):

    metric: MetricName = MetricName.TEMPERATURE

    threshold: float = Field(
        default=2.0,
        gt=0,
        le=10,
        description="Absolute z-score above which a point is an anomaly"
    )


class MeasurementResponse(BaseModel):

    metric: str

    value: float

    recorded_at: datetime

    class Config:

        from_attributes = True



class ForecastResponse(BaseModel):

    metric: str

    forecast: float

    based_on: int

    last_values: list[float]



class HealthResponse(BaseModel):

    status: str

    service: str

    time: datetime