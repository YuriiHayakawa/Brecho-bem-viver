from datetime import datetime
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.product_offer import ProductOffer
from app.models.sale import Sale
from app.schemas.sale_schema import SaleCreate, SaleResponse

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


def list_sales(db: Session) -> list[SaleResponse]:
    sales = db.query(Sale).all()
    return [build_sale_response(sale) for sale in sales]


def create_sale(db: Session, sale_data: SaleCreate) -> SaleResponse:
    # Trava o produto até o commit: cliques repetidos em "Confirmar venda" são
    # processados um de cada vez e os seguintes recebem "Produto já vendido".
    product = (
        db.query(Product)
        .filter(Product.code == sale_data.product_code)
        .with_for_update()
        .populate_existing()
        .first()
    )

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    if product.status == "vendida":
        raise HTTPException(status_code=400, detail="Produto já vendido")

    if product.active is False:
        raise HTTPException(status_code=400, detail="Produto inativo")

    existing_sale = db.query(Sale).filter(Sale.id_product == product.id).first()
    if existing_sale:
        raise HTTPException(status_code=400, detail="Já existe uma venda para este produto")

    suggested_donation_value = (
        sale_data.sale_value * DONATION_PERCENTAGE
    ).quantize(Decimal("0.01"))

    new_sale = Sale(
        sale_value=sale_data.sale_value,
        suggested_donation_value=suggested_donation_value,
        buyer_name=sale_data.buyer_name,
        buyer_phone=sale_data.buyer_phone,
        id_product=product.id
    )

    product.status = "vendida"
    product.active = False

    # Peça vendida: encerra as negociações que ainda estavam em aberto
    open_offers = (
        db.query(ProductOffer)
        .filter(
            ProductOffer.product_id == product.id,
            ProductOffer.status.in_(["pending", "countered"]),
        )
        .all()
    )
    for offer in open_offers:
        offer.status = "cancelled"
        offer.responded_at = datetime.now()
        offer.updated_at = datetime.now()

    db.add(new_sale)
    db.commit()
    db.refresh(new_sale)

    return build_sale_response(new_sale)