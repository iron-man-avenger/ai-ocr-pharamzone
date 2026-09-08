import logging
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class AzureDocumentIntelligenceService:
    def __init__(self):
        self.endpoint = settings.AZURE_DOC_INTEL_ENDPOINT
        self.key = settings.AZURE_DOC_INTEL_KEY

    async def analyze_document(self, file_bytes: bytes, filename: str = "", allow_fallback: bool = True) -> Dict[str, Any]:
        """
        Analyze document using Azure Document Intelligence Layout model.
        Falls back to intelligent mock extractor only if allow_fallback is True.
        """
        if settings.has_doc_intel:
            try:
                from azure.core.credentials import AzureKeyCredential
                from azure.ai.documentintelligence import DocumentIntelligenceClient
                from azure.ai.documentintelligence.models import AnalyzeDocumentRequest

                client = DocumentIntelligenceClient(
                    endpoint=self.endpoint,
                    credential=AzureKeyCredential(self.key)
                )

                poller = client.begin_analyze_document(
                    model_id="prebuilt-layout",
                    body=AnalyzeDocumentRequest(bytes_source=file_bytes)
                )
                result = poller.result()

                extracted_text = result.content or ""
                tables = []
                if result.tables:
                    for t in result.tables:
                        table_data = []
                        for cell in t.cells:
                            table_data.append({
                                "row": cell.row_index,
                                "col": cell.column_index,
                                "content": cell.content
                            })
                        tables.append(table_data)

                return {
                    "source": "azure_doc_intel",
                    "content": extracted_text,
                    "tables": tables,
                    "filename": filename
                }

            except Exception as e:
                logger.error(f"Azure Document Intelligence error: {e}")
                if not allow_fallback or not settings.ENABLE_MOCK_FALLBACK:
                    raise RuntimeError(f"Azure Document Intelligence could not parse '{filename}': {str(e)}")
                logger.warning("Falling back to simulated OCR extraction...")

        if allow_fallback and settings.ENABLE_MOCK_FALLBACK:
            return self._mock_extraction(file_bytes, filename)
        
        raise ValueError("Azure Document Intelligence credentials are not configured and fallback is disabled.")

    def _mock_extraction(self, file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Fallback OCR extractor that detects known document signatures for quick testing.
        """
        content = ""
        fn = filename.lower()
        
        if "esomeprazole" in fn or "pharmaris" in fn:
            content = """
            Vendor Name: Pharmazone
            Client Name: Pharmaris Canada Inc., Canada
            Name of Contact Person: Mr. Deepak Sehajpaul - deepak@pharmaris.com
            Date of Proposal: 24-Mar-2026 - D02
            Study Details: A double blinded, balanced, randomized, single dose, two-treatment, two-sequence, two-period, cross over, oral bioequivalence study Comparing PrpRZ-ESOMEPRAZOLE (Esomeprazole Magnesium Delayed Release Tablets 40mg) with P1NEXIUM® Esomeprazole Delayed release tablets 40 mg in healthy, adult, human subjects under fasting conditions
            CRO - Name and Location: VerGo Pharma Research Pvt. Ltd., Goa
            Pilot/Pivotal: Pivotal
            Total No of Subjects: 40
            Final Price (USD): $ 3,150
            Payment Schedule:
            (a) 1st payment: Sponsor will pay Pharmazone 50% of total Service Fee, within 30 working days after the date of the agreement signing/Proposal signing/ PO issuance and for kick start activities.
            (b) 2nd payment: Sponsor will pay Pharmazone 50% of total Service Fee, within 30 working days after completion of last Monitoring visit.
            """
        elif "tafamidis" in fn or "coripharma" in fn:
            content = """
            ANNEXURE I: TEMPLATE OF PROJECT CONTRACT
            PROJECT CONTRACT
            PHARMAZONE PROJECT ID: PZ-CR2526307
            CRO PROJECT ID: C1B06669
            SPONSOR: Coripharma ehf., Reykjavikurvegur 78-80, 220 Hafnarfjordur, Iceland
            SERVICE PROVIDER: PHARMAZONE
            PROJECT NAME: An Open label, randomized, balanced, 3-way crossover, single dose, oral bioequivalence study of Tafamidis 61 mg film-coated tablets under Fed condition.
            SCOPE OF WORK: Site Initiation Visit, Interim Monitoring Visit, In-process BA monitoring, Retrospective BA Monitoring, Site Close-out Visit
            AGREED PRICE (TOTAL CONTRACT VALUE): EURO 3200
            MONITORING SITE: Cliantha Research Ltd., Vadodara
            PAYMENT TERMS:
            (a) 1st payment: Coripharma shall pay Pharmazone EURO 1600, 50% of total Contract value, within thirty (30) working days after the date of the agreement signed and for kick start activities.
            (b) 2nd payment: Coripharma shall pay Pharmazone EURO 1600, 50% of total Contract value, within thirty (30) working days after the completion of the last Monitoring visit.
            """
        elif "advancion" in fn or "fis" in fn:
            content = """
            Proposal For: GMP QA Compliance Audit
            Important Details of the Proposal
            1 Proposal Prepared for: F.I.S. - Fabbrica Italiana Sintetici S.p.A.
            VIA CALLESELLA 57, MONTECCHIO MAGGIORE VI 36075 Italy
            Date of Preparation: 30th July 2025
            Tasks: GMP QA Compliance Onsite Audit at – ADVANCION Covering TRISAMINA A (FIS code 8241260)
            Site Name and Location: ADVANCION 350 Louisiana Highway 2 Sterlington LA 71280 USA
            Total Price (EURO): EURO 3700 for 1 Man Day audit
            Payment Schedule:
            (a) 1st payment: Sponsor shall pay Pharmazone EURO 1850, 50% of total Service Fee, within 60 calendar days after the date of the agreement signed.
            (b) 2nd payment: Sponsor shall pay Pharmazone EURO 1850, 50% of total Service Fee, within 60 calendar days after submission of Audit Report.
            Purchase Order / Reference: 25015258 - OH
            """
        elif "saifen" in fn:
            content = """
            Proposal For: EU Feasibility Audit
            Important Details of The Proposal
            1 Proposal Prepared for: Saifen Drugs (India) Pvt. Ltd.
            8th Floor, 824 Gala Empire, Opp. T.V. Tower, Drive In Road, Ahmedabad, Gujarat, India
            GSTIN: 24ABMCS0515J1ZD PAN: ABMCS0515J
            Date of Preparation: 8th January, 2026
            Tasks: To do EU Feasibility Audit for Saifen Drugs (India) Pvt. Ltd.
            Audit Site Location: Naroda GIDC Phase IV, Ahmedabad
            Total Price (INR): INR 1,20,000 + GST as extra
            Payment Schedule:
            1st payment & Final payment: Client shall pay Pharmazone 1,20,000 INR, i.e., 100% of total Service Fee, immediately after the proposal signed and for the kick start activity.
            """
        elif "paroxetine" in fn or "medis" in fn:
            content = """
            Proposal For: Update of Nonclinical Overview and Clinical Overview
            Proposal Prepared for: Medis ehf, Dalshraun 1, 220 Hafnarfjordur, Iceland, VAT- IS22909
            Project Reference: PZ-RA2526021
            Project Details: Update Modules 2.4 and 2.5 (CO & NCO) - Paroxetine film coated tablets
            Update of following modules from 2022:
            Module 2.4 (Non-Clinical Overview)
            Module 2.5 (Clinical Overview)
            Module 4.3 (Non-Clinical Literature References)
            Module 5.4 (Clinical Literature References)
            Module 1.4.2 (Non-Clinical Expert Sign with CV)
            Module 1.4.3 (Clinical Expert Sign with CV)
            Cost (EURO): € 3,000
            Payment Schedule:
            1st payment: Sponsor shall pay Pharmazone on Agreement signing, 50% of total Service Fee (€1,500).
            2nd payment: Sponsor shall pay Pharmazone on Work Completion, 50% of total Service Fee (€1,500).
            """
        else:
            content = f"Uploaded PDF content extracted from {filename}. Ready for structured parsing."

        return {
            "source": "simulated_fallback",
            "content": content,
            "tables": [],
            "filename": filename
        }

doc_intel_service = AzureDocumentIntelligenceService()
