from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps.auth_deps import require_admin
from app.database import get_db
from app.models.user import User
from app.schemas.report_admin_remaining_schema import AdminRemainingProductItem
import app.services.report_admin_remaining_service as report_admin_remaining_service

router = APIRouter()


@router.get(
    "/remaining-products",
    response_model=list[AdminRemainingProductItem],
    summary="Produtos restantes para o admin"
)
def get_admin_remaining_products(
    name: str | None = Query(None, description="Filtrar por nome do usuário"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return report_admin_remaining_service.get_admin_remaining_products(db, name)