import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from typing import List, Dict, Any
from app.core.config import settings
from app.models.schemas import (
    ExtractedAgreement,
    InvoiceDraftRequest,
    InvoiceDraftResponse,
    HealthResponse
)
from app.models.evren_schemas import EvrenExtractionResponse
from app.services.azure_doc_intel import doc_intel_service
from app.services.azure_openai_extractor import openai_extractor_service
from app.services.evren_extractor import evren_extractor_service
from app.services.invoice_engine import invoice_engine
from app.services.forex_service import forex_service

router = APIRouter()

SAMPLES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../samples"))

# In-memory storage for saved draft invoices
DRAFT_INVOICES_DB: List[InvoiceDraftResponse] = []

@router.get("/health", response_model=HealthResponse)
async def get_health():
    """Returns system status and Azure configuration status"""
    return HealthResponse(
        status="healthy",
        doc_intel_configured=settings.has_doc_intel,
        openai_configured=settings.has_openai,
        mock_fallback_enabled=settings.ENABLE_MOCK_FALLBACK
    )

@router.post("/extract", response_model=ExtractedAgreement)
async def extract_agreement(file: UploadFile = File(...)):
    """
    Upload a signed agreement/SOW/quotation PDF.
    Runs Azure Document Intelligence Layout/Contract model + Azure OpenAI.
    """
    if not file.filename.lower().endswith((".pdf", ".png", ".jpg", ".jpeg")):
        raise HTTPException(status_code=400, detail="Only PDF or image files are supported.")

    try:
        file_bytes = await file.read()
        
        # Step 1: Azure Document Intelligence OCR
        ocr_result = await doc_intel_service.analyze_document(file_bytes, filename=file.filename)
        
        # Step 2: Azure OpenAI Structured Extraction
        extracted_data = await openai_extractor_service.extract_agreement_data(ocr_result)
        
        return extracted_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

@router.post("/generate-draft", response_model=InvoiceDraftResponse)
async def generate_draft(req: InvoiceDraftRequest):
    """
    Generates a draft invoice from an extracted agreement for a selected milestone.
    Applies all Pharmazone business rules: department code, banking routing, SAC 998113, GST calculation.
    """
    try:
        draft = invoice_engine.generate_draft_invoice(req)
        DRAFT_INVOICES_DB.append(draft)
        return draft
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Draft generation failed: {str(e)}")

@router.get("/invoices", response_model=List[InvoiceDraftResponse])
async def list_invoices():
    """List all generated draft invoices"""
    return DRAFT_INVOICES_DB

@router.get("/sample-agreements")
async def get_sample_agreements():
    """
    Provides only the agreements that have UNBILLED / MISSING invoices 
    in the Pharmazone samples dataset, enabling direct testing of invoice generation.
    """
    return [
        {
            "id": "tafamidis",
            "name": "Coripharma ehf - Tafamidis 61mg Study (EUR)",
            "filename": "PZ-CR2526307 Tafamidis-61mg-Fed-D01-25Mar26-FE.pdf",
            "missing_invoice": "Milestone 2/2 Invoice Missing (€1,600)",
            "target_milestone": 2
        },
        {
            "id": "esomeprazole",
            "name": "Pharmaris Canada - Esomeprazole 40mg Study (USD)",
            "filename": "Quote_Esomeprazole_40mg_tab_Fast_d02_24Mar26-Signed.pdf",
            "missing_invoice": "Milestone 2/2 Invoice Missing ($1,575)",
            "target_milestone": 2
        },
        {
            "id": "advancion",
            "name": "F.I.S. S.p.A. - Advancion GMP QA Audit (EUR)",
            "filename": "Pharmazone Quotation GMP QA Audit FIS Advancion 30Jul25-v01-signed.pdf",
            "missing_invoice": "Milestone 1/2 Advance Invoice Missing (€1,850)",
            "target_milestone": 1
        }
    ]

@router.get("/sample-file/{filename}")
async def get_sample_file(filename: str):
    """Serve authentic sample PDF files from samples directory for live testing"""
    file_path = os.path.join(SAMPLES_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Sample PDF file not found")
    return FileResponse(file_path, media_type="application/pdf", filename=filename)

@router.get("/forex-rates")
async def get_forex_rates():
    """Returns current live Forex rates to INR (with caching and fallback)"""
    return forex_service.get_rates()

# -------------------------------------------------------------------------
# EVREN AI - Advisory, Legal & Commercial Contract Intelligence Endpoints
# -------------------------------------------------------------------------

ADVISORY_PDF_PATH = os.path.join(
    SAMPLES_DIR,
    "advisory",
    "Signed_Standard Advisory Engagement Letter_Project Pinnacle_18Feb20261.pdf"
)

@router.post("/evren/extract", response_model=EvrenExtractionResponse)
async def extract_advisory_contract(file: UploadFile = File(...)):
    """
    Evren AI Dynamic Extraction Endpoint:
    Accepts any Advisory, Master Services Agreement, Engagement Letter, or Legal Contract PDF/image.
    Executes Azure Document Intelligence Layout OCR -> Azure OpenAI Evren Extractor.
    Returns structured data covering:
      1) Party Names & Corporate Profiles
      2) Timeline / Commercials
      3) Payment Terms and Conditions
      4) Suggested Smart Insights
    """
    if not file.filename.lower().endswith((".pdf", ".png", ".jpg", ".jpeg")):
        raise HTTPException(status_code=400, detail="Only PDF or image files are supported.")

    try:
        file_bytes = await file.read()

        # Step 1: Document Intelligence OCR
        ocr_result = await doc_intel_service.analyze_document(file_bytes, filename=file.filename)

        # Step 2: Evren AI Structured Extraction
        extracted_data = await evren_extractor_service.extract_advisory_data(ocr_result)

        return extracted_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evren AI extraction failed: {str(e)}")

@router.get("/evren/sample-advisory", response_model=EvrenExtractionResponse)
async def get_sample_advisory_data():
    """
    Returns high-fidelity extracted intelligence for Project Pinnacle
    (Signed Standard Advisory Engagement Letter - KPMG & Brookfield Private Capital) instantly.
    """
    return evren_extractor_service._pinnacle_fallback_extraction(
        "",
        "Signed_Standard Advisory Engagement Letter_Project Pinnacle_18Feb20261.pdf"
    )

@router.get("/evren/sample-file")
async def get_evren_sample_file():
    """Serve the authentic Signed Advisory Engagement Letter PDF for preview & download"""
    if not os.path.exists(ADVISORY_PDF_PATH):
        raise HTTPException(status_code=404, detail="Advisory sample PDF file not found on server")
    return FileResponse(
        ADVISORY_PDF_PATH,
        media_type="application/pdf",
        filename="Signed_Standard Advisory Engagement Letter_Project Pinnacle_18Feb20261.pdf"
    )

