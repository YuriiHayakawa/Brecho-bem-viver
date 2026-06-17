from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps.auth_deps import get_current_user, require_admin
from app.database import get_db
from app.models.user import User
from app.schemas.product_offer_schema import ProductOfferCreate, ProductOfferResponse
from app.services import product_offer_service

router = APIRouter()


@router.post(
    "/products/{product_id}/offers",
    response_model=ProductOfferResponse,
    summary="Criar oferta para produto"
)
def create_offer(
    product_id: int,
    data: ProductOfferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return product_offer_service.create_offer(db, product_id, data, current_user)


@router.get(
    "/offers/sent",
    response_model=list[ProductOfferResponse],
    summary="Minhas ofertas enviadas"
)
def list_sent_offers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return product_offer_service.list_sent_offers(db, current_user)


@router.get(
    "/offers/received",
    response_model=list[ProductOfferResponse],
    summary="Ofertas recebidas"
)
def list_received_offers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return product_offer_service.list_received_offers(db, current_user)


@router.get(
    "/offers",
    response_model=list[ProductOfferResponse],
    summary="Admin listar todas as ofertas"
)
def list_all_offers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return product_offer_service.list_all_offers(db)


@router.patch(
    "/offers/{offer_id}/accept",
    response_model=ProductOfferResponse,
    summary="Aceitar oferta"
)
def accept_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return product_offer_service.accept_offer(db, offer_id, current_user)


@router.patch(
    "/offers/{offer_id}/reject",
    response_model=ProductOfferResponse,
    summary="Recusar oferta"
)
def reject_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return product_offer_service.reject_offer(db, offer_id, current_user)