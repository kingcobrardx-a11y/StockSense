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
    quantity: int = Field(0, ge=0, description="Current stock quantity")


class StockUpdate(BaseModel):
    quantity: int = Field(..., ge=0, description="Target or adjusted stock quantity")


class StockResponse(StockBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class StockDetailResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    sku: str
    warehouse_id: int
    warehouse_name: str
    quantity: int

    model_config = ConfigDict(from_attributes=True)


# Transaction Schemas
class TransactionBase(BaseModel):
    product_id: int
    warehouse_id: int
    type: TransactionType
    quantity: int = Field(..., description="Quantity involved in the transaction")
    source_warehouse_id: Optional[int] = Field(None, description="Source warehouse for transfers")
    destination_warehouse_id: Optional[int] = Field(None, description="Destination warehouse for transfers")
    reference: Optional[str] = Field(None, description="Optional invoice, PO, or order reference")


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Inventory Operation Schemas (Receipt, Delivery, Transfer, Adjustment)
class ReceiptCreate(BaseModel):
    product_id: int = Field(..., description="ID of the product being received")
    warehouse_id: int = Field(..., description="ID of the warehouse receiving the stock")
    quantity: int = Field(..., gt=0, description="Quantity received, must be greater than 0")
    reference: Optional[str] = Field(None, description="Purchase order or delivery reference")


class DeliveryCreate(BaseModel):
    product_id: int = Field(..., description="ID of the product being delivered")
    warehouse_id: int = Field(..., description="ID of the warehouse fulfilling the delivery")
    quantity: int = Field(..., gt=0, description="Quantity delivered, must be greater than 0")
    reference: Optional[str] = Field(None, description="Sales order or delivery order reference")


class TransferCreate(BaseModel):
    product_id: int = Field(..., description="ID of the product being transferred")
    source_warehouse_id: int = Field(..., description="ID of the source warehouse")
    destination_warehouse_id: int = Field(..., description="ID of the destination warehouse")
    quantity: int = Field(..., description="Quantity to transfer, must be greater than 0")
    reference: Optional[str] = Field(None, description="Transfer reference")


class AdjustmentCreate(BaseModel):
    product_id: int = Field(..., description="ID of the product being adjusted")
    warehouse_id: int = Field(..., description="ID of the warehouse")
    quantity: int = Field(..., description="Adjustment quantity (positive or negative, cannot be 0)")
    reference: Optional[str] = Field(None, description="Adjustment reference")


class InventoryOperationResponse(BaseModel):
    message: str
    stock: StockDetailResponse
    transaction: TransactionResponse
    destination_stock: Optional[StockDetailResponse] = Field(None, description="Destination warehouse stock for transfers")

    model_config = ConfigDict(from_attributes=True)

