from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str
    pix_key: str
    pix_key_type: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    pix_key: str
    pix_key_type: str
    role: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }