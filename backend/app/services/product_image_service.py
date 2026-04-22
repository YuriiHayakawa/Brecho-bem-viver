import os
import shutil
import uuid

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.product_image import ProductImage
from app.schemas.product_image_schema import ProductImageResponse


def list_product_images(db: Session, product_id: int) -> list[ProductImageResponse]:
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


def create_product_image(
    db: Session,
    product_id: int,
    file: UploadFile
) -> ProductImageResponse:
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

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

    product_folder = os.path.join("uploads", "products", str(product_id))
    os.makedirs(product_folder, exist_ok=True)

    original_extension = os.path.splitext(file.filename)[1] if file.filename else ""
    unique_filename = f"{uuid.uuid4()}{original_extension}"
    file_path = os.path.join(product_folder, unique_filename)

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