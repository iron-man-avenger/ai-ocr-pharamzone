import datetime
from typing import Optional
from app.models.schemas import (
    ExtractedAgreement,
    InvoiceDraftRequest,
    InvoiceDraftResponse,
    InvoiceItem,
    BankDetails
)
from app.services.forex_service import forex_service

def parse_invoice_date(date_str: Optional[str]) -> datetime.datetime:
    """Parses invoice date string in multiple common formats or defaults to now"""
    if not date_str:
        return datetime.datetime.now()
    for fmt in ("%d-%b-%y", "%d-%b-%Y", "%Y-%m-%d", "%d/%m/%Y", "%d/%m/%y"):
        try:
            return datetime.datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            pass
    return datetime.datetime.now()

def calculate_indian_fiscal_year(dt: datetime.datetime) -> str:
    """
    Calculates Indian Financial Year (April 1 to March 31).
    - Apr to Dec -> FY year/(year+1), e.g. Sep 2026 -> '2627'
    - Jan to Mar -> FY (year-1)/year, e.g. Feb 2026 -> '2526'
    """
    year = dt.year
    if dt.month >= 4:
        return f"{str(year)[-2:]}{str(year + 1)[-2:]}"
    else:
        return f"{str(year - 1)[-2:]}{str(year)[-2:]}"

# Static Bank Master for Pharmazone
BANK_ACCOUNTS = {
    "USD": BankDetails(
        account_name="Pharmazone",
        bank_name="HDFC BANK LTD. (USD)",
        account_no="50200002488742",
        branch_ifsc="CHANDLODIYA BRANCH & HDFC0001679",
        swift_code="HDFCINBB",
        currency="USD"
    ),
    "EUR": BankDetails(
        account_name="Pharmazone",
        bank_name="HDFC BANK LTD. (EURO)",
        account_no="16792440000012",
        branch_ifsc="CHANDLODIYA BRANCH & HDFC0001679",
        swift_code="HDFCINBB",
        currency="EUR"
    ),
    "INR": BankDetails(
        account_name="Pharmazone",
        bank_name="HDFC BANK LTD. (INR)",
        account_no="16792320000205",
        branch_ifsc="Chandlodiya, Ahmedabad & HDFC0001679",
        swift_code="HDFCINBB",
        currency="INR"
    )
}

# Default Exchange Rates to INR for Taxable Value calculation
DEFAULT_FOREX_RATES = {
    "USD": 94.05,
    "EUR": 108.12,
    "INR": 1.00
}

def number_to_words_en(amount: float, currency: str) -> str:
    """Helper to convert number to currency words"""
    units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
    teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
    tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

    def convert_below_thousand(n: int) -> str:
        if n == 0:
            return ""
        if n < 10:
            return units[n]
        if n < 20:
            return teens[n - 10]
        if n < 100:
            return tens[n // 10] + (" " + units[n % 10] if n % 10 else "")
        return units[n // 100] + " Hundred" + (" " + convert_below_thousand(n % 100) if n % 100 else "")

    int_part = int(round(amount))
    
    if currency == "INR":
        # Indian numbering system (Crore, Lakh, Thousand)
        if int_part == 0:
            return "Zero Indian Rupees Only"
        crore = int_part // 10000000
        lakh = (int_part % 10000000) // 100000
        thousand = (int_part % 100000) // 1000
        remainder = int_part % 1000
        parts = []
        if crore:
            parts.append(convert_below_thousand(crore) + " Crore")
        if lakh:
            parts.append(convert_below_thousand(lakh) + " Lakh")
        if thousand:
            parts.append(convert_below_thousand(thousand) + " Thousand")
        if remainder:
            parts.append(convert_below_thousand(remainder))
        return " ".join(parts) + " Indian Rupees Only"

    else:
        # Western numbering system (Million, Thousand)
        if int_part == 0:
            curr_name = "Euro" if currency == "EUR" else "USD"
            return f"Zero {curr_name} Only"
        million = int_part // 1000000
        thousand = (int_part % 1000000) // 1000
        remainder = int_part % 1000
        parts = []
        if million:
            parts.append(convert_below_thousand(million) + " Million")
        if thousand:
            parts.append(convert_below_thousand(thousand) + " Thousand")
        if remainder:
            parts.append(convert_below_thousand(remainder))
        curr_name = "Euro" if currency == "EUR" else "USD"
        return " ".join(parts) + f" {curr_name} Only"

class InvoiceEngineService:
    def generate_draft_invoice(self, req: InvoiceDraftRequest) -> InvoiceDraftResponse:
        ag = req.agreement
        parsed_dt = parse_invoice_date(req.invoice_date)
        date_str = req.invoice_date or parsed_dt.strftime("%d-%b-%y")

        # 1. Milestone Selection
        selected_milestone = None
        for m in ag.milestones:
            if m.milestone_number == req.selected_milestone_number:
                selected_milestone = m
                break
        
        if not selected_milestone and ag.milestones:
            selected_milestone = ag.milestones[0]
        
        milestone_num = selected_milestone.milestone_number if selected_milestone else 1
        total_milestones = selected_milestone.total_milestones if selected_milestone else (len(ag.milestones) or 1)
        milestone_amount = selected_milestone.amount if selected_milestone else ag.total_contract_value
        milestone_desc = selected_milestone.description_text if selected_milestone else ""

        # 2. Dynamic Sequential Invoice Number Formatting (Indian FY + Date Month)
        # Pattern: PZ[Dept][FY]/[Month]/[Seq]
        fy = calculate_indian_fiscal_year(parsed_dt)
        month_str = parsed_dt.strftime("%m")
        dept_str = ag.department
        default_seq = f"0{milestone_num:02d}"
        invoice_no = req.custom_invoice_no or f"PZ{dept_str}{fy}/{month_str}/{default_seq}"

        # 3. Reference No Formatting: <Project_ID> <m>/<total> dt. <date>
        project_id = ag.project_id or f"PZ-{dept_str}{fy}001"
        reference_no = f"{project_id} {milestone_num}/{total_milestones} dt. {date_str}"

        # 4. Bank Selection
        currency = ag.currency.upper()
        bank_details = BANK_ACCOUNTS.get(currency, BANK_ACCOUNTS["USD"])

        # 5. Service Header Text
        if ag.is_export:
            invoice_type = "EXPORT"
            invoice_title = "Export Invoice"
            legal_sub_heading = "(SUPPLY MEANT FOR EXPORT/SUPPLY TO SEZ UNIT OR SEZ DEVELOPER FOR AUTHORISED OPERATIONS UNDER BOND OR LETTER OF UNDERTAKING WITHOUT PAYMENT OF IGST)"
            if ag.department == "CR":
                header_desc = "Export Service-Exempt (GCP)"
            elif ag.department == "GM":
                header_desc = "Export Service-Exempt (GMP)"
            else:
                header_desc = "Export Service-Exempt (Regulatory)"
        else:
            invoice_type = "TAX"
            invoice_title = "Tax Invoice"
            legal_sub_heading = ""
            header_desc = f"Local Taxable Service ({ag.department})"

        # 6. Taxes and Subtotals
        subtotal = milestone_amount
        if ag.is_export:
            cgst_rate = 0.0
            cgst_amount = 0.0
            sgst_rate = 0.0
            sgst_amount = 0.0
            igst_rate = 0.0
            igst_amount = 0.0
            total_tax = 0.0
            grand_total = subtotal
            gst_rate_line = 0.0
        else:
            cgst_rate = 9.0
            cgst_amount = round(subtotal * 0.09, 2)
            sgst_rate = 9.0
            sgst_amount = round(subtotal * 0.09, 2)
            igst_rate = 0.0
            igst_amount = 0.0
            total_tax = cgst_amount + sgst_amount
            grand_total = subtotal + total_tax
            gst_rate_line = 18.0

        # 7. Forex conversion for Indian Taxable Value (Live Forex API with fallback)
        fx_rate = req.exchange_rate_to_inr or forex_service.get_rate_to_inr(currency)
        taxable_inr = round(subtotal * fx_rate, 2)

        # 8. Description lines
        item = InvoiceItem(
            header_description=header_desc,
            detailed_description=ag.study_or_project_name,
            site_location=ag.site_or_cro_location,
            milestone_clause=milestone_desc,
            hsn_sac="998113",
            gst_rate=gst_rate_line,
            quantity=1,
            amount=subtotal
        )

        amount_words = number_to_words_en(grand_total, currency)

        return InvoiceDraftResponse(
            invoice_no=invoice_no,
            invoice_date=date_str,
            invoice_type=invoice_type,
            invoice_title=invoice_title,
            legal_sub_heading=legal_sub_heading,
            reference_no=reference_no,
            buyer_order_no=req.buyer_order_no or ag.buyer_order_no,
            buyer_order_date=req.buyer_order_date or ag.buyer_order_date,
            mode_terms_of_payment=f"Within {ag.payment_terms_days} Days",
            country=ag.country,
            buyer_name=ag.client_name,
            buyer_address=ag.client_address,
            buyer_gstin=ag.client_gstin,
            buyer_pan=ag.client_pan,
            item=item,
            currency=currency,
            subtotal=subtotal,
            cgst_rate=cgst_rate,
            cgst_amount=cgst_amount,
            sgst_rate=sgst_rate,
            sgst_amount=sgst_amount,
            igst_rate=igst_rate,
            igst_amount=igst_amount,
            total_tax=total_tax,
            grand_total=grand_total,
            taxable_value_inr=taxable_inr,
            exchange_rate_to_inr=fx_rate,
            amount_in_words=amount_words,
            bank_details=bank_details
        )

invoice_engine = InvoiceEngineService()
