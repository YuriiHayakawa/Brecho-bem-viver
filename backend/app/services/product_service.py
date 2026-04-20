from datetime import datetime, timedelta
from typing import Optional

from fastapi import HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.user import User
from app.schemas.product_schema import ProductCreate, ProductUpdate, ProductResponse, ReserveRequest
from app.utils.pix import generate_pix_qrcode_png


def list_products(db: Session, user_id: Optional[int] = None) -> list[ProductResponse]:
    query = db.query(Product).filter(Product.active == True)

    if user_id is not None:
        query = query.filter(Product.id_user == user_id)

    return query.all()


def get_product(db: Session, product_id: int) -> ProductResponse:
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    return product


def reserve_product(db: Session, product_id: int, data: ReserveRequest) -> ProductResponse:
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    if product.status != "disponivel":
        raise HTTPException(status_code=400, detail="Produto não está disponível para reserva")

    user = db.query(User).filter(User.id == data.user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    product.status = "reservada"
    product.reserved_until = datetime.now() + timedelta(hours=48)
    product.reserved_by_user_id = data.user_id

    db.commit()
    db.refresh(product)

    return product


def get_pix_qrcode(db: Session, product_id: int) -> Response:
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    seller = db.query(User).filter(User.id == product.id_user).first()

    if not seller:
        raise HTTPException(status_code=404, detail="Vendedor não encontrado")

    png_bytes = generate_pix_qrcode_png(
        pix_key=seller.pix_key,
        pix_key_type=seller.pix_key_type,
        seller_name=seller.name,
    )

    return Response(content=png_bytes, media_type="image/png")


def create_product(db: Session, product_data: ProductCreate) -> ProductResponse:
    user = db.query(User).filter(User.id == product_data.id_user).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    new_product = Product(
        name=product_data.name,
        description=product_data.description,
        defect_description=product_data.defect_description,
        has_defect=bool(product_data.defect_description and product_data.defect_description.strip()),
        size=product_data.size,
        category=product_data.category,
        brand=product_data.brand,
        gender=product_data.gender,
        price=product_data.price,
        id_user=product_data.id_user
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    new_product.code = f"BZR-{new_product.id:04d}"
    db.commit()
    db.refresh(new_product)

    return new_product


def update_product(db: Session, product_id: int, data: ProductUpdate) -> ProductResponse:
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    update_data = data.model_dump(exclude_unset=True)

    if "defect_description" in update_data:
        defect_description = update_data["defect_description"]
        update_data["has_defect"] = bool(defect_description and defect_description.strip())

    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return product