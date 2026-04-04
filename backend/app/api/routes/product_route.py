from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.models.user import User
from app.schemas.product_schema import ProductCreate, ProductResponse

router = APIRouter()

@router.get("/", response_model=list[ProductResponse], summary="Listar produtos")
def list_products(db: Session = Depends(get_db)):
    return db.query(Product).all()

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