from datetime import datetime, timedelta
from typing import Optional

from fastapi import HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.product import Product
from app.models.user import User
from app.schemas.product_schema import ProductCreate, ProductUpdate, ProductResponse, ReserveRequest
from app.schemas.product_label_schema import ProductLabelDataResponse
from app.utils.pix import generate_pix_qrcode_png


def list_products(db: Session, user_id: Optional[int] = None) -> list[ProductResponse]:
    release_expired_reservations(db)

    query = db.query(Product).filter(
        (Product.active == True) | (Product.status == "vendida")
    )

    if user_id is not None:
        query = query.filter(Product.id_user == user_id)

    return query.all()


def get_product(db: Session, product_id: int) -> ProductResponse:
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    return product

def reserve_product(db: Session, product_id: int, current_user: User) -> ProductResponse:
    release_expired_reservations(db)

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    if product.status != "disponivel":
        raise HTTPException(status_code=400, detail="Produto não disponível")

    product.status = "reservada"
    product.reserved_until = datetime.now() + timedelta(hours=24)
    product.reserved_by_user_id = current_user.id

    db.commit()
    db.refresh(product)

    return product

def release_expired_reservations(db: Session):
    expired_products = (
        db.query(Product)
        .filter(
            Product.status == "reservada",
            Product.reserved_until < datetime.now()
        )
        .all()
    )

    for product in expired_products:
        product.status = "disponivel"
        product.reserved_until = None
        product.reserved_by_user_id = None

    if expired_products:
        db.commit()


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


def create_product(db: Session,product_data: ProductCreate,current_user: User) -> ProductResponse:

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
        id_user=current_user.id
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    new_product.code = f"BZR-{new_product.id:04d}"
    db.commit()
    db.refresh(new_product)

    return new_product


def update_product(db: Session,product_id: int,data: ProductUpdate,current_user: User) -> ProductResponse:

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    if product.id_user != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Você não tem permissão para editar este produto")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return product

def delete_product(db: Session, product_id: int, current_user: User):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    if product.id_user != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Você não tem permissão para deletar este produto")

    product.active = False
    db.commit()
    db.refresh(product)

    return {"message": "Produto removido com sucesso"}

def get_product_label_data(db: Session, product_id: int) -> ProductLabelDataResponse:
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    seller = db.query(User).filter(User.id == product.id_user).first()

    if not seller:
        raise HTTPException(status_code=404, detail="Vendedor não encontrado")

    return ProductLabelDataResponse(
        product_id=product.id,
        product_code=product.code,
        product_name=product.name,
        price=product.price,
        seller_name=seller.name,
        pix_key=seller.pix_key,
        pix_key_type=seller.pix_key_type,
        qr_code_url=f"/products/{product.id}/pix-qrcode"
    )