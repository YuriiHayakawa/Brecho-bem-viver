from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.models.sale import Sale
from app.schemas.sale_schema import SaleCreate, SaleResponse

router = APIRouter()

DONATION_PERCENTAGE = Decimal("0.10")


def build_sale_response(sale: Sale) -> SaleResponse:
    product = sale.product
    seller = product.user

    return SaleResponse(
        id=sale.id,
        sale_value=sale.sale_value,
        suggested_donation_value=sale.suggested_donation_value,
        buyer_name=sale.buyer_name,
        buyer_phone=sale.buyer_phone,
        sale_date=sale.sale_date,
        id_product=sale.id_product,
        product_name=product.name,
        product_code=product.code,
        seller_name=seller.name
    )


@router.get("/", response_model=list[SaleResponse], summary="Listar vendas")
def list_sales(db: Session = Depends(get_db)):
    sales = db.query(Sale).all()
    return [build_sale_response(sale) for sale in sales]


@router.post("/", response_model=SaleResponse, summary="Registrar venda")
def create_sale(sale: SaleCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.code == sale.product_code).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    if product.status == "vendida" or product.active is False:
        raise HTTPException(status_code=400, detail="Produto já vendido")

    existing_sale = db.query(Sale).filter(Sale.id_product == product.id).first()
    if existing_sale:
        raise HTTPException(status_code=400, detail="Já existe uma venda para este produto")

    suggested_donation_value = (sale.sale_value * DONATION_PERCENTAGE).quantize(Decimal("0.01"))

    new_sale = Sale(
        sale_value=sale.sale_value,
        suggested_donation_value=suggested_donation_value,
        buyer_name=sale.buyer_name,
        buyer_phone=sale.buyer_phone,
        id_product=product.id
    )

    product.status = "vendida"
    product.active = False

    db.add(new_sale)
    db.commit()
    db.refresh(new_sale)

    return build_sale_response(new_sale)