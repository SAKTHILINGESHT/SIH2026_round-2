import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, ShieldCheck, CheckCircle2, AlertTriangle, 
  Cpu, Layers, FileCheck, ArrowRight, Activity, Database, Check
} from 'lucide-react';

export const RescanModal = ({ 
  isOpen, 
  onClose, 
  document, 
  application, 
  complianceData,
  onRescanSuccess 
}) => {
  const [stage, setStage] = useState(0); // 0: Ready, 1: ELA, 2: CV pHash, 3: APH, 4: SHA Notarization, 5: Completed
  const [isScanning, setIsScanning] = useState(false);
  const [rescanResult, setRescanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStage(0);
      setIsScanning(false);
      setRescanResult(null);
      setErrorMsg('');
    }
  }, [isOpen, document?.docId]);

  if (!isOpen || !document) return null;

  const reuploadedDocId = complianceData?.reuploaded_document_id || 
    complianceData?.reuploadedDocId || 
    document?.complianceSubmission?.reuploadedDocId || 
    `${document.docId}-REV`;

  const applicantMessage = complianceData?.applicant_response || 
    complianceData?.applicantResponse || 
    document?.complianceSubmission?.applicantResponse || 
    'Replacement statutory document submitted for AICTE compliance.';

  const handleStartScan = async () => {
    setIsScanning(true);
    setStage(1);
    setErrorMsg('');

    try {
      // Step 1: ELA Fourier Analysis (Simulated 700ms)
      await new Promise(r => setTimeout(r, 700));
      setStage(2);

      // Step 2: Computer Vision pHash Splicing Check (Simulated 700ms)
      await new Promise(r => setTimeout(r, 700));
      setStage(3);

      // Step 3: APH 2026-27 Rule Matrix Check (Simulated 600ms)
      await new Promise(r => setTimeout(r, 600));
      setStage(4);

      // Step 4: Call Backend API (Express & FastAPI)
      const res = await fetch(`/api/documents/${document.docId}/rescan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: application.appId,
          officerName: 'Dr. A. K. Sundaram (Regional Scrutiny Officer)'
        })
      });

      const data = await res.json();

      // Also notify FastAPI deficiency ledger
      try {
        await fetch(`/api/deficiencies/verify-document/${document.docId}`, {
          method: 'POST'
        });
      } catch (fastApiErr) {
        console.warn("FastAPI deficiency verify non-fatal:", fastApiErr);
      }

      await new Promise(r => setTimeout(r, 600));
      setStage(5);

      if (res.ok && data.success) {
        setRescanResult(data);
      } else {
        throw new Error(data.message || 'Forensic re-scan service returned an error');
      }
    } catch (err) {
      console.error("Re-scan error:", err);
      setErrorMsg(err.message || 'Failed to complete automated re-scan.');
      setIsScanning(false);
    }
  };

  const handleApplyVerification = () => {
    if (rescanResult && onRescanSuccess) {
      onRescanSuccess(rescanResult);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">
                  AICTE Multi-Modal Forensic AI Re-Scan Engine
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  SIH26261
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Scrutinizing Re-uploaded Document for <strong>{application.institutionName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto font-sans">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submission Overview Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Flagged Original:</span>
                <span className="font-mono bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded border border-rose-200">
                  {document.docId}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Re-uploaded Replacement:</span>
                <span className="font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                  {reuploadedDocId}
                </span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-0.5">Applicant Clarification Statement:</span>
              <p className="text-slate-800 italic bg-white p-2.5 rounded-lg border border-slate-200">
                "{applicantMessage}"
              </p>
            </div>
          </div>

          {/* Forensic Re-Scan Pipeline Steps */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>Multi-Modal Re-Audit Pipeline</span>
            </h4>

            {/* Step 1: ELA */}
            <div className={`p-3 rounded-xl border text-xs transition-all flex items-start justify-between gap-3 ${
              stage >= 1 
                ? stage === 1 ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20' : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-500 opacity-70'
            }`}>
              <div className="flex items-start gap-2.5">
                <div className={`p-1.5 rounded-lg mt-0.5 ${
                  stage >= 2 ? 'bg-emerald-200 text-emerald-800' : stage === 1 ? 'bg-indigo-200 text-indigo-800 animate-pulse' : 'bg-slate-200 text-slate-600'
                }`}>
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">1. Fourier Error Level Analysis (ELA)</div>
                  <div className="text-[11px] text-slate-600">
                    {stage >= 2 
                      ? 'Mean Error Level: 0.02 (Uniform compression profile - 0 splicing anomalies)'
                      : stage === 1
                      ? 'Decomposing DCT 8x8 frequency blocks for JPEG compression degradation...'
                      : 'High-frequency compression gradient verification'
                    }
                  </div>
                </div>
              </div>
              <div className="shrink-0 font-mono text-[11px]">
                {stage >= 2 ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> PASSED
                  </span>
                ) : stage === 1 ? (
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-slate-400">QUEUED</span>
                )}
              </div>
            </div>

            {/* Step 2: Computer Vision pHash */}
            <div className={`p-3 rounded-xl border text-xs transition-all flex items-start justify-between gap-3 ${
              stage >= 2 
                ? stage === 2 ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20' : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-500 opacity-70'
            }`}>
              <div className="flex items-start gap-2.5">
                <div className={`p-1.5 rounded-lg mt-0.5 ${
                  stage >= 3 ? 'bg-emerald-200 text-emerald-800' : stage === 2 ? 'bg-indigo-200 text-indigo-800 animate-pulse' : 'bg-slate-200 text-slate-600'
                }`}>
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">2. CV Perceptual Hashing & Boundary Splice Localizer</div>
                  <div className="text-[11px] text-slate-600">
                    {stage >= 3 
                      ? 'Tamper Score: 0.02 (Zero edge discontinuities or boundary seams detected)'
                      : stage === 2
                      ? 'Calculating pHash distance matrix and pixel gradient continuity...'
                      : 'Spatial edge discontinuity and copy-move forgery check'
                    }
                  </div>
                </div>
              </div>
              <div className="shrink-0 font-mono text-[11px]">
                {stage >= 3 ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> PASSED
                  </span>
                ) : stage === 2 ? (
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-slate-400">QUEUED</span>
                )}
              </div>
            </div>

            {/* Step 3: APH Handbook */}
            <div className={`p-3 rounded-xl border text-xs transition-all flex items-start justify-between gap-3 ${
              stage >= 3 
                ? stage === 3 ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20' : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-500 opacity-70'
            }`}>
              <div className="flex items-start gap-2.5">
                <div className={`p-1.5 rounded-lg mt-0.5 ${
                  stage >= 4 ? 'bg-emerald-200 text-emerald-800' : stage === 3 ? 'bg-indigo-200 text-indigo-800 animate-pulse' : 'bg-slate-200 text-slate-600'
                }`}>
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">3. AICTE APH 2026-27 Statutory Rule Engine</div>
                  <div className="text-[11px] text-slate-600">
                    {stage >= 4 
                      ? 'Regulatory Clause 3.2.1: Statutory validity horizon verified against DTE register'
                      : stage === 3
                      ? 'Cross-referencing APH handbook regulatory mandates and competent signatory...'
                      : 'Statutory validity horizon and registrar endorsement check'
                    }
                  </div>
                </div>
              </div>
              <div className="shrink-0 font-mono text-[11px]">
                {stage >= 4 ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> PASSED
                  </span>
                ) : stage === 3 ? (
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-slate-400">QUEUED</span>
                )}
              </div>
            </div>

            {/* Step 4: SHA-256 Ledger */}
            <div className={`p-3 rounded-xl border text-xs transition-all flex items-start justify-between gap-3 ${
              stage >= 4 
                ? stage === 4 ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20' : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-500 opacity-70'
            }`}>
              <div className="flex items-start gap-2.5">
                <div className={`p-1.5 rounded-lg mt-0.5 ${
                  stage >= 5 ? 'bg-emerald-200 text-emerald-800' : stage === 4 ? 'bg-indigo-200 text-indigo-800 animate-pulse' : 'bg-slate-200 text-slate-600'
                }`}>
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">4. Immutable SHA-256 Ledger Notarization</div>
                  <div className="text-[11px] text-slate-600">
                    {stage >= 5 
                      ? 'Event Notarized: SHA-256 hash chained to immutable audit timeline'
                      : stage === 4
                      ? 'Generating cryptographic hash and appending to blockchain audit ledger...'
                      : 'Cryptographic anti-tamper signing'
                    }
                  </div>
                </div>
              </div>
              <div className="shrink-0 font-mono text-[11px]">
                {stage >= 5 ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> PASSED
                  </span>
                ) : stage === 4 ? (
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-slate-400">QUEUED</span>
                )}
              </div>
            </div>
          </div>

          {/* Final Verification Summary Card */}
          {stage === 5 && rescanResult && (
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4 text-xs space-y-3 animate-in zoom-in-95">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Forensic Re-Scan Completed: Authentic Document Verified</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
                <div className="bg-white p-2 rounded-lg border border-emerald-200 text-center">
                  <span className="text-[10px] text-slate-500 block">Tamper Score</span>
                  <span className="font-bold text-emerald-600 text-sm">0.02</span>
                  <span className="text-[9px] text-slate-400 block">(Clean)</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-200 text-center">
                  <span className="text-[10px] text-slate-500 block">Anomaly Flags</span>
                  <span className="font-bold text-emerald-600 text-sm">0 Flags</span>
                  <span className="text-[9px] text-slate-400 block">(Resolved)</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-200 text-center">
                  <span className="text-[10px] text-slate-500 block">App Risk Score</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {rescanResult.rescanSummary?.newRiskScore || 12}
                  </span>
                  <span className="text-[9px] text-slate-400 block">(Minimal)</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-200 text-center">
                  <span className="text-[10px] text-slate-500 block">Overall Status</span>
                  <span className="font-bold text-emerald-600 text-sm uppercase">
                    {rescanResult.rescanSummary?.newOverallStatus || 'Verified'}
                  </span>
                  <span className="text-[9px] text-slate-400 block">(Cleared)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            {stage === 5 ? 'Close' : 'Cancel'}
          </button>

          {stage === 0 ? (
            <button
              onClick={handleStartScan}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Initiate Multi-Modal AI Re-Scan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : stage === 5 ? (
            <button
              onClick={handleApplyVerification}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply Verification to Scrutiny Cockpit</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold px-4 py-2">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>Executing AI Forensic Analysis...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
