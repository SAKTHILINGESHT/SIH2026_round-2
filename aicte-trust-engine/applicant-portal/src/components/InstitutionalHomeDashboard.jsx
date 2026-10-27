import React from 'react';
import { 
  Building, Award, FileText, CheckCircle2, AlertTriangle, 
  ArrowRight, ShieldCheck, Clock, Sparkles, Bell, 
  MapPin, Check, Plus, Hash, ExternalLink, Send, ArrowUpRight
} from 'lucide-react';

/**
 * Institutional Dashboard (Applicant Portal)
 * Strictly focuses on:
 * 1. Tracking the Institution's Application Status
 * 2. Real-time Officer Regulatory Communications & Deficiency Messages
 * (Officer-perspective approval counts and portfolios are excluded per Requirement 3)
 */
export const InstitutionalHomeDashboard = ({
  userSession,
  selectedApp,
  collegeApplications = [],
  canApplyNextStream = true,
  activePendingStream = null,
  onSelectApp,
  onStartNextStream,
  notifications = [],
  onNavigateTab,
  onViewCertificate,
  onResolveDeficiency
}) => {
  const hasApplication = Boolean(selectedApp && selectedApp.appId);
  const currentApp = selectedApp || {};
  const isApproved = hasApplication && (
    currentApp.overallStatus === 'approved' || 
    Boolean(currentApp.eoaCertificate)
  );

  const pendingDeficiencies = notifications.filter(n => n.status === 'pending_applicant_action');

  const institutionName = userSession?.institutionName || currentApp.institutionName || "AICTE Approved Institution";
  const permanentId = userSession?.permanentId || currentApp.permanentId || "PID-Pending";
  const region = userSession?.region || currentApp.region || "Regional Jurisdiction";
  const affiliatingUniversity = userSession?.affiliatingUniversity || currentApp.affiliatingUniversity || "State Technological University";
  
  const appId = hasApplication ? currentApp.appId : "Not Assigned (Unsubmitted)";
  const category = hasApplication ? currentApp.category : "No Active Stream";
  const intake = hasApplication ? (currentApp.intakeApplied ? `${currentApp.intakeApplied} Intake` : 'Pending') : 'Pending Filing';
  const submissionDate = hasApplication ? (currentApp.submissionDate || 'Pending') : 'Not Submitted';
  const documents = hasApplication ? (currentApp.documents || []) : [];
  const verifiedDocsCount = documents.filter(d => d.status === 'verified').length || (isApproved ? Math.max(1, documents.length) : 0);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Institutional Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AICTE Institutional Portal • Academic Year 2026-27</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {institutionName}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1 font-medium">
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 font-mono">
                <Hash className="w-3.5 h-3.5 text-amber-400" />
                <span>PID: {permanentId}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>{region}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                <Building className="w-3.5 h-3.5 text-emerald-400" />
                <span>{affiliatingUniversity}</span>
              </span>
            </div>
          </div>

          {/* Institutional Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {!hasApplication || collegeApplications.length === 0 ? (
              <button
                onClick={() => onNavigateTab('apply')}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Apply for AICTE Approval (AY 2026-27)</span>
              </button>
            ) : canApplyNextStream ? (
              <button
                onClick={onStartNextStream}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-105 ring-2 ring-emerald-300"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Apply for Next Stream (AY 2026-27)</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigateTab('status')}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
              >
                <Clock className="w-4 h-4 stroke-[2.5]" />
                <span>Track Active Scrutiny</span>
              </button>
            )}

            {isApproved && (
              <button
                onClick={onViewCertificate}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-105 ring-2 ring-emerald-400"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>View Official Certificate</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sequential Streams Management & Switcher Bar */}
      {collegeApplications.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Applied Streams (Sequential Application Workflow)
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono font-bold">
                  {collegeApplications.length} of 8 Applied
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {canApplyNextStream
                  ? "All current streams are completely verified & approved. You are eligible to apply for your next approval stream."
                  : `Active stream (${activePendingStream?.category || 'submitted stream'}) is undergoing scrutiny. Subsequent streams unlock upon verification & approval.`}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {canApplyNextStream ? (
                <button
                  onClick={onStartNextStream}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 ring-1 ring-emerald-300"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Apply for Next Stream</span>
                </button>
              ) : (
                <div className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  <span>Next Stream Locked (Under Scrutiny)</span>
                </div>
              )}
            </div>
          </div>

          {/* Applied Streams Pill Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
            {collegeApplications.map((app, idx) => {
              const isSelected = (selectedApp?.appId || currentApp?.appId) === app.appId;
              const isAppApproved = app.overallStatus === 'approved' || 
                Boolean(app.eoaCertificate);
              const isAppValidating = app.overallStatus === 'ai_validation_in_progress';
              const isAppReauditing = app.overallStatus === 'reaudit_in_progress';

              return (
                <button
                  key={app.appId}
                  onClick={() => onSelectApp && onSelectApp(app)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 border transition-all cursor-pointer shrink-0 ${
                    isSelected 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-400' 
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    isAppApproved ? 'bg-emerald-500' : isAppValidating ? 'bg-indigo-500 animate-ping' : isAppReauditing ? 'bg-purple-500 animate-ping' : 'bg-amber-500 animate-pulse'
                  }`} />
                  <span className="font-bold">Stream {idx + 1}:</span>
                  <span className="max-w-[200px] truncate">{app.category}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    isAppApproved 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : isAppValidating
                      ? 'bg-indigo-100 text-indigo-800'
                      : isAppReauditing
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isAppApproved ? 'Approved ✓' : isAppValidating ? 'Validating ⚡' : isAppReauditing ? 'Re-Auditing ⚡' : 'Under Review'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Key Status Pulse Cards: Dedicated to Application Tracking and Officer Communication */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Status Card */}
        <div 
          onClick={() => onNavigateTab(hasApplication ? 'status' : 'apply')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-indigo-400 transition-all group"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Application Tracker
            </span>
            <div className={`text-base sm:text-lg font-black font-mono ${
              !hasApplication 
                ? 'text-slate-500' 
                : isApproved 
                ? 'text-emerald-600' 
                : currentApp.overallStatus === 'ai_validation_in_progress'
                ? 'text-indigo-600 animate-pulse'
                : currentApp.overallStatus === 'reaudit_in_progress'
                ? 'text-purple-600 animate-pulse'
                : pendingDeficiencies.length > 0 
                ? 'text-rose-600' 
                : 'text-indigo-600'
            }`}>
              {!hasApplication 
                ? 'NO ACTIVE APPLICATION' 
                : isApproved 
                ? 'EOA GRANTED' 
                : currentApp.overallStatus === 'ai_validation_in_progress'
                ? 'AI FORENSICS ACTIVE'
                : currentApp.overallStatus === 'reaudit_in_progress'
                ? 'AI RE-AUDIT ACTIVE'
                : pendingDeficiencies.length > 0 
                ? 'ACTION NEEDED' 
                : 'UNDER SCRUTINY'}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {!hasApplication ? 'Click to Start Application' : `Ref: ${appId}`}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
            !hasApplication
              ? 'bg-slate-100 text-slate-400 border-slate-200'
              : isApproved 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
              : pendingDeficiencies.length > 0
              ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
              : 'bg-indigo-50 text-indigo-600 border-indigo-200'
          }`}>
            {isApproved ? <Award className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
          </div>
        </div>

        {/* Officer Messages Card */}
        <div 
          onClick={() => onNavigateTab('messages')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-rose-400 transition-all group"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Officer Messages & Memos
            </span>
            <div className={`text-base sm:text-lg font-black font-mono ${
              pendingDeficiencies.length > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}>
              {notifications.length} Messages Received
            </div>
            <span className={`text-[11px] font-semibold ${
              !hasApplication
                ? 'text-slate-500'
                : pendingDeficiencies.length > 0 
                ? 'text-rose-600' 
                : 'text-emerald-700'
            }`}>
              {!hasApplication
                ? "No Scrutiny Memos (Application Not Filed)"
                : pendingDeficiencies.length > 0 
                ? `${pendingDeficiencies.length} Action Memo Requiring Response` 
                : "All Officer Regulatory Checks Cleared"}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
            pendingDeficiencies.length > 0
              ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
              : 'bg-slate-50 text-slate-700 border-slate-200'
          }`}>
            <Bell className="w-6 h-6" />
          </div>
        </div>

        {/* Multi-Modal Scrutiny Verification */}
        <div 
          onClick={() => onNavigateTab(hasApplication ? 'status' : 'apply')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-all group"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              AI Forensic Document Verification
            </span>
            <div className="text-base sm:text-lg font-black text-emerald-700 font-mono">
              {!hasApplication ? "0 / 0 Documents Filed" : isApproved ? "100% Verified" : `${verifiedDocsCount} / ${Math.max(1, documents.length)} Cleared`}
            </div>
            <span className="text-[11px] text-emerald-800 font-medium">
              {!hasApplication ? "Awaiting Application Filing" : "Tamper ELA & University API Authenticated"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Core Split-View: Left = Application Tracker | Right = Officer Communications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Application Tracker (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    Application Scrutiny Tracker
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live status and multi-modal regulatory verification pipeline
                  </p>
                </div>
              </div>

              <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-bold uppercase ${
                !hasApplication
                  ? 'bg-slate-100 text-slate-600 border border-slate-300'
                  : isApproved 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : pendingDeficiencies.length > 0 
                  ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                  : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
              }`}>
                {!hasApplication ? 'No Application Filed' : isApproved ? 'AICTE EoA Granted' : currentApp.overallStatus || 'Under Review'}
              </span>
            </div>

            {/* Application Data Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Application ID</span>
                <span className="font-mono font-bold text-slate-900">{appId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Approval Stream</span>
                <span className="font-bold text-slate-800 truncate block">{category}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Sanctioned Seats</span>
                <span className="font-mono font-bold text-slate-900">{intake}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Filing Date</span>
                <span className="font-mono font-medium text-slate-700">{submissionDate}</span>
              </div>
            </div>

            {/* Scrutiny Progress Milestones */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Scrutiny Progression Pipeline
              </span>

              <div className="space-y-2">
                {/* Milestone 1 */}
                <div className="flex items-center gap-3 p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl text-xs">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                    hasApplication ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}>
                    {hasApplication ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 block">
                      Stage 1: Institutional Application & Mandatory Dossier Lodged
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {hasApplication
                        ? "Land title, infrastructure metrics, and statutory affidavits recorded on national portal."
                        : "No application dossier currently submitted. Click 'Apply for Approval' to lodge your institutional dossier."}
                    </span>
                  </div>
                </div>

                {/* Milestone 2 */}
                <div className="flex items-center gap-3 p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl text-xs">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                    hasApplication && (isApproved || currentApp.overallStatus) ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}>
                    {hasApplication && (isApproved || currentApp.overallStatus) ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 block">Stage 2: Multi-Modal AI Forensic Scrutiny</span>
                    <span className="text-slate-500 text-[11px]">
                      {hasApplication
                        ? "Error Level Analysis (ELA) heatmap and cryptographic hash checked against national archives."
                        : "Automated ELA heatmaps and anti-tamper ledger scans will commence upon submission."}
                    </span>
                  </div>
                </div>

                {/* Milestone 3 */}
                <div className="flex items-center gap-3 p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl text-xs">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                    isApproved ? 'bg-emerald-600 text-white' : hasApplication ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}>
                    {isApproved ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : hasApplication ? '•' : '3'}
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 block">Stage 3: Affiliating University & Directorate API Cross-Audit</span>
                    <span className="text-slate-500 text-[11px]">
                      {hasApplication
                        ? `Cross-referenced against ${affiliatingUniversity} Academic Registry.`
                        : `University database cross-verification pending application filing.`}
                    </span>
                  </div>
                </div>

                {/* Milestone 4 */}
                <div className="flex items-center gap-3 p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl text-xs">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                    isApproved ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}>
                    {isApproved ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '4'}
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 block">Stage 4: Regional Scrutiny Officer Executive Decision</span>
                    <span className="text-slate-500 text-[11px]">
                      {isApproved 
                        ? "Extension of Approval (EoA) 2026-27 officially granted under Member Secretary Seal."
                        : hasApplication
                        ? "Executive scrutiny in progress by Dr. A. K. Sundaram (Regional Scrutiny Officer, SRO Chennai)."
                        : "Scrutiny committee review will begin once institutional dossier is filed."}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Tracker Navigation CTA */}
            <div className="pt-2 flex items-center justify-between">
              {hasApplication ? (
                <button
                  onClick={() => onNavigateTab('status')}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Open Full Application & Document Scrutiny Tracker</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => onNavigateTab('apply')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Start New AICTE Approval Application →</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {isApproved && (
                <button
                  onClick={onViewCertificate}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>Download EoA Certificate</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Officer Communications & Messages (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${
                  pendingDeficiencies.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    Officer Communications
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct notices from AICTE Regional Scrutiny Officer
                  </p>
                </div>
              </div>

              {pendingDeficiencies.length > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {pendingDeficiencies.length} Action Required
                </span>
              )}
            </div>

            {/* Active Deficiency Memo Priority Card (If Dispatched by Officer) */}
            {pendingDeficiencies.length > 0 ? (
              <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-xs text-rose-950 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Regulatory Action Memo Received</span>
                  </div>
                  <span className="font-mono text-[10px] text-rose-700 font-bold bg-white px-2 py-0.5 rounded border border-rose-200">
                    Doc: {pendingDeficiencies[0].document_id}
                  </span>
                </div>

                <div className="bg-white/90 p-3 rounded-xl border border-rose-200 space-y-1">
                  <div className="font-semibold text-slate-900 text-[11px]">Discrepancy Details Flagged by Officer:</div>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {pendingDeficiencies[0].discrepancy_details}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-rose-800 font-medium">
                    Deadline: 7 Days to Upload Replacement
                  </span>

                  <button
                    onClick={() => {
                      if (onResolveDeficiency) {
                        onResolveDeficiency(pendingDeficiencies[0]);
                      } else {
                        onNavigateTab('messages');
                      }
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Upload Replacement Document</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : isApproved ? (
              /* Approved Congratulations Memo */
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-xs text-emerald-950 space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                  <Award className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>AICTE Extension of Approval (EoA) Granted</span>
                </div>
                <p className="text-emerald-900 leading-relaxed">
                  The Regional Scrutiny Officer (Dr. A. K. Sundaram) has validated all statutory criteria, faculty cadre, and university affiliation for <strong>{institutionName}</strong>. Official Approval Order has been issued.
                </p>
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200 font-mono text-[11px]">
                  <div>Order No: <strong>F.No. AICTE/AB/SWR/2026-27/{appId}</strong></div>
                  <div>Status: <strong>Approved & Digitally Certified</strong></div>
                </div>
              </div>
            ) : (
              /* Standard Clearance Memo */
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Zero Active Deficiency Notices</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  No discrepancy notices or deficiency memos have been flagged against your statutory submissions. Real-time updates from scrutiny officers will appear here instantly.
                </p>
              </div>
            )}

            {/* List of Recent Messages / Notices */}
            <div className="flex-1 space-y-2 pt-2 overflow-y-auto max-h-56">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Recent Message Logs
              </span>

              {notifications.length > 0 ? (
                notifications.slice(0, 3).map((notif, idx) => (
                  <div 
                    key={notif.id || idx}
                    onClick={() => onNavigateTab('messages')}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/70 text-xs transition-colors cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate max-w-[200px]">
                        {notif.document_type || notif.document_id || 'Statutory Scrutiny Alert'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {notif.timestamp ? new Date(notif.timestamp).toLocaleTimeString() : 'Recent'}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] line-clamp-2">
                      {notif.discrepancy_details || 'Notice logged in scrutiny audit stream.'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-400 text-xs italic">
                  No previous messages logged for this institution.
                </div>
              )}
            </div>

            {/* View All Messages Button */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => onNavigateTab('messages')}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View All Officer Communications & Memos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
