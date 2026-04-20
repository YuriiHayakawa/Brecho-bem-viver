from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user_schema import UserCreate, UserResponse


def list_users(db: Session) -> list[UserResponse]:
    return db.query(User).all()


def create_user(db: Session, user_data: UserCreate) -> UserResponse:
    existing_user = db.query(User).filter(User.email == user_data.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    if user_data.pix_key_type in ["cpf", "telefone"]:
        clean_pix_key = "".join(filter(str.isdigit, user_data.pix_key))
    else:
        clean_pix_key = user_data.pix_key.strip()

    if user_data.pix_key_type == "cpf" and len(clean_pix_key) != 11:
        raise HTTPException(status_code=400, detail="CPF inválido")

    if user_data.pix_key_type == "telefone" and len(clean_pix_key) not in [10, 11]:
        raise HTTPException(status_code=400, detail="Telefone inválido")

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=user_data.password,
        phone=user_data.phone,
        pix_key=clean_pix_key,
        pix_key_type=user_data.pix_key_type,
        role="user"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user