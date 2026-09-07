import React from 'react';
import { 
  Building2, 
  FileCheck, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  Globe2
} from 'lucide-react';
import { ExtractedAgreement } from '../types/invoice';

interface ExtractionViewerProps {
  agreement: ExtractedAgreement;
  onProceedToDraft: () => void;
  onReupload: () => void;
}

export const ExtractionViewer: React.FC<ExtractionViewerProps> = ({
  agreement,
  onProceedToDraft,
  onReupload,
}) => {
  const getDeptBadge = (dept: string) => {
    switch (dept) {
      case 'CR':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">Clinical Research (GCP)</span>;
      case 'GM':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">GMP Quality Audit</span>;
      case 'RA':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">Regulatory Affairs</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{dept}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Extracted Agreement Data</h2>
            <span className="flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Verified by Azure AI
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review the extracted terms below before generating the draft invoice.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onReupload}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Upload Another
          </button>
          <button
            onClick={onProceedToDraft}
            className="inline-flex items-center px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
          >
            Configure Invoice Draft
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </button>
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Card 1: Client / Counterparty */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-700 font-semibold mb-3">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm">Client / Bill To</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 block">Company Name:</span>
              <span className="font-semibold text-slate-900 text-sm">{agreement.client_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Billing Address:</span>
              <span className="text-slate-700">{agreement.client_address || 'Address from Master Data'}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-slate-400">Jurisdiction:</span>
              <span className="font-medium text-slate-800 flex items-center">
                <Globe2 className="w-3 h-3 mr-1 text-slate-400" />
                {agreement.country} ({agreement.is_export ? 'Export 0%' : 'Domestic 18% GST'})
              </span>
            </div>
            {agreement.client_gstin && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">GSTIN:</span>
                <span className="font-mono font-medium text-slate-800">{agreement.client_gstin}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Project & Scope */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-slate-700 font-semibold">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm">Project Details</h3>
            </div>
            {getDeptBadge(agreement.department)}
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 block">Project Reference ID:</span>
              <span className="font-mono font-bold text-blue-800">{agreement.project_id || 'Auto-generated'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Study / Scope of Work:</span>
              <p className="text-slate-800 line-clamp-3 leading-relaxed">{agreement.study_or_project_name}</p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 block">Site / CRO Location:</span>
              <span className="font-medium text-slate-700 flex items-center">
                <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                {agreement.site_or_cro_location || 'Not Specified'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Financial Terms */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-700 font-semibold mb-3">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm">Commercial Terms</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-100">
              <span className="text-blue-600 block text-[11px] font-semibold uppercase tracking-wider">Total Contract Value</span>
              <span className="text-xl font-extrabold text-blue-900">
                {agreement.currency === 'EUR' ? '€ ' : agreement.currency === 'INR' ? '₹ ' : '$ '}
                {agreement.total_contract_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-blue-700 ml-1.5 font-medium">({agreement.currency})</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center">
                <Clock className="w-3 h-3 mr-1 text-slate-400" />
                Payment Terms:
              </span>
              <span className="font-semibold text-slate-800">Within {agreement.payment_terms_days} Days</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center">
                <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                Execution Date:
              </span>
              <span className="text-slate-800 font-medium">{agreement.agreement_date || 'N/A'}</span>
            </div>

            {agreement.buyer_order_no && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">PO Number:</span>
                <span className="font-mono font-medium text-slate-800">{agreement.buyer_order_no}</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Payment Milestones Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Payment Schedule & Milestones</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {agreement.milestones.length} Milestone(s) detected
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 w-20">Milestone</th>
                <th className="px-6 py-3 w-28">Split %</th>
                <th className="px-6 py-3 w-36">Amount</th>
                <th className="px-6 py-3">Trigger Condition / Clause</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {agreement.milestones.map((m) => (
                <tr key={m.milestone_number} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-slate-900">
                    {m.milestone_number} of {m.total_milestones}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold text-[11px]">
                      {m.percentage}%
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-slate-900">
                    {agreement.currency === 'EUR' ? '€ ' : agreement.currency === 'INR' ? '₹ ' : '$ '}
                    {m.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-3.5 text-slate-700">
                    <p className="font-medium text-slate-800">{m.trigger_event}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 italic">{m.description_text}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
