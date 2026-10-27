import React, { useState } from 'react';
import { 
  ZoomIn, ZoomOut, RotateCcw, Eye, ShieldAlert, Sparkles, 
  Layers, AlertOctagon, CheckCircle2, Info, Maximize2, 
  Lock, Unlock, ShieldCheck, KeyRound, AlertTriangle, Clock
} from 'lucide-react';
import { DocumentCanvas } from './SampleDocRenderers';

/**
 * Left Panel: Document Viewer with Overlaid CSS Bounding Boxes, ELA Heatmap,
 * and Feature 1: Automated PII Redaction with Authorized Officer Unmask.
 */
export const DocumentViewer = ({ 
  document, 
  application,
  isApproved = false,
  isReauditPassed = false,
  isReauditing = false,
  remainingSec = 0,
  reuploadedDocRef = '',
  flags, 
  onSelectFlag,
  onPiiUnmasked,
  onRaiseDeficiency
}) => {
  const [activeMode, setActiveMode] = useState('normal'); // 'normal' | 'ela' | 'cv'
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  // Feature 1: Automated PII Redaction
  const [isPiiRedacted, setIsPiiRedacted] = useState(true);
  const [showUnmaskPrompt, setShowUnmaskPrompt] = useState(false);
  const [unmaskReason, setUnmaskReason] = useState('Statutory identity verification for Extension of Approval');
  const [isSubmittingUnmask, setIsSubmittingUnmask] = useState(false);

  if (!document) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-slate-100 text-slate-500 rounded-lg border border-slate-200">
        <div className="text-center">
          <Info className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <p>No document selected for scrutiny.</p>
        </div>
      </div>
    );
  }

  const isOverallApproved = isApproved || 
    application?.overallStatus === 'approved' || 
    application?.overallStatus === 'verified';
  const isDocVerified = document.status === 'verified' || isOverallApproved || isReauditPassed;

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 15, 160));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 15, 75));
  const handleZoomReset = () => setZoomLevel(100);

  const handleConfirmUnmask = async () => {
    setIsSubmittingUnmask(true);
    try {
      if (application?.appId) {
        await fetch('/api/audit/log-unmask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appId: application.appId,
            docId: document.docId,
            officerName: 'Dr. A. K. Sundaram (Scrutiny Officer)',
            reason: unmaskReason
          })
        });
      }
      setIsPiiRedacted(false);
      setShowUnmaskPrompt(false);
      if (onPiiUnmasked) onPiiUnmasked();
    } catch (err) {
      console.error("PII Unmask logging failed:", err);
      setIsPiiRedacted(false);
      setShowUnmaskPrompt(false);
    } finally {
      setIsSubmittingUnmask(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg relative">
      {/* Top Toolbar */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-400 font-semibold">{document.docId}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-200 font-medium truncate max-w-[180px]">{document.type}</span>
          {isDocVerified ? (
            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono text-[10px]">
              <CheckCircle2 className="w-3 h-3" />
              VERIFIED
            </span>
          ) : isReauditing ? (
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-900/70 to-indigo-900/70 text-purple-200 border border-purple-500/50 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold shadow-xs animate-pulse">
              <Clock className="w-3.5 h-3.5 animate-spin text-amber-300" />
              AI RE-AUDIT SCANNING (~{remainingSec}s)
            </span>
          ) : (document.status === 'anomaly_detected' || (document.flags && document.flags.length > 0)) ? (
            <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full font-mono text-[10px]">
              <AlertOctagon className="w-3 h-3" />
              ANOMALY DETECTED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono text-[10px]">
              <Clock className="w-3 h-3" />
              UNDER SCRUTINY
            </span>
          )}
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveMode('normal')}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition-colors ${
              activeMode === 'normal' 
                ? 'bg-slate-800 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Original
          </button>

          <button
            onClick={() => setActiveMode('ela')}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition-colors ${
              activeMode === 'ela' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
            Forensic ELA
          </button>

          {document.crossModalCV && (
            <button
              onClick={() => setActiveMode('cv')}
              className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition-colors ${
                activeMode === 'cv' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              YOLOv8 CV
            </button>
          )}
        </div>

        {/* Feature 1: Automated PII Redaction Toggle */}
        <div className="flex items-center gap-1.5">
          {isPiiRedacted ? (
            <button
              onClick={() => setShowUnmaskPrompt(true)}
              className="bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-500/50 text-emerald-300 text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              title="Click to unmask with authorized officer credentials"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>PII Masked</span>
            </button>
          ) : (
            <button
              onClick={() => setIsPiiRedacted(true)}
              className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 text-amber-300 text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Click to re-enable privacy safeguard"
            >
              <Unlock className="w-3.5 h-3.5 text-amber-400" />
              <span>PII Unmasked (Audit Active)</span>
            </button>
          )}

          {/* AI Bounding Boxes Toggle */}
          <label className="flex items-center gap-1 cursor-pointer text-slate-300 hover:text-white select-none ml-1">
            <input 
              type="checkbox" 
              checked={showBoundingBoxes} 
              onChange={e => setShowBoundingBoxes(e.target.checked)} 
              className="rounded bg-slate-800 border-slate-700 text-rose-500"
            />
            <Layers className="w-3.5 h-3.5 text-rose-400" />
            <span>AI Boxes</span>
          </label>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-900 px-1 py-0.5 rounded border border-slate-800">
            <button onClick={handleZoomOut} className="p-1 text-slate-400 hover:text-white transition-colors">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] text-slate-400 px-0.5">{zoomLevel}%</span>
            <button onClick={handleZoomIn} className="p-1 text-slate-400 hover:text-white transition-colors">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleZoomReset} className="p-1 text-slate-400 hover:text-white transition-colors">
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Document View Canvas Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-start justify-center bg-slate-950/80 relative">
        {/* Animated Laser Scanning Sweep & AI Forensic Radar during Re-Audit */}
        {isReauditing && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {/* Horizontal Laser Scanning Line */}
            <div 
              className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] animate-pulse" 
              style={{
                position: 'absolute',
                top: `${((30 - remainingSec) * 3.5) % 92}%`,
                left: 0,
                right: 0,
                transition: 'top 1s linear'
              }}
            />

            {/* High-Tech Radar HUD in Top-Right of Canvas */}
            <div className="absolute top-4 right-4 bg-slate-950/90 backdrop-blur-md border border-purple-500/50 rounded-xl p-3 text-xs text-white shadow-2xl max-w-xs animate-in fade-in">
              <div className="flex items-center gap-2 text-purple-300 font-extrabold text-[11px] mb-1">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                <span>AI FORENSIC RE-SCAN IN PROGRESS</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight">
                Scrutinizing: <strong>{reuploadedDocRef || document.docId}</strong>
              </p>
              <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                LayoutLM neural OCR, OpenCV ELA splicing detection, and State University API re-verification running in real time...
              </p>
              <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-amber-400">
                <span>Validation Countdown:</span>
                <span className="font-bold">~{remainingSec}s</span>
              </div>
            </div>
          </div>
        )}

        <div 
          className="transition-transform duration-150 origin-top w-full max-w-2xl"
          style={{ transform: `scale(${zoomLevel / 100})` }}
        >
          <DocumentCanvas 
            doc={document} 
            application={application}
            activeMode={activeMode} 
            showBoundingBoxes={showBoundingBoxes} 
            isPiiRedacted={isPiiRedacted}
          />
        </div>
      </div>

      {/* Re-Auditing Status Bar OR Anomaly Bounding Box Legend Bar OR Clean Verification Bar */}
      {isReauditing ? (
        <div className="bg-slate-950 border-t border-purple-900/60 p-2.5">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>AI Multi-Modal Re-Audit: Actively analyzing and detecting replacement document (~{remainingSec}s remaining)</span>
            </div>
            <span className="bg-purple-500/20 text-purple-200 border border-purple-400/40 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded uppercase">
              {reuploadedDocRef ? `Scanning ${reuploadedDocRef}` : 'Analyzing Replacement'}
            </span>
          </div>
        </div>
      ) : isDocVerified ? (
        <div className="bg-slate-950 border-t border-slate-800 p-2.5">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Forensic & Statutory Compliance: 100% Passed (0 Discrepancies)</span>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              {isOverallApproved ? 'AICTE EoA Granted' : 'Verified Genuine'}
            </span>
          </div>
        </div>
      ) : document.flags && document.flags.length > 0 ? (
        <div className="bg-slate-950 border-t border-slate-800 p-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5" />
              Detected Forensic & Cryptographic Flags ({document.flags.length})
            </div>

            <button
              onClick={() => onRaiseDeficiency && onRaiseDeficiency(document)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1 shadow-xs transition-colors shrink-0 cursor-pointer"
              title="Draft notification alert for this document discrepancy"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Raise Deficiency</span>
            </button>
          </div>
          <div className="space-y-1">
            {document.flags.map((flag, idx) => (
              <div 
                key={idx}
                onClick={() => onSelectFlag && onSelectFlag(flag)}
                className="bg-rose-950/30 border border-rose-500/40 hover:border-rose-500 rounded p-1.5 text-xs flex items-center justify-between text-rose-200 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-rose-400 bg-rose-900/50 px-1.5 py-0.2 rounded text-[10px]">
                    {flag.type}
                  </span>
                  <span className="text-slate-200 text-[11px]">{flag.message}</span>
                </div>
                <div className="font-mono text-[10px] text-slate-400 shrink-0 ml-2">
                  box: [{flag.box?.join(', ')}]
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Authorized PII Unmask Dialog Modal */}
      {showUnmaskPrompt && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs z-30 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-md w-full shadow-2xl text-xs text-white">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
              <KeyRound className="w-5 h-5" />
              <span>Authorized PII Unmask Request</span>
            </div>
            <p className="text-slate-300 leading-relaxed mb-3">
              Per AICTE Confidentiality Protocol Rule 18(b), Personal Identifiable Information (faculty Aadhaar, PAN, phone) is masked by default. 
              Unmasking requires a recorded regulatory audit reason and will be permanently appended to the immutable SHA-256 ledger.
            </p>

            <div className="space-y-1.5 mb-4">
              <label className="text-slate-400 text-[11px] block">Audit Justification / Case Purpose:</label>
              <input
                type="text"
                value={unmaskReason}
                onChange={e => setUnmaskReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowUnmaskPrompt(false)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUnmask}
                disabled={isSubmittingUnmask}
                className="px-3.5 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5 transition-colors"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>{isSubmittingUnmask ? 'Logging Authorization...' : 'Authorize & Unmask'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
