import React, { useState } from 'react';
import { 
  Building, ShieldCheck, Clock, FileText, CheckCircle2, 
  AlertTriangle, AlertOctagon, AlertCircle, ArrowRight, 
  Layers, Award, Check, Sparkles, Send, ShieldAlert, Plus, Lock
} from 'lucide-react';
import { EoaCertificateModal } from './EoaCertificateModal';

export const ApplicationStatusCard = ({ 
  application, 
  collegeApplications = [],
  selectedApp,
  canApplyNextStream = true,
  activePendingStream = null,
  onSelectApp,
  onStartNextStream,
  pendingDeficienciesCount = 0,
  onNavigateToApply,
  onNavigateToMessages
}) => {
  const [isCertOpen, setIsCertOpen] = useState(false);
  if (!application) return null;

  const isAiValidating = application?.overallStatus === 'ai_validation_in_progress';
  const isReauditing = application?.overallStatus === 'reaudit_in_progress';
  const isProcessing = isAiValidating || isReauditing;

  // Determine if application is actively submitted or in initial unregistered/unapplied state
  const isSubmitted = Boolean(
    application &&
    application.submissionDate &&
    application.overallStatus &&
    application.overallStatus !== 'not_submitted' &&
    application.overallStatus !== 'draft'
  );

  // Only show deficiency alerts if the application has completed validation and is in anomaly_detected state
  const hasPending = pendingDeficienciesCount > 0 && application.overallStatus === 'anomaly_detected';
  const isApproved = application.overallStatus === 'approved' || Boolean(application.eoaCertificate);
  const isRejected = application.overallStatus === 'REJECTED' || application.overallStatus === 'rejected';
  const isVerifiedClean = application.overallStatus === 'verified' && !isProcessing;

  // Process Tracker Stages Logic
  const stages = [
    {
      step: 1,
      title: "Application Filing",
      description: isSubmitted 
        ? `Filed on ${application.submissionDate}` 
        : "Not Started (Draft / Unsubmitted)",
      status: isSubmitted ? 'completed' : 'pending',
      icon: FileText
    },
    {
      step: 2,
      title: "AI Forensic Validation",
      description: !isSubmitted
        ? "Awaiting Application Filing"
        : isAiValidating
        ? "Automated Checks in Progress"
        : isReauditing
        ? "Compliance Re-Audit in Progress"
        : hasPending
        ? "Anomalies Flagged by AI Engine"
        : (isApproved || isVerifiedClean)
        ? "ELA & Anti-Tamper Cleared ✓"
        : "Automated Checks in Progress",
      status: !isSubmitted ? 'upcoming' : isProcessing ? 'in_progress' : hasPending ? 'alert' : 'completed',
      icon: Layers
    },
    {
      step: 3,
      title: "Regional Officer Review",
      description: !isSubmitted
        ? "Pending Prior Stages"
        : isProcessing
        ? "Awaiting AI Forensic Results"
        : hasPending
        ? "Deficiency Notice Dispatched"
        : isApproved
        ? "Officer Recommended Approval"
        : isVerifiedClean
        ? "All Cleared • Pending Officer Decision"
        : "Under Scrutiny Committee Review",
      status: !isSubmitted ? 'upcoming' : isProcessing ? 'upcoming' : hasPending ? 'alert' : isApproved ? 'completed' : 'in_progress',
      icon: ShieldCheck
    },
    {
      step: 4,
      title: "Approval Order (EoA)",
      description: isApproved
        ? "EoA 2026-27 Granted"
        : isRejected
        ? "Scrutiny Order: Rejected"
        : !isSubmitted
        ? "Pending Application Submission"
        : "Awaiting Final Council Decision",
      status: isApproved ? 'completed' : isRejected ? 'alert' : 'upcoming',
      icon: Award
    }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* Multi-Stream Switcher Bar */}
      {collegeApplications.length > 1 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
              Applied Streams:
            </span>
            {collegeApplications.map((app, idx) => {
              const isSelected = application?.appId === app.appId;
              const isAppApproved = app.overallStatus === 'approved' || Boolean(app.eoaCertificate);
              const isAppProcessing = app.overallStatus === 'ai_validation_in_progress' || app.overallStatus === 'reaudit_in_progress';
              return (
                <button
                  key={app.appId}
                  onClick={() => onSelectApp && onSelectApp(app)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer shrink-0 ${
                    isSelected 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-indigo-400' 
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isAppApproved ? 'bg-emerald-500' : isAppProcessing ? 'bg-indigo-500 animate-ping' : 'bg-amber-500 animate-pulse'}`} />
                  <span>Stream {idx + 1}: {app.category}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    isAppApproved ? 'bg-emerald-100 text-emerald-800' : isAppProcessing ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isAppApproved ? 'Verified ✓' : isAppProcessing ? 'Processing ⚡' : 'Under Review'}
                  </span>
                </button>
              );
            })}
          </div>

          {canApplyNextStream && onStartNextStream && (
            <button
              onClick={onStartNextStream}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Apply Next Stream</span>
            </button>
          )}
        </div>
      )}

      {/* Top Banner: Institution & Overall Scrutiny Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {application.institutionName}
            </h2>
            <span className="font-mono text-xs bg-amber-500/15 text-amber-800 px-2.5 py-0.5 rounded-lg font-bold border border-amber-500/30">
              Unique ID: {application.appId}
            </span>
            <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-semibold border border-slate-200">
              PID: {application.permanentId || '1-932148123'}
            </span>
          </div>

          <div className="text-xs text-slate-500 mt-1.5 flex flex-wrap items-center gap-2">
            <span>Approval Stream: <strong className="text-slate-800">{application.category || 'Extension of Approval (EoA) 2026-27'}</strong></span>
            <span>•</span>
            <span>University: <strong>{application.affiliatingUniversity || 'State Technological University'}</strong></span>
          </div>
        </div>

        {/* Dynamic Approval Status Badge */}
        <div className="flex items-center gap-2 shrink-0">
          {!isSubmitted ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
              <AlertCircle className="w-4 h-4 text-slate-500" />
              <span>No Application Submitted (Not Applied)</span>
            </div>
          ) : isAiValidating ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-50 border border-indigo-300 text-indigo-700 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>AI Forensic Validation Active</span>
            </div>
          ) : isReauditing ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-50 border border-purple-300 text-purple-700 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              <span>AI Re-Audit Active</span>
            </div>
          ) : hasPending ? (
            <button
              onClick={onNavigateToMessages}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 animate-pulse cursor-pointer transition-colors shadow-xs"
              title="Click to view officer deficiency notices"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Action Required (Deficiency Raised)</span>
            </button>
          ) : isRejected ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
              <AlertOctagon className="w-4 h-4 text-red-600" />
              <span>Scrutiny Rejected</span>
            </span>
          ) : isApproved ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>EoA Approved & Verified</span>
              </span>
              <button
                onClick={() => setIsCertOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xs cursor-pointer transition-all hover:scale-105 ring-1 ring-emerald-300"
                title="View official AICTE Extension of Approval Order Certificate"
              >
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>View Certificate</span>
              </button>
            </div>
          ) : isVerifiedClean ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>100% Verified Clean • Pending Final Approval</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Under Scrutiny Committee Review</span>
            </span>
          )}

          {onNavigateToApply && !isProcessing && (
            <button
              onClick={onNavigateToApply}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors border border-slate-200 cursor-pointer"
            >
              {isSubmitted ? 'Edit Form' : 'Apply Now'}
            </button>
          )}
        </div>
      </div>
      {/* Unsubmitted Alert Banner (if no application has been filed yet) */}
      {!isSubmitted && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 mt-0.5">
              !
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                AICTE Approval Application Pending Submission for AY 2026-27
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                Your institutional login is active, but you have not submitted an approval application yet. Complete the 5-step form to upload statutory documents and initiate automated scrutiny.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToApply}
            className="bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Fill & Submit Application Now →</span>
          </button>
        </div>
      )}

      {/* Extension of Approval (EoA) Granted Celebration Banner */}
      {isApproved && (
        <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 border-2 border-emerald-500/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shrink-0 mt-0.5">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-extrabold text-emerald-950">
                  Extension of Approval (EoA) Successfully Granted for AY 2026-27!
                </h4>
                <span className="bg-emerald-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Council Approved
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                The AICTE Regional Scrutiny Committee has completed multi-modal forensic verification. All statutory compliance documents and university affiliations have been verified genuine.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsCertOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105 ring-2 ring-emerald-300"
              title="View official AICTE Extension of Approval Order Certificate"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>View Official Certificate</span>
            </button>

            {canApplyNextStream && onStartNextStream && (
              <button
                onClick={onStartNextStream}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                title="Apply for your next approval stream (e.g. Increase in Intake, Working Professionals)"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Apply for Next Stream</span>
              </button>
            )}

            <span className="px-3.5 py-2 bg-emerald-700/80 text-white rounded-xl text-xs font-bold shadow-xs items-center gap-1.5 hidden sm:flex">
              <ShieldCheck className="w-4 h-4" />
              <span>Approved</span>
            </span>
          </div>
        </div>
      )}

      {/* Sequential Stream Policy Alert if current stream is under review */}
      {!canApplyNextStream && isSubmitted && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0">
              <Clock className="w-5 h-5 text-amber-600 animate-spin" />
            </div>
            <div>
              <span className="font-extrabold text-sm block text-amber-900">
                Active Stream Under AI Scrutiny (Sequential Stream Rule Active)
              </span>
              <span className="text-[11px] text-amber-700">
                AICTE regulations allow colleges to apply for all streams sequentially: once this active application is completely verified and approved, the portal will unlock your next approval stream.
              </span>
            </div>
          </div>
          <div className="bg-amber-200/80 text-amber-900 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shrink-0 font-mono">
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            <span>Next Stream Locked</span>
          </div>
        </div>
      )}

      {/* Process Lifecycle Stepper ("Track the Process") */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              AICTE Scrutiny & Approval Lifecycle Tracker
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {isSubmitted ? (isApproved ? 'Status: Approved' : 'Status: In Process') : 'Status: Not Applied'}
          </span>
        </div>

        {/* 4-Step Horizontal Process Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {stages.map((stg) => {
            const Icon = stg.icon;
            const isDone = stg.status === 'completed';
            const isAlert = stg.status === 'alert';
            const isInProg = stg.status === 'in_progress' || stg.status === 'pending';

            return (
              <div 
                key={stg.step}
                className={`p-3 rounded-xl border transition-all ${
                  isDone 
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                    : isAlert
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950 animate-pulse'
                    : isInProg && stg.step === 1 && !isSubmitted
                    ? 'bg-amber-50/70 border-amber-300 text-amber-950 ring-2 ring-amber-200'
                    : isInProg
                    ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                    : 'bg-white border-slate-200 text-slate-400 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isAlert
                        ? 'bg-rose-600 text-white'
                        : isInProg
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : stg.step}
                    </span>
                    <span className="font-bold text-xs">{stg.title}</span>
                  </div>
                  <Icon className="w-4 h-4 opacity-80" />
                </div>

                <p className="text-[11px] leading-snug line-clamp-2 mt-1">
                  {stg.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid of Key Institution Parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <span className="text-[11px] text-slate-400 block font-medium">Institution Type</span>
          <span className="font-bold text-slate-800 mt-0.5 block truncate">
            {application.institutionType || application.category || 'Technical College'}
          </span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <span className="text-[11px] text-slate-400 block font-medium">Regional Office</span>
          <span className="font-bold text-slate-800 mt-0.5 block truncate">
            {application.region || 'Regional Jurisdiction'}
          </span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <span className="text-[11px] text-slate-400 block font-medium">Intake Approved / Applied</span>
          <span className="font-bold text-slate-800 mt-0.5 block">
            {isSubmitted && application.intakeApplied 
              ? `${application.intakeApplied} Seats` 
              : <span className="text-slate-400 font-normal italic">Pending Application</span>}
          </span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <span className="text-[11px] text-slate-400 block font-medium">Submission Timestamp</span>
          <span className="font-bold text-slate-800 mt-0.5 block">
            {isSubmitted && application.submissionDate 
              ? application.submissionDate 
              : <span className="text-amber-700 font-bold">Not Submitted Yet</span>}
          </span>
        </div>
      </div>

      {/* Submitted Mandatory Documents List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Submitted Mandatory Documents ({application.documents?.length || 0})
          </h4>
          {isSubmitted && (
            <span className="text-[10px] text-slate-500 font-mono">
              SHA-256 Ledger Verified
            </span>
          )}
        </div>

        {/* Empty state if not submitted yet */}
        {(!application.documents || application.documents.length === 0) ? (
          <div className="border border-dashed border-slate-300 rounded-2xl p-6 text-center text-xs space-y-2 bg-slate-50/50">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="font-bold text-slate-700">No Statutory Documents Submitted Yet</div>
            <p className="text-slate-500 text-[11px] max-w-md mx-auto">
              Mandatory documents (University Affiliation Order, Campus Master Plan, Fire NOC, Anti-Ragging Affidavit) will appear here once the application is submitted.
            </p>
            {onNavigateToApply && (
              <button
                onClick={onNavigateToApply}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors"
              >
                <span>Upload Documents in Application Form</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
            {application.documents.map((doc, idx) => (
              <div 
                key={doc.docId || idx}
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  doc.status === 'anomaly_detected' 
                    ? 'bg-rose-50/50 border-rose-200 text-rose-900' 
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileText className={`w-4 h-4 shrink-0 ${doc.status === 'anomaly_detected' ? 'text-rose-500' : 'text-slate-500'}`} />
                  <div className="truncate">
                    <div className="font-semibold truncate">{doc.title || doc.type}</div>
                    <div className="font-mono text-[10px] text-slate-500">{doc.docId}</div>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  doc.status === 'anomaly_detected'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {doc.status === 'anomaly_detected' ? 'Flagged' : 'Passed'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Official AICTE EoA Certificate Modal */}
      <EoaCertificateModal
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        application={application}
      />
    </div>
  );
};
