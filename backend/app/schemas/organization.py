from __future__ import annotations

from datetime import datetime
from typing import Any

from ..models.enums import EnumOrganizationType
from .base import BaseSchema


class OrganizationCreate(BaseSchema):
    name: str
    display_name: str
    description: str | None = None
    type: EnumOrganizationType
    slug: str
    user_id: str | None = None
    settings: dict[str, Any] | None = None


class OrganizationRead(BaseSchema):
    id: str
    name: str
    display_name: str
    description: str | None = None
    type: EnumOrganizationType
    slug: str
    user_id: str | None = None
    settings: dict[str, Any] | None = None
    created_at: datetime
    updated_at: datetime
