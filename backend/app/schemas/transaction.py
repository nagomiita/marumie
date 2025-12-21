from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any

from pydantic import field_validator

from ..models.enums import EnumTransactionType
from .base import BaseSchema


class TransactionRead(BaseSchema):
    id: str
    date: date
    category: str
    subcategory: str | None = None
    amount: Decimal
    type: EnumTransactionType
    payment_method: str
    description: str
    memo: str | None = None
    hash: str
    created_at: datetime
    updated_at: datetime
    organization_id: str | None = None

    @field_validator('category', mode='before')
    @classmethod
    def validate_category(cls, value: Any) -> str:
        """Categoryオブジェクトをnameとして変換"""
        if hasattr(value, 'name'):
            return value.name
        return str(value)
