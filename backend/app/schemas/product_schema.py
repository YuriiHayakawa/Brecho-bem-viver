from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class ProductCreate(BaseModel):
    name: str
    description: str
    size: str
    category: str
    price: Decimal
    id_user: int


class ProductResponse(BaseModel):
    id: int
    name: str
    description: str
    size: str
    category: str
    price: Decimal
    status: str
    active: bool
    code: str | None
    reserved_until: datetime | None
    created_at: datetime
    id_user: int

    model_config = {
        "from_attributes": True
    }