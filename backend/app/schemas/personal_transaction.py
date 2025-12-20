from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal

from ..models.enums import EnumPersonalTransactionType
from .base import BaseSchema


class PersonalTransactionRead(BaseSchema):
    id: str
    date: date
    category: str
    subcategory: str | None = None
    amount: Decimal
    type: EnumPersonalTransactionType
    payment_method: str
    description: str
    memo: str | None = None
    hash: str
    created_at: datetime
    updated_at: datetime
    organization_id: str | None = None
