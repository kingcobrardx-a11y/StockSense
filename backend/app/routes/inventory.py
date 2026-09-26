from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.product import Product
from app.models.warehouse import Warehouse
from app.models.stock import Stock
from app.models.transaction import Transaction, TransactionType
from app.schemas.inventory import (
    WarehouseCreate,
    WarehouseResponse,
    StockDetailResponse,
    ReceiptCreate,
    DeliveryCreate,
    InventoryOperationResponse,
    TransactionResponse,
)

router = APIRouter()


# ==========================================
# Warehouse APIs
# ==========================================

@router.post(
    "/warehouses",
    response_model=WarehouseResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Warehouses"],
    summary="Create a warehouse",
)
@router.post(
    "/inventory/warehouses",
    response_model=WarehouseResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Warehouses"],
    include_in_schema=False,
)
def create_warehouse(warehouse_in: WarehouseCreate, db: Session = Depends(get_db)):
    """
    Create a new warehouse.
    - **name**: Required name of the warehouse
    - **location**: Optional location / address
    """
    warehouse = Warehouse(**warehouse_in.model_dump())
    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)
    return warehouse


@router.get(
    "/warehouses",
    response_model=List[WarehouseResponse],
    tags=["Warehouses"],
    summary="Get all warehouses",
)
@router.get(
    "/inventory/warehouses",
    response_model=List[WarehouseResponse],
    tags=["Warehouses"],
    include_in_schema=False,
)
def get_warehouses(db: Session = Depends(get_db)):
    """Return all warehouses."""
    return db.query(Warehouse).all()


@router.get(
    "/warehouses/{warehouse_id}",
    response_model=WarehouseResponse,
    tags=["Warehouses"],
    summary="Get warehouse by ID",
)
@router.get(
    "/inventory/warehouses/{warehouse_id}",
    response_model=WarehouseResponse,
    tags=["Warehouses"],
    include_in_schema=False,
)
def get_warehouse(warehouse_id: int, db: Session = Depends(get_db)):
    """
    Return one warehouse by ID.
    Returns HTTP 404 if not found.
    """
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Warehouse with ID {warehouse_id} not found."
        )
    return warehouse


# ==========================================
# Stock APIs
# ==========================================

@router.get(
    "/stock",
    response_model=List[StockDetailResponse],
    tags=["Stock"],
    summary="Get current stock for all products and warehouses",
)
@router.get(
    "/inventory/stock",
    response_model=List[StockDetailResponse],
    tags=["Stock"],
    include_in_schema=False,
)
def get_all_stock(db: Session = Depends(get_db)):
    """
    Return current stock for all products and warehouses.
    Includes stock id, product id, product name, SKU, warehouse id, warehouse name, and quantity.
    """
    stocks = (
        db.query(Stock)
        .options(joinedload(Stock.product), joinedload(Stock.warehouse))
        .all()
    )
    return [
        StockDetailResponse(
            id=s.id,
            product_id=s.product_id,
            product_name=s.product.name if s.product else "Unknown",
            sku=s.product.sku if s.product else "Unknown",
            warehouse_id=s.warehouse_id,
            warehouse_name=s.warehouse.name if s.warehouse else "Unknown",
            quantity=s.quantity,
        )
        for s in stocks
    ]


@router.get(
    "/stock/{product_id}",
    response_model=List[StockDetailResponse],
    tags=["Stock"],
    summary="Get stock for a specific product across all warehouses",
)
@router.get(
    "/inventory/stock/{product_id}",
    response_model=List[StockDetailResponse],
    tags=["Stock"],
    include_in_schema=False,
)
def get_stock_by_product(product_id: int, db: Session = Depends(get_db)):
    """
    Return stock for the specified product across all warehouses.
    Returns HTTP 404 if the product does not exist.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found."
        )

    stocks = (
        db.query(Stock)
        .options(joinedload(Stock.product), joinedload(Stock.warehouse))
        .filter(Stock.product_id == product_id)
        .all()
    )
    return [
        StockDetailResponse(
            id=s.id,
            product_id=s.product_id,
            product_name=s.product.name if s.product else product.name,
            sku=s.product.sku if s.product else product.sku,
            warehouse_id=s.warehouse_id,
            warehouse_name=s.warehouse.name if s.warehouse else "Unknown",
            quantity=s.quantity,
        )
        for s in stocks
    ]


# ==========================================
# Inventory Operations: Receipts & Deliveries
# ==========================================

@router.post(
    "/inventory/receipts",
    response_model=InventoryOperationResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Inventory Operations"],
    summary="Create an inventory receipt",
)
@router.post(
    "/receipts",
    response_model=InventoryOperationResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Inventory Operations"],
    include_in_schema=False,
)
def create_receipt(receipt_in: ReceiptCreate, db: Session = Depends(get_db)):
    """
    Record an inventory receipt:
    1. Validates that product and warehouse exist.
    2. Validates quantity > 0.
    3. Finds or creates the Stock record and increases current stock quantity.
    4. Creates a Transaction record with type RECEIPT.
    5. Commits atomically.
    """
    # 1. Validate product
    product = db.query(Product).filter(Product.id == receipt_in.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {receipt_in.product_id} not found."
        )

    # 2. Validate warehouse
    warehouse = db.query(Warehouse).filter(Warehouse.id == receipt_in.warehouse_id).first()
    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Warehouse with ID {receipt_in.warehouse_id} not found."
        )

    # 3. Validate quantity
    if receipt_in.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than 0."
        )

    try:
        # 4 & 5 & 6. Find or create stock record and increase quantity
        stock = db.query(Stock).filter(
            Stock.product_id == receipt_in.product_id,
            Stock.warehouse_id == receipt_in.warehouse_id,
        ).first()

        if not stock:
            stock = Stock(
                product_id=receipt_in.product_id,
                warehouse_id=receipt_in.warehouse_id,
                quantity=receipt_in.quantity,
            )
            db.add(stock)
        else:
            stock.quantity += receipt_in.quantity

        # 7. Create audit transaction record
        tx = Transaction(
            product_id=receipt_in.product_id,
            warehouse_id=receipt_in.warehouse_id,
            type=TransactionType.RECEIPT.value,
            quantity=receipt_in.quantity,
            reference=receipt_in.reference,
        )
        db.add(tx)

        # 8. Atomically commit
        db.commit()
        db.refresh(stock)
        db.refresh(tx)

        return InventoryOperationResponse(
            message=f"Successfully received {receipt_in.quantity} units of '{product.name}'.",
            stock=StockDetailResponse(
                id=stock.id,
                product_id=product.id,
                product_name=product.name,
                sku=product.sku,
                warehouse_id=warehouse.id,
                warehouse_name=warehouse.name,
                quantity=stock.quantity,
            ),
            transaction=TransactionResponse.model_validate(tx),
        )
    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process receipt: {str(exc)}"
        )


@router.post(
    "/inventory/deliveries",
    response_model=InventoryOperationResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Inventory Operations"],
    summary="Create an inventory delivery",
)
@router.post(
    "/deliveries",
    response_model=InventoryOperationResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Inventory Operations"],
    include_in_schema=False,
)
def create_delivery(delivery_in: DeliveryCreate, db: Session = Depends(get_db)):
    """
    Record an inventory delivery:
    1. Validates that product and warehouse exist.
    2. Validates quantity > 0.
    3. Finds stock record and checks for sufficient available stock.
    4. Decreases current stock quantity.
    5. Creates a Transaction record with type DELIVERY.
    6. Commits atomically.
    """
    # 1. Validate product
    product = db.query(Product).filter(Product.id == delivery_in.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {delivery_in.product_id} not found."
        )

    # 2. Validate warehouse
    warehouse = db.query(Warehouse).filter(Warehouse.id == delivery_in.warehouse_id).first()
    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Warehouse with ID {delivery_in.warehouse_id} not found."
        )

    # 3. Validate quantity
    if delivery_in.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than 0."
        )

    try:
        # 4 & 5. Find stock record
        stock = db.query(Stock).filter(
            Stock.product_id == delivery_in.product_id,
            Stock.warehouse_id == delivery_in.warehouse_id,
        ).first()

        if not stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No stock record found for product '{product.name}' in warehouse '{warehouse.name}'."
            )

        # 6. Check sufficient available stock
        if stock.quantity < delivery_in.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}'. Available: {stock.quantity}, requested: {delivery_in.quantity}."
            )

        # 7. Decrease stock quantity
        stock.quantity -= delivery_in.quantity

        # 8. Create audit transaction record
        tx = Transaction(
            product_id=delivery_in.product_id,
            warehouse_id=delivery_in.warehouse_id,
            type=TransactionType.DELIVERY.value,
            quantity=delivery_in.quantity,
            reference=delivery_in.reference,
        )
        db.add(tx)

        # 9. Atomically commit
        db.commit()
        db.refresh(stock)
        db.refresh(tx)

        return InventoryOperationResponse(
            message=f"Successfully delivered {delivery_in.quantity} units of '{product.name}'.",
            stock=StockDetailResponse(
                id=stock.id,
                product_id=product.id,
                product_name=product.name,
                sku=product.sku,
                warehouse_id=warehouse.id,
                warehouse_name=warehouse.name,
                quantity=stock.quantity,
            ),
            transaction=TransactionResponse.model_validate(tx),
        )
    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process delivery: {str(exc)}"
        )
