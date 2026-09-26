from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.warehouse import Warehouse
from app.models.stock import Stock
from app.schemas.inventory import (
    WarehouseCreate,
    WarehouseResponse,
    StockResponse,
)

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("/warehouses", response_model=List[WarehouseResponse])
def get_warehouses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all warehouses."""
    return db.query(Warehouse).offset(skip).limit(limit).all()


@router.post("/warehouses", response_model=WarehouseResponse, status_code=status.HTTP_201_CREATED)
def create_warehouse(warehouse_in: WarehouseCreate, db: Session = Depends(get_db)):
    """Create a new warehouse."""
    warehouse = Warehouse(**warehouse_in.model_dump())
    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)
    return warehouse


@router.get("/stock", response_model=List[StockResponse])
def get_all_stock(product_id: int = None, warehouse_id: int = None, db: Session = Depends(get_db)):
    """Get current stock levels, optionally filtered by product_id or warehouse_id."""
    query = db.query(Stock)
    if product_id is not None:
        query = query.filter(Stock.product_id == product_id)
    if warehouse_id is not None:
        query = query.filter(Stock.warehouse_id == warehouse_id)
    return query.all()
