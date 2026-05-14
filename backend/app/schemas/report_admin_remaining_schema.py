from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class AdminRemainingProductItem(BaseModel):
    product_id: int
    product_code: str | None
    product_name: str
    seller_id: int
    seller_name: str
    price: Decimal
    category: str
    status: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }