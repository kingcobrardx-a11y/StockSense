from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.transaction import TransactionType


# Warehouse Schemas
class WarehouseBase(BaseModel):
    name: str = Field(..., min_length=1, description="Warehouse name")
    location: Optional[str] = Field(None, description="Physical location / address")


class WarehouseCreate(WarehouseBase):
    pass


class WarehouseResponse(WarehouseBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# Stock Schemas
class StockBase(BaseModel):
    product_id: int
    warehouse_id: int
    quantity: int = Field(0, description="Current stock quantity")


class StockUpdate(BaseModel):
    quantity: int = Field(..., description="Target or adjusted stock quantity")


class StockResponse(StockBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# Transaction Schemas
class TransactionBase(BaseModel):
    product_id: int
    warehouse_id: int
    type: TransactionType
    quantity: int = Field(..., gt=0, description="Quantity involved in the transaction")
    source_warehouse_id: Optional[int] = Field(None, description="Source warehouse for transfers")
    destination_warehouse_id: Optional[int] = Field(None, description="Destination warehouse for transfers")
    reference: Optional[str] = Field(None, description="Optional invoice, PO, or order reference")


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
