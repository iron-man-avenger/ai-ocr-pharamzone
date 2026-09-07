# PharmaAI - Agreement OCR to Invoice Drafting: Complete Project Context

> **Antigravity Context Reference:**  
> This project was designed and initialized in conversation:  
> [PharmaAI Genesis Session](conversation://876d1491-17e0-454b-a363-f901b3b00a38)  
> Conversation ID: `876d1491-17e0-454b-a363-f901b3b00a38`  
> Project Path: `C:\Users\piytech\Documents\AI OCR Pharma` (synchronized with `C:\Users\piytech\OneDrive - PIYTECH SOLUTIONS\Documents\AI OCR Pharma`)

---

## 1. Executive Summary & Objective

**Primary Goal:**  
Build an automated platform that ingests signed pharmaceutical Master Service Agreements (MSAs), Statements of Work (SOWs), Quotations, and Purchase Orders (POs) in PDF format, extracts all structured commercial terms using **Azure Document Intelligence** and **Azure OpenAI**, and automatically drafts official invoices matching **Pharmazone's** exact export and domestic invoice formats.

### The Problem It Solves:
1. Pharmaceutical contracts contain complex milestones (e.g., 50% on signing, 50% on final report), varied currencies (USD, EUR, INR), and multi-site monitoring scopes.
2. Manually copying study names, CRO sites, milestone clauses, and project codes into accounting software is time-consuming and error-prone.
3. Indian GST compliance requires distinct handling for exports (0% under Letter of Undertaking / LUT with forex-to-INR conversion) versus domestic transactions (18% CGST + SGST), plus specific HDFC bank account routing based on currency.

---

## 2. Deep Dive: Document Analysis & Real-World Dataset

In this project, 14 actual documents (agreements, quotes, POs, and final issued invoices) were analyzed from `samples/` to discover the exact field mappings:

| # | Invoice File | Matched Agreement / PO | Client & Country | Currency & Amount | Department |
|---|---|---|---|---|---|
| **1** | `PZCR2526-03-027` | `Quote_Esomeprazole_40mg_tab_Fast_d02_24Mar26-Signed.pdf` | **Pharmaris Canada Inc** (Canada) | **USD $1,575.00** (50% of $3,150) | `CR` (Clinical Research / GCP) |
| **2** | `PZCR2526-03-043` | `PZ-CR2526307 Tafamidis-61mg-Fed-D01-25Mar26-FE.pdf` + `4.MSA_Coripharma.pdf` | **Coripharma ehf** (Iceland) | **EUR €1,600.00** (50% of €3,200) | `CR` (Clinical Research / GCP) |
| **3** | `PZGM2526-02-008` | `Pharmazone Quotation GMP QA Audit FIS Advancion 30Jul25-v01-signed.pdf` + `RD574350TE...pdf` (PO) | **F.I.S. - Fabbrica Italiana Sintetici S.p.A.** (Italy) | **EUR €1,850.00** (50% of €3,700) | `GM` (GMP QA Audit) |
| **4** | `PZGM2526-01-012` | `signed_Saifen Drugs - Quotation EU Feasibility Audit_080126.Pdf` | **Saifen Drugs (India) Pvt Ltd** (India) | **INR ₹1,41,600.00** (₹1.2L + 18% GST) | `GM` (GMP Audit - Domestic) |
| **5** | `PZRA2526-02-04` *(Inv 01)* | `PZ RA 2526021_Proposal_Update_M_2.4_M_2.5_Paroxetine...pdf` | **Medis ehf** (Iceland) | **EUR €1,500.00** (Milestone 1 of 2) | `RA` (Regulatory Affairs) |
| **6** | `PZRA2526-02-07` *(Inv 02)* | `PZ RA 2526021_Proposal_Update_M_2.4_M_2.5_Paroxetine...pdf` | **Medis ehf** (Iceland) | **EUR €1,500.00** (Milestone 2 of 2) | `RA` (Regulatory Affairs) |

---

## 3. Discovered Pharmazone Business Logic & Rules

### A. Department Classification & Service Header
The project code prefix or document type dictates the department and the invoice line item header:
* **`CR` (Clinical Research):** Header = `Export Service-Exempt (GCP)`
* **`GM` (GMP Quality Audit):** Header = `Export Service-Exempt (GMP)` (Export) or `Local Taxable Service (GMP)` (Domestic)
* **`RA` (Regulatory Affairs):** Header = `Export Service-Exempt (Regulatory)`
* **HSN/SAC Code:** Universally **`998113`** across all services.

### B. Bank Account Auto-Routing
Pharmazone routes payments to specific HDFC bank accounts according to invoice currency:
* **USD:** `HDFC BANK LTD. (USD)` | A/c: `50200002488742` | Branch & IFSC: `CHANDLODIYA BRANCH & HDFC0001679` | SWIFT: `HDFCINBB`
* **EUR:** `HDFC BANK LTD. (EURO)` | A/c: `16792440000012` | Branch & IFSC: `CHANDLODIYA BRANCH & HDFC0001679` | SWIFT: `HDFCINBB`
* **INR:** `HDFC BANK LTD. (INR)` | A/c: `16792320000205` | Branch & IFSC: `Chandlodiya, Ahmedabad & HDFC0001679` | SWIFT: `HDFCINBB`

### C. Reference Numbering Syntax
Tracks the project code and milestone index:
* **Format:** `<Project_ID> <Milestone_Index>/<Total_Milestones> dt. <Invoice_Date>`
* **Examples:**
  * `PZ-CR2526307 1/2 dt. 31-Mar-26` (Milestone 1 of 2)
  * `PZ-GM2526512 2/2 dt. 20-Feb-26` (Milestone 2 of 2)
  * `PZ-GM2526813 1/1 dt. 19-Jan-26` (100% full payment)

### D. Invoice Numbering Scheme
* **Format:** `PZ[Dept][FiscalYear]/[Month]/[Sequence]`
* **Examples:**
  * `PZCR2526/03/027` ➔ `PZ` + `CR` + `2526` (FY 2025-26) + `/03/` (March) + `027`
  * `PZGM2526/02/008` ➔ `PZ` + `GM` + `2526` + `/02/` (February) + `008`
  * `PZRA2526/02/04` ➔ `PZ` + `RA` + `2526` + `/02/` + `04`

### E. Taxation Logic
* **Foreign Clients (Exports):**
  * Title: **Export Invoice**
  * Sub-heading: `(SUPPLY MEANT FOR EXPORT/SUPPLY TO SEZ UNIT OR SEZ DEVELOPER FOR AUTHORISED OPERATIONS UNDER BOND OR LETTER OF UNDERTAKING WITHOUT PAYMENT OF IGST)`
  * GST Rate: **0%**
  * Indian GST Taxable Value in INR is calculated using the billing date's exchange rate (e.g., EUR ~108.12, USD ~94.05).
* **Domestic Clients (India / Gujarat):**
  * Title: **Tax Invoice**
  * Output CGST @ 9% + Output SGST @ 9% = **18% total GST** added to the base audit fee.

---

## 4. End-to-End System Architecture

```mermaid
flowchart TD
    subgraph UserInterface["1. Frontend (React + Vite + Tailwind)"]
        UI_A["Option A: Drag & Drop Real Agreement PDF"]
        UI_B["Option B: Click Instant Demonstration Sample"]
        UI_B --> GET_SAMP["Fetch Real PDF from /api/sample-file"]
        GET_SAMP --> POST_EX["Upload File to /api/extract"]
        UI_A --> POST_EX
    end

    subgraph BackendIngest["2. Backend Ingestion & Azure AI Pipeline"]
        POST_EX --> DOC_INTEL["Azure Document Intelligence (prebuilt-layout)"]
        DOC_INTEL -->|Extracted Text & Tables| OPENAI["Azure OpenAI (gpt-5.2)"]
        OPENAI -->|Structured ExtractedAgreement JSON| JSON_RES["HTTP 200 JSON Response"]
    end

    subgraph UserReview["3. Review & Milestone Selection"]
        JSON_RES --> STEP2["Step 2: Extraction Viewer (App.tsx)"]
        STEP2 --> MS_PICK["Select Milestone (e.g. Milestone 2/2)"]
        MS_PICK --> FX_DATE["Set Invoice Date, PO No. & Forex Rate"]
        FX_DATE --> POST_DRAFT["Submit to /api/generate-draft"]
    end

    subgraph InvoicingEngine["4. Pharmazone Invoicing Engine (Python)"]
        POST_DRAFT --> DEPT_RULE{"Department Code?"}
        DEPT_RULE -->|CR (Clinical Research)| H_CR["Header: Export Service-Exempt (GCP)"]
        DEPT_RULE -->|GM (GMP Audits)| H_GM["Header: Export/Local Service (GMP)"]
        DEPT_RULE -->|RA (Regulatory)| H_RA["Header: Export Service-Exempt (Regulatory)"]

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

        TAX -->|Export (Foreign)| TAX_EXP["Export Invoice: 0% IGST under LUT + Forex INR"]
        TAX -->|Domestic (India)| TAX_DOM["Tax Invoice: 9% CGST + 9% SGST = 18% Total"]

        TAX_EXP --> REF["Format Reference: PZ-XXXX 1/2 dt. Date"]
        TAX_DOM --> REF
        REF --> DRAFT_RES["HTTP 200 InvoiceDraftResponse"]
    end

    subgraph Output["5. Output & Printing"]
        DRAFT_RES --> PREVIEW["Step 3: InvoicePreview Component"]
        PREVIEW --> A4_PRINT["Official A4 Print / Save PDF (Ctrl+P)"]
        DRAFT_RES --> HIST["In-Memory Drafts History"]
    end
```

---

## 5. Directory Structure & File Map

```
AI OCR Pharma/
├── PROJECT_CONTEXT.md                # THIS MASTER CONTEXT FILE
├── README.md                         # Quick start setup instructions
├── samples/                          # 14 original reference PDFs (Agreements + Invoices)
│
├── backend/
│   ├── .env.example                  # Environment keys template
│   ├── requirements.txt              # FastAPI, pydantic, openai, azure-ai-documentintelligence
│   ├── run.py                        # Python launch script (uvicorn)
│   ├── .venv/                        # Ready-to-use virtual environment
│   └── app/
│       ├── main.py                   # FastAPI app, CORS setup, root route
│       ├── core/
│       │   └── config.py             # Settings, Azure connection validation
│       ├── models/
│       │   └── schemas.py            # Pydantic schemas (ExtractedAgreement, Milestone, InvoiceDraft)
│       ├── services/
│       │   ├── azure_doc_intel.py    # Azure Document Intelligence OCR + mock fallback
│       │   ├── azure_openai_extractor.py # Azure OpenAI structured prompt & JSON extraction
│       │   └── invoice_engine.py     # Pharmazone business rules, bank routing & tax logic
│       └── api/
│           └── routes.py             # /extract, /generate-draft, /sample-agreements, /health
│
└── frontend/
    ├── package.json                  # React 18, TypeScript, Tailwind, Lucide React, Axios
    ├── vite.config.ts                # Vite config with backend proxy (/api -> 8000)
    ├── tailwind.config.js            # Custom pharma blue & slate color palette
    ├── src/
    │   ├── main.tsx                  # React entry point
    │   ├── App.tsx                   # Stepper workflow controller
    │   ├── index.css                 # Tailwind directives & @media print A4 stylesheet
    │   ├── types/
    │   │   └── invoice.ts            # Typed interfaces matching backend Pydantic models
    │   ├── services/
    │   │   └── api.ts                # Axios client for backend endpoints
    │   └── components/
    │       ├── Navbar.tsx            # Live Azure AI status pills & workflow navigation
    │       ├── FileUpload.tsx        # Drag & drop upload + 5 one-click sample buttons
    │       ├── ExtractionViewer.tsx  # Cards displaying extracted terms & milestone table
    │       ├── InvoiceDraftForm.tsx  # Milestone picker, PO number, and forex calculator
    │       ├── InvoicePreview.tsx    # Official Pharmazone invoice layout (A4 print-ready)
    │       └── InvoiceHistory.tsx    # Table of generated drafts
```

---

## 6. Pydantic Schemas & Data Contracts

### Extracted Agreement Schema (`schemas.py`):
```json
{
  "project_id": "PZ-CR2526307",
  "department": "CR",
  "client_name": "Coripharma ehf.",
  "client_address": "Reykjavikurvegur 78-80, 220 Hafnarfjordur, Iceland",
  "country": "Iceland",
  "is_export": true,
  "currency": "EUR",
  "total_contract_value": 3200.00,
  "payment_terms_days": 30,
  "study_or_project_name": "An Open label, randomized, balanced, 3-way crossover, single dose, oral bioequivalence study of Tafamidis 61 mg film-coated tablets under Fed condition.",
  "site_or_cro_location": "Cliantha Research Ltd., Vadodara",
  "milestones": [
    {
      "milestone_number": 1,
      "total_milestones": 2,
      "percentage": 50,
      "amount": 1600.00,
      "trigger_event": "Agreement signed and kick start activities",
      "description_text": "50% of total Contract value within thirty (30) working days after the date of the agreement signed"
    },
    {
      "milestone_number": 2,
      "total_milestones": 2,
      "percentage": 50,
      "amount": 1600.00,
      "trigger_event": "Completion of last Monitoring visit",
      "description_text": "50% of total Contract value within thirty (30) working days after completion of last Monitoring visit"
    }
  ]
}
```

---

## 7. How Another Antigravity / Developer Can Continue

1. **Start the Backend:**
   ```powershell
   cd "C:\Users\piytech\Documents\AI OCR Pharma\backend"
   .\.venv\Scripts\Activate.ps1
   python run.py
   ```
2. **Start the Frontend:**
   ```powershell
   cd "C:\Users\piytech\Documents\AI OCR Pharma\frontend"
   npm install
   npm run dev
   ```
3. **Plugging In Azure Credentials:**
   * Edit `backend/.env` with:
     ```ini
     AZURE_DOC_INTEL_ENDPOINT=https://<your-resource>.cognitiveservices.azure.com/
     AZURE_DOC_INTEL_KEY=<your-key>
     AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com/
     AZURE_OPENAI_API_KEY=<your-key>
     AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
     AZURE_OPENAI_API_VERSION=2024-08-01-preview
     ```
   * As soon as keys are entered, `has_doc_intel` and `has_openai` switch to `True`, and the live Azure services take over from mock mode automatically.
