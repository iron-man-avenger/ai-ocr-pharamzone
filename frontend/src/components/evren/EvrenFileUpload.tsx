import React, { useRef, useState } from 'react';
import { 
  UploadCloud, 
  Sparkles, 
  Building2,
  Calendar,
  CreditCard,
  Lock
} from 'lucide-react';

interface EvrenFileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const EvrenFileUpload: React.FC<EvrenFileUploadProps> = ({
  onFileSelect,
  isLoading,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        onFileSelect(file);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Hero Headline (Clean & Generic) */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E3EFF7] border border-[#3F657F]/30 text-[#1D6597] text-xs font-bold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#1D6597]" />
          <span>Evren Advisory & Commercial Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#3F657F] tracking-tight">
          Advisory Contract & Engagement Analyzer
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          Upload any legal agreement, advisory engagement letter, or commercial contract to extract structured party profiles, execution timelines, fee schedules, and payment terms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Drag & Drop Upload Container */}
        <div className="lg:col-span-7 bg-[#F6F9FB] rounded-2xl border border-[#3F657F]/20 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E3EFF7]">
            <div>
              <h2 className="text-base font-bold text-[#3F657F]">Upload Contract Document</h2>
              <p className="text-xs text-slate-500">Supports Engagement Letters, MSAs, SOWs, and Commercial Agreements</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#E3EFF7] text-[#1D6597] border border-[#3F657F]/20">
              PDF / Images up to 25MB
            </span>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-[#1D6597] bg-[#E3EFF7] scale-[1.01]'
                : 'border-[#3F657F]/40 hover:border-[#1D6597] hover:bg-[#E3EFF7]/50'
            } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleInputChange}
              className="hidden"
            />

            {isLoading ? (
              <div className="space-y-4 py-4">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="w-16 h-16 rounded-full border-4 border-[#E3EFF7] border-t-[#1D6597] animate-spin" />
                  <Sparkles className="w-6 h-6 text-[#1D6597] absolute inset-0 m-auto" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#3F657F]">Processing with Evren AI Engine...</p>
                  <p className="text-xs text-slate-500">
                    Extracting layout, contracting parties, commercials, and payment covenants...
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1D6597] flex items-center justify-center text-[#F6F9FB] shadow-md">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Click to browse or drop your contract PDF here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Extracts Party Details, Timeline, Commercials & Payment Terms automatically
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Core Fields Badge Row */}
          <div className="pt-2">
            <p className="text-xs font-bold text-[#3F657F] uppercase tracking-wider mb-2.5">
              Extracted In Strict Structured Order:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-[#E3EFF7] border border-[#3F657F]/20 text-slate-800">
                <span className="w-5 h-5 rounded-full bg-[#1D6597] text-white flex items-center justify-center font-bold text-[10px]">1</span>
                <span className="font-semibold">Party Names</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-[#E3EFF7] border border-[#3F657F]/20 text-slate-800">
                <span className="w-5 h-5 rounded-full bg-[#1D6597] text-white flex items-center justify-center font-bold text-[10px]">2</span>
                <span className="font-semibold">Timeline & Commercials</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-[#E3EFF7] border border-[#3F657F]/20 text-slate-800">
                <span className="w-5 h-5 rounded-full bg-[#1D6597] text-white flex items-center justify-center font-bold text-[10px]">3</span>
                <span className="font-semibold">Payment Terms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Generic Intelligence Capabilities (Zero Document Details) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-[#3F657F] text-white rounded-2xl p-6 shadow-md border border-[#2e4d63] space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1D6597] text-[#F6F9FB] border border-white/20">
                AI Intelligence Features
              </span>
              <span className="text-xs text-[#E3EFF7]">Enterprise Document OCR</span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white leading-snug">
                Contract Extraction Engine
              </h3>
              <p className="text-xs text-[#E3EFF7]/90">
                AI models parse complex legal and advisory agreements into clean, structured intelligence.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-[#2e4d63]/70 border border-white/10 text-xs">
                <Building2 className="w-4 h-4 text-[#E3EFF7] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-white">1. Party Identification</h4>
                  <p className="text-[#E3EFF7]/80 text-[11px] mt-0.5">
                    Extracts service providers, counterparties, registered offices, operational locations, and authorized signatories.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-[#2e4d63]/70 border border-white/10 text-xs">
                <Calendar className="w-4 h-4 text-[#E3EFF7] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-white">2. Timeline & Commercials</h4>
                  <p className="text-[#E3EFF7]/80 text-[11px] mt-0.5">
                    Extracts execution dates, delivery windows, baseline professional fees, administrative charges, and expense rules.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-[#2e4d63]/70 border border-white/10 text-xs">
                <CreditCard className="w-4 h-4 text-[#E3EFF7] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-white">3. Payment Terms & Conditions</h4>
                  <p className="text-[#E3EFF7]/80 text-[11px] mt-0.5">
                    Structures milestone tranches, invoice credit windows, statutory tax deductions (TDS), and remittance clauses.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Security Box */}
          <div className="bg-[#F6F9FB] border border-[#3F657F]/20 rounded-xl p-4 text-xs text-slate-700 space-y-1.5 shadow-xs">
            <p className="font-bold flex items-center space-x-1.5 text-[#3F657F]">
              <Lock className="w-3.5 h-3.5 text-[#1D6597]" />
              <span>Confidential & Secure Processing</span>
            </p>
            <p className="text-slate-600 leading-relaxed">
              No document contents or commercial terms are shown until a document is uploaded. Data is analyzed directly through your secure Azure instance.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
