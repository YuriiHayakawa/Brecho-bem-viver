from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.product_image_schema import ProductImageResponse
from app.services import product_image_service

router = APIRouter()


@router.get(
    "/products/{product_id}/images",
    response_model=list[ProductImageResponse],
    summary="Listar imagens de um produto"
)
def list_product_images(product_id: int, db: Session = Depends(get_db)):
    return product_image_service.list_product_images(db, product_id)


@router.post(
    "/products/{product_id}/images",
    response_model=ProductImageResponse,
    summary="Adicionar imagem a um produto"
)
def create_product_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    return product_image_service.create_product_image(db, product_id, file)