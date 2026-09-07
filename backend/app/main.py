from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router as api_router

app = FastAPI(
    title="PharmaAI - OCR Agreement to Invoice Drafting API",
    description="Automated invoice drafting from pharmaceutical agreements using Azure Document Intelligence and Azure OpenAI.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "app": "PharmaAI OCR Invoice Drafting API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }
