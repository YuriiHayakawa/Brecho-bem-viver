from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.report_admin_user_schema import AdminUserReportItem
import app.services.report_admin_user_service as report_admin_user_service

router = APIRouter()


@router.get("/users", response_model=list[AdminUserReportItem], summary="Resumo por usuário para o admin")
def get_admin_users_report(
    name: str | None = Query(None, description="Filtrar por nome do usuário"),
    db: Session = Depends(get_db)
):
    return report_admin_user_service.get_admin_users_report(db, name)