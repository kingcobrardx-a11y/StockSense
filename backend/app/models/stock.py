from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class Stock(Base):
    """Stores the current stock quantity of a product in a specific warehouse."""
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity = Column(Integer, default=0, nullable=False)

    __table_args__ = (
        UniqueConstraint("product_id", "warehouse_id", name="uq_product_warehouse_stock"),
    )

    # Relationships
    product = relationship("Product", back_populates="stocks")
    warehouse = relationship("Warehouse", back_populates="stocks")
