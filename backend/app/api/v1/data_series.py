import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.forecast_repo import DataSeriesRepository
from app.schemas.forecast import (
    DataSeriesCreate, DataSeriesUpdate, DataSeriesOut, PaginatedDataSeries,
    DataPointOut, BulkDataPointCreate,
)
from app.services.data_pipeline import parse_csv, detect_seasonality, summarize_series

router = APIRouter()


@router.get("", response_model=PaginatedDataSeries)
async def list_data_series(
    limit: int = 20, offset: int = 0, db: AsyncSession = Depends(get_db)
):
    repo = DataSeriesRepository(db)
    items, total = await repo.list_all(limit=limit, offset=offset)
    return {"items": items, "total": total, "limit": limit, "offset": offset}


@router.post("", response_model=DataSeriesOut, status_code=status.HTTP_201_CREATED)
async def create_data_series(body: DataSeriesCreate, db: AsyncSession = Depends(get_db)):
    from app.models.forecast import DataSeries
    repo = DataSeriesRepository(db)
    obj = DataSeries(**body.model_dump())
    return await repo.create(obj)


@router.get("/{series_id}", response_model=DataSeriesOut)
async def get_data_series(series_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = DataSeriesRepository(db)
    obj = await repo.get_by_id(series_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Data series not found")
    return obj


@router.patch("/{series_id}", response_model=DataSeriesOut)
async def update_data_series(
    series_id: uuid.UUID, body: DataSeriesUpdate, db: AsyncSession = Depends(get_db)
):
    repo = DataSeriesRepository(db)
    obj = await repo.get_by_id(series_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Data series not found")
    return await repo.update(obj, body.model_dump(exclude_none=True))


@router.delete("/{series_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_data_series(series_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = DataSeriesRepository(db)
    obj = await repo.get_by_id(series_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Data series not found")
    await repo.delete(obj)


@router.post("/{series_id}/points", response_model=list[DataPointOut])
async def add_data_points(
    series_id: uuid.UUID, body: BulkDataPointCreate, db: AsyncSession = Depends(get_db)
):
    repo = DataSeriesRepository(db)
    obj = await repo.get_by_id(series_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Data series not found")
    points = [p.model_dump() for p in body.data_points]
    return await repo.add_data_points(series_id, points)


@router.get("/{series_id}/points", response_model=list[DataPointOut])
async def get_data_points(series_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = DataSeriesRepository(db)
    obj = await repo.get_by_id(series_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Data series not found")
    return await repo.get_data_points(series_id)


@router.post("/{series_id}/import-csv")
async def import_csv(
    series_id: uuid.UUID,
    file: UploadFile = File(...),
    date_col: str = Form(default="date"),
    value_col: str = Form(default="value"),
    db: AsyncSession = Depends(get_db),
):
    repo = DataSeriesRepository(db)
    obj = await repo.get_by_id(series_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Data series not found")
    content = (await file.read()).decode("utf-8")
    points = parse_csv(content, date_col=date_col, value_col=value_col)
    if not points:
        raise HTTPException(status_code=422, detail="No valid data points parsed from CSV")
    await repo.add_data_points(series_id, points)
    values = [p["value"] for p in points]
    return {
        "imported": len(points),
        "summary": summarize_series(values),
        "seasonality": detect_seasonality(values),
    }


@router.get("/{series_id}/analyze")
async def analyze_series(series_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = DataSeriesRepository(db)
    obj = await repo.get_by_id(series_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Data series not found")
    points = await repo.get_data_points(series_id)
    values = [p.value for p in points]
    return {
        "summary": summarize_series(values),
        "seasonality": detect_seasonality(values),
    }
