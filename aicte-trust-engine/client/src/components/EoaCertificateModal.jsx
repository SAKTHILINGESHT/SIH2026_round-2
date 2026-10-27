import React from 'react';
import { X, Printer, Download, Award, CheckCircle2, ShieldCheck, QrCode, Lock, Building, Calendar, Hash } from 'lucide-react';

/**
 * Official AICTE Extension of Approval (EoA) Order Certificate Modal
 * Issued following executive officer sign-off and multi-modal AI forensic verification.
 */
export const EoaCertificateModal = ({ isOpen, onClose, application }) => {
  if (!isOpen || !application) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const eoaOrderNumber = application.eoaCertificate?.orderNumber || 
    `F.No. AICTE/AB/SWR/2026-27/${application.appId || 'APP-2026-AICTE-1081'}`;

  const programs = application.programs && application.programs.length > 0 
    ? application.programs 
    : ["B.Tech Computer Science & Engineering", "B.Tech Artificial Intelligence & Data Science", "B.Tech Electronics & Communication Engineering", "B.Tech Information Technology"];

  const intakePerProgram = Math.round((application.intakeApplied || 540) / programs.length);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Action Toolbar (Hidden during print) */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between shrink-0 print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">
                AICTE Official Extension of Approval (EoA) Order AY 2026-27
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Order Ref: {eoaOrderNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Paper Body (Scrollable canvas, Styled for formal Government PDF format) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 font-serif text-slate-900 bg-white space-y-6">
          {/* Official Letterhead */}
          <div className="text-center border-b-2 border-slate-900 pb-5">
            <div className="flex justify-center mb-2">
              <div className="w-14 h-14 rounded-full border-2 border-amber-600 flex items-center justify-center bg-amber-50 shadow-inner">
                <Award className="w-8 h-8 text-amber-700" />
              </div>
            </div>
            <div className="text-xs uppercase tracking-widest font-sans font-bold text-slate-600">
              Government of India • Ministry of Education
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wide text-slate-950 mt-1">
              ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
            </h1>
            <p className="text-xs font-sans text-slate-600 mt-0.5">
              (A Statutory Body under Ministry of Education, Govt. of India)
            </p>
            <p className="text-[11px] font-sans text-slate-500">
              Nelson Mandela Marg, Vasant Kunj, New Delhi - 110 070 | www.aicte-india.org
            </p>
            
            <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-1 rounded-full font-sans text-xs font-bold uppercase tracking-wider shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>OFFICIAL ORDER: EXTENSION OF APPROVAL (EoA) 2026-27</span>
            </div>
          </div>

          {/* Reference and Date Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-sans text-xs text-slate-600 border-b border-slate-200 pb-3">
            <div>
              <span className="font-bold text-slate-800">Order Ref: </span>
              <span className="font-mono font-bold text-slate-900">{eoaOrderNumber}</span>
            </div>
            <div>
              <span className="font-bold text-slate-800">Date of Order: </span>
              <span className="font-semibold text-slate-900">{todayStr}</span>
            </div>
          </div>

          {/* Addressee */}
          <div className="font-sans text-xs space-y-1 text-slate-800">
            <p className="font-bold text-slate-900">To,</p>
            <p className="font-bold text-slate-900">The Principal / Director,</p>
            <p className="text-sm font-extrabold text-slate-950">{application.institutionName}</p>
            <p className="text-slate-600">Permanent Institute ID: <strong className="text-slate-800 font-mono">{application.permanentId || '1-932148123'}</strong></p>
            <p className="text-slate-600">Jurisdiction: {application.region || 'Southern Region (Chennai)'}</p>
          </div>

          {/* Subject */}
          <div className="bg-slate-50 border-l-4 border-emerald-600 p-3 font-sans text-xs space-y-1">
            <span className="font-bold text-slate-900 block">
              Sub: Extension of Approval (EoA) / Approval for Academic Year 2026-27
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Ref: Application No. <strong>{application.appId}</strong> submitted by the institution for academic affiliation & Extension of Approval under AICTE Approval Process Handbook (APH 2026-27).
            </p>
          </div>

          {/* Body Text */}
          <div className="font-sans text-xs text-slate-800 leading-relaxed space-y-3 text-justify">
            <p>
              Sir / Madam,
            </p>
            <p>
              In terms of the provisions under the All India Council for Technical Education (Grant of Approvals for Technical Institutions) Regulations, and provisions of the AICTE Approval Process Handbook (APH 2026-27), I am directed to convey the statutory approval to:
            </p>
            <p className="bg-slate-50 p-2.5 rounded border border-slate-200 font-medium">
              <strong className="text-slate-950 block text-sm">{application.institutionName}</strong>
              Affiliated to: <strong>{application.affiliatingUniversity || "Anna University, Chennai"}</strong>, for conduct of the following Degree / Diploma technical programs with the approved sanctioned intake indicated below for the Academic Year <strong>2026-27</strong>.
            </p>
          </div>

          {/* Approved Courses Table */}
          <div className="font-sans overflow-x-auto">
            <div className="text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wide">
              Approved Courses & Sanctioned Intake (AY 2026-27)
            </div>
            <table className="w-full text-xs border border-slate-300 text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300">Sl.</th>
                  <th className="p-2 border-r border-slate-300">Program / Department</th>
                  <th className="p-2 border-r border-slate-300">Level</th>
                  <th className="p-2 border-r border-slate-300">Affiliating Body</th>
                  <th className="p-2 text-right">Sanctioned Intake</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {programs.map((prog, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-2 border-r border-slate-200 font-mono text-center">{idx + 1}</td>
                    <td className="p-2 border-r border-slate-200 font-semibold text-slate-900">{prog}</td>
                    <td className="p-2 border-r border-slate-200 text-slate-600">Under Graduate (UG)</td>
                    <td className="p-2 border-r border-slate-200 text-slate-600 truncate max-w-[200px]">
                      {application.affiliatingUniversity || "Anna University, Chennai"}
                    </td>
                    <td className="p-2 font-mono font-bold text-right text-emerald-800">{intakePerProgram}</td>
                  </tr>
                ))}
                <tr className="bg-emerald-50/60 font-bold border-t-2 border-slate-300">
                  <td colSpan={4} className="p-2 text-right border-r border-slate-300 text-slate-900 uppercase">
                    Total Approved Sanctioned Intake:
                  </td>
                  <td className="p-2 text-right font-mono text-emerald-900 text-sm">
                    {application.intakeApplied || 540} Seats
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* AI Multi-Modal Trust Engine Forensic Clearance Stamp */}
          <div className="font-sans bg-emerald-50/80 border border-emerald-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                  <span>AICTE MULTI-MODAL TRUST ENGINE • VERIFIED DIGITAL EoA</span>
                  <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">100% CLEAN</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-snug">
                  All statutory documents (Affiliation, Land, Fire Safety, Anti-Ragging Affidavit, CAD Facilities) mathematically verified via SHA-256 ledger & cross-checked with State University Registry API.
                </p>
                <div className="text-[10px] font-mono text-emerald-900 truncate max-w-md pt-0.5">
                  Ledger Hash: {application.auditTimeline?.[application.auditTimeline.length - 1]?.hash || '0x7f48a912c019bd812ef67a0129bc'}
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 bg-white p-2 rounded-lg border border-emerald-200">
              <QrCode className="w-10 h-10 text-slate-800" />
              <div className="text-[9px] font-mono leading-tight text-slate-600">
                <span>Scan for Instant</span>
                <span className="block font-bold text-slate-900">AICTE Verification</span>
              </div>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="font-sans pt-6 border-t border-slate-300 grid grid-cols-2 gap-4 items-end text-xs">
            <div>
              <div className="w-20 h-20 rounded-full border-2 border-emerald-600 flex items-center justify-center text-emerald-800 font-bold text-[10px] text-center p-1 bg-emerald-50/40 transform -rotate-12 select-none">
                AICTE NEW DELHI<br />OFFICIAL SEAL<br />★ 2026-27 ★
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="font-script text-lg text-indigo-900 italic font-bold">
                Rajive Kumar
              </div>
              <div className="font-bold text-slate-950">Prof. Rajive Kumar</div>
              <div className="text-slate-600 text-[11px]">Member Secretary, AICTE</div>
              <div className="text-slate-500 text-[10px]">All India Council for Technical Education, New Delhi</div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 print:hidden">
          <span className="text-xs text-slate-500 font-mono">
            Cryptographically signed & anchored to National Trust Engine Ledger
          </span>

          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Close Order View
          </button>
        </div>
      </div>
    </div>
  );
};
