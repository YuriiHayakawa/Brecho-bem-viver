from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user_schema import UserResponse

router = APIRouter()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/login", response_model=UserResponse, summary="Login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos")

    # TODO: usar bcrypt para comparar hash (ex: bcrypt.checkpw)
    if user.password_hash != data.password:
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos")

    return user
