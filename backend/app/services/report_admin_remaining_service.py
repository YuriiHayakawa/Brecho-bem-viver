from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.product import Product
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

    result = []

    for product, user in rows:
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
            )
        )

    return result