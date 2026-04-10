from sqlalchemy import Column, Integer, String, Numeric, Boolean, TIMESTAMP, ForeignKey, CheckConstraint, Text, text
from sqlalchemy.orm import relationship
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    has_defect = Column(Boolean, nullable=False, server_default=text("FALSE"))
    defect_description = Column(Text, nullable=True)
    size = Column(String(10), nullable=False)
    category = Column(String(100), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    brand = Column(String(100), nullable=False)
    gender = Column(String(20), nullable=False)
    status = Column(String(20), nullable=False, server_default=text("'disponivel'"))
    active = Column(Boolean, nullable=False, server_default=text("TRUE"))
    code = Column(String(30), unique=True, nullable=True)
    reserved_until = Column(TIMESTAMP, nullable=True)
    reserved_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(TIMESTAMP, nullable=False, server_default=text("NOW()"))
    id_user = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="products", foreign_keys=[id_user])
    reserved_by = relationship("User", foreign_keys=[reserved_by_user_id])
    images = relationship("ProductImage", back_populates="product")
    sale = relationship("Sale", back_populates="product", uselist=False)

    __table_args__ = (
        CheckConstraint("status IN ('disponivel', 'reservada', 'vendida')", name="check_product_status"),
    )
