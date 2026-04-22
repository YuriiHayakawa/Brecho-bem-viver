from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.report_user_schema import UserReportResponse
from app.services import report_user_service

router = APIRouter()


@router.get("/user/{user_id}", response_model=UserReportResponse, summary="Relatório do usuário")
def get_user_report(user_id: int, db: Session = Depends(get_db)):
    return report_user_service.get_user_report(db, user_id)