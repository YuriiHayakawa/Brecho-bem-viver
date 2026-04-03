from fastapi import APIRouter, Depends, HTTPException
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