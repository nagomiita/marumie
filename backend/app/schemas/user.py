from __future__ import annotations

from datetime import datetime

from ..models.enums import EnumUserRole
from .base import BaseSchema


class UserRead(BaseSchema):
    id: str
    auth_id: str
    email: str
    name: str
    role: EnumUserRole
    created_at: datetime
    updated_at: datetime
