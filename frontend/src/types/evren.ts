export interface PartyDetail {
  name: string;
  role: string;
  legal_status?: string;
  registration_number?: string;
  registered_address?: string;
  operational_address?: string;
  country_or_jurisdiction?: string;
  authorized_signatory?: string;
  signatory_title?: string;
  contact_telephone?: string;
  contact_website?: string;
}

export interface PartiesSection {
  service_provider: PartyDetail;
  client: PartyDetail;
  project_name?: string;
  target_assets_scope?: string;
  related_parties: string[];
}

export interface CommercialsSection {
  execution_date?: string;
  validity_timeline?: string;
  currency: string;
  total_professional_fee: number;
  total_fee_formatted: string;
  fee_in_words?: string;
  out_of_pocket_expenses?: string;
  administrative_expenses?: string;
  tax_terms?: string;
}

export interface MilestoneTranche {
  milestone_number: number;
  percentage: number;
  amount: number;
  amount_formatted: string;
  trigger_condition: string;
  description: string;
  status?: string;
}

export interface PaymentTermsSection {
  credit_period_days: number;
  credit_terms_description: string;
  milestones: MilestoneTranche[];
  tds_provisions?: string;
  forex_and_gst_compliance?: string;
}

export interface Stakeholder {
  name: string;
  role: string;
  entity: string;
  responsibility?: string;
}

export interface MilestoneStep {
  step_number: number;
  title: string;
  date_or_trigger: string;
  description: string;
  badge?: string;
}

export interface LegalSafeguard {
  title: string;
  clause_ref?: string;
  summary: string;
}

export interface SuggestedInsights {
  milestone_stepper: MilestoneStep[];
  key_stakeholders: Stakeholder[];
  regulatory_frameworks: string[];
  legal_safeguards: LegalSafeguard[];
}

export interface EvrenExtractionResponse {
  document_title: string;
  source_filename: string;
  confidence_score: number;
  extraction_engine: string;
  parties: PartiesSection;
  commercials: CommercialsSection;
  payment_terms: PaymentTermsSection;
  suggested_insights: SuggestedInsights;
  raw_summary?: string;
}
