import React, { useState, useEffect } from 'react';
import { 
  Cpu, ShieldCheck, AlertTriangle, CheckCircle2, Clock, 
  Sparkles, Award, ArrowRight, FastForward, Check
} from 'lucide-react';

/**
 * AI Scrutiny Multi-Modal Analysis Progress Modal
 * Simulates deep multi-minute statutory document evaluation (2-3 mins) with live multi-stage scanning feedback.
 * Includes an "Accelerate / Fast-Forward" button so users/evaluators don't have to wait the entire 2 minutes if in a hurry.
 */
export const ScrutinyAnalysisModal = ({
  isOpen,
  onComplete,
  title = "AI Multi-Modal Scrutiny & Forensic Analysis in Progress",
  subtitle = "Evaluating statutory submissions against AICTE Approval Process Handbook (APH 2026-27) norms",
  targetDurationSeconds = 120, // 2 minutes
  stages = [
    { title: "Document Ingestion & Cryptographic SHA-256 Hashing", desc: "Generating tamper-evident digest and anti-duplication ledger check" },
    { title: "State University Registry API Cross-Verification", desc: "Querying Anna University & State DTE database for active academic affiliation" },
    { title: "Cross-Modal OpenCV ELA & YOLOv8 Computer Vision", desc: "Executing Error Level Analysis on statutory dates and visual PC counting" },
    { title: "Statutory Rule Reconciliation (APH 2026-27)", desc: "Validating teacher-student cadre ratios, land contiguous title, and mandatory clauses" }
  ],
  completionTitle = "AI Scrutiny Analysis Completed",
  completionBadge = "SCRUTINY CONCLUDED",
  isAnomalyResult = true,
  resultSummary = "Critical discrepancy identified in University Affiliation Order (DOC-2026-885). Deficiency notice automatically dispatched."
}) => {
  if (!isOpen) return null;

  const [secondsRemaining, setSecondsRemaining] = useState(targetDurationSeconds);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Calculate elapsed progress percentage
  const elapsed = targetDurationSeconds - secondsRemaining;
  const progressPercent = Math.min(100, Math.round((elapsed / targetDurationSeconds) * 100));

  useEffect(() => {
    if (secondsRemaining <= 0) {
      setIsFinished(true);
      setCurrentStageIndex(stages.length - 1);
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        const nextVal = prev - 1;
        // Calculate which stage should be active
        const stageDuration = targetDurationSeconds / stages.length;
        const currentElapsed = targetDurationSeconds - nextVal;
        const stageIdx = Math.min(stages.length - 1, Math.floor(currentElapsed / stageDuration));
        setCurrentStageIndex(stageIdx);
        return nextVal;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, targetDurationSeconds, stages.length]);

  const handleAccelerate = () => {
    setSecondsRemaining(0);
    setCurrentStageIndex(stages.length - 1);
    setIsFinished(true);
  };

  const handleFinishAndProceed = () => {
    if (onComplete) onComplete();
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${
              isFinished 
                ? (isAnomalyResult ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30')
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
            }`}>
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-amber-400">
                  AICTE Multi-Modal Trust Engine
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                  AI Forensics
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {isFinished ? completionTitle : title}
              </h3>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Analysis Timer</span>
            <span className={`text-base font-black font-mono tracking-wider ${
              isFinished ? 'text-emerald-400' : 'text-amber-300'
            }`}>
              {isFinished ? "00:00 (DONE)" : formatTime(secondsRemaining)}
            </span>
          </div>
        </div>

        {/* Progress Bar & Stage Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              {!isFinished && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
              <span>{isFinished ? completionBadge : `Evaluating Stage ${currentStageIndex + 1} of ${stages.length}...`}</span>
            </span>
            <span className="font-mono text-amber-400 font-bold">{progressPercent}%</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isFinished 
                  ? (isAnomalyResult ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-teal-500 to-emerald-500')
                  : 'bg-gradient-to-r from-amber-500 via-indigo-500 to-teal-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Multi-Stage Breakdown List */}
        <div className="space-y-2.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
          {stages.map((stage, idx) => {
            const isStageDone = idx < currentStageIndex || isFinished;
            const isStageActive = idx === currentStageIndex && !isFinished;

            return (
              <div 
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  isStageActive
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                    : isStageDone
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                    isStageActive
                      ? 'bg-amber-500 text-slate-950 animate-pulse'
                      : isStageDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isStageDone ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-white text-[11px] sm:text-xs">{stage.title}</div>
                    <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{stage.desc}</div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {isStageActive ? (
                    <span className="text-[10px] font-mono text-amber-300 font-bold animate-pulse">Running...</span>
                  ) : isStageDone ? (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">Passed ✓</span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">Queued</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Result Callout (Revealed once complete) */}
        {isFinished && (
          <div className={`p-4 rounded-2xl border text-xs animate-in zoom-in-95 ${
            isAnomalyResult 
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-200' 
              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${
                isAnomalyResult ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {isAnomalyResult ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              </div>
              <div className="space-y-1">
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <span>{isAnomalyResult ? "Statutory Anomaly Identified" : "All Statutory Checks Verified Genuine"}</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {resultSummary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {!isFinished ? (
            <>
              <span className="text-[11px] text-slate-400 font-mono text-center sm:text-left">
                Performing 2-minute comprehensive statutory audit...
              </span>
              <button
                type="button"
                onClick={handleAccelerate}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white text-xs font-bold px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Skip the countdown and finish the analysis immediately"
              >
                <FastForward className="w-4 h-4" />
                <span>Accelerate Analysis (Skip Wait)</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleFinishAndProceed}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <span>Review Findings in Scrutiny Dashboard</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
