import React, { useState } from 'react';
import { EvrenNavbar } from './EvrenNavbar';
import { EvrenFileUpload } from './EvrenFileUpload';
import { EvrenExtractionView } from './EvrenExtractionView';
import { EvrenExtractionResponse } from '../../types/evren';
import { evrenApi } from '../../services/evrenApi';

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
          <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded flex items-center justify-between text-sm">
            <span>{errorMsg}</span>
            <button 
              onClick={() => setErrorMsg(null)}
              className="text-red-700 hover:text-red-900 underline text-xs font-semibold ml-4"
            >
              Dismiss
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
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-300 bg-[#F6F9FB] py-4 text-center text-xs font-bold text-slate-700 mt-auto">
        Evren AI
      </footer>

    </div>
  );
};
