import React, { useState } from 'react';
import { EvrenNavbar } from './EvrenNavbar';
import { EvrenFileUpload } from './EvrenFileUpload';
import { EvrenExtractionView } from './EvrenExtractionView';
import { EvrenExtractionResponse } from '../../types/evren';
import { evrenApi } from '../../services/evrenApi';
import { AlertCircle } from 'lucide-react';

interface EvrenPageProps {
  onSwitchApp: () => void;
}

export const EvrenPage: React.FC<EvrenPageProps> = ({ onSwitchApp }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'analysis' | 'export'>('upload');
  const [extractedData, setExtractedData] = useState<EvrenExtractionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle contract upload
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await evrenApi.extractContract(file);
      setExtractedData(result);
      setActiveTab('analysis');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to extract advisory contract. Please verify document formatting.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E3EFF7] flex flex-col font-sans text-slate-800">
      
      {/* Evren AI Top Navigation */}
      <EvrenNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasData={!!extractedData}
        onSwitchApp={onSwitchApp}
      />

      {/* Error Toast Alert */}
      {errorMsg && (
        <div className="max-w-4xl mx-auto mt-4 px-4 w-full">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-xs">
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

      {/* Main Content View */}
      <main className="flex-1">
        {activeTab === 'upload' && (
          <EvrenFileUpload
            onFileSelect={handleFileUpload}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'analysis' && extractedData && (
          <EvrenExtractionView
            data={extractedData}
            onReupload={() => setActiveTab('upload')}
            samplePdfUrl={evrenApi.getSamplePdfUrl()}
          />
        )}
      </main>

      {/* Clean Evren AI Footer (Zero Pharma references) */}
      <footer className="border-t border-[#3F657F]/20 bg-[#F6F9FB] py-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#3F657F]">Evren AI</span>
            <span>•</span>
            <span>Advisory & Commercial Contract Intelligence Platform</span>
          </div>
          <div>
            <span className="text-slate-500">Powered by Azure Document Intelligence & Azure OpenAI</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
