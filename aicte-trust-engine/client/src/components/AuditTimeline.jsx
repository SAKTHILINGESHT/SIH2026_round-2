import React, { useState } from 'react';
import { 
  History, ShieldAlert, CheckCircle, Clock, AlertTriangle, 
  Send, Lock, ChevronDown, ChevronUp, FileText, ArrowRight, UserCheck
} from 'lucide-react';

/**
 * Bottom Panel: Audit Timeline & Official Decision State Machine
 * Implements Blueprint Specification:
 * "Audit Timeline: A bottom panel showing a vertical chronological log (e.g., 'AI OCR Completed',
 * 'Mock API Pinged', 'Date Mismatch Flagged')."
 */
export const AuditTimeline = ({ 
  application, 
  onDecisionSubmit, 
  onOpenReportModal 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState(
    application?.overallStatus === 'verified' || application?.overallStatus === 'approved' 
      ? 'APPROVE' 
      : 'DEFICIENCY_MEMO'
  );

  if (!application) return null;

  const timeline = application.auditTimeline || [];

  const handleExecuteDecision = async () => {
    setIsSubmitting(true);
    try {
      if (onDecisionSubmit) {
        await onDecisionSubmit({
          decision: selectedDecision,
          remarks: decisionRemarks || `Action executed: ${selectedDecision} by Scrutiny Officer`,
          officerName: 'Dr. A. K. Sundaram (Regional Scrutiny Officer)'
        });
      }
      setDecisionRemarks('');
    } catch (err) {
      console.error("Decision recording failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 shadow-lg">
      {/* Drawer Toggle Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <History className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-xs tracking-wide uppercase">
            Audit Trail & Decision State Machine
          </span>
          <span className="bg-slate-800 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded-full border border-slate-700">
            {timeline.length} Chronological Events • SHA-256 Chained
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Immutable Ledger Active
          </span>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded Timeline Body */}
      {isExpanded && (
        <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 max-h-72 overflow-y-auto">
          {/* Vertical Chronological Audit Log (Left 8 cols) */}
          <div className="lg:col-span-8 border-r border-slate-200 pr-4">
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {timeline.map((event, idx) => {
                const isAlert = event.status === 'ALERT' || event.status === 'CRITICAL';
                const isSuccess = event.status === 'SUCCESS';

                return (
                  <div key={event.id || idx} className="relative group">
                    {/* Circle Node */}
                    <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 bg-white flex items-center justify-center ${
                      isAlert 
                        ? 'border-rose-600 bg-rose-50 text-rose-600' 
                        : isSuccess 
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-600' 
                        : 'border-indigo-600 bg-indigo-50 text-indigo-600'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        isAlert ? 'bg-rose-600' : isSuccess ? 'bg-emerald-600' : 'bg-indigo-600'
                      }`} />
                    </div>

                    {/* Event Content */}
                    <div className="bg-slate-50 hover:bg-slate-100 p-2.5 rounded-lg border border-slate-200 transition-colors">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900">{event.action}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                            {event.stage || 'Pipeline'}
                          </span>
                        </div>
                        <div className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : 'Recent'}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{event.details}</p>

                      <div className="mt-1.5 pt-1 border-t border-slate-200/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Actor: <strong className="text-slate-600">{event.actor || 'AI Engine'}</strong></span>
                        <span className="truncate max-w-[200px]" title={`Cryptographic Hash: ${event.hash}`}>
                          Hash: {event.hash?.slice(0, 16)}...
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scrutiny Official Decision Action Cockpit (Right 4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                Scrutiny Official Decision Console
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Log legally binding verdict into the AICTE Approval state machine.
              </p>

              {/* Decision Type Selector */}
              <div className="grid grid-cols-2 gap-1.5 text-xs mb-2">
                <button
                  type="button"
                  onClick={() => setSelectedDecision('DEFICIENCY_MEMO')}
                  className={`py-1.5 px-2 rounded font-medium text-left transition-colors border ${
                    selectedDecision === 'DEFICIENCY_MEMO'
                      ? 'bg-rose-50 border-rose-500 text-rose-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Issue Deficiency
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDecision('HEARING')}
                  className={`py-1.5 px-2 rounded font-medium text-left transition-colors border ${
                    selectedDecision === 'HEARING'
                      ? 'bg-amber-50 border-amber-500 text-amber-800 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Refer to Hearing (SHC)
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDecision('APPROVE')}
                  className={`py-1.5 px-2 rounded font-medium text-left transition-colors border col-span-2 ${
                    selectedDecision === 'APPROVE'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Grant Extension of Approval (EoA)
                </button>
              </div>

              {/* Scrutiny Remarks Textarea */}
              <textarea
                value={decisionRemarks}
                onChange={(e) => setDecisionRemarks(e.target.value)}
                placeholder="Enter regulatory grounds, APH reference clauses, or instructions to institution..."
                rows={2}
                className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none font-sans"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExecuteDecision}
                disabled={isSubmitting}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Recording on Ledger...' : 'Commit Decision'}
              </button>

              <button
                onClick={onOpenReportModal}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-slate-300"
                title="Print or Export Scrutiny Summary"
              >
                <FileText className="w-3.5 h-3.5" />
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
