from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.api.deps.auth_deps import get_current_user
from app.core.security import create_access_token, verify_password
from app.database import get_db
from app.models.user import User
from app.schemas.auth_schema import TokenResponse
from app.schemas.user_schema import UserResponse

router = APIRouter()
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/login", response_model=TokenResponse, summary="Login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha inválidos"
        )

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha inválidos"
        )

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
        }
    )

    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserResponse, summary="Usuário autenticado")
def read_me(current_user: User = Depends(get_current_user)):
    return current_user