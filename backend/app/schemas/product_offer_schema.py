from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class ProductOfferCreate(BaseModel):
    offered_price: Decimal
    message: str | None = None


class OfferProductEmbed(BaseModel):
    id: int
    name: str
    code: str | None
    price: Decimal
    status: str

    model_config = {"from_attributes": True}


class OfferUserEmbed(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None = None

    model_config = {"from_attributes": True}


class ProductOfferResponse(BaseModel):
    id: int

    product_id: int
    buyer_user_id: int
    seller_user_id: int

    original_price: Decimal
    offered_price: Decimal

    message: str | None
    status: str

    responded_at: datetime | None
    created_at: datetime
    updated_at: datetime

    product: OfferProductEmbed | None = None
    buyer: OfferUserEmbed | None = None
    seller: OfferUserEmbed | None = None

    model_config = {"from_attributes": True}