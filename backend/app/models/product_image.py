from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, ForeignKey, text
from sqlalchemy.orm import relationship

from app.database import Base


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(255), nullable=False)
    cloudinary_public_id = Column(String(255), nullable=False)
    is_cover = Column(Boolean, nullable=False, server_default=text("FALSE"))
    position = Column(Integer, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False, server_default=text("NOW()"))

    product = relationship("Product", back_populates="images")