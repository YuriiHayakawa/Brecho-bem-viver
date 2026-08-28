from datetime import datetime, timezone
from decimal import Decimal

from pydantic import BaseModel, field_serializer


class ProductCreate(BaseModel):
    name: str
    description: str
    defect_description: str | None = None
    size: str
    category: str
    brand: str
    gender: str
    price: Decimal


class ProductImageEmbed(BaseModel):
    id: int
    image_url: str
    is_cover: bool
    position: int

    model_config = {"from_attributes": True}


class SellerEmbed(BaseModel):
    id: int
    name: str
    pix_key: str
    pix_key_type: str

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
    qr_code_base64: str | None = None
    images: list[ProductImageEmbed] = []
    user: SellerEmbed | None = None

    model_config = {"from_attributes": True}

    # reserved_until é gravado internamente como UTC "sem tzinfo" (coluna
    # TIMESTAMP sem timezone). Sem marcar isso explicitamente aqui, o JSON sai
    # sem indicação de fuso e o navegador do usuário interpreta como horário
    # LOCAL dele — deslocando a contagem da reserva de 24h por horas a mais
    # (ex.: 27h em vez de 24h para quem está em UTC-3).
    @field_serializer("reserved_until")
    def _serialize_reserved_until(self, value: datetime | None) -> datetime | None:
        if value is not None and value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value


class ProductUpdate(BaseModel):
    name:               str | None = None
    description:        str | None = None
    defect_description: str | None = None
    has_defect:         bool | None = None
    size:               str | None = None
    category:           str | None = None
    brand:              str | None = None
    gender:             str | None = None
    price:              Decimal | None = None


class ReserveRequest(BaseModel):
    user_id: int
