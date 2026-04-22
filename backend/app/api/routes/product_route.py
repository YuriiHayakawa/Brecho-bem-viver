from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.product_schema import ProductCreate, ProductUpdate, ProductResponse, ReserveRequest
from app.services import product_service

router = APIRouter()


@router.get("/", response_model=list[ProductResponse], summary="Listar produtos")
def list_products(
    user_id: Optional[int] = Query(None, description="Filtrar por dono do produto"),
    db: Session = Depends(get_db),
):
    return product_service.list_products(db, user_id)


@router.get("/{product_id}", response_model=ProductResponse, summary="Detalhe do produto")
def get_product(product_id: int, db: Session = Depends(get_db)):
    return product_service.get_product(db, product_id)


@router.patch("/{product_id}/reserve", response_model=ProductResponse, summary="Reservar produto")
def reserve_product(product_id: int, data: ReserveRequest, db: Session = Depends(get_db)):
    return product_service.reserve_product(db, product_id, data)


@router.get("/{product_id}/pix-qrcode", summary="QR Code PIX do vendedor")
def get_pix_qrcode(product_id: int, db: Session = Depends(get_db)):
    return product_service.get_pix_qrcode(db, product_id)


@router.post("/", response_model=ProductResponse, summary="Criar Produto")
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    return product_service.create_product(db, product)


@router.put("/{product_id}", response_model=ProductResponse, summary="Atualizar produto")
def update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db)):
    return product_service.update_product(db, product_id, data)