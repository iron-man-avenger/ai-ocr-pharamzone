import React from 'react';
import { FileText, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';
import { HealthStatus } from '../types/invoice';

interface NavbarProps {
  health: HealthStatus | null;
  activeTab: 'upload' | 'draft' | 'preview' | 'history';
  setActiveTab: (tab: 'upload' | 'draft' | 'preview' | 'history') => void;
  hasExtractedData: boolean;
  hasDraftInvoice: boolean;
  onSwitchToEvren?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  health,
  activeTab,
  setActiveTab,
  hasExtractedData,
  hasDraftInvoice,
  onSwitchToEvren
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-md">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900">PharmaAI</span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">OCR Engine</span>
              </div>
              <p className="text-xs text-slate-500">Agreement to Invoice Drafting Automation</p>
            </div>
          </div>

          {/* Stepper Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              1. Upload Agreement
            </button>

            <span className="text-slate-300">→</span>

            <button
              onClick={() => hasExtractedData && setActiveTab('draft')}
              disabled={!hasExtractedData}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'draft'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : hasExtractedData
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              2. Review & Milestones
            </button>

            <span className="text-slate-300">→</span>

            <button
              onClick={() => hasDraftInvoice && setActiveTab('preview')}
              disabled={!hasDraftInvoice}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : hasDraftInvoice
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              3. Invoice Preview & Print
            </button>
          </nav>

          {/* Azure Status Badges */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 text-xs">
              <span className="text-slate-500 flex items-center">
                <Cpu className="w-3.5 h-3.5 mr-1" />
                Azure AI:
              </span>
              
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                health?.doc_intel_configured 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {health?.doc_intel_configured ? (
                  <><CheckCircle2 className="w-3 h-3 mr-1" /> Doc Intel Live</>
                ) : (
                  <><AlertCircle className="w-3 h-3 mr-1" /> Doc Intel (Ready)</>
                )}
              </span>

              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                health?.openai_configured 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {health?.openai_configured ? (
                  <><CheckCircle2 className="w-3 h-3 mr-1" /> OpenAI Live</>
                ) : (
                  <><AlertCircle className="w-3 h-3 mr-1" /> OpenAI (Ready)</>
                )}
              </span>
            </div>

            {onSwitchToEvren && (
              <button
                onClick={onSwitchToEvren}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0c1f33] hover:bg-[#153454] border border-[#1e3a5f] shadow-sm transition-all hover:scale-105"
                title="Switch to Evren AI Advisory Intelligence"
              >
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span>Evren AI</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
