import React from 'react';

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
    <header className="sticky top-0 z-50 bg-[#3F657F] border-b border-[#2e4d63]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Left: Plain text Evren AI */}
          <div className="text-xl font-bold text-white tracking-tight">
            Evren AI
          </div>

          {/* Center: Two plain bordered text tabs */}
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded text-xs font-medium border ${
                activeTab === 'upload'
                  ? 'bg-white text-slate-900 border-white font-semibold'
                  : 'text-white border-white/40 hover:bg-white/10'
              }`}
            >
              Document Upload
            </button>

            <button
              onClick={() => hasData && setActiveTab('analysis')}
              disabled={!hasData}
              className={`px-3 py-1.5 rounded text-xs font-medium border ${
                activeTab === 'analysis'
                  ? 'bg-white text-slate-900 border-white font-semibold'
                  : hasData
                  ? 'text-white border-white/40 hover:bg-white/10'
                  : 'text-white/40 border-white/20 cursor-not-allowed'
              }`}
            >
              Contract Intelligence
            </button>
          </nav>

          {/* Right: Empty spacer */}
          <div className="w-20" />

        </div>
      </div>
    </header>
  );
};
