import React, { useState } from 'react';
import { EvrenExtractionResponse } from '../../types/evren';

interface EvrenExtractionViewProps {
  data: EvrenExtractionResponse;
  onReupload: () => void;
}

type SectionKey = 'all' | 'parties' | 'commercials' | 'payments';

const SECTIONS: { id: SectionKey; label: string }[] = [
  { id: 'all', label: 'All Sections' },
  { id: 'parties', label: '1. Party Names' },
  { id: 'commercials', label: '2. Timeline & Commercials' },
  { id: 'payments', label: '3. Payment Terms' },
];

const dash = (val?: string | number | null): string => {
  if (val === undefined || val === null) return '—';
  const s = String(val).trim();
  return s === '' ? '—' : s;
};

const th = 'border border-slate-300 bg-slate-100 px-3 py-2 text-left font-semibold text-slate-700 text-xs uppercase tracking-wider';
const td = 'border border-slate-300 px-3 py-2 text-xs text-slate-800';
const tdLabel = 'border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 w-48';

const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="overflow-x-auto border border-slate-300 rounded mb-4">
    <table className="w-full border-collapse text-xs">
      {children}
    </table>
  </div>
);

const Section: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <section className="bg-white rounded-lg border border-slate-300 p-5 mb-6">
    <div className="pb-3 mb-4 border-b border-slate-200">
      <h2 className="text-base font-bold text-slate-800">{title}</h2>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </section>
);

export const EvrenExtractionView: React.FC<EvrenExtractionViewProps> = ({
  data,
  onReupload,
}) => {
  const [activeSection, setActiveSection] = useState<SectionKey>('all');
  const { parties, commercials, payment_terms, suggested_insights } = data;

  const sp = parties.service_provider;
  const cl = parties.client;

  const formatSignatory = (sig?: string | null, title?: string | null) => {
    if (!sig) return '—';
    return title ? `${sig} (${title})` : sig;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-300">
        <div>
          <button
            onClick={onReupload}
            className="text-xs text-slate-600 hover:text-slate-900 underline mb-2 inline-block"
          >
            ← Upload Another Document
          </button>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">
            {data.document_title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Source: <span className="font-medium text-slate-700">{data.source_filename}</span>
          </p>
        </div>

        <div>
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              const baseName = data.source_filename.replace(/\.[^/.]+$/, '') || 'contract';
              a.download = `${baseName}_extracted_data.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-3 py-1.5 rounded text-xs font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* Section Nav Buttons */}
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`px-3 py-1.5 rounded text-xs font-medium border ${
              activeSection === sec.id
                ? 'bg-slate-800 text-white border-slate-800 font-semibold'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* 1. Party Identification */}
      {(activeSection === 'all' || activeSection === 'parties') && (
        <Section
          title="1. Party Identification"
          subtitle="Contracting entities, operational branches, signatories, and registered offices"
        >
          {/* Comparison Table */}
          <Table>
            <thead>
              <tr>
                <th className={`${th} w-48`}>Attribute</th>
                <th className={th}>Service Provider</th>
                <th className={th}>Client</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={tdLabel}>Legal Name</td>
                <td className={`${td} font-semibold text-slate-900`}>{dash(sp?.name)}</td>
                <td className={`${td} font-semibold text-slate-900`}>{dash(cl?.name)}</td>
              </tr>
              <tr>
                <td className={tdLabel}>Role</td>
                <td className={td}>{dash(sp?.role)}</td>
                <td className={td}>{dash(cl?.role)}</td>
              </tr>
              <tr>
                <td className={tdLabel}>Legal Status</td>
                <td className={td}>{dash(sp?.legal_status)}</td>
                <td className={td}>{dash(cl?.legal_status)}</td>
              </tr>
              <tr>
                <td className={tdLabel}>Registration Number</td>
                <td className={td}>{dash(sp?.registration_number)}</td>
                <td className={td}>{dash(cl?.registration_number)}</td>
              </tr>
              <tr>
                <td className={tdLabel}>Authorized Signatory</td>
                <td className={td}>{formatSignatory(sp?.authorized_signatory, sp?.signatory_title)}</td>
                <td className={td}>{formatSignatory(cl?.authorized_signatory, cl?.signatory_title)}</td>
              </tr>
              <tr>
                <td className={tdLabel}>Registered Office</td>
                <td className={td}>{dash(sp?.registered_address)}</td>
                <td className={td}>{dash(cl?.registered_address)}</td>
              </tr>
              <tr>
                <td className={tdLabel}>Operational Office</td>
                <td className={td}>{dash(sp?.operational_address)}</td>
                <td className={td}>{dash(cl?.operational_address)}</td>
              </tr>
              <tr>
                <td className={tdLabel}>Country / Jurisdiction</td>
                <td className={td}>{dash(sp?.country_or_jurisdiction)}</td>
                <td className={td}>{dash(cl?.country_or_jurisdiction)}</td>
              </tr>
              <tr>
                <td className={tdLabel}>Telephone</td>
                <td className={td}>{dash(sp?.contact_telephone)}</td>
                <td className={td}>{dash(cl?.contact_telephone)}</td>
              </tr>
              <tr>
                <td className={tdLabel}>Website</td>
                <td className={td}>{dash(sp?.contact_website)}</td>
                <td className={td}>{dash(cl?.contact_website)}</td>
              </tr>
            </tbody>
          </Table>

          {/* Project & Scope Table */}
          <Table>
            <tbody>
              <tr>
                <td className={tdLabel}>Project Name</td>
                <td className={td}>{dash(parties.project_name)}</td>
              </tr>
              <tr>
                <td className={tdLabel}>Target Engagement / Scope</td>
                <td className={td}>{dash(parties.target_assets_scope)}</td>
              </tr>
              <tr>
                <td className={tdLabel}>Conflict / Third-Party Disclosures</td>
                <td className={td}>
                  {parties.related_parties && parties.related_parties.length > 0
                    ? parties.related_parties.join(', ')
                    : '—'}
                </td>
              </tr>
            </tbody>
          </Table>
        </Section>
      )}

      {/* 2. Timeline & Commercials */}
      {(activeSection === 'all' || activeSection === 'commercials') && (
        <Section
          title="2. Timeline & Commercials"
          subtitle="Execution timeline, baseline professional fees, administrative charges, and tax terms"
        >
          {/* Key/Value Table */}
          <Table>
            <tbody>
              <tr>
                <td className={tdLabel}>Execution Date</td>
                <td className={td}>{dash(commercials.execution_date)}</td>
              </tr>
              <tr>
                <td className={tdLabel}>Validity / Delivery Timeline</td>
                <td className={td}>{dash(commercials.validity_timeline)}</td>
              </tr>
              <tr>
                <td className={tdLabel}>Currency</td>
                <td className={td}>{dash(commercials.currency)}</td>
              </tr>
              <tr>
                <td className={tdLabel}>Total Professional Fee</td>
                <td className={`${td} font-bold text-slate-900`}>{dash(commercials.total_fee_formatted)}</td>
              </tr>
              <tr>
                <td className={tdLabel}>Fee in Words</td>
                <td className={td}>{dash(commercials.fee_in_words)}</td>
              </tr>
              <tr>
                <td className={tdLabel}>Out-of-Pocket Expenses</td>
                <td className={td}>{dash(commercials.out_of_pocket_expenses)}</td>
              </tr>
              <tr>
                <td className={tdLabel}>Administrative Expenses</td>
                <td className={td}>{dash(commercials.administrative_expenses)}</td>
              </tr>
              <tr>
                <td className={tdLabel}>Tax & Statutory Levies</td>
                <td className={td}>{dash(commercials.tax_terms)}</td>
              </tr>
            </tbody>
          </Table>

          {/* Execution & Delivery Steps Table */}
          {suggested_insights.milestone_stepper && suggested_insights.milestone_stepper.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Execution & Delivery Steps
              </h3>
              <Table>
                <thead>
                  <tr>
                    <th className={`${th} w-12 text-center`}>#</th>
                    <th className={th}>Step</th>
                    <th className={`${th} w-36`}>Date / Trigger</th>
                    <th className={`${th} w-28`}>Status</th>
                    <th className={th}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {suggested_insights.milestone_stepper.map((step) => (
                    <tr key={step.step_number}>
                      <td className={`${td} text-center font-semibold`}>{step.step_number}</td>
                      <td className={`${td} font-medium text-slate-900`}>{dash(step.title)}</td>
                      <td className={td}>{dash(step.date_or_trigger)}</td>
                      <td className={td}>{dash(step.badge)}</td>
                      <td className={td}>{dash(step.description)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Section>
      )}

      {/* 3. Payment Terms */}
      {(activeSection === 'all' || activeSection === 'payments') && (
        <Section
          title="3. Payment Terms"
          subtitle="Milestone tranche schedule, invoice credit periods, TDS rules, and compliance"
        >
          {/* Key/Value Table */}
          <Table>
            <tbody>
              <tr>
                <td className={tdLabel}>Credit Period</td>
                <td className={td}>{payment_terms.credit_period_days ? `${payment_terms.credit_period_days} Days` : '—'}</td>
              </tr>
              <tr>
                <td className={tdLabel}>Credit Terms</td>
                <td className={td}>{dash(payment_terms.credit_terms_description)}</td>
              </tr>
              <tr>
                <td className={tdLabel}>TDS Provisions</td>
                <td className={td}>{dash(payment_terms.tds_provisions)}</td>
              </tr>
              <tr>
                <td className={tdLabel}>Forex (FEMA) & GST Compliance</td>
                <td className={td}>{dash(payment_terms.forex_and_gst_compliance)}</td>
              </tr>
            </tbody>
          </Table>

          {/* Milestone Tranche Schedule Table */}
          {payment_terms.milestones && payment_terms.milestones.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Milestone Tranche Schedule
              </h3>
              <Table>
                <thead>
                  <tr>
                    <th className={`${th} w-20 text-center`}>Milestone</th>
                    <th className={`${th} w-20 text-center`}>Share %</th>
                    <th className={`${th} w-32`}>Amount</th>
                    <th className={th}>Trigger Condition</th>
                    <th className={`${th} w-28`}>Status</th>
                    <th className={th}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {payment_terms.milestones.map((m) => (
                    <tr key={m.milestone_number}>
                      <td className={`${td} text-center font-semibold`}>#{m.milestone_number}</td>
                      <td className={`${td} text-center font-medium`}>{m.percentage}%</td>
                      <td className={`${td} font-bold text-slate-900`}>{dash(m.amount_formatted)}</td>
                      <td className={td}>{dash(m.trigger_condition)}</td>
                      <td className={td}>{dash(m.status || 'Pending')}</td>
                      <td className={td}>{dash(m.description)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Section>
      )}

    </div>
  );
};
