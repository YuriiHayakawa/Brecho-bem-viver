from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.product import Product
from app.models.sale import Sale
from app.schemas.report_user_schema import UserReportResponse


def get_user_report(db: Session, user_id: int) -> UserReportResponse:
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    total_products = (
        db.query(func.count(Product.id))
        .filter(Product.id_user == user_id)
        .scalar()
    ) or 0

    sold_products = (
        db.query(func.count(Product.id))
        .join(Sale, Sale.id_product == Product.id)
        .filter(Product.id_user == user_id)
        .scalar()
    ) or 0

    remaining_products = (
        db.query(func.count(Product.id))
        .filter(
            Product.id_user == user_id,
            Product.active.is_(True)
        )
        .scalar()
    ) or 0

    sales_totals = (
        db.query(
            func.coalesce(func.sum(Sale.sale_value), 0),
            func.coalesce(func.sum(Sale.suggested_donation_value), 0),
        )
        .join(Product, Product.id == Sale.id_product)
        .filter(Product.id_user == user_id)
        .first()
    )

    total_sales_value = Decimal(str(sales_totals[0]))
    total_expected_donation = Decimal(str(sales_totals[1]))

    return UserReportResponse(
        user_id=user.id,
        user_name=user.name,
        total_products=total_products,
        sold_products=sold_products,
        remaining_products=remaining_products,
        total_sales_value=total_sales_value,
        total_expected_donation=total_expected_donation,
    )