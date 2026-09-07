# PharmaAI — System Workflow & Architecture Diagram

This document contains the complete visual and technical workflow diagram of the **PharmaAI** document extraction and automated invoice drafting platform.

---

## 🗺️ Complete End-to-End Workflow Diagram

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

## 📋 Stage-by-Stage Component Specifications

### Stage 1: Frontend Ingestion (React 18 + Vite + Tailwind CSS)
* **Drag & Drop Upload:** Accepts signed contracts, quotations, SOWs, and purchase orders in `.pdf` format.
* **Instant Demonstration:** Pre-loads authentic sample PDFs via `GET /api/sample-file/{filename}` so users can test full AI extraction without needing local files.
* **Payload Transmission:** Submits file as `multipart/form-data` to `POST /api/extract`.

---

### Stage 2: Backend AI Extraction Pipeline (FastAPI + Azure AI)
* **Azure Document Intelligence (`prebuilt-layout`):** Extracts full text, OCR coordinates, layout tables, and structural sections from multi-page PDFs.
* **Azure OpenAI (`gpt-5.2`):** Extracts structured commercial clauses into strict Pydantic `ExtractedAgreement` JSON:
  * Client Name, Billing Address, Country, and Export status
  * Department code (`CR`, `GM`, `RA`)
  * Total contract value and currency (`USD`, `EUR`, `INR`)
  * Payment terms (days) and milestone table (splits, triggers, clauses)
  * Study/Project name, site/CRO location, and Buyer Order/PO numbers.

---

### Stage 3: Review & Milestone Configuration (`App.tsx` & `InvoiceDraftForm.tsx`)
* **Review Cards:** Displays extracted commercial terms with verification badges.
* **Milestone Selector:** Allows billing individual milestones (e.g. *Milestone 1/2 Advance* vs *Milestone 2/2 Final*).
* **Metadata Overrides:** Configures invoice date, buyer PO reference, and forex conversion rate (to INR for Indian GST e-invoicing).
* **Draft Submission:** Submits structured payload to `POST /api/generate-draft`.

---

### Stage 4: Pharmazone Business Rules & Invoicing Engine (`invoice_engine.py`)
* **Department Line Item Classification:**
  * `CR` (Clinical Research) ➔ `Export Service-Exempt (GCP)`
  * `GM` (GMP Quality Audit) ➔ `Export Service-Exempt (GMP)` or `Local Taxable Service (GMP)`
  * `RA` (Regulatory Affairs) ➔ `Export Service-Exempt (Regulatory)`
* **HSN/SAC Code:** Universally sets SAC code to **`998113`**.
* **Bank Routing by Currency:**
  * **USD:** `HDFC BANK LTD. (USD)` | Account: `50200002488742` | SWIFT: `HDFCINBB`
  * **EUR:** `HDFC BANK LTD. (EURO)` | Account: `16792440000012` | SWIFT: `HDFCINBB`
  * **INR:** `HDFC BANK LTD. (INR)`  | Account: `16792320000205` | SWIFT: `HDFCINBB`
* **Taxation Logic:**
  * **Foreign Exports:** Title `Export Invoice` | 0% IGST under Letter of Undertaking (LUT) | Statutory LUT clause | Dynamic INR conversion.
  * **Domestic (India):** Title `Tax Invoice` | 9% CGST + 9% SGST = **18% total GST**.
* **Reference & Sequential Numbering:**
  * Reference format: `<Project_ID> <Milestone_Index>/<Total> dt. <Date>`
  * Invoice numbering format: `PZ[Dept][FY]/[Month]/[Seq]`

---

### Stage 5: Output & Print-Ready Preview (`InvoicePreview.tsx`)
* **A4 Print Engine:** Exact replica of Pharmazone's official Export/Tax invoice.
* **One-Click Print / PDF:** Print-optimized stylesheet (`@media print`) enables immediate high-resolution A4 export via `Ctrl+P` or **"Print / Save as PDF"**.
* **Drafts Storage:** Retains drafted invoices in an in-memory session history (`InvoiceHistory.tsx`).
