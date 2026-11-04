from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.product_offer import ProductOffer
from app.models.user import User
from app.schemas.product_schema import ProductCreate, ProductUpdate, ProductResponse
from app.schemas.product_label_schema import ProductLabelDataResponse
from app.utils.pix import generate_pix_qrcode_base64


def utc_now_naive() -> datetime:
    """Hora atual em UTC, sem tzinfo (a coluna reserved_until é TIMESTAMP sem
    timezone). Usar isso em vez de datetime.now() evita depender do fuso
    horário do servidor onde o backend está rodando (ex.: Railway roda em UTC,
    mas ambientes locais podem estar em outro fuso — misturar as duas
    referências fazia a reserva de 24h aparecer com horas a mais/menos)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def get_product_for_update(db: Session, product_id: int) -> Product | None:
    """Busca o produto travando a linha no banco até o commit/rollback.
    Requisições simultâneas sobre o mesmo produto (reservar, aceitar oferta,
    registrar venda...) passam a ser processadas uma de cada vez, e cada uma
    enxerga o status já gravado pela anterior — evita, por exemplo, duas pessoas
    receberem "reservado com sucesso" para a mesma peça. populate_existing
    recarrega o objeto caso ele já esteja carregado na sessão."""
    return (
        db.query(Product)
        .filter(Product.id == product_id)
        .with_for_update()
        .populate_existing()
        .first()
    )


def release_expired_reservations(db: Session):
    # UPDATE único com a condição de expiração no WHERE: se outra requisição
    # renovar a reserva do mesmo produto ao mesmo tempo, o Postgres reavalia a
    # condição antes de gravar e não sobrescreve a reserva nova.
    released = (
        db.query(Product)
        .filter(
            Product.status == "reservada",
            Product.reserved_until < utc_now_naive()
        )
        .update(
            {
                Product.status: "disponivel",
                Product.reserved_until: None,
                Product.reserved_by_user_id: None,
            },
            synchronize_session=False,
        )
    )

    if released:
        db.commit()


def is_reserved_via_offer(db: Session, product: Product) -> bool:
    """Indica se a reserva atual veio de uma proposta aceita (do mesmo comprador
    que está com a reserva) — essas reservas não podem ser canceladas pelo comprador."""
    if product.status != "reservada" or product.reserved_by_user_id is None:
        return False

    accepted_offer = (
        db.query(ProductOffer.id)
        .filter(
            ProductOffer.product_id == product.id,
            ProductOffer.buyer_user_id == product.reserved_by_user_id,
            ProductOffer.status == "accepted",
        )
        .first()
    )
    return accepted_offer is not None


def build_product_response(db: Session, product: Product) -> ProductResponse:
    qr_code_base64 = None

    if product.user and product.user.pix_key and product.user.pix_key_type:
        qr_code_base64 = generate_pix_qrcode_base64(
            pix_key=product.user.pix_key,
            pix_key_type=product.user.pix_key_type,
            seller_name=product.user.name,
        )

    return ProductResponse(
        id=product.id,
        name=product.name,
        description=product.description,
        has_defect=product.has_defect,
        defect_description=product.defect_description,
        size=product.size,
        category=product.category,
        brand=product.brand,
        gender=product.gender,
        price=product.price,
        status=product.status,
        active=product.active,
        code=product.code,
        reserved_until=product.reserved_until,
        reserved_by_user_id=product.reserved_by_user_id,
        reserved_via_offer=is_reserved_via_offer(db, product),
        created_at=product.created_at,
        id_user=product.id_user,
        qr_code_base64=qr_code_base64,
        images=product.images,
        user=product.user,
    )


def list_products(db: Session, user_id: Optional[int] = None) -> list[ProductResponse]:
    release_expired_reservations(db)

    query = db.query(Product).filter(
        (Product.active == True) | (Product.status == "vendida")
    )

    if user_id is not None:
        query = query.filter(Product.id_user == user_id)

    return query.all()

def list_my_reservations(db: Session, current_user: User) -> list[ProductResponse]:
    release_expired_reservations(db)

    products = (
        db.query(Product)
        .filter(
            Product.reserved_by_user_id == current_user.id,
            Product.status == "reservada",
            Product.active == True
        )
        .all()
    )

    # Informa por reserva se ela pode ser cancelada (as de proposta aceita não podem)
    return [
        ProductResponse.model_validate(product).model_copy(
            update={"reserved_via_offer": is_reserved_via_offer(db, product)}
        )
        for product in products
    ]


def get_product(db: Session, product_id: int) -> ProductResponse:
    release_expired_reservations(db)

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    return build_product_response(db, product)


def reserve_product(db: Session, product_id: int, current_user: User) -> ProductResponse:
    release_expired_reservations(db)

    product = get_product_for_update(db, product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    if product.id_user == current_user.id:
        raise HTTPException(status_code=400, detail="Você não pode reservar seu próprio produto")

    # active=False com status "disponivel" = anúncio removido (ainda acessível pelo link)
    if product.status != "disponivel" or not product.active:
        raise HTTPException(status_code=400, detail="Produto não disponível")

    product.status = "reservada"
    product.reserved_until = utc_now_naive() + timedelta(hours=24)
    product.reserved_by_user_id = current_user.id

    db.commit()
    db.refresh(product)

    # Resposta completa (com QR Code PIX): a tela usa esse retorno logo após
    # reservar, justamente quando o comprador vai pagar
    return build_product_response(db, product)


def cancel_reservation(db: Session, product_id: int, current_user: User) -> ProductResponse:
    release_expired_reservations(db)

    product = get_product_for_update(db, product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    if product.status != "reservada" or product.reserved_by_user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Você não tem uma reserva ativa neste produto")

    # Reserva originada de proposta aceita é um acordo fechado com o vendedor:
    # o comprador não pode desistir dela (só a reserva direta pode ser cancelada)
    if is_reserved_via_offer(db, product):
        raise HTTPException(
            status_code=400,
            detail="Reservas de propostas aceitas não podem ser canceladas",
        )

    product.status = "disponivel"
    product.reserved_until = None
    product.reserved_by_user_id = None

    db.commit()
    db.refresh(product)

    return build_product_response(db, product)


def create_product(
    db: Session,
    product_data: ProductCreate,
    current_user: User
) -> ProductResponse:
    new_product = Product(
        name=product_data.name,
        description=product_data.description,
        defect_description=product_data.defect_description,
        has_defect=bool(product_data.defect_description and product_data.defect_description.strip()),
        size=product_data.size,
        category=product_data.category,
        brand=product_data.brand,
        gender=product_data.gender,
        price=product_data.price,
        id_user=current_user.id
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    new_product.code = f"BZR-{new_product.id:04d}"
    db.commit()
    db.refresh(new_product)

    return new_product


def update_product(
    db: Session,
    product_id: int,
    data: ProductUpdate,
    current_user: User
) -> ProductResponse:
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    if product.id_user != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Você não tem permissão para editar este produto")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return product


def delete_product(db: Session, product_id: int, current_user: User):
    # Reserva vencida não deve bloquear a remoção
    release_expired_reservations(db)

    product = get_product_for_update(db, product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    if product.id_user != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Você não tem permissão para deletar este produto")

    # Vendida também fica inativa, por isso é checada antes de "já removido"
    if product.status == "vendida":
        raise HTTPException(status_code=400, detail="Produtos vendidos não podem ser removidos")

    if not product.active:
        raise HTTPException(status_code=400, detail="Este anúncio já foi removido")

    # O comprador pode já ter pago via PIX: a peça só pode ser removida depois
    # que a reserva terminar (venda registrada, cancelamento ou expiração)
    if product.status == "reservada":
        raise HTTPException(
            status_code=400,
            detail="Este produto está reservado e não pode ser removido enquanto a reserva estiver ativa",
        )

    product.active = False

    # Encerra as negociações em aberto — o anúncio não existe mais
    open_offers = (
        db.query(ProductOffer)
        .filter(
            ProductOffer.product_id == product.id,
            ProductOffer.status.in_(["pending", "countered"]),
        )
        .all()
    )
    for offer in open_offers:
        offer.status = "cancelled"
        offer.responded_at = datetime.now()
        offer.updated_at = datetime.now()

    db.commit()
    db.refresh(product)

    return {"message": "Produto removido com sucesso"}


def get_product_label_data(db: Session, product_id: int) -> ProductLabelDataResponse:
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    seller = product.user

    if not seller:
        raise HTTPException(status_code=404, detail="Vendedor não encontrado")

    if not seller.pix_key or not seller.pix_key_type:
        raise HTTPException(status_code=422, detail="Vendedor sem chave PIX cadastrada")

    qr_code_base64 = generate_pix_qrcode_base64(
        pix_key=seller.pix_key,
        pix_key_type=seller.pix_key_type,
        seller_name=seller.name,
    )

    return ProductLabelDataResponse(
        product_id=product.id,
        product_code=product.code,
        product_name=product.name,
        price=product.price,
        seller_name=seller.name,
        pix_key=seller.pix_key,
        pix_key_type=seller.pix_key_type,
        qr_code_base64=qr_code_base64,
    )