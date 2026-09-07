from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class Milestone(BaseModel):
    milestone_number: int = Field(default=1, description="Milestone sequence e.g. 1, 2")
    total_milestones: int = Field(default=2, description="Total milestones in agreement")
    percentage: float = Field(default=50.0, description="Percentage of total contract value e.g. 50")
    amount: float = Field(default=0.0, description="Amount in contract currency")
    trigger_event: str = Field(default="", description="Event triggering milestone e.g. Agreement signing, study completion")
    description_text: str = Field(default="", description="Description of payment condition")

class ExtractedAgreement(BaseModel):
    project_id: str = Field(default="", description="Pharmazone Project ID e.g. PZ-CR2526307, PZ-GM2526512, PZ-RA2526021")
    department: Literal["CR", "GM", "RA"] = Field(default="CR", description="CR: Clinical Research, GM: GMP Audits, RA: Regulatory Affairs")
    client_name: str = Field(default="", description="Name of the client/sponsor")
    client_address: str = Field(default="", description="Full address of the client/sponsor")
    client_gstin: Optional[str] = Field(default=None, description="GSTIN if Indian domestic client")
    client_pan: Optional[str] = Field(default=None, description="PAN if Indian domestic client")
    country: str = Field(default="Canada", description="Country of the client")
    is_export: bool = Field(default=True, description="True if foreign client (Export), False if Indian domestic")
    currency: Literal["USD", "EUR", "INR"] = Field(default="USD", description="Currency of contract")
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
