from app.routes.products import router as products_router
from app.routes.inventory import router as inventory_router
from app.routes.dashboard import router as dashboard_router
from app.routes.ledger import router as ledger_router

__all__ = [
    "products_router",
    "inventory_router",
    "dashboard_router",
    "ledger_router",
]
