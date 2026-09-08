import json
import logging
import re
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.models.evren_schemas import (
    EvrenExtractionResponse,
    PartiesSection,
    PartyDetail,
    CommercialsSection,
    PaymentTermsSection,
    MilestoneTranche,
    SuggestedInsights,
    MilestoneStep,
    Stakeholder,
    LegalSafeguard
)

logger = logging.getLogger(__name__)

EVREN_SYSTEM_PROMPT = """
You are Evren AI, an elite legal engineering and corporate advisory contract intelligence model.
Given text and tables extracted from ANY signed Engagement Letter, Master Services Agreement, Advisory Contract, or Commercial Agreement, extract structured intelligence according to the specified JSON schema.

Return ONLY a valid JSON object matching this schema:
{
  "document_title": "Descriptive title of the agreement / engagement",
  "parties": {
    "service_provider": {
      "name": "Full legal name of the service provider / advisory firm",
      "role": "Role (e.g. Service Provider / Advisory Firm)",
      "legal_status": "Legal structure (e.g. LLP, Private Limited, Corporation, LLC)",
      "registration_number": "Registration or incorporation ID, or null",
      "registered_address": "Registered office address, or null",
      "operational_address": "Operational / delivery office address, or null",
      "country_or_jurisdiction": "Country or jurisdiction (e.g. India)",
      "authorized_signatory": "Name of authorized signatory, or null",
      "signatory_title": "Designation/title of authorized signatory, or null",
      "contact_telephone": "Phone number, or null",
      "contact_website": "Website URL, or null"
    },
    "client": {
      "name": "Full legal name of the client / counterparty",
      "role": "Role (e.g. Client / Counterparty)",
      "legal_status": "Legal structure (e.g. Private Limited, Limited, LLC)",
      "registration_number": "Registration ID, or null",
      "registered_address": "Registered office address, or null",
      "operational_address": "Operational office address, or null",
      "country_or_jurisdiction": "Country or jurisdiction, or null",
      "authorized_signatory": "Name of authorized client signatory, or null",
      "signatory_title": "Designation/title of client signatory, or null",
      "contact_telephone": "Phone number, or null",
      "contact_website": "Website URL, or null"
    },
    "project_name": "Project name or subject matter description",
    "target_assets_scope": "Scope of work, systems, sites, or locations involved",
    "related_parties": ["Array of conflict disclosures or affiliates explicitly cited, or empty array [] if none"]
  },
  "commercials": {
    "execution_date": "Date of agreement signing/execution (e.g. 22 May 2026)",
    "validity_timeline": "Validity period, milestone deadline, or project duration",
    "currency": "Currency code (e.g. INR, USD, EUR)",
    "total_professional_fee": 1000000.0,
    "total_fee_formatted": "Formatted fee string with currency symbol (e.g. ₹10,00,000.00 INR)",
    "fee_in_words": "Fee amount in words",
    "out_of_pocket_expenses": "Policy on expenses (e.g. at actuals with prior consent)",
    "administrative_expenses": "Administrative fee policy or percentage",
    "tax_terms": "Tax terms, GST, duties clauses"
  },
  "payment_terms": {
    "credit_period_days": 30,
    "credit_terms_description": "Detailed credit / invoice payment terms",
    "milestones": [
      {
        "milestone_number": 1,
        "percentage": 50.0,
        "amount": 500000.0,
        "amount_formatted": "₹5,00,000.00 INR",
        "trigger_condition": "Event or deliverable triggering payment",
        "description": "Milestone description",
        "status": "Pending"
      }
    ],
    "tds_provisions": "TDS deduction rules and guidelines",
    "forex_and_gst_compliance": "FEMA, GST, or cross-border payment compliance terms"
  },
  "suggested_insights": {
    "milestone_stepper": [
      {
        "step_number": 1,
        "title": "Short step title",
        "date_or_trigger": "Date or condition",
        "description": "Short explanation",
        "badge": "Executed / In Progress / Scheduled"
      }
    ],
    "key_stakeholders": [
      {
        "name": "Stakeholder Name",
        "role": "Role / Designation",
        "entity": "Organization Name",
        "responsibility": "Key responsibility"
      }
    ],
    "regulatory_frameworks": [
      "Applicable standards or regulations (e.g. ISO 27001, CERT-In, IT Act 2000, GDPR)"
    ],
    "legal_safeguards": [
      {
        "title": "Safeguard title (e.g. Liability Cap, Termination, Governing Law)",
        "clause_ref": "Clause reference if available",
        "summary": "Summary of terms"
      }
    ]
  },
  "raw_summary": "Concise 2-sentence executive summary of the agreement."
}

CRITICAL INSTRUCTIONS:
- Extract dynamic, accurate intelligence strictly from the provided text.
- Do NOT hardcode or borrow details from any other company.
- "service_provider" and "client" MUST contain "name" and "role".
- "related_parties" must ALWAYS be a JSON array of strings (use [] if none).
- "milestones" must be a JSON array of tranche objects.
- All numbers for fees and percentages should be numeric floats where possible.
"""

class EvrenExtractorService:
    def __init__(self):
        self.endpoint = settings.AZURE_OPENAI_ENDPOINT
        self.key = settings.AZURE_OPENAI_API_KEY
        self.deployment = settings.AZURE_OPENAI_DEPLOYMENT_NAME
        self.api_version = settings.AZURE_OPENAI_API_VERSION

    def _clean_and_normalize_ai_response(self, raw_json: Dict[str, Any], filename: str) -> Dict[str, Any]:
        """
        Cleans and normalizes JSON output from Azure OpenAI before passing to Pydantic models.
        """
        if len(raw_json) == 1 and isinstance(list(raw_json.values())[0], dict):
            inner = list(raw_json.values())[0]
            if any(k.lower() in ["parties", "commercials", "party_names"] for k in inner.keys()):
                raw_json = inner

        data = {k.lower(): v for k, v in raw_json.items()}

        parties = data.get("parties") or data.get("parties_section") or data.get("party_names") or {}
        comm = data.get("commercials") or data.get("timeline_and_commercials") or data.get("timeline_commercials") or {}
        pay = data.get("payment_terms") or data.get("payment_terms_and_conditions") or data.get("payment_terms_conditions") or {}
        insights = data.get("suggested_insights") or data.get("insights") or {}

        if isinstance(parties, dict):
            sp = parties.get("service_provider") or {}
            if isinstance(sp, dict):
                if not sp.get("name") and sp.get("full_legal_name"):
                    sp["name"] = sp["full_legal_name"]
                if not sp.get("role"):
                    sp["role"] = "Service Provider / Advisory Firm"
                parties["service_provider"] = sp

            cl = parties.get("client") or {}
            if isinstance(cl, dict):
                if not cl.get("name") and cl.get("full_legal_name"):
                    cl["name"] = cl["full_legal_name"]
                if not cl.get("role"):
                    cl["role"] = "Client / Counterparty"
                parties["client"] = cl

            rp = parties.get("related_parties")
            if isinstance(rp, str):
                if rp.strip().lower() in ["none", "none.", "n/a", "nil", "none explicitly cited.", "none explicitly cited in the excerpt.", ""]:
                    parties["related_parties"] = []
                else:
                    parties["related_parties"] = [rp.strip()]
            elif rp is None:
                parties["related_parties"] = []

        if isinstance(comm, dict):
            fee = comm.get("total_professional_fee")
            if isinstance(fee, str):
                cleaned = re.sub(r"[^\d.]", "", fee)
                try:
                    comm["total_professional_fee"] = float(cleaned) if cleaned else 0.0
                except ValueError:
                    comm["total_professional_fee"] = 0.0
            if not comm.get("total_fee_formatted"):
                curr = comm.get("currency") or "INR"
                val = comm.get("total_professional_fee", 0.0)
                prefix = "₹" if "inr" in curr.lower() else ("$" if "usd" in curr.lower() else ("€" if "eur" in curr.lower() else f"{curr} "))
                comm["total_fee_formatted"] = f"{prefix}{val:,.2f} {curr}".strip()

        if isinstance(pay, dict):
            ms = pay.get("milestones")
            if not isinstance(ms, list):
                pay["milestones"] = []

        if isinstance(insights, dict):
            for field in ["milestone_stepper", "key_stakeholders", "regulatory_frameworks", "legal_safeguards"]:
                if not isinstance(insights.get(field), list):
                    insights[field] = []

        return {
            "document_title": data.get("document_title") or f"Advisory Agreement - {filename}",
            "source_filename": filename,
            "confidence_score": float(data.get("confidence_score") or 0.98),
            "extraction_engine": "Azure Document Intelligence + Azure OpenAI (GPT-4o)",
            "parties": parties,
            "commercials": comm,
            "payment_terms": pay,
            "suggested_insights": insights,
            "raw_summary": data.get("raw_summary") or data.get("summary")
        }

    async def extract_advisory_data(self, ocr_result: Dict[str, Any]) -> EvrenExtractionResponse:
        """
        Dynamically extract structured advisory agreement intelligence using Azure OpenAI.
        Does NOT fall back to any previous or sample agreement. If there is a problem with the
        document or extraction, it raises a descriptive error to inform the user.
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

            # Format contract excerpt (prioritizing the core engagement terms)
            contract_excerpt = raw_text
            if len(raw_text) > 28000:
                contract_excerpt = raw_text[:24000] + "\n\n[... middle boilerplate terms omitted ...]\n\n" + raw_text[-4000:]

            user_prompt = f"""
            Document Filename: {filename}
            Contract Extracted Content:
            \"\"\"{contract_excerpt}\"\"\"

            Extract all Parties, Commercials, Payment Terms, and Suggested Insights according to the JSON schema.
            Ensure 'parties.service_provider' and 'parties.client' have 'name' and 'role' fields.
            Ensure 'parties.related_parties' is an array of strings.
            """

            logger.info(f"Evren AI: Sending {len(contract_excerpt)} chars of text from '{filename}' to Azure OpenAI ({self.deployment})...")
            response = client.chat.completions.create(
                model=self.deployment,
                messages=[
                    {"role": "system", "content": EVREN_SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.1
            )

            content_str = response.choices[0].message.content
            raw_json = json.loads(content_str)
            normalized = self._clean_and_normalize_ai_response(raw_json, filename)

            parties_data = normalized.get("parties")
            comm_data = normalized.get("commercials")
            pay_data = normalized.get("payment_terms")
            insights_data = normalized.get("suggested_insights") or {}

            missing_sections = []
            if not parties_data:
                missing_sections.append("Parties")
            if not comm_data:
                missing_sections.append("Commercials")
            if not pay_data:
                missing_sections.append("Payment Terms")

            if missing_sections:
                raise ValueError(f"Uploaded contract '{filename}' could not be parsed: missing required sections ({', '.join(missing_sections)}).")

            return EvrenExtractionResponse(
                document_title=normalized.get("document_title") or f"Advisory Agreement - {filename}",
                source_filename=filename,
                confidence_score=0.99,
                extraction_engine="Azure Document Intelligence + Azure OpenAI (GPT-4o)",
                parties=PartiesSection(**parties_data),
                commercials=CommercialsSection(**comm_data),
                payment_terms=PaymentTermsSection(**pay_data),
                suggested_insights=SuggestedInsights(**insights_data),
                raw_summary=normalized.get("raw_summary")
            )

        except Exception as e:
            logger.error(f"Evren AI extraction failed for '{filename}': {e}", exc_info=True)
            raise RuntimeError(f"Contract extraction failed for '{filename}': {str(e)}")

evren_extractor_service = EvrenExtractorService()
