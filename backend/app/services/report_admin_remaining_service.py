from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.product_offer import ProductOffer
from app.models.sale import Sale
from app.models.user import User
from app.schemas.report_admin_remaining_schema import AdminRemainingProductItem


def get_admin_remaining_products(
    db: Session,
    search: str | None = None,
    status: str | None = None,
) -> list[AdminRemainingProductItem]:
    query = (
        db.query(Product, User)
        .join(User, User.id == Product.id_user)
        .filter(
            (Product.active.is_(True)) | (Product.status == "vendida")
        )
    )

    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(term),
                Product.code.ilike(term),
                User.name.ilike(term),
                Product.category.ilike(term),
            )
        )

    if status:
        query = query.filter(Product.status == status)

    rows = query.order_by(User.name.asc(), Product.created_at.desc()).all()

    product_ids = [product.id for product, _ in rows]

    # Contagem de ofertas por produto
    offers_count_map: dict[int, int] = {}
    # Valor da oferta aceita por produto (valor negociado)
    negotiated_map: dict[int, object] = {}
    # Valor da venda registrada por produto
    sale_value_map: dict[int, object] = {}
    # Nome do comprador registrado na venda, por produto
    sale_buyer_map: dict[int, object] = {}

    if product_ids:
        counts = (
            db.query(ProductOffer.product_id, func.count(ProductOffer.id))
            .filter(ProductOffer.product_id.in_(product_ids))
            .group_by(ProductOffer.product_id)
            .all()
        )
        offers_count_map = {pid: total for pid, total in counts}

        # Valor final negociado: se a oferta foi aceita via contraproposta,
        # prevalece o valor da contraproposta (counter_price); senão, o valor
        # originalmente ofertado pelo comprador.
        accepted = (
            db.query(
                ProductOffer.product_id,
                func.coalesce(ProductOffer.counter_price, ProductOffer.offered_price),
            )
            .filter(
                ProductOffer.product_id.in_(product_ids),
                ProductOffer.status == "accepted",
            )
            .all()
        )
        negotiated_map = {pid: price for pid, price in accepted}

        sales = (
            db.query(Sale.id_product, Sale.sale_value, Sale.buyer_name)
            .filter(Sale.id_product.in_(product_ids))
            .all()
        )
        sale_value_map = {pid: value for pid, value, _ in sales}
        sale_buyer_map = {pid: buyer_name for pid, _, buyer_name in sales}

    result = []

    for product, user in rows:
        offers_count = offers_count_map.get(product.id, 0)
        negotiated_value = negotiated_map.get(product.id)
        sale_value = sale_value_map.get(product.id)

        # Valor final: venda registrada tem prioridade; senão, valor negociado
        final_value = sale_value if sale_value is not None else negotiated_value

        # Comprador: se já foi vendido, o nome registrado na venda; senão,
        # se está reservado, quem está segurando a reserva agora (cobre tanto
        # reserva direta quanto reserva originada de oferta aceita).
        if product.status == "vendida":
            buyer_name = sale_buyer_map.get(product.id)
        elif product.status == "reservada" and product.reserved_by:
            buyer_name = product.reserved_by.name
        else:
            buyer_name = None

        result.append(
            AdminRemainingProductItem(
                product_id=product.id,
                product_code=product.code,
                product_name=product.name,
                seller_id=user.id,
                seller_name=user.name,
                price=product.price,
                category=product.category,
                status=product.status,
                created_at=product.created_at,
                offers_count=offers_count,
                has_offers=offers_count > 0,
                negotiated_value=negotiated_value,
                final_value=final_value,
                buyer_name=buyer_name,
            )
        )

    return result