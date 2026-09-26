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
    TransferCreate,
    AdjustmentCreate,
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


# ==========================================
# Inventory Operations: Transfers & Adjustments
# ==========================================

@router.post(
    "/inventory/transfers",
    response_model=InventoryOperationResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Inventory Operations"],
    summary="Create an inventory transfer",
)
@router.post(
    "/transfers",
    response_model=InventoryOperationResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Inventory Operations"],
    include_in_schema=False,
)
def create_transfer(transfer_in: TransferCreate, db: Session = Depends(get_db)):
    """
    Record an inventory transfer between two warehouses:
    1. Validates that product exists.
    2. Validates that source and destination warehouses exist.
    3. Validates that source and destination warehouses are different.
    4. Validates that quantity > 0.
    5. Validates that source stock exists and has sufficient quantity.
    6. Decreases source warehouse stock by quantity.
    7. Finds or creates destination stock row and increases it by quantity.
    8. Creates a Transaction record with type TRANSFER.
    9. Commits atomically or rolls back on any error.
    """
    # 1. Validate product
    product = db.query(Product).filter(Product.id == transfer_in.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {transfer_in.product_id} not found."
        )

    # 2. Validate source warehouse
    source_warehouse = db.query(Warehouse).filter(Warehouse.id == transfer_in.source_warehouse_id).first()
    if not source_warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Source warehouse with ID {transfer_in.source_warehouse_id} not found."
        )

    # 3. Validate destination warehouse
    destination_warehouse = db.query(Warehouse).filter(Warehouse.id == transfer_in.destination_warehouse_id).first()
    if not destination_warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Destination warehouse with ID {transfer_in.destination_warehouse_id} not found."
        )

    # 4. Source and destination warehouses must be different
    if transfer_in.source_warehouse_id == transfer_in.destination_warehouse_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Source and destination warehouses must be different."
        )

    # 5. Validate quantity
    if transfer_in.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than 0."
        )

    try:
        # 6. Find source stock record
        source_stock = db.query(Stock).filter(
            Stock.product_id == transfer_in.product_id,
            Stock.warehouse_id == transfer_in.source_warehouse_id,
        ).first()

        if not source_stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No stock record found for product '{product.name}' in source warehouse '{source_warehouse.name}'."
            )

        # 7. Check sufficient available stock in source warehouse
        if source_stock.quantity < transfer_in.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}' in source warehouse '{source_warehouse.name}'. Available: {source_stock.quantity}, requested: {transfer_in.quantity}."
            )

        # 8. Decrease source warehouse stock by quantity
        source_stock.quantity -= transfer_in.quantity

        # 9. Find or create destination stock row and increase by quantity
        destination_stock = db.query(Stock).filter(
            Stock.product_id == transfer_in.product_id,
            Stock.warehouse_id == transfer_in.destination_warehouse_id,
        ).first()

        if not destination_stock:
            destination_stock = Stock(
                product_id=transfer_in.product_id,
                warehouse_id=transfer_in.destination_warehouse_id,
                quantity=transfer_in.quantity,
            )
            db.add(destination_stock)
        else:
            destination_stock.quantity += transfer_in.quantity

        # 10. Create audit transaction record
        tx = Transaction(
            product_id=transfer_in.product_id,
            warehouse_id=transfer_in.source_warehouse_id,
            type=TransactionType.TRANSFER.value,
            quantity=transfer_in.quantity,
            source_warehouse_id=transfer_in.source_warehouse_id,
            destination_warehouse_id=transfer_in.destination_warehouse_id,
            reference=transfer_in.reference,
        )
        db.add(tx)

        # 11. Atomically commit
        db.commit()
        db.refresh(source_stock)
        db.refresh(destination_stock)
        db.refresh(tx)

        return InventoryOperationResponse(
            message=f"Successfully transferred {transfer_in.quantity} units of '{product.name}' from '{source_warehouse.name}' to '{destination_warehouse.name}'.",
            stock=StockDetailResponse(
                id=source_stock.id,
                product_id=product.id,
                product_name=product.name,
                sku=product.sku,
                warehouse_id=source_warehouse.id,
                warehouse_name=source_warehouse.name,
                quantity=source_stock.quantity,
            ),
            destination_stock=StockDetailResponse(
                id=destination_stock.id,
                product_id=product.id,
                product_name=product.name,
                sku=product.sku,
                warehouse_id=destination_warehouse.id,
                warehouse_name=destination_warehouse.name,
                quantity=destination_stock.quantity,
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
            detail=f"Failed to process transfer: {str(exc)}"
        )


@router.post(
    "/inventory/adjustments",
    response_model=InventoryOperationResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Inventory Operations"],
    summary="Create an inventory adjustment",
)
@router.post(
    "/adjustments",
    response_model=InventoryOperationResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Inventory Operations"],
    include_in_schema=False,
)
def create_adjustment(adjustment_in: AdjustmentCreate, db: Session = Depends(get_db)):
    """
    Record an inventory adjustment:
    1. Validates that product exists.
    2. Validates that warehouse exists.
    3. Validates that adjustment quantity != 0.
    4. Validates that stock record exists.
    5. Calculates new_stock = current_stock + adjustment_quantity.
    6. Rejects operation if new_stock < 0.
    7. Updates stock quantity.
    8. Creates a Transaction record with type ADJUSTMENT.
    9. Commits atomically or rolls back on any error.
    """
    # 1. Validate product
    product = db.query(Product).filter(Product.id == adjustment_in.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {adjustment_in.product_id} not found."
        )

    # 2. Validate warehouse
    warehouse = db.query(Warehouse).filter(Warehouse.id == adjustment_in.warehouse_id).first()
    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Warehouse with ID {adjustment_in.warehouse_id} not found."
        )

    # 3. Validate quantity cannot be 0
    if adjustment_in.quantity == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Adjustment quantity cannot be 0."
        )

    try:
        # 4. Stock row must exist
        stock = db.query(Stock).filter(
            Stock.product_id == adjustment_in.product_id,
            Stock.warehouse_id == adjustment_in.warehouse_id,
        ).first()

        if not stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No stock record found for product '{product.name}' in warehouse '{warehouse.name}'."
            )

        # 5 & 6. Calculate new_stock and reject if negative
        new_stock = stock.quantity + adjustment_in.quantity
        if new_stock < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Adjustment of {adjustment_in.quantity} would result in negative stock ({new_stock}). Current stock is {stock.quantity}."
            )

        # 7. Update stock quantity
        stock.quantity = new_stock

        # 8. Create audit transaction record
        tx = Transaction(
            product_id=adjustment_in.product_id,
            warehouse_id=adjustment_in.warehouse_id,
            type=TransactionType.ADJUSTMENT.value,
            quantity=adjustment_in.quantity,
            reference=adjustment_in.reference,
        )
        db.add(tx)

        # 9. Atomically commit
        db.commit()
        db.refresh(stock)
        db.refresh(tx)

        return InventoryOperationResponse(
            message=f"Successfully adjusted stock for '{product.name}' in '{warehouse.name}' by {adjustment_in.quantity:+d} units (new quantity: {stock.quantity}).",
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
            detail=f"Failed to process adjustment: {str(exc)}"
        )
