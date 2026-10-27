import React from 'react';
import { AlertTriangle, ShieldAlert, ArrowRight, Upload, Clock, CheckCircle2 } from 'lucide-react';

export const DeficiencyAlertBanner = ({ 
  deficiencies, 
  onResolveClick 
}) => {
  if (!deficiencies || deficiencies.length === 0) return null;

  const pendingDeficiencies = deficiencies.filter(d => d.status === 'pending_applicant_action');
  if (pendingDeficiencies.length === 0) return null;

  const primaryDeficiency = pendingDeficiencies[0];

  return (
    <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-amber-700 text-white rounded-2xl p-5 shadow-xl border border-rose-500/50 mb-6 relative overflow-hidden animate-pulse-subtle">
      {/* Background Decorative Pattern */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        {/* Left: Prominent Alert Icon & Headline */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-white/10 backdrop-blur-xs rounded-xl border border-white/20 shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-200" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white text-rose-800 font-extrabold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full shadow-xs">
                ACTION REQUIRED
              </span>
              <span className="text-rose-100 text-xs font-mono">
                AICTE Scrutiny Discrepancy Flagged
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-snug">
              Action Required: Discrepancy detected in recent upload.
            </h2>

            <p className="text-xs text-rose-100 max-w-2xl mt-1 leading-relaxed">
              <strong>{primaryDeficiency.document_id}</strong>: {primaryDeficiency.discrepancy_details}
            </p>

            <div className="flex items-center gap-4 mt-2.5 text-[11px] text-rose-200">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Logged: {primaryDeficiency.created_at ? new Date(primaryDeficiency.created_at).toLocaleString() : 'Just now'}
              </span>
              <span>•</span>
              <span className="font-semibold text-white">
                Pending Action: {pendingDeficiencies.length} {pendingDeficiencies.length === 1 ? 'deficiency' : 'deficiencies'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Resolve / Re-upload Action Button */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          <button
            onClick={() => onResolveClick(primaryDeficiency)}
            className="w-full md:w-auto bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-xs"
          >
            <Upload className="w-4 h-4 text-rose-600" />
            <span>Resolve / Re-upload</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
