import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Layers, 
  Coins, 
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { ExtractedAgreement, InvoiceDraftRequest } from '../types/invoice';
import { api } from '../services/api';

interface InvoiceDraftFormProps {
  agreement: ExtractedAgreement;
  onGenerateDraft: (request: InvoiceDraftRequest) => void;
  isLoading: boolean;
}

export const InvoiceDraftForm: React.FC<InvoiceDraftFormProps> = ({
  agreement,
  onGenerateDraft,
  isLoading,
}) => {
  // Format current date e.g. "31-Mar-26"
  const getFormattedDate = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = String(d.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  const [selectedMilestone, setSelectedMilestone] = useState<number>(
    agreement.suggested_milestone || (agreement.milestones.length > 0 ? agreement.milestones[0].milestone_number : 1)
  );
  const [invoiceDate, setInvoiceDate] = useState<string>(getFormattedDate());
  
  // Default exchange rates to INR based on currency
  const defaultFx = agreement.currency === 'EUR' ? 108.12 : agreement.currency === 'USD' ? 94.05 : 1.0;
  const [fxRate, setFxRate] = useState<number>(defaultFx);
  const [isLiveForex, setIsLiveForex] = useState<boolean>(false);

  useEffect(() => {
    if (agreement.is_export && agreement.currency !== 'INR') {
      api.getForexRates()
        .then((res) => {
          const live = res.rates[agreement.currency];
          if (live) {
            setFxRate(live);
            setIsLiveForex(true);
          }
        })
        .catch((err) => {
          console.warn('Could not load live forex rates, using default:', err);
        });
    }
  }, [agreement.currency, agreement.is_export]);

  const [customInvoiceNo, setCustomInvoiceNo] = useState<string>('');
  const [buyerOrderNo, setBuyerOrderNo] = useState<string>(agreement.buyer_order_no || '');
  const [buyerOrderDate, setBuyerOrderDate] = useState<string>(agreement.buyer_order_date || '');

  const activeMilestoneObj = agreement.milestones.find(
    (m) => m.milestone_number === selectedMilestone
  ) || agreement.milestones[0];

  const milestoneAmount = activeMilestoneObj ? activeMilestoneObj.amount : agreement.total_contract_value;
  const estimatedInrTaxable = (milestoneAmount * fxRate).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateDraft({
      agreement,
      selected_milestone_number: selectedMilestone,
      invoice_date: invoiceDate,
      exchange_rate_to_inr: fxRate,
      custom_invoice_no: customInvoiceNo ? customInvoiceNo : undefined,
      buyer_order_no: buyerOrderNo ? buyerOrderNo : undefined,
      buyer_order_date: buyerOrderDate ? buyerOrderDate : undefined,
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Configure Draft Invoice
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select which milestone to bill, set the invoice date, and configure exchange rate for Indian GST compliance.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Milestone Selector */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-900 font-semibold mb-4">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm sm:text-base">1. Select Milestone to Bill</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agreement.milestones.map((m) => {
              const isSelected = selectedMilestone === m.milestone_number;
              return (
                <div
                  key={m.milestone_number}
                  onClick={() => setSelectedMilestone(m.milestone_number)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-slate-900">
                      Milestone {m.milestone_number} of {m.total_milestones}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {m.milestone_number === agreement.suggested_milestone && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          ⚡ Missing Invoice (Target Test)
                        </span>
                      )}
                      {m.milestone_number !== agreement.suggested_milestone && agreement.suggested_milestone && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ✓ Real Invoice Exists
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                        {m.percentage}% Split
                      </span>
                    </div>
                  </div>

                  <div className="text-lg font-extrabold text-blue-900 mb-1">
                    {agreement.currency === 'EUR' ? '€ ' : agreement.currency === 'INR' ? '₹ ' : '$ '}
                    {m.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>

                  <p className="text-xs text-slate-600 font-medium">{m.trigger_event}</p>
                  <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-2">{m.description_text}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Invoice Details & Forex */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-900 font-semibold mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm sm:text-base">2. Invoice Metadata & Currency Conversion</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Invoice Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Date
              </label>
              <input
                type="text"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                placeholder="e.g. 31-Mar-26"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Format: DD-Mon-YY</span>
            </div>

            {/* Custom Invoice Number (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custom Invoice No. <span className="text-slate-400 font-normal">(Leave blank for auto)</span>
              </label>
              <input
                type="text"
                value={customInvoiceNo}
                onChange={(e) => setCustomInvoiceNo(e.target.value)}
                placeholder={`e.g. PZ${agreement.department}2526/03/0${selectedMilestone}`}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Auto-pattern: PZ[Dept][FY]/[Month]/[Seq]</span>
            </div>

            {/* Buyer Order / PO Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Buyer PO / Order Number
              </label>
              <input
                type="text"
                value={buyerOrderNo}
                onChange={(e) => setBuyerOrderNo(e.target.value)}
                placeholder="e.g. 25015258 - OH"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
            </div>

            {/* Buyer Order Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Buyer PO / Order Date
              </label>
              <input
                type="text"
                value={buyerOrderDate}
                onChange={(e) => setBuyerOrderDate(e.target.value)}
                placeholder="e.g. 22-Sep-25"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
            </div>

            {/* Forex Conversion (if Export) */}
            {agreement.is_export && (
              <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2 text-slate-800 font-semibold text-xs mb-3">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <span>GST Compliance: Foreign Exchange to INR Conversion</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-medium text-slate-600">
                        1 {agreement.currency} = INR (₹)
                      </label>
                      {isLiveForex ? (
                        <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          <TrendingUp className="w-3 h-3 mr-1 text-emerald-600" />
                          Live Market Rate
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Custom Rate</span>
                      )}
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={fxRate}
                      onChange={(e) => {
                        setFxRate(parseFloat(e.target.value) || 1.0);
                        setIsLiveForex(false);
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-400 block">Calculated Taxable Value in INR:</span>
                    <span className="text-base font-bold text-slate-900 font-mono">
                      ₹ {estimatedInrTaxable}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Required on Indian Export e-Invoices</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Section 3: Summary & Generate Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-blue-900 text-white p-6 rounded-2xl shadow-lg gap-4">
          <div>
            <span className="text-xs text-blue-200 block font-medium">Selected Billing Amount:</span>
            <span className="text-2xl font-extrabold tracking-tight">
              {agreement.currency === 'EUR' ? '€ ' : agreement.currency === 'INR' ? '₹ ' : '$ '}
              {milestoneAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-blue-200 ml-2">
              (Milestone {selectedMilestone} of {agreement.milestones.length})
            </span>
            <div className="text-xs text-blue-300 mt-1 font-mono">
              Reference: {agreement.project_id || 'PZ-PROJECT'} {selectedMilestone}/{agreement.milestones.length || 1} dt. {invoiceDate}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-sm font-bold rounded-xl text-blue-900 bg-white hover:bg-blue-50 shadow-md focus:outline-none transition-transform active:scale-95"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2 text-blue-700" />
                Generate Official Invoice Draft
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
