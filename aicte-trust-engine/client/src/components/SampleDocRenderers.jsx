import React from 'react';
import { 
  AlertTriangle, CheckCircle, ShieldAlert, Cpu, Award, Building, 
  FileCheck, Lock, Unlock, Copy, AlertOctagon, ShieldCheck, Clock
} from 'lucide-react';

/**
 * Realistic Document Renderers for AICTE Applications
 * Renders high-fidelity official documents (NOC, Computer Lab Photo, Land Deed, Affiliation, Affidavit)
 * and supports overlaid CSS bounding boxes, ELA heatmap, and PII Redaction security strips.
 */

export const DocumentCanvas = ({ doc, application, activeMode, showBoundingBoxes, isPiiRedacted }) => {
  if (!doc) return null;

  if (doc.docId === 'DOC-2026-881' || doc.type?.includes('NOC')) {
    return <NocDocument doc={doc} application={application} activeMode={activeMode} showBoundingBoxes={showBoundingBoxes} isPiiRedacted={isPiiRedacted} />;
  }

  if (doc.docId === 'DOC-2026-883' || doc.type?.includes('Infrastructure') || doc.type?.includes('Computer')) {
    return <ComputerLabDocument doc={doc} application={application} activeMode={activeMode} showBoundingBoxes={showBoundingBoxes} isPiiRedacted={isPiiRedacted} />;
  }

  if (doc.docId === 'DOC-2026-884' || doc.type?.includes('Land')) {
    return <LandDeedDocument doc={doc} application={application} activeMode={activeMode} showBoundingBoxes={showBoundingBoxes} isPiiRedacted={isPiiRedacted} />;
  }

  if (doc.docId === 'DOC-2026-885' || doc.type?.includes('Affiliation')) {
    return <AffiliationDocument doc={doc} application={application} activeMode={activeMode} showBoundingBoxes={showBoundingBoxes} isPiiRedacted={isPiiRedacted} />;
  }

  if (doc.docId === 'DOC-2026-886' || doc.type?.includes('Affidavit')) {
    return <AffidavitDocument doc={doc} application={application} activeMode={activeMode} showBoundingBoxes={showBoundingBoxes} isPiiRedacted={isPiiRedacted} />;
  }

  return <GenericScannedDocument doc={doc} application={application} activeMode={activeMode} showBoundingBoxes={showBoundingBoxes} isPiiRedacted={isPiiRedacted} />;
};

/* 1. State DTE NOC with Tampered Expiry Date & PII Redaction */
const NocDocument = ({ doc, application, activeMode, showBoundingBoxes, isPiiRedacted }) => {
  const instName = application?.institutionName || doc?.extractedData?.institutionName || doc?.institutionName || "AICTE Approved Institution";
  const state = application?.state || (application?.region?.includes('Karnataka') ? 'Karnataka' : application?.region?.includes('Maharashtra') ? 'Maharashtra' : 'Tamil Nadu');
  const address = application?.address || (instName.includes('R.M.K') ? "RSM Nagar, Kavaraipettai, Gummidipoondi Taluk, Tiruvallur - 601 206" : `${instName} Campus, Technical Complex`);
  const permId = application?.permanentId || doc?.extractedData?.permanentId || (application?.appId ? `1-${application.appId.replace(/\D/g, '').padEnd(9, '0')}` : "1-932148123");
  const docRef = doc?.extractedData?.docNumber || `Ref. No. 49210/H1/${doc?.status === 'verified' ? '2026' : '2021'}`;
  return (
    <div className="relative w-full aspect-[1/1.38] bg-white border border-slate-300 shadow-md p-6 sm:p-10 font-serif text-slate-800 select-none overflow-hidden">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <div className="text-8xl font-black text-slate-900 rotate-[-35deg] tracking-widest uppercase">
          AICTE VERIFICATION
        </div>
      </div>

      {/* Official State Emblem & Header */}
      <div className="text-center border-b-2 border-slate-800 pb-4 mb-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-amber-800 bg-amber-50 mb-2">
          <Building className="w-6 h-6 text-amber-900" />
        </div>
        <p className="text-xs font-sans tracking-widest text-slate-600 uppercase font-semibold">
          Government of {state} • Higher Education Department
        </p>
        <h2 className="text-base sm:text-lg font-bold text-slate-950 uppercase tracking-wide mt-1">
          Directorate of Technical Education (DTE)
        </h2>
        <p className="text-xs text-slate-500 font-sans">Guindy, Chennai - 600 025 | Reference: {docRef}</p>
      </div>

      {/* Document Title */}
      <div className="text-center my-3">
        <span className="inline-block px-4 py-1 text-xs font-sans font-bold uppercase bg-slate-100 text-slate-800 border border-slate-300 tracking-wider">
          NO OBJECTION CERTIFICATE (N.O.C.)
        </span>
        <p className="text-xs text-slate-500 font-sans mt-0.5">
          For Extension of Approval (EoA) under AICTE Act 1987
        </p>
      </div>

      {/* Body Content */}
      <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-justify font-serif">
        <p>
          This is to certify that the State Government of {state} has <strong>NO OBJECTION</strong> for the grant of Extension of Approval (EoA) to:
        </p>
        <div className="bg-slate-50 border-l-4 border-slate-700 p-2.5 my-1.5 font-sans text-xs">
          <div className="font-bold text-slate-900">M/s. {instName}</div>
          <div className="text-slate-600">Campus: {address}</div>
          <div className="text-slate-600">DTE Permanent Registration ID: <strong>DTE/{state.slice(0, 2).toUpperCase()}/NOC/{permId}</strong></div>
          
          {/* Trust PAN - Protected PII */}
          <div className="flex items-center gap-2 mt-1 pt-1 border-t border-slate-200">
            <span className="text-slate-500">Trust PAN Card:</span>
            {isPiiRedacted ? (
              <span className="inline-flex items-center gap-1 bg-slate-950 text-slate-200 px-1.5 py-0.2 rounded font-mono text-[10px]" title="Confidentiality Safeguard: PII Masked">
                <Lock className="w-2.5 h-2.5 text-amber-400" />
                <span>•••••8492K [PII REDACTED]</span>
              </span>
            ) : (
              <span className="font-mono bg-amber-100 border border-amber-300 px-1 rounded text-amber-950 text-[10px] font-bold">
                AAACT8492K (UNMASKED)
              </span>
            )}
          </div>
        </div>

        <p>
          The NOC is granted subject to strict adherence to the minimum student-faculty ratio, physical land requirements, and compliance with the AICTE Approval Process Handbook (APH).
        </p>

        {/* Date Section - WHERE TAMPERING OCCURRED */}
        <div className="pt-2.5 border-t border-slate-200 grid grid-cols-2 gap-4 font-sans text-xs">
          <div>
            <span className="text-slate-500 block">Date of Original Issuance:</span>
            <span className="font-semibold text-slate-800">15th July 2021</span>
          </div>

          {/* Tampered Region */}
          <div className="relative">
            <span className="text-slate-500 block">Statutory Validity Horizon:</span>
            <div className={`inline-block mt-0.5 px-2 py-0.5 font-mono font-bold tracking-wider ${
              doc.status === 'verified'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                : 'bg-amber-50/70 border border-amber-200/50 text-slate-900'
            }`}>
              VALID UPTO: 2028-12-31
            </div>

            {/* Overlaid CSS Bounding Box for Tampering Anomaly or Re-scan Verified */}
            {doc.status === 'verified' ? (
              showBoundingBoxes && (
                <div 
                  className="absolute -inset-1 border-2 border-emerald-500 bg-emerald-500/15 rounded z-20 pointer-events-auto"
                  title="AI Re-Scan Verified: Clean authentic date profile (0 splicing detected)"
                >
                  <div className="absolute -top-6 -right-2 bg-emerald-600 text-white text-[10px] font-sans font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    AI Re-Scan Verified [Clean ELA 0.02]
                  </div>
                </div>
              )
            ) : (
              showBoundingBoxes && (
                <div 
                  className="absolute -inset-1 border-2 border-dashed border-rose-600 bg-rose-500/15 rounded animate-pulse-subtle z-20 pointer-events-auto"
                  title="AI Anomaly: ELA Compression mismatch detected in date box"
                >
                  <div className="absolute -top-6 -right-2 bg-rose-600 text-white text-[10px] font-sans font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    ELA Splicing [120, 45, 180, 60]
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Official Signatory and Stamp with PII Protection */}
      <div className="mt-6 pt-4 border-t border-slate-300 flex justify-between items-end">
        <div className="text-left font-sans text-xs">
          <div className="w-16 h-16 rounded-full border-2 border-slate-400 border-dashed flex items-center justify-center text-center p-1 text-[8px] text-slate-400 font-bold uppercase rotate-[-12deg]">
            Govt. of Tamil Nadu<br />Directorate Seal
          </div>
          <span className="text-slate-400 block mt-1 text-[10px]">Ref Code: #TN-DTE-881</span>
        </div>

        <div className="text-right font-sans text-xs space-y-0.5">
          <div className="font-serif italic text-base text-slate-700 font-bold">
            K. R. Ramanathan
          </div>
          <div className="font-bold text-slate-900">Dr. K. R. Ramanathan, Ph.D.</div>
          <div className="text-slate-500 text-[11px]">Director of Technical Education</div>

          {/* Sensitive Signatory PII (Aadhaar & Direct Phone) */}
          <div className="pt-1.5 flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-[10px]">
              <span className="text-slate-400">Signatory Aadhaar:</span>
              {isPiiRedacted ? (
                <span className="inline-flex items-center gap-1 bg-slate-950 text-slate-200 px-1.5 py-0.2 rounded font-mono text-[9px]">
                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                  <span>•••• •••• 8831</span>
                </span>
              ) : (
                <span className="font-mono bg-amber-100 border border-amber-300 px-1 rounded text-amber-950 text-[9px] font-bold">
                  7489 1204 8831
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-[10px]">
              <span className="text-slate-400">Official Mobile:</span>
              {isPiiRedacted ? (
                <span className="inline-flex items-center gap-1 bg-slate-950 text-slate-200 px-1.5 py-0.2 rounded font-mono text-[9px]">
                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                  <span>+91 98••• ••456</span>
                </span>
              ) : (
                <span className="font-mono bg-amber-100 border border-amber-300 px-1 rounded text-amber-950 text-[9px] font-bold">
                  +91 98401 23456
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ELA Heatmap Layer */}
      {activeMode === 'ela' && (
        <div className="absolute inset-0 bg-slate-950/75 mix-blend-multiply z-10 flex flex-col items-center justify-center p-4">
          <div className="absolute inset-0 ela-heatmap-overlay pointer-events-none" />
          <div className="relative z-20 bg-slate-900/90 border border-rose-500 text-white p-4 rounded-lg max-w-sm text-center shadow-xl">
            <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-2 animate-bounce" />
            <h4 className="font-sans font-bold text-sm text-rose-400 uppercase tracking-wider">
              Forensic ELA Analysis Active
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              Error Level Analysis reveals pixel compression discrepancy (maxDiff: 42) localized around the expiry year <strong>"2028"</strong>.
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-mono bg-slate-800 py-1.5 px-3 rounded text-rose-300">
              <span>Mean Variance: 0.28</span>
              <span>•</span>
              <span>Tamper Score: 0.89</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* 2. Computer Lab Infrastructure Photo (YOLOv8 + Anti-Duplication Alert) */
const ComputerLabDocument = ({ doc, application, activeMode, showBoundingBoxes }) => {
  const isDuplicateCollision = doc.cryptographicFingerprint?.collisionDetected;
  const instName = application?.institutionName || doc?.extractedData?.institutionName || "AICTE Approved Institution";
  const totalWorkstations = application?.workstationsCount || application?.infrastructure?.workstationsCount || 60;

  return (
    <div className="relative w-full aspect-[16/10] bg-slate-900 rounded-md overflow-hidden border border-slate-700 shadow-md">
      {/* Background Simulated Lab Photo */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `radial-gradient(ellipse at center, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.9) 100%), 
            repeating-linear-gradient(45deg, #1e293b 0, #1e293b 10px, #0f172a 10px, #0f172a 20px)`
        }}
      >
        {/* Lab Grid Simulation with Desks and Workstations */}
        <div className="absolute inset-0 p-8 grid grid-cols-6 grid-rows-4 gap-3 opacity-90">
          {Array.from({ length: 24 }).map((_, i) => (
            <div 
              key={i} 
              className="relative rounded border border-emerald-500/70 bg-emerald-950/40 flex flex-col items-center justify-center p-1"
            >
              <Cpu className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-[9px] font-mono text-emerald-300 font-semibold">PC-{String(i + 1).padStart(2, '0')}</span>
              {showBoundingBoxes && (
                <div className="absolute inset-0 border border-emerald-400/80 rounded" />
              )}
            </div>
          ))}

          {/* Empty Desks (Deficit of 36 units) */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div 
              key={`empty-${i}`} 
              className="relative rounded border border-dashed border-rose-500/50 bg-rose-950/20 flex flex-col items-center justify-center p-1"
            >
              <span className="text-[8px] font-mono text-rose-400 italic">Empty Desk</span>
              {showBoundingBoxes && (
                <div className="absolute inset-0 border border-rose-500/60 rounded" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Top Metadata Bar */}
      <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-sm border border-slate-700 px-3 py-1.5 rounded text-[11px] font-mono text-slate-300 flex items-center gap-3">
        <span className="text-amber-400 font-bold">{instName} • Computer Center</span>
        <span>•</span>
        <span>SHA-256: {doc.cryptographicFingerprint?.sha256?.slice(0, 16)}...</span>
      </div>

      {/* Feature 2: Anti-Duplication Ledger Collision Banner (Top Right) */}
      {isDuplicateCollision && (
        <div className="absolute top-3 right-3 bg-rose-600 text-white border border-rose-400 px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 shadow-xl animate-pulse">
          <AlertOctagon className="w-4 h-4" />
          <span>100% SHA-256 HASH COLLISION (RECYCLED PHOTO)</span>
        </div>
      )}

      {/* YOLOv8 Detection Overlay Banner */}
      {showBoundingBoxes && (
        doc.status === 'verified' ? (
          <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 border-2 border-emerald-500 rounded p-3 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Cross-Modal CV: Workstations Verified</span>
                  <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">COMPLIANT</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Certified replacement layout authenticated. <strong>{totalWorkstations} operational terminals</strong> verified under AICTE APH norms for {instName}.
                </div>
              </div>
            </div>
            <div className="text-right font-mono text-xs text-emerald-400">
              <div>APH Threshold: {totalWorkstations} PCs</div>
              <div className="text-white font-bold">Detected: {totalWorkstations}/{totalWorkstations} (100%)</div>
            </div>
          </div>
        ) : (
          <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 border-2 border-rose-500 rounded p-3 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-500/20 text-rose-400 rounded">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Cross-Modal CV: YOLOv8 Object Count Deficit</span>
                  <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded font-mono">NON-COMPLIANT</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Application claims <strong>{totalWorkstations} operational PCs</strong>. Visual CV counted only <strong>24 verified terminals</strong> (Deficit: {Math.max(0, totalWorkstations - 24)} PCs).
                </div>
              </div>
            </div>
            <div className="text-right font-mono text-xs text-rose-400">
              <div>APH Threshold: {totalWorkstations} PCs</div>
              <div className="text-white font-bold">Detected: 24/{totalWorkstations} ({Math.round(24/totalWorkstations*100)}%)</div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

/* 3. Land Deed Document (Verified Genuine with PII) */
const LandDeedDocument = ({ doc, application, isPiiRedacted }) => {
  const instName = application?.institutionName || doc?.extractedData?.institutionName || "AICTE Approved Institution";
  const state = application?.state || (application?.region?.includes('Karnataka') ? 'Karnataka' : application?.region?.includes('Maharashtra') ? 'Maharashtra' : 'Tamil Nadu');
  const acres = application?.landAcres || application?.infrastructure?.landAcres || 8.25;
  const trustName = application?.trustName || `${instName.replace(/(College|Institute|Academy|of Engineering|and Technology)/gi, '').trim()} Educational Trust`;
  const address = application?.address || (instName.includes('R.M.K') ? "Survey No. 42/1, Kavaraipettai, Tiruvallur" : `Survey No. 42/1, ${instName} Campus`);

  return (
    <div className="relative w-full aspect-[1/1.38] bg-amber-50/50 border border-amber-200 shadow-md p-6 sm:p-10 font-serif text-slate-800 select-none overflow-hidden">
      <div className="text-center border-b-2 border-amber-900 pb-3 mb-4">
        <div className="text-xs font-mono uppercase tracking-widest text-amber-800 font-bold">
          Government of {state} • Registration & Stamps Department
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-950 mt-1 uppercase">
          Certificate of Registered Lease & Land Title
        </h3>
        <p className="text-xs text-slate-600 font-sans">Office of the Sub-Registrar • Deed No. REG-{state.slice(0, 2).toUpperCase()}-2015-9921</p>
      </div>

      <div className="space-y-3 text-xs sm:text-sm font-serif leading-relaxed text-justify">
        <p>
          This is to verify that the parcel of land situated at <strong>{address}</strong> comprising 
          an area of <strong>{acres} Contiguous Acres</strong> is legally leased / titled to:
        </p>
        <div className="bg-white border-l-4 border-emerald-600 p-2.5 font-sans text-xs shadow-sm space-y-1">
          <div className="font-bold text-slate-900">{trustName.toUpperCase()}</div>
          <div className="text-slate-600">Designated Beneficiary: <strong>{instName}</strong></div>
          <div className="text-emerald-700 font-semibold">Lease Tenure: 99 Years (Unexpired: 88 Years Remaining)</div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[11px]">
            <span className="text-slate-500">Managing Trustee Aadhaar:</span>
            {isPiiRedacted ? (
              <span className="inline-flex items-center gap-1 bg-slate-950 text-slate-200 px-1.5 py-0.2 rounded font-mono text-[9px]">
                <Lock className="w-2.5 h-2.5 text-amber-400" />
                <span>•••• •••• 9912 [PII REDACTED]</span>
              </span>
            ) : (
              <span className="font-mono bg-amber-100 border border-amber-300 px-1 rounded text-amber-950 text-[9px] font-bold">
                9102 4491 9912
              </span>
            )}
          </div>
        </div>
        <p>
          The land is classified exclusively for Educational / Institutional Zone with clear title and zero registered encumbrances.
        </p>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-center font-sans text-xs">
        <div className="flex items-center gap-2 text-emerald-700 font-bold">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>DigiLocker Cryptographic Seal: VERIFIED GENUINE</span>
        </div>
        <div className="text-right text-slate-500">
          <div>Sub-Registrar Authority</div>
          <div className="text-[10px] font-mono">SHA-256: 7b2ee4550016...</div>
        </div>
      </div>
    </div>
  );
};

/* 4. Affiliation Order Document (Dynamically matching Applicant Institution & University) */
const AffiliationDocument = ({ doc, application, showBoundingBoxes }) => {
  const instName = application?.institutionName || doc?.extractedData?.institutionName || doc?.institutionName || "AICTE Approved Institution";
  const affiliatingUniv = application?.affiliatingUniversity || doc?.extractedData?.affiliatingUniversity || "Anna University, Chennai";
  const state = application?.state || (application?.region?.includes('Karnataka') ? 'Karnataka' : application?.region?.includes('Maharashtra') ? 'Maharashtra' : 'Tamil Nadu');
  const address = application?.address || (instName.includes('R.M.K') ? 'RSM Nagar, Kavaraipettai, Gummidipoondi Taluk, Tiruvallur - 601 206' : `${instName} Campus, Academic Enclave`);
  const intake = application?.intakeApplied || doc?.extractedData?.sanctionedIntake || 540;

  // Generate university-specific prefix
  const univCode = affiliatingUniv.includes('Anna') ? 'AU' 
    : affiliatingUniv.includes('Visvesvaraya') || affiliatingUniv.includes('VTU') ? 'VTU'
    : affiliatingUniv.includes('Mumbai') ? 'MU'
    : affiliatingUniv.includes('Jawaharlal') || affiliatingUniv.includes('JNTU') ? 'JNTU'
    : 'REG';

  const isVerifiedDoc = doc.status === 'verified' || 
    application?.overallStatus === 'approved' || 
    application?.overallStatus === 'verified';

  const docNum = doc?.extractedData?.docNumber || 
    (isVerifiedDoc 
      ? `${univCode}/ACA-AFFIL/2026/4812-REV` 
      : `${univCode}/ACA-AFFIL/2024/982`);

  let univAddress = "Sardar Patel Road, Guindy, Chennai - 600 025, Tamil Nadu";
  if (affiliatingUniv.includes('VTU') || affiliatingUniv.includes('Visvesvaraya')) {
    univAddress = "Jnana Sangama, Belagavi - 590 018, Karnataka";
  } else if (affiliatingUniv.includes('Mumbai') || affiliatingUniv.includes('Maharashtra')) {
    univAddress = "Kalina, Santacruz East, Mumbai - 400 098, Maharashtra";
  } else if (affiliatingUniv.includes('JNTU') || affiliatingUniv.includes('Hyderabad')) {
    univAddress = "Kukatpally, Hyderabad - 500 085, Telangana";
  } else if (affiliatingUniv.includes('AKTU') || affiliatingUniv.includes('Kalam')) {
    univAddress = "Sec 11, Jankipuram Vistar, Lucknow - 226 031, Uttar Pradesh";
  } else if (affiliatingUniv.includes('Anna')) {
    univAddress = "Sardar Patel Road, Guindy, Chennai - 600 025, Tamil Nadu";
  } else {
    univAddress = `${affiliatingUniv} Main Administrative Complex, State University Registry`;
  }

  return (
    <div className="relative w-full aspect-[1/1.38] bg-white border border-slate-300 shadow-md p-6 sm:p-10 font-serif text-slate-800 select-none overflow-hidden">
      {/* Official University Letterhead */}
      <div className="text-center border-b border-slate-700 pb-3 mb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-indigo-900 bg-indigo-50 mb-1.5">
          <Award className="w-6 h-6 text-indigo-900" />
        </div>
        <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
          {affiliatingUniv}
        </h3>
        <p className="text-xs text-slate-500 font-sans">{univAddress}</p>
        <div className="mt-2 text-xs font-bold text-slate-800 font-sans tracking-wide">
          ANNUAL STATUTORY AFFILIATION NOTIFICATION (AY 2026-27)
        </div>
        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
          Order Ref: {docNum}
        </div>
      </div>

      <div className="space-y-3 text-xs sm:text-sm text-justify font-serif">
        <p>
          In exercise of the statutory powers conferred under the State Universities Act, sanction is hereby accorded for continuation of affiliation to <strong>{instName}</strong> ({address}) for the Academic Year 2026-2027.
        </p>
        <div className="relative bg-slate-50 p-3 border border-slate-200 text-xs font-sans rounded">
          <div className="font-semibold text-slate-800">
            {isVerifiedDoc
              ? `Affiliation Status: Permanent Affiliation Granted (${univCode} Gazette Ref: ${docNum})`
              : `Affiliation Status: Permanent (Provisional validity discrepancy in university registry)`}
          </div>
          <div className="text-slate-600 mt-1 text-[11px]">
            Approved Intake Capacity: <strong>{intake} Students</strong> across approved Engineering & Technology streams.
          </div>
          {isVerifiedDoc ? (
            showBoundingBoxes && (
              <div className="absolute -inset-1 border-2 border-emerald-500 bg-emerald-500/10 rounded flex items-center justify-end pr-2 pointer-events-none">
                <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded shadow font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  AI Re-Scan Verified [Affiliation Order Authentic {affiliatingUniv.split(',')[0]} 2026-27]
                </span>
              </div>
            )
          ) : (doc.status === 'reaudit_in_progress' || application?.overallStatus === 'reaudit_in_progress') ? (
            showBoundingBoxes && (
              <div className="absolute -inset-1 border-2 border-purple-500 bg-purple-500/10 rounded flex items-center justify-end pr-2 pointer-events-none animate-pulse">
                <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded shadow font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 animate-spin text-amber-300" />
                  AI Re-Audit In Progress: Cross-Checking Anna University Registry...
                </span>
              </div>
            )
          ) : (
            showBoundingBoxes && (
              <div className="absolute -inset-1 border-2 border-dashed border-amber-500 bg-amber-500/10 rounded flex items-center justify-end pr-2 pointer-events-none">
                <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.5 rounded shadow font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Discrepancy: University DB records Provisional
                </span>
              </div>
            )
          )}
        </div>
        <p className="text-slate-600 text-[11px] leading-relaxed">
          The affiliation is subject to continuous compliance with AICTE Approval Process Handbook (APH 2026-27) norms, faculty-cadre ratios, and unhindered Expert Visit Committee (EVC) verification.
        </p>
      </div>

      {/* Official Signatory and Seal */}
      <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-end font-sans text-xs">
        <div>
          <div className="w-16 h-16 rounded-full border-2 border-slate-400 border-dashed flex items-center justify-center text-center p-1 text-[8px] text-slate-400 font-bold uppercase rotate-[-8deg]">
            {affiliatingUniv.split(' ')[0]} University<br />Registrar Seal
          </div>
          <span className="text-slate-400 block mt-1 text-[10px]">Registry Token: #{doc?.docId || 'DOC-2026-885'}</span>
        </div>
        <div className="text-right">
          <div className="font-serif italic font-bold text-slate-800 text-sm">Dr. Registrar</div>
          <div className="text-[11px] text-slate-600 font-semibold">Registrar (Academic Affiliation)</div>
          <div className="text-[10px] text-slate-500">{affiliatingUniv}</div>
        </div>
      </div>
    </div>
  );
};

/* 5. Stamp Paper Affidavit */
const AffidavitDocument = ({ doc, application, showBoundingBoxes, isPiiRedacted }) => {
  const instName = application?.institutionName || doc?.extractedData?.institutionName || "AICTE Approved Institution";
  const principalName = application?.principalName || (instName.includes('R.M.K') ? "Dr. K. A. Mohamed Junaid, Ph.D." : "Dr. Principal / Head of Institution");
  const state = application?.state || (application?.region?.includes('Karnataka') ? 'Karnataka' : application?.region?.includes('Maharashtra') ? 'Maharashtra' : 'Tamil Nadu');

  return (
    <div className="relative w-full aspect-[1/1.38] bg-amber-50/70 border border-amber-300 shadow-md p-6 sm:p-10 font-serif text-slate-800 select-none overflow-hidden">
      <div className="border-4 border-amber-800/40 p-4 mb-4 text-center">
        <div className="text-sm font-bold tracking-widest text-amber-900 uppercase">Non-Judicial Stamp Paper • Rs. 100/-</div>
        <div className="text-xs text-slate-600 font-mono">Government of {state} • Serial: STAMP-849201</div>
      </div>

      <div className="space-y-3 text-xs text-justify">
        <div className="font-bold text-center uppercase tracking-wider text-slate-900">
          FORM 1 - STATUTORY AFFIDAVIT UNDER AICTE REGULATIONS 2026
        </div>
        <p>
          I, {principalName}, Principal / Secretary of {instName}, do hereby solemnly affirm and state on oath:
        </p>
        <p>1. That the institution strictly complies with all faculty salary disbursements per 7th CPC norms.</p>
        <p>2. That all uploaded certificates and infrastructure photos represent genuine facilities.</p>
        
        {/* Missing Clauses Callout */}
        <div className="relative p-3 bg-rose-50 border border-rose-300 rounded text-rose-900 text-xs">
          {showBoundingBoxes && (
            <div className="absolute -inset-1 border-2 border-dashed border-rose-600 bg-rose-500/15 rounded flex items-center justify-center">
              <span className="bg-rose-600 text-white text-[10px] font-sans font-bold px-2 py-1 rounded shadow">
                Missing Statutory Clause 4.2.1 (Anti-Ragging) & 4.2.8 (EVC Audit Consent)
              </span>
            </div>
          )}
          <span className="font-mono text-[10px] text-slate-400">[Missing Section 4.2.1 & 4.2.8 Mandatory Clauses]</span>
        </div>

        {/* Deponent Aadhaar PII */}
        <div className="pt-2 text-[11px] font-sans flex items-center gap-2">
          <span className="text-slate-500">Deponent Aadhaar ID:</span>
          {isPiiRedacted ? (
            <span className="inline-flex items-center gap-1 bg-slate-950 text-slate-200 px-1.5 py-0.2 rounded font-mono text-[9px]">
              <Lock className="w-2.5 h-2.5 text-amber-400" />
              <span>•••• •••• 7182 [PII REDACTED]</span>
            </span>
          ) : (
            <span className="font-mono bg-amber-100 border border-amber-300 px-1 rounded text-amber-950 text-[9px] font-bold">
              8492 0184 7182
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/* Fallback Generic Scanned Doc */
const GenericScannedDocument = ({ doc, application, showBoundingBoxes }) => {
  const instName = application?.institutionName || doc?.extractedData?.institutionName || doc?.institutionName || "AICTE Approved Institution";

  return (
    <div className="relative w-full aspect-[1/1.38] bg-white border border-slate-300 shadow-md p-8 font-serif text-slate-800">
      <div className="border-b border-slate-400 pb-3 mb-4 text-center">
        <h3 className="font-bold text-base text-slate-900 uppercase">{doc.type || "Statutory Document"}</h3>
        <p className="text-xs text-slate-500 font-sans">{doc.docId} • {instName}</p>
      </div>
      <div className="text-xs text-slate-700 space-y-2">
        <p>Scanned institutional submission processed by AICTE Multi-Modal Trust Engine for {instName}.</p>
        <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono text-[11px]">
          <div>Document ID: {doc.docId}</div>
          <div>Status: {doc.status}</div>
          <div>Flags Detected: {doc.flags?.length || 0}</div>
        </div>
      </div>
    </div>
  );
};
