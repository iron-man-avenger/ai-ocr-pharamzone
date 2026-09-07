import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FileUpload } from './components/FileUpload';
import { ExtractionViewer } from './components/ExtractionViewer';
import { InvoiceDraftForm } from './components/InvoiceDraftForm';
import { InvoicePreview } from './components/InvoicePreview';
import { InvoiceHistory } from './components/InvoiceHistory';
import { 
  ExtractedAgreement, 
  InvoiceDraftRequest, 
  InvoiceDraftResponse, 
  HealthStatus, 
  SampleAgreementItem 
} from './types/invoice';
import { api } from './services/api';
import { AlertCircle, History } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'draft' | 'preview' | 'history'>('upload');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [sampleAgreements, setSampleAgreements] = useState<SampleAgreementItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [extractedAgreement, setExtractedAgreement] = useState<ExtractedAgreement | null>(null);
  const [draftInvoice, setDraftInvoice] = useState<InvoiceDraftResponse | null>(null);
  const [invoicesHistory, setInvoicesHistory] = useState<InvoiceDraftResponse[]>([]);

  useEffect(() => {
    // Check backend health & get sample options on initial load
    api.checkHealth()
      .then(setHealth)
      .catch((err) => {
        console.warn('Backend connection warning:', err);
        // Default optimistic health for frontend development
        setHealth({
          status: 'connecting',
          doc_intel_configured: false,
          openai_configured: false,
          mock_fallback_enabled: true
        });
      });

    api.getSampleAgreements()
      .then(setSampleAgreements)
      .catch((err) => {
        console.warn('Could not fetch sample agreements list:', err);
        setSampleAgreements([
          { 
            id: 'tafamidis', 
            name: 'Coripharma ehf - Tafamidis 61mg Study (EUR)', 
            filename: 'PZ-CR2526307 Tafamidis-61mg-Fed-D01-25Mar26-FE.pdf',
            missing_invoice: 'Milestone 2/2 Invoice Missing (€1,600)',
            target_milestone: 2
          },
          { 
            id: 'esomeprazole', 
            name: 'Pharmaris Canada - Esomeprazole 40mg Study (USD)', 
            filename: 'Quote_Esomeprazole_40mg_tab_Fast_d02_24Mar26-Signed.pdf',
            missing_invoice: 'Milestone 2/2 Invoice Missing ($1,575)',
            target_milestone: 2
          },
          { 
            id: 'advancion', 
            name: 'F.I.S. S.p.A. - Advancion GMP QA Audit (EUR)', 
            filename: 'Pharmazone Quotation GMP QA Audit FIS Advancion 30Jul25-v01-signed.pdf',
            missing_invoice: 'Milestone 1/2 Advance Invoice Missing (€1,850)',
            target_milestone: 1
          },
        ]);
      });

    api.getInvoices()
      .then(setInvoicesHistory)
      .catch(() => {});
  }, []);

  // Handle PDF file upload
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const extracted = await api.extractAgreement(file);
      setExtractedAgreement(extracted);
      setActiveTab('draft');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to extract document. Please check your backend connection or file format.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sample selection with real PDF bytes from backend
  const handleSelectSample = async (sample: SampleAgreementItem) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Fetch authentic sample PDF from backend
      const response = await fetch(`/api/sample-file/${encodeURIComponent(sample.filename)}`);
      if (!response.ok) {
        throw new Error(`Failed to load sample PDF (${response.statusText})`);
      }
      const blob = await response.blob();
      const realFile = new File([blob], sample.filename, { type: 'application/pdf' });
      await handleFileUpload(realFile);
    } catch (err: any) {
      console.warn('Could not fetch sample PDF bytes, using simulated fallback:', err);
      const dummyFile = new File(['%PDF-1.4 sample content fallback'], sample.filename, { type: 'application/pdf' });
      await handleFileUpload(dummyFile);
    }
  };

  // Handle Generate Draft
  const handleGenerateDraft = async (request: InvoiceDraftRequest) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const draft = await api.generateDraftInvoice(request);
      setDraftInvoice(draft);
      setInvoicesHistory(prev => [draft, ...prev]);
      setActiveTab('preview');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to generate draft invoice.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Navbar */}
      <Navbar
        health={health}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasExtractedData={!!extractedAgreement}
        hasDraftInvoice={!!draftInvoice}
      />

      {/* Error Alert Toast */}
      {errorMsg && (
        <div className="max-w-4xl mx-auto mt-4 px-4 w-full no-print">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between text-sm shadow-sm">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
            <button 
              onClick={() => setErrorMsg(null)}
              className="text-red-500 hover:text-red-700 font-bold ml-4"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'upload' && (
          <FileUpload
            onFileSelect={handleFileUpload}
            isLoading={isLoading}
            sampleAgreements={sampleAgreements}
            onSelectSample={handleSelectSample}
          />
        )}

        {activeTab === 'draft' && extractedAgreement && (
          <div className="space-y-8 pb-12">
            <ExtractionViewer
              agreement={extractedAgreement}
              onProceedToDraft={() => {
                const el = document.getElementById('draft-config-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onReupload={() => setActiveTab('upload')}
            />
            <div id="draft-config-section">
              <InvoiceDraftForm
                agreement={extractedAgreement}
                onGenerateDraft={handleGenerateDraft}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}

        {activeTab === 'preview' && draftInvoice && (
          <InvoicePreview
            invoice={draftInvoice}
            onBackToEdit={() => setActiveTab('draft')}
          />
        )}

        {activeTab === 'history' && (
          <InvoiceHistory
            invoices={invoicesHistory}
            onSelectInvoice={(inv) => {
              setDraftInvoice(inv);
              setActiveTab('preview');
            }}
          />
        )}
      </main>

      {/* Bottom Floating History Bar (if invoices exist and not in preview) */}
      {invoicesHistory.length > 0 && activeTab !== 'preview' && activeTab !== 'history' && (
        <aside className="fixed bottom-4 right-4 no-print z-20">
          <button
            onClick={() => setActiveTab('history')}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-slate-700 transition-all hover:scale-105"
          >
            <History className="w-4 h-4" />
            <span>Saved Drafts ({invoicesHistory.length})</span>
          </button>
        </aside>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400 no-print mt-auto">
        <p>PharmaAI OCR & Invoicing Platform • Powered by Azure Document Intelligence & Azure OpenAI</p>
      </footer>

    </div>
  );
}
export default App;
