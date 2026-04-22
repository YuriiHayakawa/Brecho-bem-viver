from decimal import Decimal
from pydantic import BaseModel


class AdminSummaryResponse(BaseModel):
    total_products: int
    sold_products: int
    remaining_products: int
    total_sales_value: Decimal
    total_expected_donation: Decimal