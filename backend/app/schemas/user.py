from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str
    role: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    role: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }