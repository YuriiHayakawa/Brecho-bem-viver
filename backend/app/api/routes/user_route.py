from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps.auth_deps import get_current_user, require_admin
from app.database import get_db
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserResponse, UserUpdate
from app.services import user_service

router = APIRouter()


@router.get("/", response_model=list[UserResponse], summary="Listar usuários")
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return user_service.list_users(db)


@router.post("/", response_model=UserResponse, summary="Criar usuário")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    return user_service.create_user(db, user)


@router.get("/me", response_model=UserResponse, summary="Meu perfil")
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse, summary="Atualizar meu perfil")
def update_me(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return user_service.update_current_user(db, current_user, data)


@router.put("/{user_id}", response_model=UserResponse, summary="Admin atualizar usuário")
def update_user_by_admin(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return user_service.update_user_by_admin(db, user_id, data)

@router.delete("/{user_id}", summary="Admin deletar usuário")
def delete_user_by_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return user_service.delete_user_by_admin(db, user_id)