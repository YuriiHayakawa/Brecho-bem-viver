from decimal import Decimal

from sqlalchemy import func, case
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.product import Product
from app.models.sale import Sale
from app.schemas.report_admin_user_schema import AdminUserReportItem


def get_admin_users_report(db: Session, name: str | None = None) -> list[AdminUserReportItem]:
    query = (
        db.query(
            User.id.label("user_id"),
            User.name.label("user_name"),
            func.count(Product.id).label("total_products"),
            func.count(Sale.id).label("sold_products"),
            func.sum(
                case(
                    (Product.active.is_(True), 1),
                    else_=0
                )
            ).label("remaining_products"),
            func.coalesce(func.sum(Sale.sale_value), 0).label("total_sales_value"),
            func.coalesce(func.sum(Sale.suggested_donation_value), 0).label("total_expected_donation"),
        )
        .outerjoin(Product, Product.id_user == User.id)
        .outerjoin(Sale, Sale.id_product == Product.id)
    )

    if name:
        query = query.filter(User.name.ilike(f"%{name}%"))

    rows = (
        query
        .group_by(User.id, User.name)
        .order_by(User.name.asc())
        .all()
    )

    result = []

    for row in rows:
        result.append(
            AdminUserReportItem(
                user_id=row.user_id,
                user_name=row.user_name,
                total_products=row.total_products or 0,
                sold_products=row.sold_products or 0,
                remaining_products=row.remaining_products or 0,
                total_sales_value=Decimal(str(row.total_sales_value or 0)),
                total_expected_donation=Decimal(str(row.total_expected_donation or 0)),
            )
        )

    return result