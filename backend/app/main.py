from __future__ import annotations

from fastapi import FastAPI

from .api import health
from .core.settings import get_settings


def get_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Marumie Backend", version="0.1.0", docs_url="/docs" if settings.is_development else None)
    app.include_router(health.router)
    return app


app = get_app()
