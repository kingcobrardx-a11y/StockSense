from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    """
    Create a new product.
    SKU must be unique.
    """
    existing_product = db.query(Product).filter(Product.sku == product_in.sku).first()
    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with SKU '{product_in.sku}' already exists."
        )

    product = Product(**product_in.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("", response_model=List[ProductResponse])
@router.get("/", response_model=List[ProductResponse], include_in_schema=False)
def get_products(db: Session = Depends(get_db)):
    """
    Retrieve all products.
    """
    products = db.query(Product).all()
    return products


@router.get("/{id}", response_model=ProductResponse)
def get_product(id: int, db: Session = Depends(get_db)):
    """
    Retrieve a single product by ID.
    Returns HTTP 404 if the product does not exist.
    """
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {id} not found."
        )
    return product


@router.put("/{id}", response_model=ProductResponse)
def update_product(id: int, product_in: ProductUpdate, db: Session = Depends(get_db)):
    """
    Update product details by ID.
    Returns HTTP 404 if the product does not exist.
    Returns HTTP 400 if updating to an existing SKU belonging to another product.
    """
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {id} not found."
        )

    # If SKU is being updated, verify it is not already taken by another product
    if product_in.sku is not None and product_in.sku != product.sku:
        existing_sku = db.query(Product).filter(
            Product.sku == product_in.sku,
            Product.id != id
        ).first()
        if existing_sku:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with SKU '{product_in.sku}' already exists."
            )

    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_product(id: int, db: Session = Depends(get_db)):
    """
    Delete a product by ID.
    Returns HTTP 404 if the product does not exist.
    """
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {id} not found."
        )

    db.delete(product)
    db.commit()
    return {"message": f"Product with ID {id} deleted successfully."}
