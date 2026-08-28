from datetime import datetime, timedelta

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.product_offer import ProductOffer
from app.models.user import User
from app.schemas.product_offer_schema import ProductOfferCreate, ProductOfferResponse, CounterOfferCreate
from app.services.product_service import release_expired_reservations, utc_now_naive


def create_offer(
    db: Session,
    product_id: int,
    data: ProductOfferCreate,
    current_user: User
) -> ProductOfferResponse:
    release_expired_reservations(db)

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    if product.id_user == current_user.id:
        raise HTTPException(status_code=400, detail="Você não pode fazer oferta no seu próprio produto")

    if product.active is False:
        raise HTTPException(status_code=400, detail="Produto inativo")

    if product.status == "vendida":
        raise HTTPException(status_code=400, detail="Produto já vendido")

    if product.status == "reservada":
        raise HTTPException(status_code=400, detail="Produto já reservado")

    if data.offered_price <= 0:
        raise HTTPException(status_code=400, detail="Valor da oferta deve ser maior que zero")
    
    if data.offered_price >= product.price:
        raise HTTPException(status_code=400,detail="A oferta deve ser menor que o valor do produto")

    existing_pending_offer = (
        db.query(ProductOffer)
        .filter(
            ProductOffer.product_id == product.id,
            ProductOffer.buyer_user_id == current_user.id,
            ProductOffer.status == "pending"
        )
        .first()
    )

    if existing_pending_offer:
        raise HTTPException(status_code=400, detail="Você já possui uma oferta pendente para este produto")

    new_offer = ProductOffer(
        product_id=product.id,
        buyer_user_id=current_user.id,
        seller_user_id=product.id_user,
        original_price=product.price,
        offered_price=data.offered_price,
        message=data.message,
        status="pending",
    )

    db.add(new_offer)
    db.commit()
    db.refresh(new_offer)

    return new_offer


def list_sent_offers(db: Session, current_user: User) -> list[ProductOfferResponse]:
    return (
        db.query(ProductOffer)
        .filter(ProductOffer.buyer_user_id == current_user.id)
        .order_by(ProductOffer.created_at.desc())
        .all()
    )


def list_received_offers(db: Session, current_user: User) -> list[ProductOfferResponse]:
    return (
        db.query(ProductOffer)
        .filter(ProductOffer.seller_user_id == current_user.id)
        .order_by(ProductOffer.created_at.desc())
        .all()
    )


def list_all_offers(db: Session) -> list[ProductOfferResponse]:
    return (
        db.query(ProductOffer)
        .order_by(ProductOffer.created_at.desc())
        .all()
    )


def get_accepted_offer_for_product(db: Session, product_id: int) -> ProductOfferResponse:
    offer = (
        db.query(ProductOffer)
        .filter(
            ProductOffer.product_id == product_id,
            ProductOffer.status == "accepted",
        )
        .order_by(ProductOffer.responded_at.desc())
        .first()
    )

    if not offer:
        raise HTTPException(status_code=404, detail="Nenhuma oferta aceita para este produto")

    return offer


def accept_offer(db: Session, offer_id: int, current_user: User) -> ProductOfferResponse:
    release_expired_reservations(db)

    offer = db.query(ProductOffer).filter(ProductOffer.id == offer_id).first()

    if not offer:
        raise HTTPException(status_code=404, detail="Oferta não encontrada")

    if offer.seller_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Sem permissão para aceitar esta oferta")

    if offer.status != "pending":
        raise HTTPException(status_code=400, detail="Esta oferta não está pendente")

    product = offer.product

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    if product.status != "disponivel":
        raise HTTPException(status_code=400, detail="Produto não está disponível")

    offer.status = "accepted"
    offer.responded_at = datetime.now()
    offer.updated_at = datetime.now()

    product.status = "reservada"
    product.reserved_by_user_id = offer.buyer_user_id
    product.reserved_until = utc_now_naive() + timedelta(hours=24)

    other_pending_offers = (
        db.query(ProductOffer)
        .filter(
            ProductOffer.product_id == product.id,
            ProductOffer.id != offer.id,
            ProductOffer.status.in_(["pending", "countered"])
        )
        .all()
    )

    for other_offer in other_pending_offers:
        other_offer.status = "rejected"
        other_offer.responded_at = datetime.now()
        other_offer.updated_at = datetime.now()

    db.commit()
    db.refresh(offer)

    return offer


def counter_offer(
    db: Session,
    offer_id: int,
    data: CounterOfferCreate,
    current_user: User
) -> ProductOfferResponse:
    offer = db.query(ProductOffer).filter(ProductOffer.id == offer_id).first()

    if not offer:
        raise HTTPException(status_code=404, detail="Oferta não encontrada")

    if offer.seller_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Sem permissão para contrapropor esta oferta")

    if offer.status != "pending":
        raise HTTPException(status_code=400, detail="Esta oferta não está pendente")

    if data.counter_price <= 0:
        raise HTTPException(status_code=400, detail="Valor da contraproposta deve ser maior que zero")

    if data.counter_price >= offer.original_price:
        raise HTTPException(status_code=400, detail="A contraproposta deve ser menor que o valor anunciado")

    offer.counter_price = data.counter_price
    offer.counter_message = data.message
    offer.status = "countered"
    offer.updated_at = datetime.now()

    db.commit()
    db.refresh(offer)

    return offer


def respond_to_counter(
    db: Session,
    offer_id: int,
    accept: bool,
    current_user: User
) -> ProductOfferResponse:
    release_expired_reservations(db)

    offer = db.query(ProductOffer).filter(ProductOffer.id == offer_id).first()

    if not offer:
        raise HTTPException(status_code=404, detail="Oferta não encontrada")

    if offer.buyer_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sem permissão para responder a esta contraproposta")

    if offer.status != "countered":
        raise HTTPException(status_code=400, detail="Esta oferta não possui contraproposta pendente")

    if not accept:
        offer.status = "rejected"
        offer.responded_at = datetime.now()
        offer.updated_at = datetime.now()
        db.commit()
        db.refresh(offer)
        return offer

    product = offer.product

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    # Como a contraproposta não bloqueia o produto, ele pode ter sido
    # reservado/vendido por outro caminho enquanto o comprador decidia.
    if product.status != "disponivel":
        raise HTTPException(status_code=400, detail="Produto não está mais disponível")

    offer.status = "accepted"
    offer.responded_at = datetime.now()
    offer.updated_at = datetime.now()

    product.status = "reservada"
    product.reserved_by_user_id = offer.buyer_user_id
    product.reserved_until = utc_now_naive() + timedelta(hours=24)

    other_pending_offers = (
        db.query(ProductOffer)
        .filter(
            ProductOffer.product_id == product.id,
            ProductOffer.id != offer.id,
            ProductOffer.status.in_(["pending", "countered"])
        )
        .all()
    )

    for other_offer in other_pending_offers:
        other_offer.status = "rejected"
        other_offer.responded_at = datetime.now()
        other_offer.updated_at = datetime.now()

    db.commit()
    db.refresh(offer)

    return offer


def reject_offer(db: Session, offer_id: int, current_user: User) -> ProductOfferResponse:
    offer = db.query(ProductOffer).filter(ProductOffer.id == offer_id).first()

    if not offer:
        raise HTTPException(status_code=404, detail="Oferta não encontrada")

    if offer.seller_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Sem permissão para recusar esta oferta")

    if offer.status != "pending":
        raise HTTPException(status_code=400, detail="Esta oferta não está pendente")

    offer.status = "rejected"
    offer.responded_at = datetime.now()
    offer.updated_at = datetime.now()

    db.commit()
    db.refresh(offer)

    return offer