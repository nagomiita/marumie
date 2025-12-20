from __future__ import annotations

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from .api import (
    categories,
    csv_upload,
    health,
    organizations,
    transactions,
)
from .core.settings import get_settings


def get_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Marumie Backend",
        version="0.1.0",
        docs_url="/docs" if settings.is_development else None,
    )
    # Allow CORS for all origins (開発用 — 必要に応じて制限してください)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(health.router)
    app.include_router(categories.router)
    app.include_router(organizations.router)
    app.include_router(transactions.router)
    app.include_router(csv_upload.router)
    return app


app = get_app()
