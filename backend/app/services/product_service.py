from datetime import datetime, timedelta
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.user import User
from app.schemas.product_schema import ProductCreate, ProductUpdate, ProductResponse
from app.schemas.product_label_schema import ProductLabelDataResponse
from app.utils.pix import generate_pix_qrcode_base64


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


def build_product_response(product: Product) -> ProductResponse:
    qr_code_base64 = None

    if product.user and product.user.pix_key and product.user.pix_key_type:
        qr_code_base64 = generate_pix_qrcode_base64(
            pix_key=product.user.pix_key,
            pix_key_type=product.user.pix_key_type,
            seller_name=product.user.name,
        )

    return ProductResponse(
        id=product.id,
        name=product.name,
        description=product.description,
        has_defect=product.has_defect,
        defect_description=product.defect_description,
        size=product.size,
        category=product.category,
        brand=product.brand,
        gender=product.gender,
        price=product.price,
        status=product.status,
        active=product.active,
        code=product.code,
        reserved_until=product.reserved_until,
        reserved_by_user_id=product.reserved_by_user_id,
        created_at=product.created_at,
        id_user=product.id_user,
        qr_code_base64=qr_code_base64,
        images=product.images,
        user=product.user,
    )


def list_products(db: Session, user_id: Optional[int] = None) -> list[ProductResponse]:
    release_expired_reservations(db)

    query = db.query(Product).filter(
        (Product.active == True) | (Product.status == "vendida")
    )

    if user_id is not None:
        query = query.filter(Product.id_user == user_id)

    return query.all()

def list_my_reservations(db: Session, current_user: User) -> list[ProductResponse]:
    release_expired_reservations(db)

    products = (
        db.query(Product)
        .filter(
            Product.reserved_by_user_id == current_user.id,
            Product.status == "reservada",
            Product.active == True
        )
        .all()
    )

    return products


def get_product(db: Session, product_id: int) -> ProductResponse:
    release_expired_reservations(db)

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    return build_product_response(product)


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


def create_product(
    db: Session,
    product_data: ProductCreate,
    current_user: User
) -> ProductResponse:
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


def update_product(
    db: Session,
    product_id: int,
    data: ProductUpdate,
    current_user: User
) -> ProductResponse:
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

    seller = product.user

    if not seller:
        raise HTTPException(status_code=404, detail="Vendedor não encontrado")

    if not seller.pix_key or not seller.pix_key_type:
        raise HTTPException(status_code=422, detail="Vendedor sem chave PIX cadastrada")

    qr_code_base64 = generate_pix_qrcode_base64(
        pix_key=seller.pix_key,
        pix_key_type=seller.pix_key_type,
        seller_name=seller.name,
    )

    return ProductLabelDataResponse(
        product_id=product.id,
        product_code=product.code,
        product_name=product.name,
        price=product.price,
        seller_name=seller.name,
        pix_key=seller.pix_key,
        pix_key_type=seller.pix_key_type,
        qr_code_base64=qr_code_base64,
    )