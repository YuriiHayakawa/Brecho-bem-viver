from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.report_admin_schema import AdminSummaryResponse
import app.services.report_admin_service as report_admin_service

router = APIRouter()


@router.get("/summary", response_model=AdminSummaryResponse, summary="Resumo geral do admin")
def get_admin_summary(db: Session = Depends(get_db)):
    return report_admin_service.get_admin_summary(db)