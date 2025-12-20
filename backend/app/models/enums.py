from __future__ import annotations

import enum


class PersonalTransactionType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"


class OrganizationType(str, enum.Enum):
    HOUSEHOLD = "household"
    BUSINESS = "business"
    NONPROFIT = "nonprofit"
    POLITICAL_ORGANIZATION = "political_organization"
    OTHER = "other"
