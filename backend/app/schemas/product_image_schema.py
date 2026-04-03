from datetime import datetime
from pydantic import BaseModel


class ProductImageResponse(BaseModel):
    id: int
    product_id: int
    image_url: str
    is_cover: bool
    position: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }