from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps.auth_deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.report_user_schema import UserReportResponse
import app.services.report_user_service as report_user_service

router = APIRouter()


@router.get("/me", response_model=UserReportResponse, summary="Meu relatório")
def get_my_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return report_user_service.get_user_report(db, current_user.id)