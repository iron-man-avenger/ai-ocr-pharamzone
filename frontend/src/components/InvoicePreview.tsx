import React from 'react';
import { Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { InvoiceDraftResponse } from '../types/invoice';

interface InvoicePreviewProps {
  invoice: InvoiceDraftResponse;
  onBackToEdit: () => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoice,
  onBackToEdit,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const currSymbol = invoice.currency === 'EUR' ? '€' : invoice.currency === 'INR' ? '₹' : '$';

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      
      {/* Top Action Bar (hidden in print) */}
      <div className="flex justify-between items-center mb-6 no-print">
        <button
          onClick={onBackToEdit}
          className="inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Edit Milestone / Details
        </button>

        <div className="flex items-center space-x-3">
          <span className="hidden sm:inline-flex items-center text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Pharmazone Draft Ready
          </span>

          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Official Invoice Sheet (A4 Proportion) */}
      <div className="invoice-container bg-white border border-slate-400 p-8 sm:p-12 shadow-xl mx-auto text-slate-900 text-xs font-sans max-w-[850px]">
        
        {/* Header Title */}
        <div className="text-center mb-4">
          <h1 className="text-lg font-bold tracking-wide uppercase">
            {invoice.invoice_title}
          </h1>
          {invoice.legal_sub_heading && (
            <p className="text-[10px] text-slate-600 max-w-xl mx-auto uppercase mt-0.5 leading-tight">
              {invoice.legal_sub_heading}
            </p>
          )}
        </div>

        {/* Master Table Grid */}
        <div className="border border-slate-800">
          
          {/* Top Row: Seller Details (Left) + Invoice Metadata (Right) */}
          <div className="grid grid-cols-2 border-b border-slate-800">
            
            {/* Left: Pharmazone Info */}
            <div className="p-3 border-r border-slate-800 space-y-1">
              <div className="font-bold text-sm text-slate-900">{invoice.seller_name}</div>
              <div>402, Shafalya Elegance</div>
              <div>Nr. Shakti Arcade, Opp. Sola Water Tank</div>
              <div>Sola, Ahmedabad-380060, India</div>
              <div><strong>GSTIN/UIN:</strong> {invoice.seller_gstin}</div>
              <div><strong>State Name :</strong> {invoice.seller_state}</div>
              <div><strong>E-Mail :</strong> {invoice.seller_email}</div>
              <div>www.pharmazones.com</div>
            </div>

            {/* Right: Invoice Reference Metadata */}
            <div className="divide-y divide-slate-800">
              <div className="grid grid-cols-2 divide-x divide-slate-800">
                <div className="p-2">
                  <div className="text-[10px] text-slate-500 uppercase">Invoice No.</div>
                  <div className="font-bold font-mono text-sm">{invoice.invoice_no}</div>
                </div>
                <div className="p-2">
                  <div className="text-[10px] text-slate-500 uppercase">Dated</div>
                  <div className="font-bold">{invoice.invoice_date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-slate-800">
                <div className="p-2">
                  <div className="text-[10px] text-slate-500 uppercase">Reference No. & Date.</div>
                  <div className="font-bold font-mono text-[11px]">{invoice.reference_no}</div>
                </div>
                <div className="p-2">
                  <div className="text-[10px] text-slate-500 uppercase">Mode/Terms of Payment</div>
                  <div className="font-bold">{invoice.mode_terms_of_payment}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-slate-800">
                <div className="p-2">
                  <div className="text-[10px] text-slate-500 uppercase">Buyer's Order No.</div>
                  <div className="font-bold font-mono">{invoice.buyer_order_no || 'N/A'}</div>
                </div>
                <div className="p-2">
                  <div className="text-[10px] text-slate-500 uppercase">Dated</div>
                  <div className="font-medium">{invoice.buyer_order_date || 'N/A'}</div>
                </div>
              </div>

              <div className="p-2">
                <span className="text-[10px] text-slate-500 uppercase">Country: </span>
                <span className="font-bold">{invoice.country}</span>
              </div>

            </div>

          </div>

          {/* Buyer (Bill To) Row */}
          <div className="p-3 border-b border-slate-800 bg-slate-50/40">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Buyer (Bill to)</div>
            <div className="font-bold text-sm text-slate-900 mt-0.5">{invoice.buyer_name}</div>
            <div className="text-xs text-slate-800 whitespace-pre-line mt-0.5">{invoice.buyer_address}</div>
            {invoice.buyer_gstin && (
              <div className="mt-1">
                <strong>GSTIN/UIN:</strong> {invoice.buyer_gstin} | <strong>PAN:</strong> {invoice.buyer_pan}
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className="border-b border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-100 font-bold text-slate-900">
                  <th className="p-2.5 border-r border-slate-800 w-[55%]">Description of Services</th>
                  <th className="p-2.5 border-r border-slate-800 text-center w-[15%]">HSN/SAC</th>
                  <th className="p-2.5 border-r border-slate-800 text-center w-[10%]">GST Rate</th>
                  <th className="p-2.5 border-r border-slate-800 text-center w-[10%]">Quantity</th>
                  <th className="p-2.5 text-right w-[10%]">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="align-top">
                  <td className="p-3 border-r border-slate-800 space-y-2">
                    <div className="font-bold underline text-slate-900">
                      {invoice.item.header_description}
                    </div>
                    
                    <div className="text-slate-800 leading-relaxed italic">
                      {invoice.item.detailed_description}
                    </div>

                    {invoice.item.site_location && (
                      <div className="font-semibold text-slate-800">
                        MONITORING / AUDIT SITE: {invoice.item.site_location}
                      </div>
                    )}

                    {invoice.item.milestone_clause && (
                      <div className="text-[11px] text-slate-700 bg-slate-50 p-2 border border-slate-200 rounded">
                        {invoice.item.milestone_clause}
                      </div>
                    )}
                  </td>

                  <td className="p-3 border-r border-slate-800 text-center font-mono font-bold">
                    {invoice.item.hsn_sac}
                  </td>

                  <td className="p-3 border-r border-slate-800 text-center font-mono">
                    {invoice.item.gst_rate} %
                  </td>

                  <td className="p-3 border-r border-slate-800 text-center font-mono">
                    {invoice.item.quantity}
                  </td>

                  <td className="p-3 text-right font-mono font-bold">
                    {invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currSymbol}
                  </td>
                </tr>

                {/* Domestic GST rows if applicable */}
                {invoice.invoice_type === 'TAX' && (
                  <>
                    <tr className="border-t border-slate-200">
                      <td className="p-2 border-r border-slate-800 font-semibold text-right" colSpan={4}>
                        Output CGST @ {invoice.cgst_rate}%
                      </td>
                      <td className="p-2 text-right font-mono font-bold">
                        {invoice.cgst_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currSymbol}
                      </td>
                    </tr>
                    <tr className="border-t border-slate-200">
                      <td className="p-2 border-r border-slate-800 font-semibold text-right" colSpan={4}>
                        Output SGST @ {invoice.sgst_rate}%
                      </td>
                      <td className="p-2 text-right font-mono font-bold">
                        {invoice.sgst_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currSymbol}
                      </td>
                    </tr>
                  </>
                )}

              </tbody>
            </table>
          </div>

          {/* Grand Total Row */}
          <div className="grid grid-cols-2 p-3 border-b border-slate-800 bg-slate-50 font-bold">
            <div className="text-right pr-4">Total</div>
            <div className="text-right font-mono text-sm">
              {invoice.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currSymbol}
            </div>
          </div>

          {/* Amount in words */}
          <div className="p-3 border-b border-slate-800 flex justify-between items-center">
            <div>
              <span className="text-slate-500 uppercase text-[10px] block">Amount Chargeable (in words)</span>
              <span className="font-bold text-slate-900">{invoice.amount_in_words}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">E. & O.E</span>
          </div>

          {/* Tax Table (HSN/SAC Breakdown) */}
          <div className="border-b border-slate-800">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-100 font-semibold">
                  <th className="p-2 border-r border-slate-800 text-center">HSN/SAC</th>
                  <th className="p-2 border-r border-slate-800 text-right">Taxable Value (INR)</th>
                  {invoice.invoice_type === 'TAX' ? (
                    <>
                      <th className="p-2 border-r border-slate-800 text-center">CGST Rate</th>
                      <th className="p-2 border-r border-slate-800 text-right">CGST Amt</th>
                      <th className="p-2 border-r border-slate-800 text-center">SGST Rate</th>
                      <th className="p-2 border-r border-slate-800 text-right">SGST Amt</th>
                    </>
                  ) : (
                    <th className="p-2 border-r border-slate-800 text-center">IGST Rate</th>
                  )}
                  <th className="p-2 text-right">Total Tax</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border-r border-slate-800 text-center font-mono font-bold">
                    {invoice.item.hsn_sac}
                  </td>
                  <td className="p-2 border-r border-slate-800 text-right font-mono">
                    ₹ {invoice.taxable_value_inr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  {invoice.invoice_type === 'TAX' ? (
                    <>
                      <td className="p-2 border-r border-slate-800 text-center font-mono">9%</td>
                      <td className="p-2 border-r border-slate-800 text-right font-mono">₹ {invoice.cgst_amount}</td>
                      <td className="p-2 border-r border-slate-800 text-center font-mono">9%</td>
                      <td className="p-2 border-r border-slate-800 text-right font-mono">₹ {invoice.sgst_amount}</td>
                    </>
                  ) : (
                    <td className="p-2 border-r border-slate-800 text-center font-mono">0%</td>
                  )}
                  <td className="p-2 text-right font-mono font-bold">
                    {invoice.total_tax > 0 ? `₹ ${invoice.total_tax}` : 'NIL'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom Row: Company PAN / Bank Details (Left) + Signature (Right) */}
          <div className="grid grid-cols-2">
            
            {/* Left: Bank Details & Declaration */}
            <div className="p-3 border-r border-slate-800 space-y-2 text-[11px]">
              <div><strong>Company's PAN/ IEC Code:</strong> {invoice.seller_pan}</div>
              
              <div className="pt-2 border-t border-slate-200">
                <div className="font-bold text-slate-800 uppercase text-[10px]">Company's Bank Details</div>
                <div><strong>A/c Holder's Name :</strong> {invoice.bank_details.account_name}</div>
                <div><strong>Bank Name :</strong> {invoice.bank_details.bank_name}</div>
                <div><strong>A/c No. :</strong> {invoice.bank_details.account_no}</div>
                <div><strong>Branch & IFS Code:</strong> {invoice.bank_details.branch_ifsc}</div>
                <div><strong>SWIFT Code :</strong> {invoice.bank_details.swift_code}</div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 italic">
                <strong>Declaration:</strong> We declare that this invoice shows the actual price of the services described and that all particulars are true and correct.
              </div>
            </div>

            {/* Right: Signature Box */}
            <div className="p-4 flex flex-col justify-between items-end text-right">
              <div className="font-bold text-slate-900">for {invoice.seller_name}</div>
              
              <div className="text-center pt-8">
                <div className="border-t border-dashed border-slate-400 pt-1 text-[11px] font-semibold text-slate-700">
                  Authorised Signatory
                </div>
                <div className="text-[9px] text-slate-400 mt-1">This is a Computer Generated Invoice</div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
