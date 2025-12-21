from __future__ import annotations

from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.db import get_db_session
from ..services import CSVUploadService

router = APIRouter(prefix="/csv", tags=["csv"])


@router.post("/upload", operation_id="upload_transactions_csv")
async def upload_transactions_csv(
    organization_id: str,
    file: UploadFile,
    session: AsyncSession = Depends(get_db_session),
) -> dict:
    """CSVファイルをアップロードしてトランザクションを一括作成"""
    return await CSVUploadService.upload_transactions_csv(
        session, organization_id, file
    )
