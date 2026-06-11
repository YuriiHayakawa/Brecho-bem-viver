from decimal import Decimal
from pydantic import BaseModel


class ProductLabelDataResponse(BaseModel):
    product_id: int
    product_code: str | None
    product_name: str
    price: Decimal
    seller_name: str
    pix_key: str
    pix_key_type: str
    qr_code_base64: str