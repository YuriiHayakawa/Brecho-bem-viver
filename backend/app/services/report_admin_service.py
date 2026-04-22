from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.sale import Sale
from app.schemas.report_admin_schema import AdminSummaryResponse


def get_admin_summary(db: Session) -> AdminSummaryResponse:
    total_products = (
        db.query(func.count(Product.id))
        .scalar()
    ) or 0

    sold_products = (
        db.query(func.count(Product.id))
        .join(Sale, Sale.id_product == Product.id)
        .scalar()
    ) or 0

    remaining_products = (
        db.query(func.count(Product.id))
        .filter(Product.active.is_(True))
        .scalar()
    ) or 0

    sales_totals = (
        db.query(
            func.coalesce(func.sum(Sale.sale_value), 0),
            func.coalesce(func.sum(Sale.suggested_donation_value), 0),
        )
        .first()
    )

    total_sales_value = Decimal(str(sales_totals[0]))
    total_expected_donation = Decimal(str(sales_totals[1]))

    return AdminSummaryResponse(
        total_products=total_products,
        sold_products=sold_products,
        remaining_products=remaining_products,
        total_sales_value=total_sales_value,
        total_expected_donation=total_expected_donation,
    )