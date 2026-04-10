from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class ProductCreate(BaseModel):
    name: str
    description: str
    defect_description: str | None = None
    size: str
    category: str
    brand: str
    gender: str
    price: Decimal
    id_user: int


class ProductImageEmbed(BaseModel):
    id: int
    image_url: str
    is_cover: bool
    position: int

    model_config = {"from_attributes": True}


class ProductResponse(BaseModel):
    id: int
    name: str
    description: str
    has_defect: bool
    defect_description: str | None
    size: str
    category: str
    brand: str
    gender: str
    price: Decimal
    status: str
    active: bool
    code: str | None
    reserved_until: datetime | None
    reserved_by_user_id: int | None
    created_at: datetime
    id_user: int
    images: list[ProductImageEmbed] = []

    model_config = {"from_attributes": True}


class ReserveRequest(BaseModel):
    user_id: int
