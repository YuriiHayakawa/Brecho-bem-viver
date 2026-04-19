from datetime import datetime, timedelta

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.models.user import User
from app.schemas.product_schema import ProductCreate, ProductUpdate, ProductResponse, ReserveRequest
from app.utils.pix import generate_pix_qrcode_png

router = APIRouter()


@router.get("/", response_model=list[ProductResponse], summary="Listar produtos")
def list_products(
    user_id: Optional[int] = Query(None, description="Filtrar por dono do produto"),
    db: Session = Depends(get_db),
):
    query = db.query(Product).filter(Product.active == True)
    if user_id is not None:
        query = query.filter(Product.id_user == user_id)
    return query.all()


@router.get("/{product_id}", response_model=ProductResponse, summary="Detalhe do produto")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return product


@router.patch("/{product_id}/reserve", response_model=ProductResponse, summary="Reservar produto")
def reserve_product(product_id: int, data: ReserveRequest, db: Session = Depends(get_db)):
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


@router.get("/{product_id}/pix-qrcode", summary="QR Code PIX do vendedor")
def get_pix_qrcode(product_id: int, db: Session = Depends(get_db)):
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


@router.post("/", response_model=ProductResponse, summary="Criar Produto")
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == product.id_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    new_product = Product(
        name=product.name,
        description=product.description,
        defect_description=product.defect_description,
        has_defect=bool(product.defect_description and product.defect_description.strip()),
        size=product.size,
        category=product.category,
        brand=product.brand,
        gender=product.gender,
        price=product.price,
        id_user=product.id_user
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    new_product.code = f"BZR-{new_product.id:04d}"
    db.commit()
    db.refresh(new_product)

    return new_product


@router.put("/{product_id}", response_model=ProductResponse, summary="Atualizar produto")
def update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product
