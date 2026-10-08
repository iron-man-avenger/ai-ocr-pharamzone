from pydantic import BaseModel, Field, model_validator
from typing import List, Optional, Literal, Any
import re

class Milestone(BaseModel):
    milestone_number: int = Field(default=1, description="Milestone sequence e.g. 1, 2")
    total_milestones: int = Field(default=2, description="Total milestones in agreement")
    percentage: float = Field(default=50.0, description="Percentage of total contract value e.g. 50")
    amount: float = Field(default=0.0, description="Amount in contract currency")
    trigger_event: str = Field(default="", description="Event triggering milestone e.g. Agreement signing, study completion")
    description_text: str = Field(default="", description="Description of payment condition")

    @model_validator(mode="before")
    @classmethod
    def normalize_milestone(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # amount
            amt = data.get("amount")
            if isinstance(amt, str):
                cleaned = re.sub(r"[^\d.]", "", amt)
                try:
                    data["amount"] = float(cleaned) if cleaned else 0.0
                except ValueError:
                    data["amount"] = 0.0
            elif amt is None:
                data["amount"] = 0.0

            # percentage
            pct = data.get("percentage")
            if isinstance(pct, str):
                cleaned_pct = re.sub(r"[^\d.]", "", pct)
                try:
                    data["percentage"] = float(cleaned_pct) if cleaned_pct else 0.0
                except ValueError:
                    data["percentage"] = 0.0
            elif pct is None:
                data["percentage"] = 0.0

            # milestone_number
            mn = data.get("milestone_number")
            if isinstance(mn, str):
                digits = re.findall(r"\d+", mn)
                data["milestone_number"] = int(digits[0]) if digits else 1
            elif mn is None:
                data["milestone_number"] = 1

            # total_milestones
            tm = data.get("total_milestones")
            if isinstance(tm, str):
                digits = re.findall(r"\d+", tm)
                data["total_milestones"] = int(digits[0]) if digits else 2
            elif tm is None:
                data["total_milestones"] = 2

            if not data.get("trigger_event"):
                data["trigger_event"] = data.get("trigger") or data.get("condition") or "As per milestone schedule"
            if not data.get("description_text"):
                data["description_text"] = data.get("description") or data.get("details") or ""
        return data

class ExtractedAgreement(BaseModel):
    project_id: str = Field(default="", description="Pharmazone Project ID e.g. PZ-CR2526307, PZ-GM2526512, PZ-RA2526021")
    department: str = Field(default="CR", description="CR: Clinical Research, GM: GMP Audits, RA: Regulatory Affairs")
    client_name: str = Field(default="", description="Name of the client/sponsor")
    client_address: str = Field(default="", description="Full address of the client/sponsor")
    client_gstin: Optional[str] = Field(default=None, description="GSTIN if Indian domestic client")
    client_pan: Optional[str] = Field(default=None, description="PAN if Indian domestic client")
    country: str = Field(default="Canada", description="Country of the client")
    is_export: bool = Field(default=True, description="True if foreign client (Export), False if Indian domestic")
    currency: str = Field(default="USD", description="Currency of contract")
    total_contract_value: float = Field(default=0.0, description="Total contract value")
    payment_terms_days: int = Field(default=30, description="Payment terms in days e.g. 30, 60")
    study_or_project_name: str = Field(default="", description="Study title, project name, or product details")
    site_or_cro_location: str = Field(default="", description="CRO name, audit site, or monitoring location")
    agreement_date: Optional[str] = Field(default=None, description="Date of agreement execution")
    milestones: List[Milestone] = Field(default_factory=list, description="List of payment milestones")
    buyer_order_no: Optional[str] = Field(default=None, description="PO/Order number if available")
    buyer_order_date: Optional[str] = Field(default=None, description="PO/Order date if available")
    suggested_milestone: Optional[int] = Field(default=None, description="Suggested unbilled milestone number to test")
    raw_summary: Optional[str] = Field(default=None, description="Summary extracted by Document Intelligence / OpenAI")

    @model_validator(mode="before")
    @classmethod
    def normalize_agreement(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Normalize department
            dept = str(data.get("department") or "").strip().upper()
            if "CR" in dept or "CLINICAL" in dept or "BIOEQUIVALENCE" in dept or "BE" in dept or "BA" in dept:
                data["department"] = "CR"
            elif "GM" in dept or "GMP" in dept or "AUDIT" in dept or "QA" in dept:
                data["department"] = "GM"
            elif "RA" in dept or "REGULATORY" in dept or "DOSSIER" in dept or "MODULE" in dept:
                data["department"] = "RA"
            else:
                data["department"] = "CR"

            # Normalize currency
            curr = str(data.get("currency") or "").strip().upper()
            if any(x in curr for x in ["INR", "RS", "RUPEE", "₹"]):
                data["currency"] = "INR"
            elif any(x in curr for x in ["EUR", "EURO", "€"]):
                data["currency"] = "EUR"
            elif any(x in curr for x in ["USD", "DOLLAR", "$"]):
                data["currency"] = "USD"
            elif curr in ["GBP", "CAD", "AUD", "CHF"]:
                data["currency"] = curr
            else:
                data["currency"] = "USD"

            # Normalize total_contract_value
            val = data.get("total_contract_value")
            if isinstance(val, str):
                cleaned = re.sub(r"[^\d.]", "", val)
                try:
                    data["total_contract_value"] = float(cleaned) if cleaned else 0.0
                except ValueError:
                    data["total_contract_value"] = 0.0
            elif val is None:
                data["total_contract_value"] = 0.0

            # Normalize payment_terms_days
            pt = data.get("payment_terms_days")
            if isinstance(pt, str):
                digits = re.findall(r"\d+", pt)
                data["payment_terms_days"] = int(digits[0]) if digits else 30
            elif pt is None:
                data["payment_terms_days"] = 30

            # Normalize country and is_export
            country = str(data.get("country") or "").strip()
            if not country:
                data["country"] = "India" if data.get("client_gstin") else "International"
            if data.get("is_export") is None:
                data["is_export"] = "india" not in data["country"].lower()
            elif isinstance(data.get("is_export"), str):
                data["is_export"] = data.get("is_export").strip().lower() in ["true", "1", "yes"]

            # Normalize client_name from possible aliases
            if not data.get("client_name"):
                for alias in ["sponsor_name", "sponsor", "client", "company_name"]:
                    if data.get(alias):
                        data["client_name"] = str(data[alias]).strip()
                        break

            # Normalize study_or_project_name from possible aliases
            if not data.get("study_or_project_name"):
                for alias in ["project_name", "study_name", "project_title", "title"]:
                    if data.get(alias):
                        data["study_or_project_name"] = str(data[alias]).strip()
                        break

            # Normalize milestones
            ms = data.get("milestones")
            if not isinstance(ms, list):
                data["milestones"] = []

        return data

class BankDetails(BaseModel):
    account_name: str = "Pharmazone"
    bank_name: str = "HDFC BANK LTD."
    account_no: str = "50200002488742"
    branch_ifsc: str = "CHANDLODIYA BRANCH & HDFC0001679"
    swift_code: str = "HDFCINBB"
    currency: str = "USD"

class InvoiceItem(BaseModel):
    header_description: str = "Export Service-Exempt (GCP)"
    detailed_description: str = ""
    site_location: Optional[str] = None
    milestone_clause: Optional[str] = None
    hsn_sac: str = "998113"
    gst_rate: float = 0.0
    quantity: int = 1
    amount: float = 0.0

class InvoiceDraftRequest(BaseModel):
    agreement: ExtractedAgreement
    selected_milestone_number: int = 1
    invoice_date: Optional[str] = None
    exchange_rate_to_inr: Optional[float] = None
    custom_invoice_no: Optional[str] = None
    buyer_order_no: Optional[str] = None
    buyer_order_date: Optional[str] = None

class InvoiceDraftResponse(BaseModel):
    invoice_no: str
    invoice_date: str
    invoice_type: Literal["EXPORT", "TAX"] = "EXPORT"
    invoice_title: str = "Export Invoice"
    legal_sub_heading: str = "(SUPPLY MEANT FOR EXPORT/SUPPLY TO SEZ UNIT OR SEZ DEVELOPER FOR AUTHORISED OPERATIONS UNDER BOND OR LETTER OF UNDERTAKING WITHOUT PAYMENT OF IGST)"
    reference_no: str
    buyer_order_no: Optional[str] = None
    buyer_order_date: Optional[str] = None
    mode_terms_of_payment: str = "Within 30 Days"
    country: str = "Canada"
    
    # Seller
    seller_name: str = "Pharmazone"
    seller_address: str = "402, Shafalya Elegance, Nr. Shakti Arcade, Opp. Sola Water Tank, Sola, Ahmedabad-380060, India"
    seller_gstin: str = "24AAMFP6329H1Z1"
    seller_state: str = "Gujarat, Code : 24"
    seller_email: str = "accounts@pharmazones.com"
    seller_pan: str = "AAMFP6329H"
    
    # Buyer
    buyer_name: str
    buyer_address: str
    buyer_gstin: Optional[str] = None
    buyer_pan: Optional[str] = None
    buyer_state: Optional[str] = None

    # Line Item
    item: InvoiceItem
    
    # Amounts & Taxes
    currency: str = "USD"
    subtotal: float = 0.0
    cgst_rate: float = 0.0
    cgst_amount: float = 0.0
    sgst_rate: float = 0.0
    sgst_amount: float = 0.0
    igst_rate: float = 0.0
    igst_amount: float = 0.0
    total_tax: float = 0.0
    grand_total: float = 0.0
    taxable_value_inr: float = 0.0
    exchange_rate_to_inr: float = 0.0
    amount_in_words: str = ""
    
    # Bank
    bank_details: BankDetails

class HealthResponse(BaseModel):
    status: str = "healthy"
    doc_intel_configured: bool = False
    openai_configured: bool = False
    mock_fallback_enabled: bool = True
