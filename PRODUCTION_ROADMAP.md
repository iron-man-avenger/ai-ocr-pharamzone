# PharmaAI — Production Readiness & Architecture Roadmap

This document catalogs all remaining hardcoded items in the codebase, explains their current implementations, and provides concrete architectural blueprints to transition the platform into an enterprise, production-ready SaaS/ERP solution.

---

## 📌 Executive Status Overview

| Capability | Current Status | Production Target | Priority |
|---|---|---|:---:|
| **Forex Exchange Rates** | ✅ **100% Dynamic** (Live API via `open.er-api.com` + user override) | Integrated with RBI official daily reference rate | Completed |
| **Indian Fiscal Year** | ✅ **100% Dynamic** (Auto-calculated Apr 1 - Mar 31 from invoice date) | Automated accounting year rollover | Completed |
| **Invoice Sequential Numbering** | ⚠️ **Semi-Hardcoded** (`001`, `002` per milestone, stored in RAM) | DB sequence counter per department/FY/month (`PZCR2627/09/001`...) | **High** |
| **Invoice Storage & Persistence** | ⚠️ **In-Memory** (`DRAFT_INVOICES_DB = []` in server memory) | PostgreSQL / SQLite relational database | **High** |
| **Seller & Company Master Data** | ⚠️ **Hardcoded** (Pharmazone name, Sola address, GSTIN, PAN) | `CompanyProfile` settings screen & database record | **Medium** |
| **Bank Routing Master** | ⚠️ **Hardcoded Dictionary** (HDFC USD, EUR, INR accounts) | `BankAccounts` table with multi-currency management | **Medium** |
| **Department & SAC Code Master** | ⚠️ **Hardcoded Tuple** (`CR`, `GM`, `RA` mapped to SAC `998113`) | `Department` master table with customizable SAC & headers | **Medium** |
| **LUT Statutory ARN Number** | ⚠️ **Hardcoded Generic Text** | Dynamic annual LUT ARN and date stamped on export invoices | **Medium** |
| **AI Fallback Mocks** | ⚠️ **Hardcoded 5 Sample Profiles** | Toggleable via `ENABLE_MOCK_FALLBACK=false` for pure live OCR | **Low** |

---

## 🔍 Detailed Audit of Remaining Hardcoded Items

### 1. Database Persistence & Sequential Invoice Numbering
* **Current Implementation:**
  * In [`backend/app/api/routes.py`](file:///c:/Users/LOTUS%20IT%20SOLUTION/OneDrive%20-%20PIYTECH%20SOLUTIONS/Documents/AI%20OCR%20Pharma/backend/app/api/routes.py):
    ```python
    DRAFT_INVOICES_DB: List[InvoiceDraftResponse] = []  # Stored in server memory
    ```
  * In [`backend/app/services/invoice_engine.py`](file:///c:/Users/LOTUS%20IT%20SOLUTION/OneDrive%20-%20PIYTECH%20SOLUTIONS/Documents/AI%20OCR%20Pharma/backend/app/services/invoice_engine.py):
    ```python
    default_seq = f"0{milestone_num:02d}"  # Defaults to 001 or 002
    ```
* **Limitation:** Invoices reset if the backend restarts, and multiple invoices drafted in the same month risk sequence duplication if not custom-named.
* **Production Solution:**
  1. Add an SQLite or PostgreSQL database using SQLAlchemy.
  2. Implement an auto-incrementing atomic sequence generator that queries:
     ```sql
     SELECT COALESCE(MAX(sequence_number), 0) + 1 
     FROM invoices 
     WHERE department = :dept AND fiscal_year = :fy AND month = :month;
     ```
  3. Formats sequentially: `001` ➔ `002` ➔ `003`...

---

### 2. Seller & Company Entity Master Data
* **Current Implementation:**
  * In [`backend/app/models/schemas.py`](file:///c:/Users/LOTUS%20IT%20SOLUTION/OneDrive%20-%20PIYTECH%20SOLUTIONS/Documents/AI%20OCR%20Pharma/backend/app/models/schemas.py):
    ```python
    seller_name: str = "Pharmazone"
    seller_address: str = "402, Shafalya Elegance, Nr. Shakti Arcade, Opp. Sola Water Tank, Sola, Ahmedabad-380060, India"
    seller_gstin: str = "24AAMFP6329H1Z1"
    seller_state: str = "Gujarat, Code : 24"
    seller_email: str = "accounts@pharmazones.com"
    seller_pan: str = "AAMFP6329H"
    ```
  * In [`frontend/src/components/InvoicePreview.tsx`](file:///c:/Users/LOTUS%20IT%20SOLUTION/OneDrive%20-%20PIYTECH%20SOLUTIONS/Documents/AI%20OCR%20Pharma/frontend/src/components/InvoicePreview.tsx): Hardcoded address lines and website string (`www.pharmazones.com`).
* **Limitation:** If Pharmazone relocates, updates its GSTIN, or if the platform is deployed for a sister company, code modification is required.
* **Production Solution:**
  * Create a `CompanyProfile` database table and a `/settings/company` frontend screen:
    * Legal Name & Trade Name
    * Registered Office Address & Billing Address
    * GSTIN, State Code, and PAN
    * Accounts Email, Phone, Website
    * Digital Signature & Company Stamp image uploads.

---

### 3. Bank Accounts Master & Multi-Currency Routing
* **Current Implementation:**
  * In [`backend/app/services/invoice_engine.py`](file:///c:/Users/LOTUS%20IT%20SOLUTION/OneDrive%20-%20PIYTECH%20SOLUTIONS/Documents/AI%20OCR%20Pharma/backend/app/services/invoice_engine.py):
    ```python
    BANK_ACCOUNTS = {
        "USD": BankDetails(bank_name="HDFC BANK LTD. (USD)", account_no="50200002488742", ...),
        "EUR": BankDetails(bank_name="HDFC BANK LTD. (EURO)", account_no="16792440000012", ...),
        "INR": BankDetails(bank_name="HDFC BANK LTD. (INR)", account_no="16792320000205", ...)
    }
    ```
* **Limitation:** Cannot configure non-HDFC accounts (e.g. ICICI, SBI) or support additional currencies like **GBP (£)**, **CAD ($)**, or **AUD ($)** without code edits.
* **Production Solution:**
  * Create a `BankMaster` database table with a `/settings/banking` admin view:
    ```sql
    CREATE TABLE bank_accounts (
        id SERIAL PRIMARY KEY,
        currency VARCHAR(3) NOT NULL,
        bank_name VARCHAR(100) NOT NULL,
        account_name VARCHAR(100) NOT NULL,
        account_number VARCHAR(50) NOT NULL,
        branch_and_ifsc VARCHAR(100) NOT NULL,
        swift_code VARCHAR(20) NOT NULL,
        is_default BOOLEAN DEFAULT TRUE
    );
    ```

---

### 4. Department Master & HSN/SAC Code Mapping
* **Current Implementation:**
  * In [`backend/app/services/invoice_engine.py`](file:///c:/Users/LOTUS%20IT%20SOLUTION/OneDrive%20-%20PIYTECH%20SOLUTIONS/Documents/AI%20OCR%20Pharma/backend/app/services/invoice_engine.py):
    ```python
    if ag.department == "CR":
        header_desc = "Export Service-Exempt (GCP)"
    elif ag.department == "GM":
        header_desc = "Export Service-Exempt (GMP)"
    else:
        header_desc = "Export Service-Exempt (Regulatory)"
    # HSN/SAC is uniformly fixed to "998113"
    ```
* **Limitation:** If Pharmazone opens new divisions (e.g., Pharmacovigilance `PV`, Medical Devices `MD`, Bioanalytical `BA`), they cannot be configured dynamically.
* **Production Solution:**
  * Create a `DepartmentMaster` table:
    * `department_code`: `CR`, `GM`, `RA`, `PV`, `MD`
    * `department_name`: Clinical Research, GMP Audits, etc.
    * `hsn_sac_code`: `998113`
    * `export_header`: `Export Service-Exempt (GCP)`
    * `domestic_header`: `Local Taxable Service (GCP)`

---

### 5. Annual Letter of Undertaking (LUT) Number & Expiry
* **Current Implementation:**
  * In [`backend/app/models/schemas.py`](file:///c:/Users/LOTUS%20IT%20SOLUTION/OneDrive%20-%20PIYTECH%20SOLUTIONS/Documents/AI%20OCR%20Pharma/backend/app/models/schemas.py) and [`invoice_engine.py`](file:///c:/Users/LOTUS%20IT%20SOLUTION/OneDrive%20-%20PIYTECH%20SOLUTIONS/Documents/AI%20OCR%20Pharma/backend/app/services/invoice_engine.py):
    ```python
    legal_sub_heading = "(SUPPLY MEANT FOR EXPORT/SUPPLY TO SEZ UNIT OR SEZ DEVELOPER FOR AUTHORISED OPERATIONS UNDER BOND OR LETTER OF UNDERTAKING WITHOUT PAYMENT OF IGST)"
    ```
* **Limitation:** In Indian GST law, a Letter of Undertaking has an **Application Reference Number (ARN)** and validity period (e.g., `ARN: AD240326009876X dt. 28-Mar-2026 for FY 2026-27`).
* **Production Solution:**
  * Store the active fiscal year's LUT ARN in settings:
    `"SUPPLY MEANT FOR EXPORT UNDER LUT ARN {lut_arn} DT. {lut_date} WITHOUT PAYMENT OF IGST"`.

---

### 6. Simulated OCR & Extraction Fallbacks
* **Current Implementation:**
  * In [`backend/app/services/azure_doc_intel.py`](file:///c:/Users/LOTUS%20IT%20SOLUTION/OneDrive%20-%20PIYTECH%20SOLUTIONS/Documents/AI%20OCR%20Pharma/backend/app/services/azure_doc_intel.py): Canned OCR strings for sample files.
  * In [`backend/app/services/azure_openai_extractor.py`](file:///c:/Users/LOTUS%20IT%20SOLUTION/OneDrive%20-%20PIYTECH%20SOLUTIONS/Documents/AI%20OCR%20Pharma/backend/app/services/azure_openai_extractor.py): Canned extraction objects for sample files.
* **Limitation:** Serves as a prototype safety net, but in production, bad/corrupted files should fail with descriptive validation errors rather than falling back to simulated data.
* **Production Solution:**
  * In `.env`, set:
    ```ini
    ENABLE_MOCK_FALLBACK=false
    ```
  * All documents will strictly pass through the live Azure AI pipeline with production error telemetry (e.g., Sentry / Azure Application Insights).

---

## 🏗️ Proposed Production Database Architecture (SQL DDL)

To transition to production, the following standard relational schema is recommended:

```sql
-- 1. Company Profile Master
CREATE TABLE company_profile (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT 'Pharmazone',
    address TEXT NOT NULL,
    gstin VARCHAR(15) NOT NULL,
    pan VARCHAR(10) NOT NULL,
    state_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    website VARCHAR(100) NOT NULL,
    active_lut_arn VARCHAR(50),
    active_lut_date DATE
);

-- 2. Bank Accounts Master
CREATE TABLE bank_accounts (
    id SERIAL PRIMARY KEY,
    currency VARCHAR(3) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    account_no VARCHAR(50) NOT NULL,
    branch_ifsc VARCHAR(100) NOT NULL,
    swift_code VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Department & Tax Service Mapping
CREATE TABLE departments (
    code VARCHAR(5) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    hsn_sac VARCHAR(10) NOT NULL DEFAULT '998113',
    export_header VARCHAR(150) NOT NULL,
    domestic_header VARCHAR(150) NOT NULL
);

-- 4. Invoices Database (Persistent Storage & Sequential Counter)
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    sequence_number INT NOT NULL,
    fiscal_year VARCHAR(4) NOT NULL,
    month VARCHAR(2) NOT NULL,
    department VARCHAR(5) REFERENCES departments(code),
    invoice_date DATE NOT NULL,
    invoice_type VARCHAR(10) NOT NULL,
    buyer_name VARCHAR(255) NOT NULL,
    buyer_country VARCHAR(100) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    total_tax DECIMAL(12, 2) NOT NULL,
    grand_total DECIMAL(12, 2) NOT NULL,
    exchange_rate DECIMAL(10, 4) NOT NULL,
    taxable_value_inr DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎯 Implementation Roadmap

1. **Phase 1 (Completed):**
   * ✅ Real-time Live Forex API integration (`USD` and `EUR` to `INR`).
   * ✅ Indian Fiscal Year dynamic calculation (`Apr 1 – Mar 31`).
2. **Phase 2 (Database Persistence):**
   * Integrate SQLite / PostgreSQL using SQLAlchemy.
   * Atomic sequence numbering (`PZCR2627/09/001`, `002`...).
3. **Phase 3 (Admin Settings UI):**
   * Build `/settings` view for Company Profile, Bank Master, and Department Master.
4. **Phase 4 (Enterprise Hardening):**
   * Turn off mock fallback (`ENABLE_MOCK_FALLBACK=false`).
   * Add automated PDF invoice email dispatch and integration with Indian GST e-Invoicing API.
