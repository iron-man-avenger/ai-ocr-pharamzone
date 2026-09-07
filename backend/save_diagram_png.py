import base64
import json
import httpx
import os
import shutil

mermaid_code = """flowchart TD
    subgraph UserInterface["1. Frontend (React + Vite + Tailwind)"]
        UI_A["Option A: Drag and Drop Real Agreement PDF"]
        UI_B["Option B: Click Instant Demonstration Sample"]
        UI_B --> GET_SAMP["Fetch Real PDF from /api/sample-file"]
        GET_SAMP --> POST_EX["Upload File to /api/extract"]
        UI_A --> POST_EX
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
        DEPT_RULE -->|CR| H_CR["Header: Export Service-Exempt (GCP)"]
        DEPT_RULE -->|GM| H_GM["Header: Export/Local Service (GMP)"]
        DEPT_RULE -->|RA| H_RA["Header: Export Service-Exempt (Regulatory)"]

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

        TAX -->|Export| TAX_EXP["Export Invoice: 0% IGST under LUT + Forex INR"]
        TAX -->|Domestic| TAX_DOM["Tax Invoice: 9% CGST + 9% SGST = 18% Total"]

        TAX_EXP --> REF["Format Reference: PZ-XXXX 1/2 dt. Date"]
        TAX_DOM --> REF
        REF --> DRAFT_RES["HTTP 200 InvoiceDraftResponse"]
    end

    subgraph Output["5. Output and Printing"]
        DRAFT_RES --> PREVIEW["Step 3: InvoicePreview Component"]
        PREVIEW --> A4_PRINT["Official A4 Print / Save PDF (Ctrl+P)"]
        DRAFT_RES --> HIST["In-Memory Drafts History"]
    end"""

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
target_png = os.path.join(ROOT_DIR, "PharmaAI_Workflow_Diagram.png")
user_uploaded = r"C:/Users/LOTUS IT SOLUTION/.gemini/antigravity/brain/8cacb09b-e65a-456d-9491-c6507133c120/.user_uploaded/media_1788790927638.png"

saved_highres = False
try:
    graph_dict = {"code": mermaid_code, "mermaid": {"theme": "default"}}
    b64 = base64.b64encode(json.dumps(graph_dict).encode("utf-8")).decode("ascii")
    url = f"https://mermaid.ink/img/{b64}?scale=3"
    print("Downloading high-resolution diagram (scale=3) from mermaid.ink...")
    r = httpx.get(url, timeout=25.0)
    if r.status_code == 200 and len(r.content) > 5000:
        with open(target_png, "wb") as f:
            f.write(r.content)
        print("Saved high-res PNG! Size:", len(r.content), "bytes")
        saved_highres = True
    else:
        print("Mermaid.ink status:", r.status_code)
except Exception as e:
    print("Could not fetch highres image:", e)

if not saved_highres and os.path.exists(user_uploaded):
    print("Copying original uploaded screenshot...")
    shutil.copyfile(user_uploaded, target_png)

print("Target file:", target_png)
print("Exists:", os.path.exists(target_png))
if os.path.exists(target_png):
    print("File size:", os.path.getsize(target_png), "bytes")
