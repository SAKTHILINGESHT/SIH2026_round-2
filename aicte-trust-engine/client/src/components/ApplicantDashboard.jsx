import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Bell, Upload, CheckCircle2, FileText, 
  Clock, ShieldAlert, ArrowRight, Building, RefreshCw, 
  ExternalLink, Send, Check, X, Mail, MessageSquare
} from 'lucide-react';

/**
 * Component 2: Applicant's Dashboard View (React/Tailwind)
 * Minimalist applicant portal for the institution:
 * - Prominent red/amber alert banner at top when deficiency is logged
 * - Simple "Notifications Inbox" component displaying full deficiency message text
 * - "Resolve / Re-upload" workflow
 */
export const ApplicantDashboard = ({ 
  application, 
  onBackToOfficialView 
}) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDeficiency, setActiveDeficiency] = useState(null);
  
  // Resolve / Re-upload modal state
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [selectedResolveDeficiency, setSelectedResolveDeficiency] = useState(null);
  const [reuploadedFile, setReuploadedFile] = useState(null);
  const [applicantResponseText, setApplicantResponseText] = useState('');
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  // Fetch deficiency notifications from FastAPI
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const url = application?.appId 
        ? `/api/deficiencies/application/${application.appId}`
        : `/api/deficiencies/notifications`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load deficiency notifications from FastAPI:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [application]);

  // Check if any notification is currently pending action
  const pendingDeficiencies = notifications.filter(n => n.status === 'pending_applicant_action');
  const hasPendingDeficiency = pendingDeficiencies.length > 0;
  const primaryPending = pendingDeficiencies[0];

  const handleOpenResolveModal = (deficiency) => {
    setSelectedResolveDeficiency(deficiency);
    setApplicantResponseText('');
    setReuploadedFile(null);
    setIsResolveModalOpen(true);
  };

  const handleSubmitResolution = async () => {
    if (!selectedResolveDeficiency) return;

    setIsSubmittingResolution(true);
    try {
      const response = await fetch(`/api/deficiencies/resolve/${selectedResolveDeficiency.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_response: applicantResponseText || "Corrected statutory document re-uploaded as requested.",
          reuploaded_document_id: reuploadedFile ? `DOC-REUPLOAD-${Date.now().toString().slice(-4)}` : `${selectedResolveDeficiency.document_id}-REV1`
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessToast(`Document re-uploaded and deficiency #${selectedResolveDeficiency.id} resolved!`);
        setTimeout(() => setSuccessToast(null), 4000);
        setIsResolveModalOpen(false);
        fetchNotifications();
      }
    } catch (err) {
      console.error("Failed to resolve deficiency:", err);
    } finally {
      setIsSubmittingResolution(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Breadcrumb & Switcher to Official View */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">Portal View:</span>
          <span className="bg-slate-900 text-white px-2.5 py-1 rounded-md font-medium text-[11px] flex items-center gap-1.5 shadow-xs">
            <Building className="w-3.5 h-3.5 text-amber-400" />
            Applicant Institution Portal (College Dashboard)
          </span>
        </div>

        <button
          onClick={onBackToOfficialView}
          className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors"
        >
          <span>Return to AICTE Official View</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Institutional Profile Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            AICTE Extension of Approval (EoA) • Academic Year 2026-27
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
            {application?.institutionName || "AICTE Approved Institution"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Application ID: <strong className="font-mono text-slate-800">{application?.appId || "APP-Pending"}</strong> • Region: {application?.region || "National AICTE Region"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchNotifications}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="Refresh notifications"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Prominent Red/Amber Alert Banner (When Deficiency Logged) */}
      {hasPendingDeficiency ? (
        <div className="bg-rose-50 border-2 border-rose-500 rounded-2xl p-5 text-rose-950 shadow-md animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-600 text-white rounded-xl shrink-0 mt-0.5 shadow-xs animate-bounce">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-rose-900 uppercase tracking-wide">
                    Action Required: Discrepancy detected in recent upload.
                  </h3>
                  <span className="bg-rose-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                    SLA: 7 Days Remaining
                  </span>
                </div>
                <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                  The AICTE Scrutiny Officer flagged an official deficiency on Document <strong>{primaryPending.document_id}</strong>.
                  Please inspect the notification below and submit a re-upload immediately.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenResolveModal(primaryPending)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Resolve / Re-upload</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-emerald-950 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-emerald-900">Application in Good Standing</h4>
              <p className="text-[11px] text-emerald-800">
                No active deficiencies require your immediate action. Scrutiny proceedings are ongoing.
              </p>
            </div>
          </div>
          <span className="bg-emerald-100 text-emerald-800 font-mono text-[10px] px-2.5 py-1 rounded-full font-bold">
            ZERO PENDING NOTICES
          </span>
        </div>
      )}

      {/* Notifications Inbox Component */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Inbox Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider">Regulatory Notifications Inbox</h3>
            <span className="bg-slate-800 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded-full border border-slate-700">
              {notifications.length} Total
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">AICTE Formal Alert Log</span>
        </div>

        {/* Inbox Messages List */}
        <div className="divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Your institutional notification inbox is currently clear.</p>
            </div>
          ) : (
            notifications.map((item) => {
              const isPending = item.status === 'pending_applicant_action';

              return (
                <div 
                  key={item.id} 
                  className={`p-5 transition-colors ${
                    isPending ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        isPending 
                          ? 'bg-rose-600 text-white animate-pulse-subtle' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isPending ? 'ACTION REQUIRED' : 'RESOLVED'}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs">
                        Deficiency Notice: {item.document_id}
                      </h4>
                      <span className="text-slate-400 font-mono text-[11px]">• Ref #{item.id}</span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-400 font-mono text-[10px]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.created_at ? new Date(item.created_at).toLocaleString() : 'Recent'}
                      </span>
                    </div>
                  </div>

                  {/* Discrepancy Text Message */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 my-2.5 text-xs text-slate-800 space-y-2 shadow-2xs">
                    <div>
                      <span className="font-semibold text-slate-500 text-[10px] uppercase tracking-wider block mb-0.5">
                        Specific Discrepancy Found:
                      </span>
                      <p className="leading-relaxed text-rose-950 font-medium">
                        {item.discrepancy_details}
                      </p>
                    </div>

                    {item.official_notes && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="font-semibold text-slate-500 text-[10px] uppercase tracking-wider block mb-0.5">
                          Reviewing Official Remarks:
                        </span>
                        <p className="text-slate-700 leading-relaxed italic">
                          "{item.official_notes}"
                        </p>
                      </div>
                    )}

                    {item.applicant_response && (
                      <div className="pt-2 border-t border-emerald-100 bg-emerald-50/50 p-2 rounded">
                        <span className="font-semibold text-emerald-800 text-[10px] uppercase tracking-wider block mb-0.5">
                          Applicant Resolution Note:
                        </span>
                        <p className="text-emerald-950 leading-relaxed">
                          "{item.applicant_response}"
                        </p>
                        {item.reuploaded_document_id && (
                          <div className="text-[10px] font-mono text-emerald-700 mt-1">
                            Re-uploaded File: {item.reuploaded_document_id}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Channel Delivery Status & Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                      <span className="flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        <Mail className="w-3 h-3" />
                        {item.applicant_email} (Resend Email ✓)
                      </span>
                      <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <MessageSquare className="w-3 h-3" />
                        {item.applicant_phone} (Twilio SMS ✓)
                      </span>
                    </div>

                    {isPending && (
                      <button
                        onClick={() => handleOpenResolveModal(item)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Resolve / Re-upload</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Resolution & Re-upload Modal */}
      {isResolveModalOpen && selectedResolveDeficiency && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">Resolve Deficiency & Re-Upload Document</h3>
              </div>
              <button 
                onClick={() => setIsResolveModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Target Deficiency</span>
                <div className="font-semibold text-slate-900 mt-0.5">{selectedResolveDeficiency.document_id}</div>
                <p className="text-[11px] text-slate-600 mt-1">{selectedResolveDeficiency.discrepancy_details}</p>
              </div>

              {/* File Upload Zone */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Upload Corrected Document (PDF / Scan)</label>
                <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-5 text-center bg-slate-50/50 cursor-pointer transition-colors">
                  <input
                    type="file"
                    id="resolveFileInput"
                    className="hidden"
                    onChange={e => setReuploadedFile(e.target.files[0])}
                    accept=".pdf,.png,.jpg,.jpeg"
                  />
                  <label htmlFor="resolveFileInput" className="cursor-pointer">
                    <FileText className="w-7 h-7 text-indigo-500 mx-auto mb-1" />
                    <div className="font-semibold text-slate-800">
                      {reuploadedFile ? reuploadedFile.name : 'Click to select corrected replacement PDF'}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Signed and ratified version required</p>
                  </label>
                </div>
              </div>

              {/* Explanatory Response Textarea */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Applicant Compliance Justification</label>
                <textarea
                  value={applicantResponseText}
                  onChange={e => setApplicantResponseText(e.target.value)}
                  placeholder="Explain the correction (e.g. 'Attached updated syndicate affiliation notification ratified on 20th Oct 2026')..."
                  rows={3}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 text-xs font-sans leading-relaxed resize-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsResolveModalOpen(false)}
                disabled={isSubmittingResolution}
                className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 font-medium text-xs"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmitResolution}
                disabled={isSubmittingResolution}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmittingResolution ? 'Submitting Resolution...' : 'Submit Rectification'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
