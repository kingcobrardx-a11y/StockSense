from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, description="Name of the product")
    sku: str = Field(..., min_length=1, description="Unique stock keeping unit")
    category: Optional[str] = Field(None, description="Product category")
    unit: Optional[str] = Field(None, description="Unit of measurement (e.g., pcs, kg, box)")
    reorder_level: Optional[int] = Field(0, ge=0, description="Minimum threshold before reordering")


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    reorder_level: Optional[int] = Field(None, ge=0)


class ProductResponse(ProductBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
