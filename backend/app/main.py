from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
import app.models  # noqa: F401 - ensure models are registered with Base.metadata
from app.routes import (
    products_router,
    inventory_router,
    dashboard_router,
    ledger_router,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("stocksense")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables for MVP if connection is available
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully.")
    except Exception as exc:
        logger.warning(
            "Database table creation skipped or failed on startup (%s). "
            "Ensure PostgreSQL is running and DATABASE_URL is valid.",
            exc,
        )
    yield


app = FastAPI(
    title="StockSense API",
    description="Modular Inventory Management System Backend for Hackathon MVP",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration for React frontend
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(products_router)
app.include_router(inventory_router)
app.include_router(dashboard_router)
app.include_router(ledger_router)


@app.get("/", tags=["Health"])
def health_check():
    """Root health check endpoint."""
    return {
        "status": "healthy",
        "service": "StockSense API",
        "version": "1.0.0",
        "docs_url": "/docs",
    }
