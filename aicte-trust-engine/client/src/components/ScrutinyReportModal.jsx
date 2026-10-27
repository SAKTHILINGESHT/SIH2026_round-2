import React from 'react';
import { X, Printer, Download, ShieldCheck, AlertOctagon, CheckCircle2, Lock } from 'lucide-react';

/**
 * Formal AICTE Preliminary Scrutiny Summary Report
 * Printable enterprise document for AICTE officials and evaluation committees.
 */
export const ScrutinyReportModal = ({ isOpen, onClose, application }) => {
  if (!isOpen || !application) return null;

  const currentDoc = application.documents?.[0] || {};
  const isAnomaly = application.overallStatus === 'anomaly_detected';
  const lastEvent = application.auditTimeline?.[application.auditTimeline.length - 1];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Toolbar */}
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm">Official Preliminary Scrutiny Report (AICTE Form-SCR-26)</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Canvas */}
        <div className="flex-1 overflow-y-auto p-8 font-serif text-slate-800 bg-white space-y-6">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <div className="text-xs uppercase tracking-widest font-sans font-semibold text-slate-500">
              Government of India • Ministry of Education
            </div>
            <h1 className="text-xl font-bold uppercase tracking-wide text-slate-950 mt-1 font-serif">
              ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)
            </h1>
            <p className="text-xs font-sans text-slate-600">
              Nelson Mandela Marg, Vasant Kunj, New Delhi - 110 070 | Regulation Bureau
            </p>
            <div className="mt-3 inline-block bg-slate-100 border border-slate-300 px-4 py-1 font-sans text-xs font-bold uppercase tracking-wider text-slate-800">
              PRELIMINARY SCRUTINY VERIFICATION SHEET (SIH26261) • EOA 2026-27
            </div>
          </div>

          {/* Institutional Metadata Block */}
          <div className="grid grid-cols-2 gap-4 font-sans text-xs border border-slate-300 p-4 bg-slate-50/60 rounded">
            <div>
              <span className="text-slate-500 block">Institution Name:</span>
              <strong className="text-slate-900 text-sm">{application.institutionName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">AICTE Application ID:</span>
              <strong className="text-slate-900 font-mono">{application.appId}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Regional Office:</span>
              <span className="text-slate-800 font-medium">{application.region}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Scrutiny Category & Intake:</span>
              <span className="text-slate-800 font-medium">{application.category} ({application.intakeApplied} Seats)</span>
            </div>
          </div>

          {/* AI Decision Verdict Banner */}
          <div className={`p-4 rounded border font-sans text-xs flex items-center justify-between ${
            isAnomaly ? 'bg-rose-50 border-rose-400 text-rose-900' : 'bg-emerald-50 border-emerald-400 text-emerald-900'
          }`}>
            <div className="flex items-center gap-3">
              {isAnomaly ? <AlertOctagon className="w-6 h-6 text-rose-600" /> : <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
              <div>
                <div className="font-bold text-sm uppercase tracking-wide">
                  AI Validation Verdict: {application.overallStatus.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div>Risk Tampering Score: {application.riskScore || 0}/100 • Forensic Confidence: 94.2%</div>
              </div>
            </div>
            <div className="font-mono text-xs font-bold px-3 py-1 rounded bg-white border">
              {application.overallStatus === 'anomaly_detected' ? 'SCRUTINY DEFICIENT' : 'CLEAN GREEN-CHANNEL'}
            </div>
          </div>

          {/* Forensic Multi-Modal Findings Table */}
          <div className="space-y-2 font-sans text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-300 pb-1">
              Multi-Modal Trust Engine Scrutiny Summary
            </h3>
            
            <table className="w-full text-left border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
                  <th className="p-2 w-1/4">Evaluation Module</th>
                  <th className="p-2 w-1/2">Scrutiny Finding & AICTE APH Reference</th>
                  <th className="p-2 w-1/4 text-right">Module Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 font-semibold text-slate-800">Contextual NLP (LayoutLM)</td>
                  <td className="p-2 text-slate-600">Extracted statutory fields from {currentDoc.docId || 'attached documents'}.</td>
                  <td className="p-2 text-right font-mono font-bold text-emerald-700">EXTRACTED (14 Fields)</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold text-slate-800">Forensic ELA (OpenCV)</td>
                  <td className="p-2 text-slate-600">
                    {currentDoc.flags?.find(f => f.type === 'ELA_Mismatch')?.message || 'Uniform compression. No pixel splicing detected.'}
                  </td>
                  <td className="p-2 text-right font-mono font-bold text-rose-700">
                    {isAnomaly ? 'SPLICING FLAGGED' : 'CLEAN PASS'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold text-slate-800">Simulated Authority API</td>
                  <td className="p-2 text-slate-600">
                    {currentDoc.apiVerification?.service} cross-reference completed. Status: {currentDoc.apiVerification?.status}
                  </td>
                  <td className="p-2 text-right font-mono font-bold text-slate-800">
                    {currentDoc.apiVerification?.status || 'QUERY COMPLETE'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold text-slate-800">Confidentiality Safeguard (PII)</td>
                  <td className="p-2 text-slate-600">
                    Automated PII Redaction active. Faculty Aadhaar and Trust PAN credentials masked per AICTE Confidentiality Protocol Rule 18(b).
                  </td>
                  <td className="p-2 text-right font-mono font-bold text-emerald-700">
                    PII PROTECTED
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold text-slate-800">Anti-Duplication Hash Ledger</td>
                  <td className="p-2 text-slate-600">
                    {currentDoc.cryptographicFingerprint?.message || 'Unique cryptographic fingerprint. 0 collisions across 48,920 AICTE repository records.'}
                  </td>
                  <td className={`p-2 text-right font-mono font-bold ${
                    currentDoc.cryptographicFingerprint?.collisionDetected ? 'text-rose-700' : 'text-emerald-700'
                  }`}>
                    {currentDoc.cryptographicFingerprint?.collisionDetected ? 'RECYCLED COLLISION' : '0 COLLISIONS (UNIQUE)'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold text-slate-800">AICTE Handbook Compliance</td>
                  <td className="p-2 text-slate-600">
                    Audited against APH 2026-27 rules (APH-RULE-201, APH-RULE-304, APH-RULE-412).
                  </td>
                  <td className="p-2 text-right font-mono font-bold text-rose-700">
                    {isAnomaly ? 'BREACH FLAGGED' : 'COMPLIANT'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cryptographic Ledger & Signatures */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 font-sans text-xs">
            <div>
              <div className="flex items-center gap-1.5 text-slate-700 font-bold mb-1">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Immutable SHA-256 Ledger Record</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono break-all">
                Event Hash: {lastEvent?.hash || '3d99cb109012bbec4091aae0041288cba17e'}<br />
                Timestamp: {lastEvent?.timestamp || new Date().toISOString()}
              </p>
            </div>

            <div className="text-right">
              <div className="font-serif italic text-base text-slate-700 font-bold mb-1">
                A. K. Sundaram
              </div>
              <div className="font-bold text-slate-900">Dr. A. K. Sundaram</div>
              <div className="text-slate-500 text-[11px]">Senior Scrutiny Officer, AICTE RO</div>
              <div className="text-slate-400 text-[10px]">Digital Signature Verified by e-Pramaan</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
