from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict

from .models.enums import OrganizationType, PersonalTransactionType, TransactionType, UserRole


class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class UserRead(BaseSchema):
    id: str
    auth_id: str
    email: str
    role: UserRole
    created_at: datetime
    updated_at: datetime


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


class PoliticalOrganizationRead(BaseSchema):
    id: int
    display_name: str
    description: str | None = None
    slug: str
    org_name: str | None = None
    created_at: datetime
    updated_at: datetime


class BalanceSnapshotRead(BaseSchema):
    id: int
    political_organization_id: int
    snapshot_date: date
    balance: Decimal
    created_at: datetime
    updated_at: datetime


class TransactionRead(BaseSchema):
    id: int
    political_organization_id: int
    transaction_no: str
    transaction_date: date
    financial_year: int
    transaction_type: TransactionType
    debit_account: str
    debit_sub_account: str | None = None
    debit_department: str | None = None
    debit_partner: str | None = None
    debit_tax_category: str | None = None
    debit_amount: Decimal
    credit_account: str
    credit_sub_account: str | None = None
    credit_department: str | None = None
    credit_partner: str | None = None
    credit_tax_category: str | None = None
    credit_amount: Decimal
    description: str | None = None
    created_at: datetime
    updated_at: datetime
    memo: str | None = None
    friendly_category: str | None = None
    category_key: str
    label: str
    hash: str


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
