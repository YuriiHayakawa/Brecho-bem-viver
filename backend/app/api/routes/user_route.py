from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserResponse

router = APIRouter()


@router.get("/", response_model=list[UserResponse], summary="Listar usuários")
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@router.post("/", response_model=UserResponse, summary="Criar usuário")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    # Limpar máscara
    if user.pix_key_type in ["cpf", "telefone"]:
        clean_pix_key = "".join(filter(str.isdigit, user.pix_key))
    else:
        clean_pix_key = user.pix_key.strip()

    if user.pix_key_type == "cpf" and len(clean_pix_key) != 11:
        raise HTTPException(status_code=400, detail="CPF inválido")

    if user.pix_key_type == "telefone" and len(clean_pix_key) not in [10, 11]:
        raise HTTPException(status_code=400, detail="Telefone inválido")

    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=user.password,
        phone=user.phone,
        pix_key=clean_pix_key,
        pix_key_type=user.pix_key_type,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user