import cloudinary.uploader

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.product_image import ProductImage
from app.models.user import User
from app.schemas.product_image_schema import ProductImageResponse

import app.utils.cloudinary


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
    file: UploadFile,
    current_user: User
) -> ProductImageResponse:
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    if product.id_user != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Sem permissão para adicionar imagem")

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

    try:
        upload_result = cloudinary.uploader.upload(
            file.file,
            folder=f"bazar-interno/products/{product_id}",
            resource_type="image",
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Erro ao enviar imagem para a nuvem")

    image_url = upload_result.get("secure_url")
    cloudinary_public_id = upload_result.get("public_id")

    if not image_url or not cloudinary_public_id:
        raise HTTPException(status_code=500, detail="Erro ao obter dados da imagem enviada")

    new_image = ProductImage(
        product_id=product_id,
        image_url=image_url,
        cloudinary_public_id=cloudinary_public_id,
        is_cover=is_cover,
        position=next_position
    )

    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return new_image