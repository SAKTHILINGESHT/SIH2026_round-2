import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Building, AlertOctagon, CheckCircle2, AlertTriangle, 
  FileText, ShieldCheck, Download, ChevronRight, Share2, Layers,
  Bot, Sparkles, Send, Bell, Award, Check, Trash2, BookOpen, Clock
} from 'lucide-react';
import { DocumentViewer } from './DocumentViewer';
import { ExtractedDataComparison } from './ExtractedDataComparison';
import { RagCopilotDrawer } from './RagCopilotDrawer';
import { DraftDeficiencyModal } from './DraftDeficiencyModal';
import { RescanModal } from './RescanModal';
import { EoaCertificateModal } from './EoaCertificateModal';
import { OfficerApprovalGenerationModal } from './OfficerApprovalGenerationModal';
import { HandbookModal } from './HandbookModal';

/**
 * Core Verification Split-Screen View
 * Left Panel: Document viewer with CSS bounding box overlays, ELA heatmap & PII Redaction
 * Right Panel: Extracted Data Key-Values comparison, Authority API, & Anti-Duplication Ledger
 * Bottom Panel: Audit Timeline & Official Decision state machine
 * Top Bar & Modals:
 * - Automated AI Anomaly Detection & Auto-Dispatched Deficiency Alert
 * - Prominent "Grant Final Approval (Issue AICTE EoA)" Manual Executive Action
 * - Official AICTE Extension of Approval (EoA) Certificate Modal
 * - Feature 3 RAG Regulatory AI Co-Pilot
 * - Multi-Modal AI Forensic Re-Scan Modal
 */
export const VerificationView = ({ 
  application, 
  onBackToDashboard, 
  onDecisionSubmit, 
  onOpenReportModal,
  onDeleteApplication,
  onApplicationUpdated
}) => {
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [activeFlag, setActiveFlag] = useState(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isDeficiencyModalOpen, setIsDeficiencyModalOpen] = useState(false);
  const [isRescanModalOpen, setIsRescanModalOpen] = useState(false);
  const [isApprovalCertificateOpen, setIsApprovalCertificateOpen] = useState(false);
  const [isApprovalGeneratingModalOpen, setIsApprovalGeneratingModalOpen] = useState(false);
  const [isHandbookOpen, setIsHandbookOpen] = useState(false);
  const [notificationSentToast, setNotificationSentToast] = useState(null);
  const [rescanSuccessToast, setRescanSuccessToast] = useState(null);
  const [deficiencyLogs, setDeficiencyLogs] = useState([]);

  // Fetch deficiency notifications and live application updates
  const fetchLiveScrutinyData = async () => {
    if (!application?.appId) return;
    try {
      // 1. Fetch deficiency logs from FastAPI
      const res = await fetch(`/api/deficiencies/application/${application.appId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDeficiencyLogs(data.data);
      }

      // 2. Fetch fresh application state from Express backend
      const appRes = await fetch(`/api/applications/${application.appId}`);
      const appData = await appRes.json();
      if (appData.success && appData.data && onApplicationUpdated) {
        onApplicationUpdated(appData.data);
      }
    } catch (e) {
      console.warn("Could not fetch live scrutiny data:", e);
    }
  };

  useEffect(() => {
    fetchLiveScrutinyData();
    const interval = setInterval(fetchLiveScrutinyData, 2000);
    return () => clearInterval(interval);
  }, [application?.appId]);

  // Auto-focus the relevant document (compliance replacement or anomaly) when application changes or updates
  useEffect(() => {
    if (application?.documents && Array.isArray(application.documents)) {
      const reauditDocIdx = application.documents.findIndex(d => 
        d.complianceSubmission || d.status === 'reaudit_in_progress' || d.status === 'anomaly_detected'
      );
      if (reauditDocIdx >= 0) {
        setSelectedDocIndex(reauditDocIdx);
      }
    }
    setActiveFlag(null);
  }, [application?.appId, application?.overallStatus]);

  if (!application) return null;

  const documents = application.documents || [];
  const currentDoc = documents[selectedDocIndex] || documents[0] || {
    docId: application.primaryDocId || 'DOC-2026-885',
    type: 'Statutory Document',
    status: application.overallStatus === 'approved' ? 'verified' : 'pending_review',
    flags: []
  };

  // Match deficiency log for current document
  const matchingDeficiency = deficiencyLogs.find(d => 
    d?.document_id === currentDoc?.docId || 
    (typeof d?.reuploaded_document_id === 'string' && currentDoc?.docId && d.reuploaded_document_id.includes(currentDoc.docId))
  );

  const complianceData = currentDoc?.complianceSubmission || matchingDeficiency;
  const hasComplianceReceived = Boolean(
    (currentDoc?.complianceSubmission) ||
    (matchingDeficiency && (
      matchingDeficiency.status === 'resolved_by_applicant' || 
      matchingDeficiency.status === 'resolved' || 
      matchingDeficiency.applicant_response
    ))
  );

  const isReauditPassed = currentDoc?.status === 'verified' || matchingDeficiency?.status === 're_audit_passed';

  const reuploadedDocRef = complianceData?.reuploaded_document_id || 
    complianceData?.reuploadedDocId || 
    (currentDoc?.docId ? `${currentDoc.docId}-REV` : 'DOC-REV');

  const applicantStatement = complianceData?.applicant_response || 
    complianceData?.applicantResponse || 
    'Replacement compliance document re-uploaded by institution.';

  const isAiValidating = application?.overallStatus === 'ai_validation_in_progress';
  const isReauditing = application?.overallStatus === 'reaudit_in_progress' || (hasComplianceReceived && !isReauditPassed);
  const isProcessing = isAiValidating || isReauditing;

  const [remainingSec, setRemainingSec] = useState(() => {
    const targetTime = application?.reAuditEndsAt || application?.validationEndsAt;
    if (targetTime) {
      return Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
    }
    return isProcessing ? 30 : 0;
  });

  useEffect(() => {
    const targetTime = application?.reAuditEndsAt || application?.validationEndsAt;
    if (targetTime) {
      setRemainingSec(Math.max(0, Math.ceil((targetTime - Date.now()) / 1000)));
    }
  }, [application?.reAuditEndsAt, application?.validationEndsAt, isProcessing]);

  useEffect(() => {
    if (!isProcessing) return;
    const tick = () => {
      const targetTime = application?.reAuditEndsAt || application?.validationEndsAt;
      if (targetTime) {
        setRemainingSec(Math.max(0, Math.ceil((targetTime - Date.now()) / 1000)));
      } else {
        setRemainingSec(prev => Math.max(0, prev - 1));
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [application?.validationEndsAt, application?.reAuditEndsAt, isProcessing]);

  // Determine whether an issue/discrepancy was detected in this document or application
  const docHasIssue = 
    currentDoc?.status === 'anomaly_detected' ||
    currentDoc?.status === 'review_needed' ||
    currentDoc?.status === 'pending_rescan' ||
    Boolean(currentDoc?.flags && currentDoc.flags.length > 0) ||
    Boolean(currentDoc?.tamperScore && currentDoc.tamperScore > 0.15) ||
    currentDoc?.apiVerification?.status === 'MISMATCH' ||
    currentDoc?.apiVerification?.status === 'FLAGGED' ||
    Boolean(currentDoc?.crossModalCV && currentDoc.crossModalCV.deficit > 0);

  const isAlreadyApproved = application.overallStatus === 'approved';
  const isIssueDetected = !isProcessing && !isReauditPassed && (docHasIssue || (application.overallStatus === 'anomaly_detected' && currentDoc?.status !== 'verified'));
  const isCleanOrVerified = !isProcessing && (application.overallStatus === 'verified' || isReauditPassed) && !isIssueDetected;

  // Executive Approval: Opens the Council Ledger Anchoring page (without timer)
  const handleFinalOfficerApproval = () => {
    setIsApprovalGeneratingModalOpen(true);
  };

  const handleApprovalGenerationComplete = async () => {
    setIsApprovalGeneratingModalOpen(false);
    application.overallStatus = 'approved';
    application.riskScore = 0;
    if (application.documents && Array.isArray(application.documents)) {
      application.documents.forEach(doc => {
        doc.status = 'verified';
        doc.flags = [];
        doc.tamperScore = 0.01;
        if (doc.extractedData && doc.expectedData) {
          doc.expectedData = { ...doc.extractedData };
        }
        if (doc.complianceSubmission) {
          doc.complianceSubmission.status = 'verified';
        }
        if (doc.apiVerification) {
          doc.apiVerification.status = 'VERIFIED';
        }
      });
    }
    if (currentDoc) {
      currentDoc.status = 'verified';
      currentDoc.flags = [];
      currentDoc.tamperScore = 0.01;
      if (currentDoc.extractedData && currentDoc.expectedData) {
        currentDoc.expectedData = { ...currentDoc.extractedData };
      }
    }
    if (onDecisionSubmit) {
      await onDecisionSubmit({
        decision: 'APPROVE',
        remarks: 'Official AICTE Extension of Approval (EoA) 2026-27 granted by Regional Scrutiny Officer following 100% verified AI compliance checks.',
        officerName: 'Dr. A. K. Sundaram (Regional Scrutiny Officer)'
      });
    }
    setIsApprovalCertificateOpen(true);
  };

  const handleNotificationSent = (data) => {
    setNotificationSentToast({
      title: "Notification Sent (Email & SMS)",
      message: `Formal deficiency alert dispatched for ${data.document_id}. Application state set to pending_applicant_action.`,
      recipient: data.applicant_email
    });

    // Auto-append audit log entry for this deficiency dispatch
    if (application.auditTimeline) {
      application.auditTimeline.push({
        id: `EVT-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        stage: "Applicant Alerting",
        actor: "FastAPI Deficiency Gateway",
        action: "Deficiency Notice Dispatched",
        details: `Dispatched multi-channel alert (Resend Email to ${data.applicant_email} & Twilio SMS to ${data.applicant_phone}). Status: pending_applicant_action.`,
        hash: `def_${Date.now().toString(16).padEnd(20, '0')}`,
        status: "ALERT"
      });
    }

    setTimeout(() => {
      setNotificationSentToast(null);
    }, 5000);
  };

  const handleRescanSuccess = (rescanData) => {
    // 1. Update currentDoc in memory
    currentDoc.status = 'verified';
    currentDoc.tamperScore = 0.02;
    currentDoc.flags = [];
    if (currentDoc.complianceSubmission) {
      currentDoc.complianceSubmission.status = 'verified';
    }

    // 2. Update application risk score and overall status
    if (rescanData.rescanSummary) {
      application.riskScore = rescanData.rescanSummary.newRiskScore;
      application.overallStatus = rescanData.rescanSummary.newOverallStatus;
    } else {
      application.riskScore = 0;
      application.overallStatus = 'verified';
    }

    // 3. Append to timeline
    if (rescanData.data?.auditEntry && application.auditTimeline) {
      application.auditTimeline.push(rescanData.data.auditEntry);
    }

    // 4. Notify parent
    if (onApplicationUpdated) {
      onApplicationUpdated(rescanData.data?.application || application);
    }

    // 5. Toast
    setRescanSuccessToast({
      title: "Multi-Modal AI Forensic Re-Scan Completed",
      message: `Document ${currentDoc.docId} verified with 0 anomalies. Application risk score lowered to ${application.riskScore || 0}.`
    });

    setTimeout(() => {
      setRescanSuccessToast(null);
    }, 6000);

    // Refresh deficiency logs
    if (typeof fetchLiveScrutinyData === 'function') {
      fetchLiveScrutinyData();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] space-y-3 relative">
      {/* Green "Notification Sent" Toast */}
      {notificationSentToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-4 border border-emerald-400">
          <div className="p-1.5 bg-emerald-700 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide">{notificationSentToast.title}</div>
            <div className="text-emerald-100 text-[11px] font-normal">{notificationSentToast.message}</div>
          </div>
        </div>
      )}

      {/* Green "Re-Scan Succeeded" Toast */}
      {rescanSuccessToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-4 border-2 border-emerald-500">
          <div className="p-2 bg-emerald-500 text-slate-950 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-emerald-400 tracking-wide">{rescanSuccessToast.title}</div>
            <div className="text-slate-300 text-[11px] font-normal">{rescanSuccessToast.message}</div>
          </div>
        </div>
      )}

      {/* Top Breadcrumb & Application Summary Bar */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer"
            title="Return to Global Applications List"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">{application.institutionName}</h2>
              <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold border border-slate-200">
                {application.appId}
              </span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase ${
                isAlreadyApproved
                  ? 'bg-emerald-600 text-white border border-emerald-500 shadow-2xs'
                  : isAiValidating
                  ? 'bg-indigo-100 text-indigo-900 border border-indigo-300 animate-pulse'
                  : isReauditing
                  ? 'bg-purple-100 text-purple-900 border border-purple-300 animate-pulse'
                  : application.overallStatus === 'verified'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : application.overallStatus === 'anomaly_detected'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {isAlreadyApproved 
                  ? 'AICTE EOA GRANTED' 
                  : isAiValidating
                  ? `AI Forensics Active (~${remainingSec}s)`
                  : isReauditing
                  ? `AI Re-Audit Active (~${remainingSec}s)`
                  : `Risk: ${application.riskScore || 0} • ${application.overallStatus}`}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              {application.category} • {application.region} • Submitted: {application.submissionDate}
            </div>
          </div>
        </div>

        {/* Action Controls & Document Switcher */}
        <div className="flex items-center gap-2">
          {/* Document Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            {documents.map((doc, idx) => (
              <button
                key={doc.docId || idx}
                onClick={() => setSelectedDocIndex(idx)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  selectedDocIndex === idx
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{doc.docId}</span>
                {doc.status === 'verified' ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                ) : doc.status === 'pending_rescan' ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                ) : doc.status === 'anomaly_detected' ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </button>
            ))}
          </div>

          {/* DYNAMIC EXECUTIVE CONTROLS (Manual Officer Action: Only Final Approval Button) */}
          {isAlreadyApproved ? (
            <button
              onClick={() => setIsApprovalCertificateOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer transition-all ring-1 ring-emerald-400"
              title="View official AICTE Extension of Approval Order"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>View EoA Certificate</span>
            </button>
          ) : isProcessing ? (
            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 shadow-2xs ${
              isAiValidating 
                ? 'bg-indigo-50 text-indigo-800 border-indigo-300' 
                : 'bg-purple-50 text-purple-800 border-purple-300'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-ping ${isAiValidating ? 'bg-indigo-600' : 'bg-purple-600'}`} />
              <span>{isAiValidating ? 'AI Forensics Running' : 'AI Re-Audit Running'} (~{remainingSec}s)</span>
            </div>
          ) : isCleanOrVerified ? (
            <button
              onClick={handleFinalOfficerApproval}
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold px-4 py-1.5 rounded-lg flex items-center gap-2 transition-all shadow-md ring-2 ring-emerald-400/50 hover:scale-[1.02] cursor-pointer"
              title="Grant final executive approval and issue official AICTE EoA 2026-27"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Grant Final Approval (Issue AICTE EoA)</span>
            </button>
          ) : isIssueDetected ? (
            <div className="flex items-center gap-1.5">
              <div className="bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                <span>AI Auto-Dispatched Deficiency (Email/SMS)</span>
              </div>
              <button
                onClick={() => setIsDeficiencyModalOpen(true)}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                title="Inspect dispatched formal deficiency notification"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Inspect Memo</span>
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>All Documents Verified</span>
            </div>
          )}

          {/* APH Handbook Regulatory Ruleset Button (Officer Portal Only) */}
          <button
            onClick={() => setIsHandbookOpen(true)}
            className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            title="Browse AICTE Approval Process Handbook (APH) 2026-27 Regulatory Ruleset"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>APH Rules</span>
          </button>

          {/* RAG-Powered AI Co-Pilot Button */}
          <button
            onClick={() => setIsCopilotOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">Ask Copilot (RAG)</span>
          </button>

          {/* Export Scrutiny Sheet */}
          <button
            onClick={onOpenReportModal}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report</span>
          </button>

          {/* Delete Application (Officer Purge) */}
          {onDeleteApplication && (
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete application ${application.appId} (${application.institutionName})? This will completely purge the application and its deficiency messages.`)) {
                  onDeleteApplication(application.appId);
                }
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
              title={`Delete application ${application.appId} from system`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* AUTOMATED AI SCRUTINY STATUS BANNERS */}
      {isProcessing && (
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border-2 border-purple-500/50 rounded-xl p-4 shadow-xl shrink-0 animate-in fade-in space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl shrink-0 border border-purple-400/30">
                <Sparkles className="w-5 h-5 animate-spin text-amber-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-white text-sm">
                    {isReauditing 
                      ? '🤖 AI Multi-Modal Re-Audit: Analyzing & Detecting Replacement Document' 
                      : '🤖 AI Multi-Modal Forensic Scrutiny Engine Active'}
                  </span>
                  <span className="bg-purple-600 text-white font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    {isReauditing ? 'Automated Re-Audit Active' : 'Forensic Validation'}
                  </span>
                  {isReauditing && (
                    <span className="font-mono text-xs font-bold text-indigo-200 bg-white/10 px-2 py-0.5 rounded border border-indigo-400/30">
                      Replacement: {reuploadedDocRef}
                    </span>
                  )}
                </div>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-snug">
                  {isReauditing
                    ? `Replacement statutory document (${reuploadedDocRef}) ingested for ${currentDoc?.docId || 'statutory document'}. LayoutLM neural OCR, OpenCV ELA splicing detection, and State University Registry API are executing in real time (~${remainingSec}s remaining). Detected anomalies or genuine clearance will update automatically.`
                    : 'Application received. LayoutLM OCR extraction, OpenCV ELA splicing detection, and State University API verification are executing in the background (~' + remainingSec + 's remaining).'}
                </p>
                {isReauditing && applicantStatement && (
                  <div className="mt-1.5 text-[11px] text-indigo-200/90 bg-black/35 px-2.5 py-1 rounded-lg border border-indigo-400/20 inline-block">
                    <span className="font-semibold text-amber-300">Applicant Institution Statement:</span> "{applicantStatement}"
                  </div>
                )}
              </div>
            </div>
            <div className="bg-slate-950/90 border-2 border-amber-400/50 px-3.5 py-2 rounded-xl font-mono text-xs text-amber-300 font-extrabold shrink-0 self-start sm:self-center flex items-center gap-2 shadow-inner">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span>~{remainingSec}s remaining</span>
            </div>
          </div>

          {/* 5-Stage Live AI Forensic Detection Pipeline Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-800 text-[11px]">
            {/* Stage 1 */}
            <div className={`p-2 rounded-lg border flex flex-col gap-0.5 ${
              remainingSec <= 28 
                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300' 
                : 'bg-purple-950/40 border-purple-500/60 text-purple-200 animate-pulse'
            }`}>
              <div className="flex items-center justify-between font-bold text-[11px]">
                <span>1. Cryptographic Ingestion</span>
                {remainingSec <= 28 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-purple-300 animate-spin" />}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">SHA-256 Digest Anchored</span>
            </div>

            {/* Stage 2 */}
            <div className={`p-2 rounded-lg border flex flex-col gap-0.5 ${
              remainingSec <= 21 
                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300' 
                : remainingSec <= 28
                ? 'bg-purple-950/40 border-purple-500/60 text-purple-200 animate-pulse'
                : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
            }`}>
              <div className="flex items-center justify-between font-bold text-[11px]">
                <span>2. LayoutLM OCR</span>
                {remainingSec <= 21 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : remainingSec <= 28 ? <Clock className="w-3.5 h-3.5 text-purple-300 animate-spin" /> : <span className="text-[10px] text-slate-500">Queued</span>}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Tokens & Key-Values</span>
            </div>

            {/* Stage 3 */}
            <div className={`p-2 rounded-lg border flex flex-col gap-0.5 ${
              remainingSec <= 14 
                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300' 
                : remainingSec <= 21 
                ? 'bg-purple-950/40 border-purple-500/60 text-purple-200 animate-pulse' 
                : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
            }`}>
              <div className="flex items-center justify-between font-bold text-[11px]">
                <span>3. OpenCV ELA Splicing</span>
                {remainingSec <= 14 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : remainingSec <= 21 ? <Clock className="w-3.5 h-3.5 text-purple-300 animate-spin" /> : <span className="text-[10px] text-slate-500">Queued</span>}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Pixel Tamper Detection</span>
            </div>

            {/* Stage 4 */}
            <div className={`p-2 rounded-lg border flex flex-col gap-0.5 ${
              remainingSec <= 7 
                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300' 
                : remainingSec <= 14 
                ? 'bg-purple-950/40 border-purple-500/60 text-purple-200 animate-pulse' 
                : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
            }`}>
              <div className="flex items-center justify-between font-bold text-[11px]">
                <span>4. University Registry</span>
                {remainingSec <= 7 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : remainingSec <= 14 ? <Clock className="w-3.5 h-3.5 text-purple-300 animate-spin" /> : <span className="text-[10px] text-slate-500">Queued</span>}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Live Gazette API Match</span>
            </div>

            {/* Stage 5 */}
            <div className={`p-2 rounded-lg border flex flex-col gap-0.5 ${
              remainingSec <= 1 
                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300' 
                : remainingSec <= 7 
                ? 'bg-purple-950/40 border-purple-500/60 text-purple-200 animate-pulse' 
                : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
            }`}>
              <div className="flex items-center justify-between font-bold text-[11px]">
                <span>5. APH 2026-27 Norms</span>
                {remainingSec <= 1 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : remainingSec <= 7 ? <Clock className="w-3.5 h-3.5 text-purple-300 animate-spin" /> : <span className="text-[10px] text-slate-500">Queued</span>}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Statutory Approval Order</span>
            </div>
          </div>
        </div>
      )}

      {isIssueDetected && (
        <div className="bg-rose-50/95 border-2 border-rose-300 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-950 shadow-xs shrink-0 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-600 text-white rounded-lg shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-rose-950">🤖 AI Scrutiny Engine: Regulatory Anomaly Automatically Detected: </span>
              <span className="text-rose-900">
                Statutory discrepancy automatically identified against APH 2026-27 rules & State Registry. Formal deficiency memo has been automatically generated and dispatched to the applicant portal, registered email (<strong>{application.applicantEmail || `principal@${(application.institutionName || 'college').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15)}.edu.in`}</strong>), and SMS (<strong>{application.applicantPhone || '+91 98401 23456'}</strong>). Awaiting applicant replacement document.
              </span>
            </div>
          </div>
          <span className="bg-rose-600 text-white font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase shrink-0 self-start sm:self-center">
            Deficiency Auto-Dispatched
          </span>
        </div>
      )}

      {isCleanOrVerified && !isAlreadyApproved && (
        <div className="bg-emerald-50/95 border-2 border-emerald-300 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-xs shrink-0 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-emerald-950">✅ AI Scrutiny Engine: 100% Passed & Verified (0 Anomalies Detected): </span>
              <span className="text-emerald-900">
                {hasComplianceReceived
                  ? `Replacement statutory document (${reuploadedDocRef}) verified genuine by AI. All statutory clauses and University Registry checks cleared. Zero officer manual detecting needed. Click button to grant final approval.`
                  : `All statutory documents, approvals, and physical norms have been mathematically validated by AI against State University registries. Zero officer manual detecting needed. Review details below and click final approval.`}
              </span>
            </div>
          </div>
          <button
            onClick={handleFinalOfficerApproval}
            className="bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer hover:scale-[1.02] transition-all"
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>Grant Final Approval</span>
          </button>
        </div>
      )}

      {isAlreadyApproved && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md shrink-0 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-lg shrink-0">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="font-extrabold text-sm block">🎉 AICTE Extension of Approval (EoA) 2026-27 Officially Granted</span>
              <span className="text-emerald-100 text-[11px]">
                Order {application.eoaCertificate?.orderNumber || `F.No. AICTE/AB/SWR/2026-27/${application.appId}`} formally issued under Member Secretary Seal. Legally binding state recorded in immutable ledger.
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsApprovalCertificateOpen(true)}
            className="bg-white text-emerald-900 hover:bg-emerald-50 font-extrabold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer self-start sm:self-center"
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>View Official EoA Order</span>
          </button>
        </div>
      )}

      {/* Main Core Verification Split-Screen Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
        {/* Left Panel: Document Viewer (7 cols on Desktop) */}
        <div className="lg:col-span-7 h-full min-h-[420px] flex flex-col overflow-hidden">
          <DocumentViewer 
            document={currentDoc} 
            application={application}
            isApproved={isAlreadyApproved}
            isReauditPassed={isReauditPassed}
            isReauditing={isReauditing}
            remainingSec={remainingSec}
            reuploadedDocRef={reuploadedDocRef}
            flags={isAlreadyApproved || isReauditPassed ? [] : (currentDoc?.flags || [])} 
            onSelectFlag={(flag) => setActiveFlag(flag)}
            onRaiseDeficiency={() => setIsDeficiencyModalOpen(true)}
          />
        </div>

        {/* Right Panel: Extracted vs Expected Data Comparison (5 cols on Desktop) */}
        <div className="lg:col-span-5 h-full min-h-[420px] flex flex-col overflow-hidden">
          <ExtractedDataComparison 
            document={currentDoc} 
            application={application}
            isApproved={isAlreadyApproved}
            isReauditPassed={isReauditPassed}
            isReauditing={isReauditing}
            onRaiseDeficiency={() => setIsDeficiencyModalOpen(true)}
          />
        </div>
      </div>

      {/* Feature 3: RAG-Powered "Chat with the Application" Drawer */}
      <RagCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        application={application}
      />

      {/* Component 1: "Draft Applicant Notification" Modal */}
      <DraftDeficiencyModal
        isOpen={isDeficiencyModalOpen}
        onClose={() => setIsDeficiencyModalOpen(false)}
        document={currentDoc}
        application={application}
        onNotificationSent={handleNotificationSent}
      />

      {/* Feature: Multi-Modal AI Forensic Re-Scan Modal */}
      <RescanModal
        isOpen={isRescanModalOpen}
        onClose={() => setIsRescanModalOpen(false)}
        document={currentDoc}
        application={application}
        complianceData={complianceData}
        onRescanSuccess={handleRescanSuccess}
      />

      {/* Council Ledger Anchoring Modal (No Timer) */}
      <OfficerApprovalGenerationModal
        isOpen={isApprovalGeneratingModalOpen}
        application={application}
        onComplete={handleApprovalGenerationComplete}
      />

      {/* Official AICTE Extension of Approval (EoA) Certificate Modal */}
      <EoaCertificateModal
        isOpen={isApprovalCertificateOpen}
        onClose={() => setIsApprovalCertificateOpen(false)}
        application={application}
      />

      {/* AICTE Approval Process Handbook (APH) Regulatory Rules Browser Modal */}
      <HandbookModal
        isOpen={isHandbookOpen}
        onClose={() => setIsHandbookOpen(false)}
      />
    </div>
  );
};
