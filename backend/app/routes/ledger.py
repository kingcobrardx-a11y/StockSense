from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.models.warehouse import Warehouse
from app.models.stock import Stock
from app.models.transaction import Transaction, TransactionType
from app.schemas.inventory import TransactionCreate, TransactionResponse

router = APIRouter(prefix="/ledger", tags=["Ledger"])


@router.get("/transactions", response_model=List[TransactionResponse])
def get_transactions(
    product_id: Optional[int] = None,
    warehouse_id: Optional[int] = None,
    type: Optional[TransactionType] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Retrieve audit ledger transactions with optional filters."""
    query = db.query(Transaction)
    if product_id is not None:
        query = query.filter(Transaction.product_id == product_id)
    if warehouse_id is not None:
        query = query.filter(Transaction.warehouse_id == warehouse_id)
    if type is not None:
        query = query.filter(Transaction.type == type.value)

    return query.order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/transactions", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def record_transaction(tx_in: TransactionCreate, db: Session = Depends(get_db)):
    """
    Record an inventory transaction in the audit log and update current stock levels atomically.
    Transaction types: RECEIPT, DELIVERY, TRANSFER, ADJUSTMENT.
    """
    # Verify product exists
    product = db.query(Product).filter(Product.id == tx_in.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {tx_in.product_id} not found."
        )

    # Verify warehouse exists
    warehouse = db.query(Warehouse).filter(Warehouse.id == tx_in.warehouse_id).first()
    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Warehouse with ID {tx_in.warehouse_id} not found."
        )

    # Fetch or initialize current stock record
    stock = db.query(Stock).filter(
        Stock.product_id == tx_in.product_id,
        Stock.warehouse_id == tx_in.warehouse_id,
    ).first()

    if not stock:
        stock = Stock(product_id=tx_in.product_id, warehouse_id=tx_in.warehouse_id, quantity=0)
        db.add(stock)

    # Apply inventory logic based on transaction type
    if tx_in.type == TransactionType.RECEIPT:
        stock.quantity += tx_in.quantity

    elif tx_in.type == TransactionType.DELIVERY:
        if stock.quantity < tx_in.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock in warehouse {tx_in.warehouse_id}. Available: {stock.quantity}, requested: {tx_in.quantity}."
            )
        stock.quantity -= tx_in.quantity

    elif tx_in.type == TransactionType.ADJUSTMENT:
        # For adjustment, tx_in.quantity sets or updates current stock count
        stock.quantity = tx_in.quantity

    elif tx_in.type == TransactionType.TRANSFER:
        if not tx_in.destination_warehouse_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="destination_warehouse_id is required for TRANSFER transaction."
            )
        dest_warehouse = db.query(Warehouse).filter(Warehouse.id == tx_in.destination_warehouse_id).first()
        if not dest_warehouse:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Destination warehouse with ID {tx_in.destination_warehouse_id} not found."
            )
        if stock.quantity < tx_in.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock to transfer. Available: {stock.quantity}, requested: {tx_in.quantity}."
            )

        # Deduct from source warehouse
        stock.quantity -= tx_in.quantity

        # Add to destination warehouse
        dest_stock = db.query(Stock).filter(
            Stock.product_id == tx_in.product_id,
            Stock.warehouse_id == tx_in.destination_warehouse_id,
        ).first()
        if not dest_stock:
            dest_stock = Stock(
                product_id=tx_in.product_id,
                warehouse_id=tx_in.destination_warehouse_id,
                quantity=0
            )
            db.add(dest_stock)
        dest_stock.quantity += tx_in.quantity

    # Create audit record
    tx_record = Transaction(
        product_id=tx_in.product_id,
        warehouse_id=tx_in.warehouse_id,
        type=tx_in.type.value if hasattr(tx_in.type, "value") else str(tx_in.type),
        quantity=tx_in.quantity,
        source_warehouse_id=tx_in.source_warehouse_id or tx_in.warehouse_id,
        destination_warehouse_id=tx_in.destination_warehouse_id,
        reference=tx_in.reference,
    )
    db.add(tx_record)
    db.commit()
    db.refresh(tx_record)

    return tx_record
