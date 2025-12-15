from __future__ import annotations

import enum


class TransactionType(str, enum.Enum):
    income = "income"
    expense = "expense"
    non_cash_journal = "non_cash_journal"
    offset_income = "offset_income"
    offset_expense = "offset_expense"


class PersonalTransactionType(str, enum.Enum):
    income = "income"
    expense = "expense"


class UserRole(str, enum.Enum):
    admin = "admin"
    user = "user"


class OrganizationType(str, enum.Enum):
    household = "household"
    business = "business"
    nonprofit = "nonprofit"
    other = "other"
