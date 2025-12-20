from __future__ import annotations

import enum


class EnumPersonalTransactionType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"


class EnumUserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"


class EnumOrganizationType(str, enum.Enum):
    HOUSEHOLD = "household"
    BUSINESS = "business"
    NONPROFIT = "nonprofit"
    POLITICAL_ORGANIZATION = "political_organization"
    OTHER = "other"


class EnumCategoryType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"
