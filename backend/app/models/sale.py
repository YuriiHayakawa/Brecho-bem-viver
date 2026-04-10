from sqlalchemy import Column, Integer, Numeric, TIMESTAMP, ForeignKey, String, text
from sqlalchemy.orm import relationship
from app.database import Base


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True)
    sale_value = Column(Numeric(10, 2), nullable=False)
    suggested_donation_value = Column(Numeric(10, 2), nullable=False)
    buyer_name = Column(String(150), nullable=False)
    buyer_phone = Column(String(20), nullable=True)
    sale_date = Column(TIMESTAMP, nullable=False, server_default=text("NOW()"))
    id_product = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), unique=True, nullable=False)

    product = relationship("Product", back_populates="sale")