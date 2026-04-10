from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class SaleCreate(BaseModel):
    sale_value: Decimal
    buyer_name: str
    buyer_phone: str | None = None
    product_code: str


class SaleResponse(BaseModel):
    id: int
    sale_value: Decimal
    suggested_donation_value: Decimal
    buyer_name: str
    buyer_phone: str | None
    sale_date: datetime
    id_product: int

    product_name: str
    product_code: str | None
    seller_name: str

    model_config = {
        "from_attributes": True
    }