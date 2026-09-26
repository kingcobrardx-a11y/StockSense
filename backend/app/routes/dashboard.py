from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.product import Product
from app.models.warehouse import Warehouse
from app.models.stock import Stock

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Return top-level inventory KPIs for the dashboard."""
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_warehouses = db.query(func.count(Warehouse.id)).scalar() or 0
    total_stock_units = db.query(func.coalesce(func.sum(Stock.quantity), 0)).scalar() or 0

    # Low stock query: products where total quantity across all warehouses <= product.reorder_level
    # In an MVP foundation, return summary counts
    return {
        "total_products": total_products,
        "total_warehouses": total_warehouses,
        "total_stock_units": total_stock_units,
    }
