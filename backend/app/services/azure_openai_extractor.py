import json
import logging
import re
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.models.schemas import ExtractedAgreement, Milestone

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are an expert pharmaceutical contract and financial data extraction AI specializing in Pharmazone agreements.
Given text and tables extracted from ANY signed Agreement, Work Order, Proposal, or Quotation, extract structured commercial data strictly according to this JSON schema.

Return ONLY a valid JSON object matching this schema:
{
  "project_id": "Pharmazone Project ID e.g. PZ-CR2526307, PZ-GM2526512, PZ-RA2526021. If not explicitly found, infer with prefix PZ-CR...",
  "department": "CR (Clinical Research / BE / BA study), GM (GMP QA Compliance Audits), or RA (Regulatory Affairs / Dossier / Modules)",
  "client_name": "Full legal name of the client / sponsor entity",
  "client_address": "Full registered or business address of the client / sponsor",
  "client_gstin": "GSTIN number if Indian domestic entity, or null",
  "client_pan": "PAN number if Indian domestic entity, or null",
  "country": "Country where client is located (e.g. Canada, Iceland, Italy, India, USA)",
  "is_export": true,
  "currency": "Currency code (USD, EUR, INR, etc.)",
  "total_contract_value": 3150.0,
  "payment_terms_days": 30,
  "study_or_project_name": "Full study title, clinical protocol, audit scope, or regulatory project name",
  "site_or_cro_location": "Name and location of CRO facility, clinical site, or audit location",
  "agreement_date": "Signing or execution date (e.g. 24-Mar-2026)",
  "buyer_order_no": "PO / Purchase Order number or reference code if stated, or null",
  "buyer_order_date": "PO or order date if stated, or null",
  "suggested_milestone": 1,
  "milestones": [
    {
      "milestone_number": 1,
      "total_milestones": 2,
      "percentage": 50.0,
      "amount": 1575.0,
      "trigger_event": "Milestone condition or deliverable triggering payment (e.g. Agreement signing, Last monitoring visit)",
      "description_text": "Description of the payment clause"
    }
  ],
  "raw_summary": "Concise 2-sentence executive summary of the agreement."
}

CRITICAL INSTRUCTIONS:
- Extract dynamic, accurate intelligence strictly from the provided text.
- Do NOT hardcode or borrow details from any other company.
- "milestones" must be a JSON array of milestone objects.
- All numbers for fees and percentages should be numeric floats where possible.
- "is_export" must be false if client address is in India, and true if outside India.
"""

class AzureOpenAIExtractorService:
    def __init__(self):
        self.endpoint = settings.AZURE_OPENAI_ENDPOINT
        self.key = settings.AZURE_OPENAI_API_KEY
        self.deployment = settings.AZURE_OPENAI_DEPLOYMENT_NAME
        self.api_version = settings.AZURE_OPENAI_API_VERSION

    def _clean_and_normalize_ai_response(self, raw_json: Dict[str, Any], filename: str) -> Dict[str, Any]:
        """
        Cleans and normalizes JSON output from Azure OpenAI before passing to Pydantic models.
        """
        # Unwrap nested root if single key
        if len(raw_json) == 1 and isinstance(list(raw_json.values())[0], dict):
            inner = list(raw_json.values())[0]
            if any(k.lower() in ["client_name", "department", "currency", "total_contract_value"] for k in inner.keys()):
                raw_json = inner

        # Lowercase mapping of keys
        data = {k.lower(): v for k, v in raw_json.items()}

        # Coerce milestones
        ms = data.get("milestones")
        if not isinstance(ms, list):
            data["milestones"] = []

        return data

    async def extract_agreement_data(self, ocr_result: Dict[str, Any]) -> ExtractedAgreement:
        """
        Dynamically extract structured agreement data using Azure OpenAI.
        Does NOT fall back to any hardcoded or sample contracts. If there is an issue,
        it raises a descriptive error directly.
        """
        raw_text = ocr_result.get("content", "")
        filename = ocr_result.get("filename", "Uploaded Document")

        if not raw_text or len(raw_text.strip()) == 0:
            raise ValueError(f"No text could be extracted from '{filename}'. Please verify the uploaded document is not blank, corrupted, or password-protected.")

        if not settings.has_openai:
            raise ValueError("Azure OpenAI service is not configured on the server. Please configure AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT.")

        try:
            from openai import AzureOpenAI

            client = AzureOpenAI(
                azure_endpoint=self.endpoint,
                api_key=self.key,
                api_version=self.api_version
            )

            # Format contract excerpt
            contract_excerpt = raw_text
            if len(raw_text) > 28000:
                contract_excerpt = raw_text[:24000] + "\n\n[... middle boilerplate terms omitted ...]\n\n" + raw_text[-4000:]

            user_prompt = f"""
            Document Filename: {filename}
            Contract Extracted Content:
            \"\"\"{contract_excerpt}\"\"\"

            Extract all commercial terms, client details, project identification, and milestone payment schedules in strict JSON according to the schema.
            """

            logger.info(f"Pharma AI: Sending {len(contract_excerpt)} chars of text from '{filename}' to Azure OpenAI ({self.deployment})...")
            response = client.chat.completions.create(
                model=self.deployment,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.1
            )

            content_str = response.choices[0].message.content
            raw_json = json.loads(content_str)
            normalized = self._clean_and_normalize_ai_response(raw_json, filename)

            if not normalized.get("client_name") and not normalized.get("total_contract_value"):
                raise ValueError(f"Uploaded agreement '{filename}' could not be parsed: missing required client or financial terms.")

            return ExtractedAgreement(**normalized)

        except Exception as e:
            logger.error(f"Pharma AI extraction failed for '{filename}': {e}", exc_info=True)
            raise RuntimeError(f"Pharmazone agreement extraction failed for '{filename}': {str(e)}")

openai_extractor_service = AzureOpenAIExtractorService()
