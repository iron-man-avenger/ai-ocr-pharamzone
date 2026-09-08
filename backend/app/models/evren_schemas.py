from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PartyDetail(BaseModel):
    name: str = Field(..., description="Legal name of the entity")
    role: str = Field(..., description="Role in agreement e.g. Service Provider, Client / Counterparty")
    legal_status: Optional[str] = Field(None, description="Legal structure e.g. LLP, Limited, Pvt Ltd")
    registration_number: Optional[str] = Field(None, description="Registration / incorporation ID or LLP number")
    registered_address: Optional[str] = Field(None, description="Registered legal address")
    operational_address: Optional[str] = Field(None, description="Office/delivery branch location")
    country_or_jurisdiction: Optional[str] = Field(None, description="Country or governing jurisdiction")
    authorized_signatory: Optional[str] = Field(None, description="Name of individual signing the agreement")
    signatory_title: Optional[str] = Field(None, description="Designation/title of authorized signatory")
    contact_telephone: Optional[str] = Field(None, description="Phone or contact telephone")
    contact_website: Optional[str] = Field(None, description="Website or portal URL")

class PartiesSection(BaseModel):
    service_provider: PartyDetail
    client: PartyDetail
    project_name: Optional[str] = Field(None, description="Project code or subject matter (e.g. Project Pinnacle)")
    target_assets_scope: Optional[str] = Field(None, description="Target assets, sites, or locations involved")
    related_parties: List[str] = Field(default_factory=list, description="Third-parties or conflict disclosures mentioned")

class CommercialsSection(BaseModel):
    execution_date: Optional[str] = Field(None, description="Agreement signing / execution date")
    validity_timeline: Optional[str] = Field(None, description="Validity or delivery milestone end date")
    currency: str = Field("INR", description="Fee currency (INR, USD, EUR, etc.)")
    total_professional_fee: float = Field(..., description="Total agreed baseline fee value")
    total_fee_formatted: str = Field(..., description="Formatted fee string e.g. ₹24,00,000.00 INR")
    fee_in_words: Optional[str] = Field(None, description="Amount in words e.g. Twenty-Four Lakhs Only")
    out_of_pocket_expenses: Optional[str] = Field(None, description="Policy on OPE (e.g. at actuals, pre-approved)")
    administrative_expenses: Optional[str] = Field(None, description="Admin expenses e.g. 3% of total fee")
    tax_terms: Optional[str] = Field(None, description="Taxes, GST, duty, cess terms")

class MilestoneTranche(BaseModel):
    milestone_number: int
    percentage: float
    amount: float
    amount_formatted: str
    trigger_condition: str
    description: str
    status: Optional[str] = "Pending"

class PaymentTermsSection(BaseModel):
    credit_period_days: int = Field(30, description="Payment credit period in days")
    credit_terms_description: str = Field(..., description="Description of payment credit period and invoice receipt condition")
    milestones: List[MilestoneTranche] = Field(default_factory=list)
    tds_provisions: Optional[str] = Field(None, description="TDS deduction rules")
    forex_and_gst_compliance: Optional[str] = Field(None, description="FEMA / indirect tax rules for foreign payments")

class Stakeholder(BaseModel):
    name: str
    role: str
    entity: str
    responsibility: Optional[str] = None

class MilestoneStep(BaseModel):
    step_number: int
    title: str
    date_or_trigger: str
    description: str
    badge: Optional[str] = None

class LegalSafeguard(BaseModel):
    title: str
    clause_ref: Optional[str] = None
    summary: str

class SuggestedInsights(BaseModel):
    milestone_stepper: List[MilestoneStep] = Field(default_factory=list)
    key_stakeholders: List[Stakeholder] = Field(default_factory=list)
    regulatory_frameworks: List[str] = Field(default_factory=list)
    legal_safeguards: List[LegalSafeguard] = Field(default_factory=list)

class EvrenExtractionResponse(BaseModel):
    document_title: str
    source_filename: str
    confidence_score: float = 0.98
    extraction_engine: str = "Azure Document Intelligence + Azure OpenAI"
    parties: PartiesSection
    commercials: CommercialsSection
    payment_terms: PaymentTermsSection
    suggested_insights: SuggestedInsights
    raw_summary: Optional[str] = None
