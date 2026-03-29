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
        size=product.size,
        category=product.category,
        price=product.price,
        id_user=product.id_user
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product