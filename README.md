# PharmaAI - Agreement OCR to Invoice Drafting Platform

An intelligent document extraction and invoice drafting platform built for pharmaceutical agreements, SOWs, and quotations. Powered by **Azure Document Intelligence**, **Azure OpenAI**, **FastAPI (Python)**, and **React (TypeScript + Tailwind CSS)**.

> 📖 **Architecture & Workflow Diagram:** See [WORKFLOW.md](file:///c:/Users/LOTUS%20IT%20SOLUTION/OneDrive%20-%20PIYTECH%20SOLUTIONS/Documents/AI%20OCR%20Pharma/WORKFLOW.md) for the complete visual system diagram and component specifications.  
> 🚀 **Production Roadmap & Hardcoding Audit:** See [PRODUCTION_ROADMAP.md](file:///c:/Users/LOTUS%20IT%20SOLUTION/OneDrive%20-%20PIYTECH%20SOLUTIONS/Documents/AI%20OCR%20Pharma/PRODUCTION_ROADMAP.md) for database schemas and blueprints to make remaining static masters dynamic.

---

## 📁 Project Structure

```
C:\Users\piytech\Documents\AI OCR Pharma\
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py              # API endpoints: /api/extract, /api/generate-draft, /api/health
│   │   ├── core/
│   │   │   └── config.py              # Settings & Azure configuration
│   │   ├── models/
│   │   │   └── schemas.py             # Pydantic models (Agreement, Milestone, InvoiceDraft)
│   │   ├── services/
│   │   │   ├── azure_doc_intel.py     # Azure Document Intelligence OCR extraction
│   │   │   ├── azure_openai_extractor.py # Azure OpenAI structured JSON extraction
│   │   │   └── invoice_engine.py      # Pharmazone business rules & invoice drafting engine
│   │   └── main.py                    # FastAPI app entry point & CORS
│   ├── .env.example                   # Template for Azure keys and endpoints
│   ├── requirements.txt               # Backend Python dependencies
│   └── run.py                         # FastAPI runner script
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx             # Navigation header & Azure AI status badges
│   │   │   ├── FileUpload.tsx         # Drag & Drop PDF uploader & sample test buttons
│   │   │   ├── ExtractionViewer.tsx   # Extracted terms & milestone schedules
│   │   │   ├── InvoiceDraftForm.tsx   # Interactive milestone selector & forex calculator
│   │   │   ├── InvoicePreview.tsx     # Exact replica of Pharmazone Export/Tax Invoice (A4 print-ready)
│   │   │   └── InvoiceHistory.tsx     # Saved drafts manager
│   │   ├── services/
│   │   │   └── api.ts                 # Typed Axios API client
│   │   ├── types/
│   │   │   └── invoice.ts             # TypeScript definitions
│   │   ├── App.tsx                    # Stepper application logic
│   │   └── index.css                  # Tailwind + Print CSS
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── README.md
```

---

## 🚀 Step 1: Backend Setup (Python FastAPI)

As you requested, you can create the virtual environment (`.venv`) and run the backend yourself:

```powershell
# 1. Navigate to the backend directory
cd "C:\Users\piytech\Documents\AI OCR Pharma\backend"

# 2. Create the Python virtual environment
python -m venv .venv

# 3. Activate the virtual environment
.\.venv\Scripts\Activate.ps1

# 4. Install dependencies
pip install -r requirements.txt

# 5. (Optional) Configure Azure Credentials
# Copy the example env file:
Copy-Item .env.example .env
# Edit .env with your Azure Document Intelligence and Azure OpenAI keys when available.
# (Note: Even without keys, the system includes a built-in mock fallback for immediate testing)

# 6. Run the FastAPI server
python run.py
```

* Backend will run on: `http://127.0.0.1:8000`
* Interactive API Documentation (Swagger): `http://127.0.0.1:8000/docs`

---

## 💻 Step 2: Frontend Setup (React + Vite + Tailwind)

Once you have Node.js / npm installed on your machine:

```powershell
# 1. Navigate to the frontend directory
cd "C:\Users\piytech\Documents\AI OCR Pharma\frontend"

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev
```

* Frontend will run on: `http://localhost:5173`

---

## ⚙️ Pharmazone Business Rules Embedded in this Engine

1. **Department Auto-Classification:**
   * **`CR` (Clinical Research):** Sets invoice header to `Export Service-Exempt (GCP)`.
   * **`GM` (GMP Audits):** Sets header to `Export Service-Exempt (GMP)` (foreign) or `Local Taxable Service (GMP)` (domestic).
   * **`RA` (Regulatory Affairs):** Sets header to `Export Service-Exempt (Regulatory)`.
   * HSN/SAC is uniformly configured to **`998113`**.

2. **Bank Account Auto-Selection:**
   * **USD:** Selects `HDFC BANK LTD. (USD)` (A/c: `50200002488742`, SWIFT: `HDFCINBB`).
   * **EUR:** Selects `HDFC BANK LTD. (EURO)` (A/c: `16792440000012`, SWIFT: `HDFCINBB`).
   * **INR:** Selects `HDFC BANK LTD. (INR)` (A/c: `16792320000205`, SWIFT: `HDFCINBB`).

3. **Reference Syntax:**
   * Formats milestone tracking as `<Project_ID> <Milestone>/<Total> dt. <Date>` (e.g. `PZ-CR2526307 1/2 dt. 31-Mar-26`).

4. **Tax Calculation:**
   * **Foreign Exports:** 0% IGST under Letter of Undertaking (LUT) with export declaration.
   * **Domestic (India):** 9% CGST + 9% SGST (Total 18%) added to base fee.
   * **Taxable Value in INR:** Converted dynamically using real-time forex rates for Indian GST e-invoicing compliance.

5. **A4 Print / Save PDF:**
   * The Invoice Preview includes print-optimized CSS that converts the preview into a clean A4 PDF when you click **"Print / Save as PDF"** or press `Ctrl+P`.
