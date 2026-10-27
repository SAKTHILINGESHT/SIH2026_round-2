import React, { useState, useEffect } from 'react';
import { 
  Award, ShieldCheck, Cpu, CheckCircle2, 
  ArrowRight, Check, Sparkles 
} from 'lucide-react';

/**
 * Officer Executive Approval & Certificate Generation Modal
 * Displays the Council ledger anchoring & certificate generation process without any timer.
 */
export const OfficerApprovalGenerationModal = ({
  isOpen,
  application,
  onComplete
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const stages = [
    { 
      title: "Regional Scrutiny Officer Digital Token Authentication", 
      desc: "Validating digital signature credentials for Dr. A. K. Sundaram (Regional Scrutiny Officer, SRO Chennai)" 
    },
    { 
      title: "Sanctioned Intake & Program Cryptographic Ledger Anchoring", 
      desc: `Anchoring 540 sanctioned seats for ${application?.institutionName || 'R.M.K. Engineering College'} to National AICTE Blockchain` 
    },
    { 
      title: "Synthesizing AICTE High-Resolution Council Letterhead & QR Security Seal", 
      desc: "Embedding dynamic verification URI and tamper-evident cryptographic QR matrix into official PDF" 
    },
    { 
      title: "Affixing Member Secretary Seal & Issuing AICTE EoA Order", 
      desc: "Binding Council Seal (Prof. Rajive Kumar, Member Secretary, AICTE New Delhi) and generating final certificate" 
    }
  ];

  // Stage advancement without any timer
  useEffect(() => {
    if (!isOpen) {
      setCurrentStageIndex(0);
      setIsFinished(false);
      return;
    }

    setCurrentStageIndex(0);
    setIsFinished(false);

    const t1 = setTimeout(() => setCurrentStageIndex(1), 600);
    const t2 = setTimeout(() => setCurrentStageIndex(2), 1200);
    const t3 = setTimeout(() => setCurrentStageIndex(3), 1800);
    const t4 = setTimeout(() => {
      setCurrentStageIndex(4);
      setIsFinished(true);
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const progressPercent = isFinished 
    ? 100 
    : Math.min(95, Math.round(((currentStageIndex + 1) / (stages.length + 0.5)) * 100));

  const handleFinishAndProceed = () => {
    if (onComplete) onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header Bar - Timer completely removed */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${
              isFinished 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
            }`}>
              <Award className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-amber-400">
                  AICTE Executive Approval Order
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                  AY 2026-27
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {isFinished 
                  ? "AICTE Extension of Approval (EoA) Successfully Generated" 
                  : "Council Ledger Anchoring & Certificate Generation in Progress"}
              </h3>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Council Ledger</span>
            <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
              isFinished 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isFinished ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
              <span>{isFinished ? "100% ANCHORED" : "ANCHORING..."}</span>
            </span>
          </div>
        </div>

        {/* Progress Bar & Stage Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              {!isFinished && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
              <span>{isFinished ? "COUNCIL SEAL AFFIXED • READY FOR ISSUANCE" : `Processing Step ${Math.min(stages.length, currentStageIndex + 1)} of ${stages.length}...`}</span>
            </span>
            <span className="font-mono text-amber-400 font-bold">{progressPercent}%</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isFinished 
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 4-Stage Breakdown List */}
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
                    <span className="text-[10px] font-mono text-amber-300 font-bold animate-pulse">Anchoring...</span>
                  ) : isStageDone ? (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">Anchored ✓</span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">Queued</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Finished Success Callout */}
        {isFinished && (
          <div className="p-4 rounded-2xl border text-xs bg-emerald-500/15 border-emerald-500/40 text-emerald-200 animate-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <span>AICTE Extension of Approval Order Finalized</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Official AICTE Extension of Approval (EoA) 2026-27 decree registered under Member Secretary Seal. Order Number: <strong>F.No. AICTE/AB/SWR/2026-27/{application?.appId || '1084'}</strong>. An approval notification has been dispatched to the Applicant Institution Portal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Action Controls - No timer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {!isFinished ? (
            <div className="flex items-center gap-2.5 text-xs text-amber-300 font-mono py-2">
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span>Anchoring approval decree to National AICTE Blockchain...</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleFinishAndProceed}
              className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] ring-2 ring-emerald-400/50"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Reveal Official AICTE EoA Certificate Now</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
