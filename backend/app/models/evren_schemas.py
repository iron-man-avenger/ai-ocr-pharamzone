from pydantic import BaseModel, Field, model_validator
from typing import List, Optional, Dict, Any
import re

class PartyDetail(BaseModel):
    name: str = Field(default="Unknown Party", description="Legal name of the entity")
    role: str = Field(default="Contracting Party", description="Role in agreement e.g. Service Provider, Client / Counterparty")
    legal_status: Optional[str] = Field(None, description="Legal structure e.g. LLP, Limited, Pvt Ltd")
    registration_number: Optional[str] = Field(None, description="Registration / incorporation ID or LLP number")
    registered_address: Optional[str] = Field(None, description="Registered legal address")
    operational_address: Optional[str] = Field(None, description="Office/delivery branch location")
    country_or_jurisdiction: Optional[str] = Field(None, description="Country or governing jurisdiction")
    authorized_signatory: Optional[str] = Field(None, description="Name of individual signing the agreement")
    signatory_title: Optional[str] = Field(None, description="Designation/title of authorized signatory")
    contact_telephone: Optional[str] = Field(None, description="Phone or contact telephone")
    contact_website: Optional[str] = Field(None, description="Website or portal URL")

    @model_validator(mode="before")
    @classmethod
    def normalize_party(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Resolve name from possible aliases
            if not data.get("name"):
                for alias in ["full_legal_name", "entity_name", "party_name", "company_name", "legal_name", "title"]:
                    if data.get(alias):
                        data["name"] = str(data[alias]).strip()
                        break
            if not data.get("name"):
                data["name"] = "Contracting Party"

            # Resolve role from possible aliases
            if not data.get("role"):
                for alias in ["party_role", "entity_role", "type"]:
                    if data.get(alias):
                        data["role"] = str(data[alias]).strip()
                        break
            if not data.get("role"):
                data["role"] = "Contracting Party"
        return data

class PartiesSection(BaseModel):
    service_provider: PartyDetail = Field(default_factory=lambda: PartyDetail(name="Service Provider", role="Service Provider / Advisory Firm"))
    client: PartyDetail = Field(default_factory=lambda: PartyDetail(name="Client", role="Client / Counterparty"))
    project_name: Optional[str] = Field(None, description="Project code or subject matter (e.g. Project Pinnacle)")
    target_assets_scope: Optional[str] = Field(None, description="Target assets, sites, or locations involved")
    related_parties: List[str] = Field(default_factory=list, description="Third-parties or conflict disclosures mentioned")

    @model_validator(mode="before")
    @classmethod
    def normalize_parties_section(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Normalize service provider role if missing
            sp = data.get("service_provider")
            if isinstance(sp, dict):
                if not sp.get("role"):
                    sp["role"] = "Service Provider / Advisory Firm"
            elif sp is None:
                data["service_provider"] = {"name": "Service Provider", "role": "Service Provider / Advisory Firm"}

            # Normalize client role if missing
            cl = data.get("client")
            if isinstance(cl, dict):
                if not cl.get("role"):
                    cl["role"] = "Client / Counterparty"
            elif cl is None:
                data["client"] = {"name": "Client", "role": "Client / Counterparty"}

            # Coerce related_parties to List[str]
            rp = data.get("related_parties")
            if isinstance(rp, str):
                cleaned = rp.strip()
                if not cleaned or cleaned.lower() in [
                    "none", "none.", "n/a", "nil", "none explicitly cited.",
                    "none explicitly cited in the excerpt.", "no conflict disclosed",
                    "no conflict disclosed.", "not mentioned", "not applicable", "[]"
                ]:
                    data["related_parties"] = []
                else:
                    data["related_parties"] = [cleaned]
            elif rp is None:
                data["related_parties"] = []
            elif isinstance(rp, list):
                data["related_parties"] = [str(x) for x in rp if x and str(x).strip()]
        return data

class CommercialsSection(BaseModel):
    execution_date: Optional[str] = Field(None, description="Agreement signing / execution date")
    validity_timeline: Optional[str] = Field(None, description="Validity or delivery milestone end date")
    currency: str = Field("INR", description="Fee currency (INR, USD, EUR, etc.)")
    total_professional_fee: float = Field(0.0, description="Total agreed baseline fee value")
    total_fee_formatted: str = Field("₹0.00", description="Formatted fee string e.g. ₹24,00,000.00 INR")
    fee_in_words: Optional[str] = Field(None, description="Amount in words e.g. Twenty-Four Lakhs Only")
    out_of_pocket_expenses: Optional[str] = Field(None, description="Policy on OPE (e.g. at actuals, pre-approved)")
    administrative_expenses: Optional[str] = Field(None, description="Admin expenses e.g. 3% of total fee")
    tax_terms: Optional[str] = Field(None, description="Taxes, GST, duty, cess terms")

    @model_validator(mode="before")
    @classmethod
    def normalize_commercials(cls, data: Any) -> Any:
        if isinstance(data, dict):
            fee = data.get("total_professional_fee")
            if isinstance(fee, str):
                clean_fee = re.sub(r"[^\d.]", "", fee)
                try:
                    data["total_professional_fee"] = float(clean_fee) if clean_fee else 0.0
                except ValueError:
                    data["total_professional_fee"] = 0.0
            elif fee is None:
                data["total_professional_fee"] = 0.0
            
            curr = data.get("currency") or "INR"
            val = data.get("total_professional_fee", 0.0)
            if not data.get("total_fee_formatted"):
                prefix = "₹" if "inr" in curr.lower() else ("$" if "usd" in curr.lower() else ("€" if "eur" in curr.lower() else f"{curr} "))
                data["total_fee_formatted"] = f"{prefix}{val:,.2f} {curr}".strip()
        return data

class MilestoneTranche(BaseModel):
    milestone_number: int = 1
    percentage: float = 0.0
    amount: float = 0.0
    amount_formatted: str = ""
    trigger_condition: str = ""
    description: str = ""
    status: Optional[str] = "Pending"

    @model_validator(mode="before")
    @classmethod
    def normalize_tranche(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # percentage
            pct = data.get("percentage")
            if isinstance(pct, str):
                clean_pct = re.sub(r"[^\d.]", "", pct)
                try:
                    data["percentage"] = float(clean_pct) if clean_pct else 0.0
                except ValueError:
                    data["percentage"] = 0.0
            elif pct is None:
                data["percentage"] = 0.0

            # amount
            amt = data.get("amount")
            if isinstance(amt, str):
                clean_amt = re.sub(r"[^\d.]", "", amt)
                try:
                    data["amount"] = float(clean_amt) if clean_amt else 0.0
                except ValueError:
                    data["amount"] = 0.0
            elif amt is None:
                data["amount"] = 0.0

            if not data.get("amount_formatted"):
                amt_val = data.get("amount", 0.0)
                data["amount_formatted"] = f"{amt_val:,.2f}"
            if not data.get("trigger_condition"):
                data["trigger_condition"] = data.get("trigger") or data.get("condition") or "Milestone completion"
            if not data.get("description"):
                data["description"] = data.get("deliverable") or data.get("details") or ""
        return data

class PaymentTermsSection(BaseModel):
    credit_period_days: int = Field(30, description="Payment credit period in days")
    credit_terms_description: str = Field("Standard invoice credit terms apply.", description="Description of payment credit period and invoice receipt condition")
    milestones: List[MilestoneTranche] = Field(default_factory=list)
    tds_provisions: Optional[str] = Field(None, description="TDS deduction rules")
    forex_and_gst_compliance: Optional[str] = Field(None, description="FEMA / indirect tax rules for foreign payments")

    @model_validator(mode="before")
    @classmethod
    def normalize_payment_terms(cls, data: Any) -> Any:
        if isinstance(data, dict):
            cp = data.get("credit_period_days")
            if isinstance(cp, str):
                digits = re.findall(r"\d+", cp)
                data["credit_period_days"] = int(digits[0]) if digits else 30
            elif cp is None:
                data["credit_period_days"] = 30
            
            if not data.get("credit_terms_description"):
                data["credit_terms_description"] = f"Payable within {data.get('credit_period_days', 30)} days from receipt of a valid tax invoice."

            # Normalize milestones list
            ms = data.get("milestones")
            if not isinstance(ms, list):
                data["milestones"] = []
        return data

class Stakeholder(BaseModel):
    name: str = Field(default="Stakeholder")
    role: str = Field(default="Engagement Stakeholder")
    entity: str = Field(default="Contracting Entity")
    responsibility: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_stakeholder(cls, data: Any) -> Any:
        if isinstance(data, str):
            text = data.strip()
            name = text.split("(")[0].strip()
            role = "Stakeholder"
            if "(" in text and ")" in text:
                role = text[text.find("(")+1:text.find(")")]
            return {
                "name": name or text[:40],
                "role": role,
                "entity": "Contracting Entity",
                "responsibility": text
            }
        return data

class MilestoneStep(BaseModel):
    step_number: int = 1
    title: str = "Milestone Step"
    date_or_trigger: str = ""
    description: str = ""
    badge: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_step(cls, data: Any) -> Any:
        if isinstance(data, str):
            text = data.strip()
            title = text.split(" - ")[0].split(":")[0][:50]
            return {
                "step_number": 1,
                "title": title or "Milestone Step",
                "date_or_trigger": "As scheduled",
                "description": text,
                "badge": "Scheduled"
            }
        return data

class LegalSafeguard(BaseModel):
    title: str = "Legal Safeguard"
    clause_ref: Optional[str] = None
    summary: str = ""

    @model_validator(mode="before")
    @classmethod
    def normalize_safeguard(cls, data: Any) -> Any:
        if isinstance(data, str):
            text = data.strip()
            title = text.split(":")[0].split(" - ")[0][:60]
            return {
                "title": title or "Legal Safeguard",
                "summary": text
            }
        return data

class SuggestedInsights(BaseModel):
    milestone_stepper: List[MilestoneStep] = Field(default_factory=list)
    key_stakeholders: List[Stakeholder] = Field(default_factory=list)
    regulatory_frameworks: List[str] = Field(default_factory=list)
    legal_safeguards: List[LegalSafeguard] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def normalize_insights(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # regulatory_frameworks
            rf = data.get("regulatory_frameworks")
            if isinstance(rf, str):
                data["regulatory_frameworks"] = [rf.strip()] if rf.strip() else []
            elif rf is None:
                data["regulatory_frameworks"] = []
            elif isinstance(rf, list):
                data["regulatory_frameworks"] = [str(x) for x in rf if x]

            # milestone_stepper
            ms = data.get("milestone_stepper")
            if isinstance(ms, list):
                formatted_steps = []
                for idx, step in enumerate(ms):
                    if isinstance(step, str):
                        formatted_steps.append({
                            "step_number": idx + 1,
                            "title": step.split(" - ")[0].split(":")[0][:50],
                            "date_or_trigger": "As scheduled",
                            "description": step,
                            "badge": "Scheduled"
                        })
                    elif isinstance(step, dict):
                        if not step.get("step_number"):
                            step["step_number"] = idx + 1
                        formatted_steps.append(step)
                data["milestone_stepper"] = formatted_steps
            else:
                data["milestone_stepper"] = []

            # key_stakeholders
            ks = data.get("key_stakeholders")
            if isinstance(ks, list):
                formatted_sh = []
                for sh in ks:
                    if isinstance(sh, str):
                        name = sh.split("(")[0].strip()
                        role = "Stakeholder"
                        if "(" in sh and ")" in sh:
                            role = sh[sh.find("(")+1:sh.find(")")]
                        formatted_sh.append({
                            "name": name or sh[:40],
                            "role": role,
                            "entity": "Contracting Entity",
                            "responsibility": sh
                        })
                    elif isinstance(sh, dict):
                        formatted_sh.append(sh)
                data["key_stakeholders"] = formatted_sh
            else:
                data["key_stakeholders"] = []

            # legal_safeguards
            ls = data.get("legal_safeguards")
            if isinstance(ls, list):
                formatted_ls = []
                for sg in ls:
                    if isinstance(sg, str):
                        title = sg.split(":")[0].split(" - ")[0][:60]
                        formatted_ls.append({
                            "title": title or "Legal Safeguard",
                            "summary": sg
                        })
                    elif isinstance(sg, dict):
                        formatted_ls.append(sg)
                data["legal_safeguards"] = formatted_ls
            else:
                data["legal_safeguards"] = []

        return data

class EvrenExtractionResponse(BaseModel):
    document_title: str = "Advisory & Commercial Agreement"
    source_filename: str = "Agreement.pdf"
    confidence_score: float = 0.98
    extraction_engine: str = "Azure Document Intelligence + Azure OpenAI"
    parties: PartiesSection
    commercials: CommercialsSection
    payment_terms: PaymentTermsSection
    suggested_insights: SuggestedInsights = Field(default_factory=SuggestedInsights)
    raw_summary: Optional[str] = None
