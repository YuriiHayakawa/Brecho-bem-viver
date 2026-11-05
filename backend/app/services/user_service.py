from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user_schema import UserUpdate, UserResponse, UserRoleUpdate, PasswordChange
from app.core.security import hash_password, verify_password, generate_temporary_password
from app.utils.pix import normalize_pix_key
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserResponse

VALID_ROLES = {"admin", "vendedor", "user"}


def list_users(db: Session) -> list[UserResponse]:
    return db.query(User).all()


def find_user_by_email(db: Session, email: str, exclude_user_id: int | None = None) -> User | None:
    """Busca usuário pelo e-mail sem diferenciar maiúsculas/minúsculas."""
    query = db.query(User).filter(func.lower(User.email) == email.lower())
    if exclude_user_id is not None:
        query = query.filter(User.id != exclude_user_id)
    return query.first()


def create_user(db: Session, user_data: UserCreate) -> UserResponse:
    existing_user = find_user_by_email(db, user_data.email)

    if existing_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    try:
        clean_pix_key = normalize_pix_key(user_data.pix_key, user_data.pix_key_type)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    hashed_password = hash_password(user_data.password)

    new_user = User(
        name=user_data.name,
        email=user_data.email.lower(),
        password_hash=hashed_password,
        phone=user_data.phone,
        unit=user_data.unit,
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

    if update_data.get("email"):
        update_data["email"] = update_data["email"].lower()
        if find_user_by_email(db, update_data["email"], exclude_user_id=current_user.id):
            raise HTTPException(status_code=400, detail="Email já está em uso por outro usuário")

    # Valida a combinação chave + tipo sempre que qualquer um dos dois mudar
    # (trocar só o tipo também precisa revalidar a chave já cadastrada)
    if "pix_key" in update_data or "pix_key_type" in update_data:
        pix_key_type = update_data.get("pix_key_type") or current_user.pix_key_type
        pix_key = update_data.get("pix_key") or current_user.pix_key

        try:
            update_data["pix_key"] = normalize_pix_key(pix_key, pix_key_type)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        update_data["pix_key_type"] = pix_key_type

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

    # Validação de e-mail duplicado fica em update_current_user (vale para os dois caminhos)
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


# Mesmo mínimo exigido no cadastro (tela de criar conta)
MIN_PASSWORD_LENGTH = 6


def reset_password_by_admin(db: Session, user_id: int, current_admin: User) -> str:
    """Gera uma senha temporária para o usuário e devolve em texto puro — ela é
    mostrada uma única vez ao admin, que repassa à pessoa (só o hash fica salvo)."""
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if user.id == current_admin.id:
        raise HTTPException(
            status_code=400,
            detail="Para trocar a sua própria senha, use \"Alterar senha\" no Perfil",
        )

    temporary_password = generate_temporary_password()
    user.password_hash = hash_password(temporary_password)
    db.commit()

    return temporary_password


def change_own_password(db: Session, current_user: User, data: PasswordChange):
    # 400 (e não 401) na senha atual errada: o frontend trata todo 401 como
    # sessão expirada e deslogaria a pessoa
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")

    if len(data.new_password) < MIN_PASSWORD_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"A nova senha deve ter pelo menos {MIN_PASSWORD_LENGTH} caracteres",
        )

    if data.new_password == data.current_password:
        raise HTTPException(status_code=400, detail="A nova senha deve ser diferente da atual")

    current_user.password_hash = hash_password(data.new_password)
    db.commit()

    return {"message": "Senha alterada com sucesso"}