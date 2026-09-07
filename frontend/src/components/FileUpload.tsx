import React, { useState, useRef } from 'react';
import { Upload, FileUp, Sparkles, AlertCircle, FileCheck2 } from 'lucide-react';
import { SampleAgreementItem } from '../types/invoice';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  sampleAgreements: SampleAgreementItem[];
  onSelectSample: (sample: SampleAgreementItem) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  isLoading,
  sampleAgreements,
  onSelectSample,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Upload Agreement or Quotation
        </h1>
        <p className="mt-2 text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
          Our AI pipeline uses <strong className="text-slate-800">Azure Document Intelligence</strong> to read PDF text & tables, then executes <strong className="text-slate-800">Azure OpenAI</strong> to extract commercial clauses, milestones, and client metadata.
        </p>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
            : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/50'
        } ${isLoading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {isLoading ? (
          <div className="flex flex-col items-center py-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <Sparkles className="w-6 h-6 text-blue-600 absolute top-5 left-5 animate-pulse" />
            </div>
            <p className="mt-4 text-base font-semibold text-slate-800">
              Processing with Azure AI...
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Extracting tables, client info, drug names, and payment milestones
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-sm">
              <Upload className="w-8 h-8" />
            </div>

            {selectedFileName ? (
              <div className="flex items-center space-x-2 text-emerald-600 font-medium">
                <FileCheck2 className="w-5 h-5" />
                <span>Selected: {selectedFileName}</span>
              </div>
            ) : (
              <>
                <p className="text-base font-semibold text-slate-800">
                  Click to upload or drag & drop agreement PDF
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports Master Service Agreements (MSA), SOWs, Quotations, and Purchase Orders (.pdf)
                </p>
              </>
            )}

            <button
              type="button"
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              <FileUp className="w-4 h-4 mr-2" />
              Select PDF File
            </button>
          </div>
        )}
      </div>

      {/* Quick Test Samples Card */}
      <div className="mt-10 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
              Instant Demonstration: Test Agreements with Missing Invoices
            </h3>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
            {sampleAgreements.length} Test Cases Available
          </span>
        </div>

        <p className="text-xs text-slate-600 mb-4">
          These agreements have unbilled milestones with no issued invoice in the sample dataset. Click any sample below to simulate instant extraction and draft the missing invoice:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sampleAgreements.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              disabled={isLoading}
              className="flex flex-col justify-between p-3.5 text-left border border-slate-200 hover:border-blue-400 rounded-xl hover:bg-blue-50/30 transition-all group bg-white shadow-xs hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    ⚡ Missing Invoice
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 leading-snug">
                  {sample.name}
                </p>
                <p className="text-[11px] text-slate-400 font-mono truncate max-w-full mt-1">
                  {sample.filename}
                </p>
              </div>

              {sample.missing_invoice && (
                <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-medium text-emerald-700 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 flex-shrink-0" />
                  <span>{sample.missing_invoice}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Info Notice */}
      <div className="mt-6 bg-slate-100 rounded-lg p-4 flex items-start space-x-3 text-xs text-slate-600">
        <AlertCircle className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
        <p>
          <strong>Automatic Business Logic:</strong> When an agreement is uploaded, PharmaAI automatically classifies the department (Clinical Research `CR`, GMP `GM`, or Regulatory `RA`), identifies whether it is an export or domestic transaction, routes to the matching HDFC bank account, and extracts the payment milestone table.
        </p>
      </div>

    </div>
  );
};
