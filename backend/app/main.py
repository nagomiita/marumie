from __future__ import annotations

from fastapi import FastAPI

from .api import health, organizations, personal_transactions, political_organizations
from .core.settings import get_settings


def get_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Marumie Backend", version="0.1.0", docs_url="/docs" if settings.is_development else None)
    app.include_router(health.router)
    app.include_router(organizations.router)
    app.include_router(political_organizations.router)
    app.include_router(personal_transactions.router)
    return app


app = get_app()
