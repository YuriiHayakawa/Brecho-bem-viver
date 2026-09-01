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

    # Informações de ofertas / negociação
    offers_count: int = 0
    has_offers: bool = False
    negotiated_value: Decimal | None = None  # valor da oferta aceita
    final_value: Decimal | None = None       # venda registrada, senão valor negociado

    # Comprador: nome de quem comprou (venda registrada) ou, se ainda não
    # vendido, de quem está com a reserva ativa no momento
    buyer_name: str | None = None

    model_config = {
        "from_attributes": True
    }