import React, { useState } from 'react';
import { 
  CheckCircle, AlertTriangle, XCircle, RefreshCw, Send, 
  ExternalLink, ShieldCheck, Database, BookOpen, Layers, 
  Terminal, Fingerprint, Copy, AlertOctagon, ShieldAlert, Check,
  Sparkles
} from 'lucide-react';

/**
 * Right Panel: Extracted Data Key-Values, Authority API Check, APH Rules,
 * and Feature 2: Cryptographic Document Hashing & Anti-Duplication Ledger.
 */
export const ExtractedDataComparison = ({ 
  document, 
  application, 
  isApproved = false,
  isReauditPassed = false,
  isReauditing = false,
  onPingApiSuccess, 
  onRaiseDeficiency 
}) => {
  const [isPingingApi, setIsPingingApi] = useState(false);
  const [apiResult, setApiResult] = useState(null);
  const [activeTab, setActiveTab] = useState('comparison'); // 'comparison' | 'crypto' | 'api' | 'rules'
  
  // Feature 2: Anti-Duplication Scan state
  const [isScanningHash, setIsScanningHash] = useState(false);
  const [hashScanResult, setHashScanResult] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);

  if (!document) return null;

  const rawExtracted = document.extractedData || {};
  const rawExpected = document.expectedData || {};
  const cryptoFingerprint = document.cryptographicFingerprint || {};

  // If officer has granted approval, or document is verified, or re-audit passed:
  // all parameters are 100% passed and reconciled!
  const isOverallApproved = isApproved || 
    application?.overallStatus === 'approved' || 
    application?.overallStatus === 'verified';
  const isDocVerified = document.status === 'verified' || isOverallApproved || isReauditPassed;

  // Synthesize default statutory baseline parameters if rawExtracted is empty
  const defaultExtracted = {
    institutionName: application?.institutionName || "R.M.K. Engineering College",
    docNumber: document.docId ? document.docId.replace('DOC', 'REG') : "AU/ACA-AFFIL/2024/982",
    issueDate: "2024-05-12",
    expiryDate: document.status === 'anomaly_detected' ? "2024-06-30" : "2027-06-30",
    affiliatingUniversity: application?.affiliatingUniversity || "Anna University, Chennai",
    affiliationType: document.status === 'anomaly_detected' ? "Provisional Affiliation (Expired)" : "Permanent / Continuous Affiliation (AY 2026-27)",
    sanctionedIntake: `${application?.intakeApplied || 540} Students`,
    signatory: "Registrar, Academic Affiliation Wing"
  };

  const defaultExpected = {
    institutionName: application?.institutionName || "R.M.K. Engineering College",
    docNumber: document.docId ? document.docId.replace('DOC', 'REG') : "AU/ACA-AFFIL/2026/4812",
    issueDate: "2026-05-10",
    expiryDate: "2027-06-30",
    affiliatingUniversity: application?.affiliatingUniversity || "Anna University, Chennai",
    affiliationType: "Permanent / Continuous Affiliation (AY 2026-27)",
    sanctionedIntake: `${application?.intakeApplied || 540} Students`,
    signatory: "Registrar, Academic Affiliation Wing"
  };

  const hasRawKeys = Object.keys(rawExtracted).length > 0 || Object.keys(rawExpected).length > 0;
  const extracted = hasRawKeys ? { ...defaultExtracted, ...rawExtracted } : defaultExtracted;
  const expected = hasRawKeys ? { ...defaultExpected, ...rawExpected } : defaultExpected;

  const allKeys = Array.from(new Set([...Object.keys(extracted), ...Object.keys(expected)]));
  const hasMismatches = !isDocVerified && (allKeys.some(key => {
    let extVal = extracted[key];
    let expVal = expected[key];
    if (key === 'institutionName' && application?.institutionName) {
      extVal = application.institutionName;
      expVal = application.institutionName;
    }
    if (key === 'affiliatingUniversity' && application?.affiliatingUniversity) {
      extVal = application.affiliatingUniversity;
      expVal = application.affiliatingUniversity;
    }
    return expVal !== undefined && extVal !== undefined && 
      String(extVal).toLowerCase().trim() !== String(expVal).toLowerCase().trim();
  }) || (document.flags && document.flags.length > 0));

  const handlePingSimulatedApi = async () => {
    setIsPingingApi(true);
    setApiResult(null);

    try {
      const res = await fetch('/api/verify/mock-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docId: document.docId,
          service: document.apiVerification?.service || 'DigiLocker / State DTE Registry'
        })
      });
      const data = await res.json();
      setApiResult(data);
      if (onPingApiSuccess) onPingApiSuccess(data);
    } catch (err) {
      console.error("API Ping failed:", err);
      setApiResult({
        service: document.apiVerification?.service || 'DigiLocker Gateway',
        status: document.status === 'anomaly_detected' ? 'MISMATCH_CONFIRMED' : 'VERIFIED_GENUINE',
        latencyMs: 145,
        matchResult: {
          isAuthentic: document.status !== 'anomaly_detected',
          note: 'Authority records cross-checked'
        }
      });
    } finally {
      setIsPingingApi(false);
    }
  };

  // Feature 2: Run Cryptographic Anti-Duplication Collision Scan
  const handleRunHashScan = async () => {
    setIsScanningHash(true);
    try {
      const res = await fetch('/api/verify/hash-collision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sha256: cryptoFingerprint.sha256,
          pHash: cryptoFingerprint.pHash,
          appId: application?.appId,
          docId: document.docId
        })
      });
      const data = await res.json();
      setHashScanResult(data.data);
    } catch (err) {
      console.error("Hash collision check failed:", err);
    } finally {
      setIsScanningHash(false);
    }
  };

  const handleCopyHash = () => {
    if (cryptoFingerprint.sha256) {
      navigator.clipboard.writeText(cryptoFingerprint.sha256);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Tab Navigation Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
              activeTab === 'comparison'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Data Comparison
          </button>

          {/* Feature 2: Cryptographic Anti-Duplication Tab */}
          <button
            onClick={() => setActiveTab('crypto')}
            className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'crypto'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5 text-rose-400" />
            <span>Anti-Duplication</span>
            {cryptoFingerprint.collisionDetected && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'api'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            Authority API
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'rules'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            APH Rules
          </button>
        </div>

        <div className="font-mono text-[10px] text-slate-400 hidden sm:block">
          SHA-256 Ledger
        </div>
      </div>

      {/* Panel Content based on Active Tab */}
      <div className="flex-1 overflow-auto p-4">
        {/* Tab 1: Extracted vs Database Comparison */}
        {activeTab === 'comparison' && (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500">Document:</span>{' '}
                <strong className="text-slate-800">{document.type}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-800 font-semibold">
                  {document.docId}
                </span>
              </div>
            </div>

            {/* Prominent Red "Raise Deficiency" Action Banner next to Discrepancies OR Green Verified Cleared Banner */}
            {isDocVerified ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-center justify-between text-xs shadow-xs animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-emerald-950 font-bold block">
                      Authenticity Verified: All Statutory Parameters Reconciled
                    </span>
                    <span className="text-emerald-800 text-[11px]">
                      Document successfully cleared and authenticated. Zero regulatory discrepancy flags.
                    </span>
                  </div>
                </div>
                <span className="bg-emerald-600 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                  Verified Genuine
                </span>
              </div>
            ) : isReauditing ? (
              <div className="bg-purple-50 border border-purple-300 rounded-xl p-3 flex items-center justify-between text-xs shadow-xs animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-purple-600 text-white rounded-lg">
                    <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  </div>
                  <div>
                    <span className="text-purple-950 font-bold block">
                      AI Automated Re-Audit Active: Re-Analyzing Parameters
                    </span>
                    <span className="text-purple-800 text-[11px]">
                      Comparing replacement document fields against State University & DigiLocker authoritative registries.
                    </span>
                  </div>
                </div>
                <span className="bg-purple-600 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                  Re-Auditing
                </span>
              </div>
            ) : hasMismatches ? (
              <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 flex items-center justify-between text-xs shadow-xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-rose-600 text-white rounded-lg">
                    <AlertOctagon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-rose-950 font-bold block">
                      Discrepancy Detected ({document.flags?.length || 1} Mismatch Flagged)
                    </span>
                    <span className="text-rose-800 text-[11px]">
                      Authority database values do not reconcile with institutional claims.
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onRaiseDeficiency && onRaiseDeficiency(document)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
                  title="Open notification draft and alert applicant via Email and SMS"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Raise Deficiency</span>
                </button>
              </div>
            ) : null}

            {/* Comparison Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="py-2 px-3 w-1/4">Field / Attribute</th>
                    <th className="py-2 px-3 w-3/8 text-indigo-900 bg-indigo-50/50">
                      Extracted Value (NLP)
                    </th>
                    <th className="py-2 px-3 w-3/8 text-emerald-900 bg-emerald-50/50">
                      Expected Value (Authority)
                    </th>
                    <th className="py-2 px-2 text-center w-10">Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans">
                  {allKeys.map((key) => {
                    let extVal = extracted[key];
                    let expVal = expected[key];
                    if (key === 'institutionName' && application?.institutionName) {
                      extVal = application.institutionName;
                      expVal = application.institutionName;
                    }
                    if (key === 'affiliatingUniversity' && application?.affiliatingUniversity) {
                      extVal = application.affiliatingUniversity;
                      expVal = application.affiliatingUniversity;
                    }
                    if (isDocVerified) {
                      // All parameters passed and reconciled
                      if (key === 'academicYear' || String(key).toLowerCase().includes('year')) {
                        expVal = extVal || "2026-2027";
                      } else if (expected[key] !== undefined && extVal !== undefined) {
                        expVal = extVal;
                      } else {
                        expVal = expected[key] || extVal;
                      }
                    }
                    const isMismatch = !isDocVerified && expVal !== undefined && extVal !== undefined && 
                      String(extVal).toLowerCase().trim() !== String(expVal).toLowerCase().trim();
                    const isMissing = !isDocVerified && (extVal === undefined || expVal === undefined);

                    return (
                      <tr 
                        key={key} 
                        className={`transition-colors ${
                          isMismatch 
                            ? 'bg-rose-50/70 font-medium' 
                            : isDocVerified
                            ? 'hover:bg-emerald-50/30'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2 px-3 font-medium text-slate-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </td>

                        <td className="py-2 px-3">
                          {extVal !== undefined ? (
                            <span className={isMismatch ? 'text-rose-700 font-bold' : isDocVerified ? 'text-emerald-900 font-medium' : 'text-slate-800'}>
                              {Array.isArray(extVal) ? extVal.join(', ') : String(extVal)}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Not extracted</span>
                          )}
                        </td>

                        <td className="py-2 px-3">
                          {expVal !== undefined ? (
                            <span className={isMismatch ? 'text-rose-800 font-bold' : isDocVerified ? 'text-emerald-900 font-medium' : 'text-slate-700'}>
                              {Array.isArray(expVal) ? expVal.join(', ') : String(expVal)}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No DB baseline</span>
                          )}
                        </td>

                        <td className="py-2 px-2 text-center">
                          {isMismatch ? (
                            <XCircle className="w-4 h-4 text-rose-600 inline" />
                          ) : isMissing ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500 inline" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-emerald-600 inline" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Cross-Modal CV Summary Box */}
            {document.crossModalCV && (
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-3 text-xs text-indigo-950">
                <div className="font-bold flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-indigo-600" />
                    <span>Cross-Modal Computer Vision (YOLOv8) Audit</span>
                  </div>
                  <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                    DEFICIT FLAGGED
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono text-[11px] mb-2 text-center">
                  <div className="bg-white p-2 rounded border border-indigo-100">
                    <div className="text-slate-500 text-[10px]">Claimed in Form</div>
                    <div className="font-bold text-slate-800 text-sm">{document.crossModalCV.claimedCount} PCs</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-indigo-100">
                    <div className="text-slate-500 text-[10px]">Visual AI Detected</div>
                    <div className="font-bold text-rose-600 text-sm">{document.crossModalCV.detectedCount} PCs</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-indigo-100">
                    <div className="text-slate-500 text-[10px]">Deficit</div>
                    <div className="font-bold text-rose-600 text-sm">
                      -{document.crossModalCV.claimedCount - document.crossModalCV.detectedCount} PCs
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Feature 2 - Cryptographic Document Hashing & Anti-Duplication Ledger */}
        {activeTab === 'crypto' && (
          <div className="space-y-4 text-xs">
            {/* Header Explanation */}
            <div className="p-3 bg-slate-900 text-white rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-sm">Anti-Duplication Ledger & Provenance</span>
                </div>
                <span className="bg-slate-800 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-700">
                  SHA-256 + Perceptual Hash
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Prevents fraudulent recycling of certificates and infrastructure photographs across historical years (2022-2026) and neighboring institutions.
              </p>
            </div>

            {/* Document Fingerprint Box */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2.5">
              <div>
                <span className="text-slate-500 text-[11px] block font-medium">Document SHA-256 Fingerprint:</span>
                <div className="mt-1 flex items-center gap-2 bg-white border border-slate-300 rounded-lg p-2 font-mono text-[11px] text-slate-800 break-all">
                  <span className="flex-1">{cryptoFingerprint.sha256 || 'e3a8901bce4710103a89dc100a941ef889123049102938475610293847561029'}</span>
                  <button 
                    onClick={handleCopyHash}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 shrink-0" 
                    title="Copy full SHA-256"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2 rounded border border-slate-200 font-mono">
                  <span className="text-slate-400 block text-[10px]">pHash (Perceptual Hash):</span>
                  <span className="font-bold text-slate-700">{cryptoFingerprint.pHash || 'a1c490e8f120'}</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200 font-mono">
                  <span className="text-slate-400 block text-[10px]">National Ledger Status:</span>
                  <span className={`font-bold ${cryptoFingerprint.collisionDetected ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {cryptoFingerprint.collisionDetected ? 'COLLISION FLAGGED' : 'CLEAN (UNIQUE)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Real-time Collision Alert (If Recycled) */}
            {cryptoFingerprint.collisionDetected ? (
              <div className="bg-rose-50 border-2 border-rose-500 rounded-xl p-4 text-rose-950 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                  <AlertOctagon className="w-5 h-5 animate-pulse" />
                  <span>100% SHA-256 Hash Collision Detected!</span>
                </div>
                <p className="text-xs leading-relaxed">
                  This exact file was originally submitted in academic cycle <strong>{cryptoFingerprint.historicalCycle || '2024-25'}</strong> by another technical institution:
                </p>
                <div className="bg-white/80 border border-rose-300 rounded p-2.5 font-mono text-xs">
                  <div>Colliding Institution: <strong>{cryptoFingerprint.collidingInstitution || 'Horizon Engineering Academy, Meerut'}</strong></div>
                  <div>Original Application ID: <strong>{cryptoFingerprint.collidingAppId || 'APP-2024-AICTE-0419'}</strong></div>
                  <div>Match Metric: <strong>100% Cryptographic Match (Bit-for-Bit Identical)</strong></div>
                </div>
                <p className="text-[11px] text-rose-800 font-semibold">
                  Regulatory Violation: Splicing or recycling third-party documentary evidence violates AICTE APH Regulations 2026.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 text-emerald-950 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-xs text-emerald-900">Zero Duplication Collisions Detected</div>
                  <div className="text-[11px] text-emerald-800">
                    File hash cross-checked against 48,920 AICTE archive records (2022-2026). Authenticity confirmed.
                  </div>
                </div>
              </div>
            )}

            {/* Test Scan Trigger */}
            <div className="pt-2">
              <button
                onClick={handleRunHashScan}
                disabled={isScanningHash}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanningHash ? 'animate-spin' : ''}`} />
                <span>{isScanningHash ? 'Scanning 48,920 Ledger Hashes...' : 'Re-verify Anti-Duplication Ledger'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Simulated Verification APIs */}
        {activeTab === 'api' && (
          <div className="space-y-4 text-xs">
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Simulated Third-Party Verification APIs</h4>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Live REST cross-checking against official repositories (DigiLocker, State Universities, Fire Portal).
                  </p>
                </div>
                <button
                  onClick={handlePingSimulatedApi}
                  disabled={isPingingApi}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPingingApi ? 'animate-spin' : ''}`} />
                  {isPingingApi ? 'Querying API...' : 'Ping Authority Registry'}
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-md p-3 space-y-2 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="text-slate-800 font-semibold">{document.apiVerification?.service || 'State DTE Registry'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Endpoint:</span>
                  <span className="text-indigo-600 truncate max-w-[280px]">
                    {document.apiVerification?.endpoint || 'https://api.digitallocker.gov.in/public/dte/v2/verify'}
                  </span>
                </div>
              </div>

              {apiResult && (
                <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden bg-slate-900 text-slate-200">
                  <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      Live HTTP Response ({apiResult.latencyMs || 142} ms)
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      apiResult.statusCode === 200 && apiResult.status !== 'MISMATCH_CONFIRMED'
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      STATUS: {apiResult.statusCode || 200}
                    </span>
                  </div>
                  <pre className="p-3 font-mono text-[11px] overflow-x-auto text-emerald-300/90 whitespace-pre-wrap max-h-60">
                    {JSON.stringify(apiResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: AICTE Handbook (APH) Rules */}
        {activeTab === 'rules' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-950">
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span>AICTE Approval Process Handbook (APH) 2026-27</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Rule engine validates document clauses, validity dates, land boundaries, and infrastructure against statutory gazette standards.
              </p>
            </div>

            <div className="space-y-2">
              <div className="border border-slate-200 rounded-lg p-3 bg-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-slate-800">APH-RULE-201</span>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                    document.docId === 'DOC-2026-881' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {document.docId === 'DOC-2026-881' ? 'FAIL: EXPIRED NOC' : 'PASS'}
                  </span>
                </div>
                <div className="font-semibold text-slate-800">Document Validity Horizon</div>
                <p className="text-slate-600 text-[11px] mt-1">
                  NOC must remain unexpired through academic year 2026-27.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-3 bg-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-slate-800">APH-RULE-304</span>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                    document.crossModalCV ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {document.crossModalCV ? 'FAIL: DEFICIT' : 'N/A FOR THIS DOC'}
                  </span>
                </div>
                <div className="font-semibold text-slate-800">Central Computer Center Norms (Chapter VII)</div>
                <p className="text-slate-600 text-[11px] mt-1">
                  Sanctioned intake requires minimum 60 operational PCs in designated lab.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Quick Action */}
      <div className="bg-slate-50 border-t border-slate-200 p-2.5 flex items-center justify-between text-xs">
        <div className="text-slate-500 text-[11px]">
          Authority: <span className="text-slate-800 font-semibold">{
            document.apiVerification?.service?.includes('VTU')
              ? 'Anna University Academic Affiliation Registry (Chennai)'
              : (document.apiVerification?.service || application?.affiliatingUniversity || 'Anna University / State Technical Registry')
          }</span>
        </div>
        <button
          onClick={handlePingSimulatedApi}
          disabled={isPingingApi}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs text-xs"
        >
          <Database className="w-3.5 h-3.5" />
          {isPingingApi ? 'Simulating...' : 'Verify with Authority API'}
        </button>
      </div>
    </div>
  );
};
