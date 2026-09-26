from datetime import datetime, timezone
import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class TransactionType(str, enum.Enum):
    RECEIPT = "RECEIPT"
    DELIVERY = "DELIVERY"
    TRANSFER = "TRANSFER"
    ADJUSTMENT = "ADJUSTMENT"


class Transaction(Base):
    """Audit log/history of inventory movements and adjustments."""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False, index=True)
    type = Column(String, nullable=False)  # RECEIPT, DELIVERY, TRANSFER, ADJUSTMENT
    quantity = Column(Integer, nullable=False)
    source_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    destination_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    reference = Column(String, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    product = relationship("Product", back_populates="transactions")
    warehouse = relationship("Warehouse", foreign_keys=[warehouse_id])
    source_warehouse = relationship("Warehouse", foreign_keys=[source_warehouse_id])
    destination_warehouse = relationship("Warehouse", foreign_keys=[destination_warehouse_id])
