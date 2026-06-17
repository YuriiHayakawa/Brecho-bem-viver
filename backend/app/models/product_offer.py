from sqlalchemy import Column, Integer, String, Numeric, TIMESTAMP, ForeignKey, CheckConstraint, Text, text
from sqlalchemy.orm import relationship

from app.database import Base


class ProductOffer(Base):
    __tablename__ = "product_offers"

    id = Column(Integer, primary_key=True)

    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    buyer_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    seller_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    original_price = Column(Numeric(10, 2), nullable=False)
    offered_price = Column(Numeric(10, 2), nullable=False)

    message = Column(Text, nullable=True)

    status = Column(String(20), nullable=False, server_default=text("'pending'"))

    responded_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, nullable=False, server_default=text("NOW()"))
    updated_at = Column(TIMESTAMP, nullable=False, server_default=text("NOW()"))

    product = relationship("Product")
    buyer = relationship("User", foreign_keys=[buyer_user_id])
    seller = relationship("User", foreign_keys=[seller_user_id])

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'accepted', 'rejected', 'cancelled')",
            name="check_product_offer_status"
        ),
    )