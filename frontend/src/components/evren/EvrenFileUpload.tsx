import React, { useRef, useState } from 'react';

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
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      
      {/* Single h1 heading */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">
          Evren AI
        </h1>
      </div>

      {/* One white bordered card */}
      <div className="bg-white rounded-lg border border-slate-300 p-6 space-y-6">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-800">Upload Contract Document</h2>
            <p className="text-xs text-slate-500">Supports Engagement Letters, MSAs, SOWs, and Commercial Agreements</p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-300">
            PDF / Images up to 25MB
          </span>
        </div>

        {/* Plain dashed-border drop zone with text only */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !isLoading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer ${
            isDragOver
              ? 'border-slate-600 bg-slate-50'
              : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
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
            <div className="py-4">
              <p className="text-sm font-semibold text-slate-700">Processing document…</p>
              <p className="text-xs text-slate-500 mt-1">Extracting layout, contracting parties, commercials, and payment terms…</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800">
                Click to browse or drop your contract PDF here
              </p>
              <p className="text-xs text-slate-500">
                Upload any advisory agreement, engagement letter, or commercial contract
              </p>
            </div>
          )}
        </div>

        {/* Small bordered table listing extraction order */}
        <div className="pt-2">
          <table className="w-full border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-3 py-2 text-left font-semibold text-slate-700 w-20">Order</th>
                <th className="border border-slate-300 px-3 py-2 text-left font-semibold text-slate-700">Extracted Section</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 px-3 py-2 font-semibold text-slate-800">1</td>
                <td className="border border-slate-300 px-3 py-2 text-slate-700">Party Names</td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-3 py-2 font-semibold text-slate-800">2</td>
                <td className="border border-slate-300 px-3 py-2 text-slate-700">Timeline & Commercials</td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-3 py-2 font-semibold text-slate-800">3</td>
                <td className="border border-slate-300 px-3 py-2 text-slate-700">Payment Terms</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Fine print */}
        <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          No document contents are shown until a document is uploaded. Data is analyzed directly through your secure Azure instance.
        </p>

      </div>

    </div>
  );
};
