from sqlalchemy import Column, Integer, String, Numeric, Boolean, TIMESTAMP, ForeignKey, CheckConstraint, Text, text
from sqlalchemy.orm import relationship
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    size = Column(String(10), nullable=False)
    category = Column(String(100), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), nullable=False, server_default=text("'disponivel'"))
    active = Column(Boolean, nullable=False, server_default=text("TRUE"))
    code = Column(String(30), unique=True, nullable=True)
    reserved_until = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, nullable=False, server_default=text("NOW()"))
    id_user = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user = relationship("User", back_populates="products")
    images = relationship("ProductImage", back_populates="product")
    sale = relationship("Sale", back_populates="product", uselist=False)

    __table_args__ = (CheckConstraint("status IN ('disponivel', 'reservada', 'vendida')", name="check_product_status"),)