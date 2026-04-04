import os
import shutil
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.models.product_image import ProductImage
from app.schemas.product_image_schema import ProductImageResponse

router = APIRouter()


@router.get(
    "/products/{product_id}/images",
    response_model=list[ProductImageResponse],
    summary="Listar imagens de um produto"
)
def list_product_images(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    images = (
        db.query(ProductImage)
        .filter(ProductImage.product_id == product_id)
        .order_by(ProductImage.position.asc())
        .all()
    )

    return images


@router.post(
    "/products/{product_id}/images",
    response_model=ProductImageResponse,
    summary="Adicionar imagem a um produto"
)
def create_product_image(product_id: int,file: UploadFile = File(...),db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    # validação de tipo
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="O arquivo enviado não é uma imagem")

    last_image = (
        db.query(ProductImage)
        .filter(ProductImage.product_id == product_id)
        .order_by(ProductImage.position.desc())
        .first()
    )

    next_position = 1 if not last_image else last_image.position + 1
    is_cover = next_position == 1

    # cria pasta do produto
    product_folder = os.path.join("uploads", "products", str(product_id))
    os.makedirs(product_folder, exist_ok=True)

    # gera nome único mantendo extensão
    original_extension = os.path.splitext(file.filename)[1] if file.filename else ""
    unique_filename = f"{uuid.uuid4()}{original_extension}"
    file_path = os.path.join(product_folder, unique_filename)

    # salva arquivo
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    image_url = f"/uploads/products/{product_id}/{unique_filename}"

    new_image = ProductImage(
        product_id=product_id,
        image_url=image_url,
        is_cover=is_cover,
        position=next_position
    )

    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return new_image