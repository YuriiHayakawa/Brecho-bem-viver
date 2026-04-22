from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user_schema import UserCreate, UserResponse
from app.services import user_service

router = APIRouter()


@router.get("/", response_model=list[UserResponse], summary="Listar usuários")
def list_users(db: Session = Depends(get_db)):
    return user_service.list_users(db)


@router.post("/", response_model=UserResponse, summary="Criar usuário")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    return user_service.create_user(db, user)