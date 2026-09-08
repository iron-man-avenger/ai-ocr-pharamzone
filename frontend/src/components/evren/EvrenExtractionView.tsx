import React, { useState } from 'react';
import { 
  EvrenExtractionResponse, 
  PartyDetail 
} from '../../types/evren';
import { 
  Building2, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Globe, 
  AlertCircle, 
  Briefcase, 
  Scale, 
  Download,
  ArrowLeft
} from 'lucide-react';

interface EvrenExtractionViewProps {
  data: EvrenExtractionResponse;
  onReupload: () => void;
  samplePdfUrl: string;
}

export const EvrenExtractionView: React.FC<EvrenExtractionViewProps> = ({
  data,
  onReupload,
  samplePdfUrl,
}) => {
  const [activeSection, setActiveSection] = useState<'all' | 'parties' | 'commercials' | 'payments'>('all');

  const { parties, commercials, payment_terms, suggested_insights } = data;

  const renderPartyCard = (party: PartyDetail, isProvider: boolean) => (
    <div className={`rounded-xl border p-5 transition-all ${
      isProvider 
        ? 'bg-[#3F657F] border-[#2e4d63] text-white shadow-md' 
        : 'bg-[#F6F9FB] border-[#3F657F]/20 text-slate-900 shadow-sm'
    }`}>
      <div className="flex items-start justify-between pb-3 border-b border-white/10">
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
            isProvider ? 'bg-[#1D6597] text-[#F6F9FB] border border-white/20' : 'bg-[#E3EFF7] text-[#1D6597] border border-[#3F657F]/20'
          }`}>
            {party.role}
          </span>
          <h3 className={`text-base font-bold mt-1.5 leading-snug ${isProvider ? 'text-white' : 'text-[#3F657F]'}`}>
            {party.name}
          </h3>
          {party.legal_status && (
            <p className={`text-xs ${isProvider ? 'text-[#E3EFF7]' : 'text-slate-500'}`}>
              {party.legal_status}
            </p>
          )}
        </div>
        <div className={`p-2 rounded-xl ${isProvider ? 'bg-[#1D6597] text-[#F6F9FB]' : 'bg-[#E3EFF7] text-[#1D6597]'}`}>
          <Building2 className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 space-y-3 text-xs">
        {party.registration_number && (
          <div className="flex items-start space-x-2">
            <span className={`font-semibold min-w-[90px] ${isProvider ? 'text-[#E3EFF7]/80' : 'text-slate-500'}`}>
              Registration:
            </span>
            <span className={`font-medium ${isProvider ? 'text-white' : 'text-slate-800'}`}>
              {party.registration_number}
            </span>
          </div>
        )}

        {party.authorized_signatory && (
          <div className="flex items-start space-x-2">
            <span className={`font-semibold min-w-[90px] ${isProvider ? 'text-[#E3EFF7]/80' : 'text-slate-500'}`}>
              Signatory:
            </span>
            <span className={`font-semibold ${isProvider ? 'text-emerald-300' : 'text-[#1D6597]'}`}>
              {party.authorized_signatory} {party.signatory_title && `(${party.signatory_title})`}
            </span>
          </div>
        )}

        {party.registered_address && (
          <div className="flex items-start space-x-2">
            <MapPin className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${isProvider ? 'text-[#E3EFF7]' : 'text-[#1D6597]'}`} />
            <div>
              <span className={`font-semibold ${isProvider ? 'text-[#E3EFF7]/80' : 'text-slate-500'}`}>Registered Office: </span>
              <span className={isProvider ? 'text-[#E3EFF7]' : 'text-slate-700'}>{party.registered_address}</span>
            </div>
          </div>
        )}

        {party.operational_address && party.operational_address !== party.registered_address && (
          <div className="flex items-start space-x-2">
            <MapPin className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${isProvider ? 'text-emerald-300' : 'text-[#1D6597]'}`} />
            <div>
              <span className={`font-semibold ${isProvider ? 'text-[#E3EFF7]/80' : 'text-slate-500'}`}>Operational Office: </span>
              <span className={isProvider ? 'text-[#E3EFF7]' : 'text-slate-700'}>{party.operational_address}</span>
            </div>
          </div>
        )}

        <div className="pt-2 flex flex-wrap gap-3 border-t border-white/10 text-[11px]">
          {party.contact_telephone && (
            <div className={`flex items-center space-x-1 ${isProvider ? 'text-[#E3EFF7]/90' : 'text-slate-500'}`}>
              <Phone className="w-3 h-3" />
              <span>{party.contact_telephone}</span>
            </div>
          )}
          {party.contact_website && (
            <div className={`flex items-center space-x-1 ${isProvider ? 'text-emerald-300 font-medium' : 'text-[#1D6597] font-medium'}`}>
              <Globe className="w-3 h-3" />
              <span>{party.contact_website}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#3F657F]/20">
        <div>
          <button
            onClick={onReupload}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#1D6597] hover:text-[#16507a] transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Upload Another Document</span>
          </button>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-[#3F657F] tracking-tight">
              {data.document_title}
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E3EFF7] text-[#1D6597] border border-[#3F657F]/30">
              {Math.round(data.confidence_score * 100)}% Confidence
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Source: <span className="font-medium text-slate-700">{data.source_filename}</span> • Processed by {data.extraction_engine}
          </p>
        </div>

        {data.source_filename.toLowerCase().includes('pinnacle') && (
          <div className="flex items-center space-x-2">
            <a
              href={samplePdfUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-lg bg-[#1D6597] hover:bg-[#16507a] text-white shadow-sm transition-all hover:scale-105"
            >
              <Download className="w-3.5 h-3.5 text-[#E3EFF7]" />
              <span>View Sample PDF</span>
            </a>
          </div>
        )}
      </div>

      {/* Structured Extraction Flow Header (3 Core Sections) */}
      <div className="bg-[#F6F9FB] rounded-xl border border-[#3F657F]/20 p-2 shadow-sm flex items-center justify-center space-x-1 sm:space-x-3 text-xs font-semibold text-slate-600">
        <span className="text-[#3F657F] font-bold hidden sm:inline">Sections:</span>
        <button
          onClick={() => setActiveSection('all')}
          className={`px-3 py-1.5 rounded-lg transition-all font-bold ${activeSection === 'all' ? 'bg-[#1D6597] text-white shadow' : 'hover:bg-[#E3EFF7] text-slate-700'}`}
        >
          All Sections
        </button>
        <button
          onClick={() => setActiveSection('parties')}
          className={`px-3 py-1.5 rounded-lg transition-all font-bold ${activeSection === 'parties' ? 'bg-[#1D6597] text-white shadow' : 'hover:bg-[#E3EFF7] text-slate-700'}`}
        >
          1. Party Names
        </button>
        <button
          onClick={() => setActiveSection('commercials')}
          className={`px-3 py-1.5 rounded-lg transition-all font-bold ${activeSection === 'commercials' ? 'bg-[#1D6597] text-white shadow' : 'hover:bg-[#E3EFF7] text-slate-700'}`}
        >
          2. Timeline & Commercials
        </button>
        <button
          onClick={() => setActiveSection('payments')}
          className={`px-3 py-1.5 rounded-lg transition-all font-bold ${activeSection === 'payments' ? 'bg-[#1D6597] text-white shadow' : 'hover:bg-[#E3EFF7] text-slate-700'}`}
        >
          3. Payment Terms
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1) PARTY NAME SECTION (REQUIRED ORDER #1)                               */}
      {/* ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'parties') && (
        <section className="bg-[#E3EFF7]/50 border border-[#3F657F]/20 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#3F657F]/20">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#3F657F] text-[#F6F9FB] flex items-center justify-center font-black text-sm shadow">
                1
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#3F657F]">Party Identification & Corporate Profiles</h2>
                <p className="text-xs text-slate-500">Contracting entities, operational branches, signatories, and registered offices</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#E3EFF7] text-[#1D6597] border border-[#3F657F]/20">
              Verified Identities
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {renderPartyCard(parties.service_provider, true)}
            {renderPartyCard(parties.client, false)}
          </div>

          {/* Project Subject Matter & Target Scope */}
          <div className="bg-[#F6F9FB] rounded-xl border border-[#3F657F]/20 p-4 space-y-3">
            <div className="flex items-start space-x-3">
              <Briefcase className="w-4 h-4 text-[#1D6597] mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#3F657F] uppercase tracking-wider">
                  Target Engagement / Project Scope:
                </span>
                <p className="text-xs text-slate-700 mt-1 font-medium leading-relaxed">
                  <span className="font-bold text-[#3F657F]">{parties.project_name}</span> — {parties.target_assets_scope}
                </p>
              </div>
            </div>

            {parties.related_parties && parties.related_parties.length > 0 && (
              <div className="pt-3 border-t border-[#E3EFF7] flex items-start space-x-3 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-800">Conflict / Third-Party Disclosures:</span>
                  {parties.related_parties.map((party, idx) => (
                    <p key={idx} className="text-slate-600 mt-0.5">{party}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2) TIMELINE & COMMERCIALS SECTION (WITH EXECUTION & DELIVERY STEPPER)    */}
      {/* ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'commercials') && (
        <section className="bg-[#F6F9FB] border border-[#3F657F]/20 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#3F657F]/20">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#3F657F] text-[#F6F9FB] flex items-center justify-center font-black text-sm shadow">
                2
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#3F657F]">Timeline & Commercials</h2>
                <p className="text-xs text-slate-500">Execution stepper, agreed professional fees, delivery windows, expenses, and tax terms</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#E3EFF7] text-[#1D6597] border border-[#3F657F]/20">
              Total: {commercials.total_fee_formatted}
            </span>
          </div>

          {/* Execution & Delivery Stepper (Moved directly into Timeline & Commercials Box) */}
          {suggested_insights.milestone_stepper && suggested_insights.milestone_stepper.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#3F657F] uppercase tracking-wider">
                Execution & Delivery Stepper:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {suggested_insights.milestone_stepper.map((step) => (
                  <div key={step.step_number} className="p-4 rounded-xl bg-[#E3EFF7]/50 border border-[#3F657F]/20 relative space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-full bg-[#1D6597] text-white flex items-center justify-center text-xs font-bold shadow">
                        {step.step_number}
                      </span>
                      {step.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          step.badge === 'Executed' 
                            ? 'bg-emerald-100 text-emerald-800'
                            : step.badge === 'In Progress'
                            ? 'bg-[#1D6597] text-white animate-pulse'
                            : 'bg-white text-[#3F657F] border border-[#3F657F]/20'
                        }`}>
                          {step.badge}
                        </span>
                      )}
                    </div>

                    <h5 className="text-xs font-bold text-[#3F657F] leading-tight">
                      {step.title}
                    </h5>

                    <span className="inline-block text-[11px] font-bold text-[#1D6597]">
                      {step.date_or_trigger}
                    </span>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            
            {/* Metric 1: Total Agreed Fee */}
            <div className="bg-[#3F657F] text-white p-4 rounded-xl border border-[#2e4d63] shadow-sm">
              <span className="text-[10px] font-bold tracking-wider text-[#E3EFF7] uppercase">
                Agreed Professional Fee
              </span>
              <div className="text-2xl font-black mt-1 text-[#F6F9FB] tracking-tight">
                {commercials.total_fee_formatted}
              </div>
              {commercials.fee_in_words && (
                <p className="text-[11px] text-[#E3EFF7] mt-1 font-medium">
                  {commercials.fee_in_words}
                </p>
              )}
            </div>

            {/* Metric 2: Execution Date */}
            <div className="bg-[#E3EFF7]/60 border border-[#3F657F]/20 p-4 rounded-xl">
              <span className="text-[10px] font-bold tracking-wider text-[#3F657F] uppercase flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-[#1D6597]" />
                <span>Execution Date</span>
              </span>
              <div className="text-lg font-bold text-[#3F657F] mt-1">
                {commercials.execution_date || 'Not Specified'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Mutual signature date
              </p>
            </div>

            {/* Metric 3: Validity Timeline */}
            <div className="bg-[#E3EFF7]/60 border border-[#3F657F]/20 p-4 rounded-xl">
              <span className="text-[10px] font-bold tracking-wider text-[#3F657F] uppercase flex items-center space-x-1">
                <Clock className="w-3 h-3 text-[#1D6597]" />
                <span>Validity / Delivery Timeline</span>
              </span>
              <div className="text-lg font-bold text-[#3F657F] mt-1">
                {commercials.validity_timeline?.split('(')[0] || 'As agreed'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Provisional milestone window
              </p>
            </div>

            {/* Metric 4: Admin Expenses */}
            <div className="bg-[#E3EFF7]/60 border border-[#3F657F]/20 p-4 rounded-xl">
              <span className="text-[10px] font-bold tracking-wider text-[#3F657F] uppercase">
                Administrative Expenses
              </span>
              <div className="text-lg font-bold text-[#3F657F] mt-1">
                {commercials.administrative_expenses || 'As per agreement'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Printing, telecom, courier
              </p>
            </div>

          </div>

          {/* Expenses & Taxes Details Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#E3EFF7]/40 border border-[#3F657F]/20 space-y-1.5">
              <h4 className="font-bold text-[#3F657F] flex items-center space-x-1.5">
                <Scale className="w-3.5 h-3.5 text-[#1D6597]" />
                <span>Out-of-Pocket Expenses (OPE)</span>
              </h4>
              <p className="text-slate-600 leading-relaxed">
                {commercials.out_of_pocket_expenses || 'At actuals with prior written approval from Client.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#E3EFF7]/40 border border-[#3F657F]/20 space-y-1.5">
              <h4 className="font-bold text-[#3F657F] flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1D6597]" />
                <span>Tax & Statutory Levies</span>
              </h4>
              <p className="text-slate-600 leading-relaxed">
                {commercials.tax_terms || 'Exclusive of taxes. GST and applicable duties payable at actuals.'}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3) PAYMENT TERMS AND CONDITIONS SECTION (REQUIRED ORDER #3)               */}
      {/* ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'payments') && (
        <section className="bg-[#E3EFF7]/50 border border-[#3F657F]/20 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#3F657F]/20">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#3F657F] text-[#F6F9FB] flex items-center justify-center font-black text-sm shadow">
                3
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#3F657F]">Payment Terms and Conditions</h2>
                <p className="text-xs text-slate-500">Milestone schedule, invoice credit terms, TDS deductions, and forex repatriation</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#1D6597] text-white">
              Net {payment_terms.credit_period_days} Days Credit
            </span>
          </div>

          {/* Credit Terms Banner */}
          <div className="bg-[#F6F9FB] rounded-xl border border-[#1D6597]/30 p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#1D6597] text-white flex items-center justify-center flex-shrink-0 shadow">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#3F657F] uppercase tracking-wider">
                  Payment Credit Policy:
                </span>
                <p className="text-xs text-slate-600 mt-0.5">
                  {payment_terms.credit_terms_description}
                </p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Standard Period</span>
              <p className="text-base font-extrabold text-[#3F657F]">{payment_terms.credit_period_days} Calendar Days</p>
            </div>
          </div>

          {/* Milestone Tranches Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#3F657F] uppercase tracking-wider">
              Agreed Milestone Tranche Schedule:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {payment_terms.milestones.map((m) => (
                <div key={m.milestone_number} className="bg-[#F6F9FB] rounded-xl border border-[#3F657F]/20 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E3EFF7] text-[#3F657F]">
                      Milestone {m.milestone_number} of {payment_terms.milestones.length}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#1D6597] text-white">
                      {m.percentage}% Share
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xl font-black text-[#3F657F]">
                      {m.amount_formatted}
                    </span>
                    <p className="text-xs font-bold text-[#1D6597]">
                      Trigger: {m.trigger_condition}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 pt-2 border-t border-[#E3EFF7] leading-relaxed">
                    {m.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Statutory Compliance Provisions: TDS & FEMA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {payment_terms.tds_provisions && (
              <div className="bg-[#F6F9FB] p-4 rounded-xl border border-[#3F657F]/20 space-y-1.5">
                <span className="font-bold text-[#3F657F] flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1D6597]" />
                  <span>Tax Deducted at Source (TDS) Compliance</span>
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {payment_terms.tds_provisions}
                </p>
              </div>
            )}

            {payment_terms.forex_and_gst_compliance && (
              <div className="bg-[#F6F9FB] p-4 rounded-xl border border-[#3F657F]/20 space-y-1.5">
                <span className="font-bold text-[#3F657F] flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#1D6597]" />
                  <span>Foreign Exchange (FEMA) & GST Rules</span>
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {payment_terms.forex_and_gst_compliance}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
};
