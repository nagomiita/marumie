from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict

from .models.enums import (
    OrganizationType,
    PersonalTransactionType,
    UserRole,
)


class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class UserRead(BaseSchema):
    id: str
    auth_id: str
    email: str
    role: UserRole
    created_at: datetime
    updated_at: datetime


class OrganizationCreate(BaseSchema):
    name: str
    display_name: str
    description: str | None = None
    type: OrganizationType
    slug: str
    user_id: str | None = None
    settings: dict[str, Any] | None = None


class OrganizationRead(BaseSchema):
    id: str
    name: str
    display_name: str
    description: str | None = None
    type: OrganizationType
    slug: str
    user_id: str | None = None
    settings: dict[str, Any] | None = None
    created_at: datetime
    updated_at: datetime


class PersonalTransactionRead(BaseSchema):
    id: str
    date: date
    category: str
    subcategory: str | None = None
    amount: Decimal
    type: PersonalTransactionType
    payment_method: str
    description: str
    memo: str | None = None
    hash: str
    created_at: datetime
    updated_at: datetime
    organization_id: str | None = None
