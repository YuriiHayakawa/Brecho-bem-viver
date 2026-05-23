from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user_schema import UserUpdate, UserResponse, UserRoleUpdate
from app.core.security import hash_password
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserResponse

VALID_ROLES = {"admin", "vendedor", "user"}


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

    hashed_password = hash_password(user_data.password)

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_password,
        phone=user_data.phone,
        pix_key=clean_pix_key,
        pix_key_type=user_data.pix_key_type,
        role="user"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

def update_current_user(db: Session,current_user: User,data: UserUpdate) -> UserResponse:
    update_data = data.model_dump(exclude_unset=True)

    if "pix_key_type" in update_data and update_data["pix_key_type"] not in ["cpf", "telefone", "email", "aleatoria"]:
        raise HTTPException(status_code=400, detail="Tipo de chave PIX inválido")

    if "pix_key" in update_data:
        pix_key_type = update_data.get("pix_key_type", current_user.pix_key_type)

        if pix_key_type in ["cpf", "telefone"]:
            clean_pix_key = "".join(filter(str.isdigit, update_data["pix_key"]))
        else:
            clean_pix_key = update_data["pix_key"].strip()

        if pix_key_type == "cpf" and len(clean_pix_key) != 11:
            raise HTTPException(status_code=400, detail="CPF inválido")

        if pix_key_type == "telefone" and len(clean_pix_key) not in [10, 11]:
            raise HTTPException(status_code=400, detail="Telefone inválido")

        update_data["pix_key"] = clean_pix_key

    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    return current_user


def update_user_by_admin(
    db: Session,
    user_id: int,
    data: UserUpdate
) -> UserResponse:
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    return update_current_user(db, user, data)

def delete_user_by_admin(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    db.delete(user)
    db.commit()

    return {"message": "Usuário deletado com sucesso"}


def update_user_role(db: Session, user_id: int, data: UserRoleUpdate) -> UserResponse:
    if data.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Role inválida. Use: {', '.join(VALID_ROLES)}")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    user.role = data.role
    db.commit()
    db.refresh(user)
    return user