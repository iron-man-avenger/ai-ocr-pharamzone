import React from 'react';
import { FileText, Eye } from 'lucide-react';
import { InvoiceDraftResponse } from '../types/invoice';

interface InvoiceHistoryProps {
  invoices: InvoiceDraftResponse[];
  onSelectInvoice: (inv: InvoiceDraftResponse) => void;
}

export const InvoiceHistory: React.FC<InvoiceHistoryProps> = ({
  invoices,
  onSelectInvoice,
}) => {
  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8 max-w-2xl mx-auto mt-8">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="font-semibold text-slate-800 text-base">No Invoices Generated Yet</h3>
        <p className="text-xs text-slate-500 mt-1">
          Upload an agreement or select a sample above to generate your first draft invoice.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Generated Draft Invoices</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            History of invoices created from uploaded agreements.
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
          {invoices.length} Invoices
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Invoice No</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Buyer / Client</th>
                <th className="px-6 py-3">Reference No</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoices.map((inv, idx) => {
                const sym = inv.currency === 'EUR' ? '€' : inv.currency === 'INR' ? '₹' : '$';
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-900 font-mono">
                      {inv.invoice_no}
                    </td>
                    <td className="px-6 py-4">{inv.invoice_date}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{inv.buyer_name}</td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                      {inv.reference_no}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 font-mono">
                      {inv.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2 })} {sym}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onSelectInvoice(inv)}
                        className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
