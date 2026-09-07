import os
import json
import base64
import httpx
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUTPUT_PDF = os.path.join(ROOT_DIR, "PharmaAI_Project_Workflow_Diagram.pdf")
USER_IMG = r"C:/Users/LOTUS IT SOLUTION/.gemini/antigravity/brain/8cacb09b-e65a-456d-9491-c6507133c120/.user_uploaded/media_1788790927638.png"
HIGHRES_IMG = os.path.join(os.path.dirname(__file__), "diagram_highres.png")

mermaid_code = """flowchart TD
    subgraph UserInterface["1. Frontend (React + Vite + Tailwind)"]
        UI_A["Option A: Drag and Drop Real Agreement PDF"]
        UI_B["Option B: Click Instant Demonstration Sample"]
        UI_A --> POST_EX["Upload File to /api/extract"]
        UI_B --> GET_SAMP["Fetch Real PDF from /api/sample-file"] --> POST_EX
    end

    subgraph BackendIngest["2. Backend Ingestion and Azure AI Pipeline"]
        POST_EX --> DOC_INTEL["Azure Document Intelligence (prebuilt-layout)"]
        DOC_INTEL -->|Extracted Text and Tables| OPENAI["Azure OpenAI (gpt-5.2)"]
        OPENAI -->|Structured ExtractedAgreement JSON| JSON_RES["HTTP 200 JSON Response"]
    end

    subgraph UserReview["3. Review and Milestone Selection"]
        JSON_RES --> STEP2["Step 2: Extraction Viewer (App.tsx)"]
        STEP2 --> MS_PICK["Select Milestone (e.g. Milestone 2/2)"]
        MS_PICK --> FX_DATE["Set Invoice Date, PO No. and Forex Rate"]
        FX_DATE --> POST_DRAFT["Submit to /api/generate-draft"]
    end

    subgraph InvoicingEngine["4. Pharmazone Invoicing Engine (Python)"]
        POST_DRAFT --> DEPT_RULE{"Department Code?"}
        DEPT_RULE -->|CR Clinical Research| H_CR["Header: Export Service-Exempt (GCP)"]
        DEPT_RULE -->|GM GMP Audits| H_GM["Header: Export/Local Service (GMP)"]
        DEPT_RULE -->|RA Regulatory| H_RA["Header: Export Service-Exempt (Regulatory)"]

        H_CR --> SAC["HSN/SAC Fixed: 998113"]
        H_GM --> SAC
        H_RA --> SAC
        SAC --> BANK{"Currency?"}
        BANK -->|USD| B_USD["HDFC Bank USD A/c: 50200002488742"]
        BANK -->|EUR| B_EUR["HDFC Bank EUR A/c: 16792440000012"]
        BANK -->|INR| B_INR["HDFC Bank INR A/c: 16792320000205"]

        B_USD --> TAX{"Is Export or Domestic?"}
        B_EUR --> TAX
        B_INR --> TAX
        TAX -->|Export Foreign| TAX_EXP["Export Invoice: 0% IGST under LUT + Forex INR"]
        TAX -->|Domestic India| TAX_DOM["Tax Invoice: 9% CGST + 9% SGST = 18% Total"]

        TAX_EXP --> REF["Format Reference: PZ-XXXX 1/2 dt. Date"]
        TAX_DOM --> REF
        REF --> DRAFT_RES["HTTP 200 InvoiceDraftResponse"]
    end

    subgraph Output["5. Output and Printing"]
        DRAFT_RES --> PREVIEW["Step 3: InvoicePreview Component"]
        PREVIEW --> A4_PRINT["Official A4 Print / Save PDF (Ctrl+P)"]
        DRAFT_RES --> HIST["In-Memory Drafts History"]
    end
"""

def fetch_highres_image():
    try:
        graph_dict = {"code": mermaid_code, "mermaid": {"theme": "default"}}
        json_str = json.dumps(graph_dict)
        b64 = base64.b64encode(json_str.encode("utf-8")).decode("ascii")
        url = f"https://mermaid.ink/img/{b64}?scale=3"
        print("Fetching high-resolution diagram from mermaid.ink...")
        r = httpx.get(url, timeout=20.0)
        if r.status_code == 200 and len(r.content) > 1000:
            with open(HIGHRES_IMG, "wb") as f:
                f.write(r.content)
            print(f"Saved high-res image: {HIGHRES_IMG} ({len(r.content)} bytes)")
            return HIGHRES_IMG
    except Exception as e:
        print("Could not fetch from mermaid.ink:", e)
    return None

def build_pdf():
    chosen_img = fetch_highres_image()
    if not chosen_img and os.path.exists(USER_IMG):
        chosen_img = USER_IMG
        print(f"Using uploaded screenshot: {USER_IMG}")

    doc = SimpleDocTemplate(
        OUTPUT_PDF,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1E3A8A'),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#475569'),
        spaceAfter=14
    )
    section_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#334155')
    )
    table_hdr_style = ParagraphStyle(
        'TableHdr',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )
    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#1E293B')
    )

    story = []

    # Title & Header
    story.append(Paragraph("PharmaAI — Architecture & Workflow Diagram", title_style))
    story.append(Paragraph("Pharmaceutical Agreement OCR to Invoice Drafting Platform • End-to-End System Pipeline", subtitle_style))

    # Add Diagram Image
    if chosen_img and os.path.exists(chosen_img):
        with Image.open(chosen_img) as pil_im:
            w, h = pil_im.size
            aspect = h / float(w)
            
            # Max width on A4 page (595 - 72 = 523 pt)
            target_w = 480
            target_h = target_w * aspect
            
            # If it's too tall for single page, scale to fit nicely on page 1
            max_h = 690
            if target_h > max_h:
                target_h = max_h
                target_w = target_h / aspect
                
            story.append(RLImage(chosen_img, width=target_w, height=target_h))
    
    # Page Break for Technical Specification & Details Table
    story.append(PageBreak())

    story.append(Paragraph("System Component Specification & Rule Mapping", title_style))
    story.append(Paragraph("Technical reference for each stage in the PharmaAI data processing pipeline", subtitle_style))

    # Stage breakdown table
    table_data = [
        [
            Paragraph("Stage", table_hdr_style),
            Paragraph("Component / Service", table_hdr_style),
            Paragraph("Key Responsibilities & Logic", table_hdr_style)
        ],
        [
            Paragraph("<b>1. Ingestion</b>", table_cell_style),
            Paragraph("Frontend UI<br/>(React + Vite)", table_cell_style),
            Paragraph("• Drag-and-drop agreement/SOW/Quotation PDFs<br/>• Instant test samples loaded with real binary files from backend<br/>• Submits multipart/form-data to <code>/api/extract</code>", table_cell_style)
        ],
        [
            Paragraph("<b>2. AI Extraction</b>", table_cell_style),
            Paragraph("Azure Document Intelligence<br/>+ Azure OpenAI (gpt-5.2)", table_cell_style),
            Paragraph("• <code>prebuilt-layout</code> extracts tables, structures, and text<br/>• Azure OpenAI parses commercial clauses into strict <code>ExtractedAgreement</code> JSON schema (Client, Milestones, Currency, CRO)", table_cell_style)
        ],
        [
            Paragraph("<b>3. Review & Config</b>", table_cell_style),
            Paragraph("ExtractionViewer &<br/>InvoiceDraftForm", table_cell_style),
            Paragraph("• User verifies extracted study title, parties, and milestones<br/>• Selects target milestone (e.g., Milestone 2/2)<br/>• Configures billing date, Buyer PO, and forex rate to INR", table_cell_style)
        ],
        [
            Paragraph("<b>4. Business Rules</b>", table_cell_style),
            Paragraph("Pharmazone Invoice Engine<br/>(Python Backend)", table_cell_style),
            Paragraph("• <b>Department:</b> CR (GCP), GM (GMP Audits), RA (Regulatory)<br/>• <b>HSN/SAC:</b> Uniform 998113<br/>• <b>Bank Selection:</b> USD (50200002488742), EUR (16792440000012), INR (16792320000205)<br/>• <b>Tax:</b> Export 0% IGST under LUT vs Domestic 18% GST (9% CGST + 9% SGST)<br/>• <b>Reference:</b> <code>&lt;Project_ID&gt; &lt;M&gt;/&lt;Total&gt; dt. &lt;Date&gt;</code>", table_cell_style)
        ],
        [
            Paragraph("<b>5. Invoice Output</b>", table_cell_style),
            Paragraph("InvoicePreview &<br/>Print Stylesheet", table_cell_style),
            Paragraph("• Renders exact Pharmazone export/tax invoice format<br/>• Pixel-perfect A4 printable layout (Ctrl+P / Save as PDF)<br/>• Saves generated drafts to in-memory history repository", table_cell_style)
        ]
    ]

    t = Table(table_data, colWidths=[1.1*inch, 2.0*inch, 4.1*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E3A8A')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))

    story.append(t)

    story.append(Spacer(1, 16))

    # Bank routing summary table
    story.append(Paragraph("Pharmazone Banking Routing Master", section_style))
    bank_data = [
        [Paragraph("Currency", table_hdr_style), Paragraph("Bank Name", table_hdr_style), Paragraph("Account Number", table_hdr_style), Paragraph("IFSC / Branch", table_hdr_style), Paragraph("SWIFT Code", table_hdr_style)],
        [Paragraph("USD ($)", table_cell_style), Paragraph("HDFC BANK LTD. (USD)", table_cell_style), Paragraph("50200002488742", table_cell_style), Paragraph("CHANDLODIYA BRANCH & HDFC0001679", table_cell_style), Paragraph("HDFCINBB", table_cell_style)],
        [Paragraph("EUR (€)", table_cell_style), Paragraph("HDFC BANK LTD. (EURO)", table_cell_style), Paragraph("16792440000012", table_cell_style), Paragraph("CHANDLODIYA BRANCH & HDFC0001679", table_cell_style), Paragraph("HDFCINBB", table_cell_style)],
        [Paragraph("INR (₹)", table_cell_style), Paragraph("HDFC BANK LTD. (INR)", table_cell_style), Paragraph("16792320000205", table_cell_style), Paragraph("Chandlodiya, Ahmedabad & HDFC0001679", table_cell_style), Paragraph("HDFCINBB", table_cell_style)],
    ]
    tb = Table(bank_data, colWidths=[1.0*inch, 1.8*inch, 1.4*inch, 2.0*inch, 1.0*inch])
    tb.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0284C7')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    story.append(tb)

    doc.build(story)
    print(f"Successfully generated PDF at: {OUTPUT_PDF}")

if __name__ == "__main__":
    build_pdf()
