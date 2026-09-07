export interface Milestone {
  milestone_number: number;
  total_milestones: number;
  percentage: number;
  amount: number;
  trigger_event: string;
  description_text: string;
}

export interface ExtractedAgreement {
  project_id: string;
  department: 'CR' | 'GM' | 'RA';
  client_name: string;
  client_address: string;
  client_gstin?: string | null;
  client_pan?: string | null;
  country: string;
  is_export: boolean;
  currency: 'USD' | 'EUR' | 'INR';
  total_contract_value: number;
  payment_terms_days: number;
  study_or_project_name: string;
  site_or_cro_location: string;
  agreement_date?: string | null;
  milestones: Milestone[];
  buyer_order_no?: string | null;
  buyer_order_date?: string | null;
  suggested_milestone?: number | null;
  raw_summary?: string | null;
}

export interface BankDetails {
  account_name: string;
  bank_name: string;
  account_no: string;
  branch_ifsc: string;
  swift_code: string;
  currency: string;
}

export interface InvoiceItem {
  header_description: string;
  detailed_description: string;
  site_location?: string | null;
  milestone_clause?: string | null;
  hsn_sac: string;
  gst_rate: number;
  quantity: number;
  amount: number;
}

export interface InvoiceDraftRequest {
  agreement: ExtractedAgreement;
  selected_milestone_number: number;
  invoice_date?: string;
  exchange_rate_to_inr?: number;
  custom_invoice_no?: string;
  buyer_order_no?: string;
  buyer_order_date?: string;
}

export interface InvoiceDraftResponse {
  invoice_no: string;
  invoice_date: string;
  invoice_type: 'EXPORT' | 'TAX';
  invoice_title: string;
  legal_sub_heading: string;
  reference_no: string;
  buyer_order_no?: string | null;
  buyer_order_date?: string | null;
  mode_terms_of_payment: string;
  country: string;
  seller_name: string;
  seller_address: string;
  seller_gstin: string;
  seller_state: string;
  seller_email: string;
  seller_pan: string;
  buyer_name: string;
  buyer_address: string;
  buyer_gstin?: string | null;
  buyer_pan?: string | null;
  buyer_state?: string | null;
  item: InvoiceItem;
  currency: string;
  subtotal: number;
  cgst_rate: number;
  cgst_amount: number;
  sgst_rate: number;
  sgst_amount: number;
  igst_rate: number;
  igst_amount: number;
  total_tax: number;
  grand_total: number;
  taxable_value_inr: number;
  exchange_rate_to_inr: number;
  amount_in_words: string;
  bank_details: BankDetails;
}

export interface HealthStatus {
  status: string;
  doc_intel_configured: boolean;
  openai_configured: boolean;
  mock_fallback_enabled: boolean;
}

export interface SampleAgreementItem {
  id: string;
  name: string;
  filename: string;
  missing_invoice?: string;
  target_milestone?: number;
}

export interface ForexRatesResponse {
  rates: {
    USD: number;
    EUR: number;
    INR: number;
    [key: string]: number;
  };
  last_updated: number;
  source: string;
}
