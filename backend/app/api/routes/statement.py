from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Body
from pydantic import BaseModel
from app.domain.models import StatementUploadResponse
from app.api.deps import get_subscription_repo
from app.services.repository import SubscriptionRepository
from app.services.intelligence.statement_parser import StatementParser

router = APIRouter(prefix="/api/statement", tags=["Statement Ingestion"])

DEFAULT_DEMO_CSV = """Date,Merchant,Amount,Category
2026-06-28,Adobe Creative Cloud,$59.99,Productivity
2026-06-28,Canva Pro,$14.99,Productivity
2026-06-24,Netflix,$15.49,Entertainment
2026-06-26,Spotify,$10.99,Entertainment
2026-07-02,Notion,$10.00,Productivity
2026-07-05,iCloud+,$2.99,Storage
"""

class StatementUploadPayload(BaseModel):
    csvContent: Optional[str] = None
    useDemo: Optional[bool] = False

@router.post("/upload", response_model=StatementUploadResponse)
async def upload_statement(
    payload: Optional[StatementUploadPayload] = None,
    repo: SubscriptionRepository = Depends(get_subscription_repo)
):
    csv_text = DEFAULT_DEMO_CSV
    if payload and payload.csvContent and not payload.useDemo:
        csv_text = payload.csvContent

    response = StatementParser.parse_csv_content(csv_text)

    # Ingest parsed subscriptions into repository
    for sub in response.subscriptions:
        repo.add(sub)

    return response
