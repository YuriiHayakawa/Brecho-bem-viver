from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps.auth_deps import get_current_user
from app.api.deps.auth_deps import require_admin
from app.models.user import User
from app.database import get_db
from app.schemas.product_schema import ProductCreate, ProductUpdate, ProductResponse, ReserveRequest
from app.schemas.product_label_schema import ProductLabelDataResponse
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


@router.patch("/{product_id}/reserve", response_model=ProductResponse)
def reserve_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return product_service.reserve_product(db, product_id, current_user)

@router.post("/", response_model=ProductResponse, summary="Criar Produto")
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return product_service.create_product(db, product, current_user)


@router.put("/{product_id}", response_model=ProductResponse, summary="Atualizar produto")
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return product_service.update_product(db, product_id, data, current_user)

@router.delete("/{product_id}", summary="Deletar produto")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return product_service.delete_product(db, product_id, current_user)

@router.get("/{product_id}/label-data",response_model=ProductLabelDataResponse,summary="Dados da etiqueta do produto")
def get_product_label_data(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return product_service.get_product_label_data(db, product_id)