from sqlalchemy import Column, Integer, String, TIMESTAMP, CheckConstraint, text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    role = Column(String(20), nullable=False)
    created_at = Column(TIMESTAMP, nullable=False, server_default=text("NOW()"))
    products = relationship("Product", back_populates="user")

    __table_args__ = (CheckConstraint("role IN ('admin', 'vendedor')", name="check_user_role"),)