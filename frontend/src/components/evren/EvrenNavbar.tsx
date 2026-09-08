import React from 'react';
import { Sparkles, FileText, ShieldCheck } from 'lucide-react';

interface EvrenNavbarProps {
  activeTab: 'upload' | 'analysis' | 'export';
  setActiveTab: (tab: 'upload' | 'analysis' | 'export') => void;
  hasData: boolean;
  onSwitchApp?: () => void;
}

export const EvrenNavbar: React.FC<EvrenNavbarProps> = ({
  activeTab,
  setActiveTab,
  hasData,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#3F657F] border-b border-[#2e4d63] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Evren AI Logo & Constellation Mark */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#1D6597] border border-white/20 shadow-md">
              {/* Constellation Nodes Graphic */}
              <svg className="w-6 h-6 text-[#F6F9FB]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="5" cy="12" r="2" fill="#E3EFF7" />
                <circle cx="12" cy="5" r="2" fill="#E3EFF7" />
                <circle cx="19" cy="10" r="2" fill="#E3EFF7" />
                <circle cx="16" cy="19" r="2" fill="#E3EFF7" />
                <line x1="5" y1="12" x2="12" y2="5" stroke="#E3EFF7" strokeWidth="1.5" strokeOpacity="0.8" />
                <line x1="12" y1="5" x2="19" y2="10" stroke="#E3EFF7" strokeWidth="1.5" strokeOpacity="0.8" />
                <line x1="19" y1="10" x2="16" y2="19" stroke="#E3EFF7" strokeWidth="1.5" strokeOpacity="0.8" />
              </svg>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-300 rounded-full animate-ping" />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-bold tracking-tight text-[#F6F9FB] font-sans">
                  Evren <span className="text-[#E3EFF7]">AI</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-[#1D6597] text-[#F6F9FB] border border-white/20">
                  Advisory
                </span>
              </div>
              <span className="text-[11px] text-[#E3EFF7]/80">
                Corporate Contract & Engagement Intelligence
              </span>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#2e4d63] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'upload'
                  ? 'bg-[#1D6597] text-white shadow-md'
                  : 'text-[#E3EFF7] hover:text-white hover:bg-[#3F657F]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Document Upload</span>
            </button>

            <button
              onClick={() => hasData && setActiveTab('analysis')}
              disabled={!hasData}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'analysis'
                  ? 'bg-[#1D6597] text-white shadow-md'
                  : hasData
                  ? 'text-[#E3EFF7] hover:text-white hover:bg-[#3F657F]'
                  : 'text-white/40 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Contract Intelligence</span>
              {hasData && (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </button>
          </nav>

          {/* Right Action: Azure AI Badge */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#2e4d63] border border-white/10 text-[11px] text-[#E3EFF7]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Azure Document Intelligence & OpenAI</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
