import uuid
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, ConfigDict


class DataPointBase(BaseModel):
    date: date
    value: float


class DataPointCreate(DataPointBase):
    pass


class DataPointOut(DataPointBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    data_series_id: uuid.UUID
    created_at: datetime


class DataSeriesBase(BaseModel):
    name: str
    description: Optional[str] = None
    unit: str = "units"
    data_type: str = "demand"


class DataSeriesCreate(DataSeriesBase):
    pass


class DataSeriesUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    unit: Optional[str] = None
    data_type: Optional[str] = None


class DataSeriesOut(DataSeriesBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    data_points: list[DataPointOut] = []


class ForecastPointOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    forecast_id: uuid.UUID
    date: date
    value: float
    lower_bound: float
    upper_bound: float


class ForecastBase(BaseModel):
    name: str
    model_type: str = "ensemble"
    horizon_months: int = 12


class ForecastCreate(ForecastBase):
    data_series_id: Optional[uuid.UUID] = None


class ForecastUpdate(BaseModel):
    name: Optional[str] = None
    model_type: Optional[str] = None
    horizon_months: Optional[int] = None
    status: Optional[str] = None


class ForecastOut(ForecastBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    data_series_id: Optional[uuid.UUID] = None
    status: str
    mape: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    forecast_points: list[ForecastPointOut] = []


class PaginatedDataSeries(BaseModel):
    items: list[DataSeriesOut]
    total: int
    limit: int
    offset: int


class PaginatedForecasts(BaseModel):
    items: list[ForecastOut]
    total: int
    limit: int
    offset: int


class BulkDataPointCreate(BaseModel):
    data_points: list[DataPointCreate]


class RunForecastRequest(BaseModel):
    data_series_id: uuid.UUID
    model_type: str = "ensemble"
    horizon_months: int = 12
    name: Optional[str] = None
