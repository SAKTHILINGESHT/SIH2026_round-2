import React, { useState, useEffect, useRef } from 'react';
import { SecureLoginPage } from './components/SecureLoginPage';
import { ApplicantHeader } from './components/ApplicantHeader';
import { ApplyApprovalForm } from './components/ApplyApprovalForm';
import { DeficiencyAlertBanner } from './components/DeficiencyAlertBanner';
import { NotificationsInbox } from './components/NotificationsInbox';
import { ApplicationStatusCard } from './components/ApplicationStatusCard';
import { ResolveReuploadModal } from './components/ResolveReuploadModal';
import { EoaCertificateModal } from './components/EoaCertificateModal';
import { InstitutionalHomeDashboard } from './components/InstitutionalHomeDashboard';
import { 
  Building, ShieldCheck, CheckCircle2, AlertTriangle, 
  RefreshCw, ExternalLink, HelpCircle, Phone, Mail, FileText, Send, Radio
} from 'lucide-react';

export function App() {
  // Authentication Session (null = Show Secure Login Screen)
  const [userSession, setUserSession] = useState(null);
  const [isCertOpen, setIsCertOpen] = useState(false);

  const [applications, setApplications] = useState([]);
  const [collegeApplications, setCollegeApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [startNewStreamSignal, setStartNewStreamSignal] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Real-time synchronization tracker
  const [lastSyncSecondsAgo, setLastSyncSecondsAgo] = useState(0);
  const prevNotifCountRef = useRef(0);
  const [realtimeAlertToast, setRealtimeAlertToast] = useState(null);

  // Active Navigation Tab: 'home' | 'apply' | 'status' | 'messages'
  const [activeTab, setActiveTab] = useState('home');

  // Resolve / Re-upload Modal state
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [activeDeficiencyForResolve, setActiveDeficiencyForResolve] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch applications from Express Backend (scoped for applicant portal)
  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications?portal=applicant');
      const data = await res.json();
      if (data.success && data.data) {
        setApplications(data.data);
        if (userSession) {
          const matches = data.data.filter(a => 
            (userSession.permanentId && a.permanentId === userSession.permanentId) ||
            (userSession.institutionName && a.institutionName?.trim().toLowerCase() === userSession.institutionName?.trim().toLowerCase()) ||
            (userSession.appId && a.appId === userSession.appId)
          );
          setCollegeApplications(matches);
          if (matches.length > 0) {
            setSelectedApp(prev => {
              if (!prev) return matches[0];
              const found = matches.find(a => a.appId === prev.appId);
              return found || matches[0];
            });
          } else {
            // Once the officer deletes the application, immediately reset selectedApp to null
            // so no residual data (old ID, submission date, intake, documents) remains!
            setSelectedApp(null);
          }
        }
      }
    } catch (err) {
      console.warn("Could not fetch applications list:", err);
    }
  };

  // Real-Time Fetch deficiency notifications from FastAPI Backend
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/deficiencies/notifications');
      const data = await res.json();
      if (data.success && data.data) {
        const newNotifs = data.data;

        // REAL-TIME INTERCEPTION: Detect newly dispatched deficiency
        if (prevNotifCountRef.current > 0 && newNotifs.length > prevNotifCountRef.current) {
          const latestAlert = newNotifs[0];
          // Only alert if notification is for an active application belonging to this institution
          const currentAppIds = collegeApplications.map(a => a.appId).filter(Boolean);
          if (selectedApp?.appId && !currentAppIds.includes(selectedApp.appId)) {
            currentAppIds.push(selectedApp.appId);
          }

          if (currentAppIds.includes(latestAlert.application_id)) {
            setRealtimeAlertToast({
              title: "🚨 REAL-TIME SCRUTINY ALERT RECEIVED",
              docId: latestAlert.document_id,
              details: latestAlert.discrepancy_details,
              timestamp: new Date().toLocaleTimeString()
            });

            // Play subtle browser notification sound if available
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.value = 587.33; // D5
              gain.gain.setValueAtTime(0.1, ctx.currentTime);
              osc.start();
              osc.stop(ctx.currentTime + 0.25);
            } catch (e) {
              // Audio context not allowed or not supported
            }

            setTimeout(() => {
              setRealtimeAlertToast(null);
            }, 7000);
          }
        }

        prevNotifCountRef.current = newNotifs.length;
        setNotifications(newNotifs);
        setLastSyncSecondsAgo(0);
      }
    } catch (err) {
      console.warn("Could not fetch deficiency notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Login Success Handler: Land on general home overview page
  const handleLoginSuccess = (session) => {
    setUserSession(session);
    setSelectedApp(null); // Clean state - fetchApplications binds active app if present on server
    setActiveTab('home');
    setToastMessage(`Secure Authentication Verified: Welcome, ${session.institutionName}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Logout Handler
  const handleLogout = () => {
    setUserSession(null);
    setSelectedApp(null);
    setCollegeApplications([]);
    setToastMessage("Session Terminated. Signed out of AICTE Portal.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    fetchApplications();
    fetchNotifications();

    // REAL-TIME ENGINE: Fast-poll notifications & applications every 2.5 seconds
    const pollInterval = setInterval(() => {
      fetchNotifications();
      fetchApplications();
    }, 2500);

    // Live Sync seconds ticker
    const timerInterval = setInterval(() => {
      setLastSyncSecondsAgo(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(timerInterval);
    };
  }, [userSession?.permanentId, userSession?.institutionName]);

  // Application IDs currently belonging to this institution
  const activeAppIds = collegeApplications.map(a => a.appId).filter(Boolean);
  if (selectedApp?.appId && !activeAppIds.includes(selectedApp.appId)) {
    activeAppIds.push(selectedApp.appId);
  }

  // Strict institution & application notification scoping:
  // Requirement: Before college application is submitted or after officer deletion, NO officer messages are shown!
  const appNotifications = (activeAppIds.length > 0)
    ? notifications.filter(n => activeAppIds.includes(n.application_id))
    : [];

  // Strictly use institution-scoped notifications (NEVER fall back to global mock notifications!)
  const activeDisplayNotifications = appNotifications;
  const pendingDeficiencies = activeDisplayNotifications.filter(n => n.status === 'pending_applicant_action');

  const handleOpenResolve = (deficiency) => {
    setActiveDeficiencyForResolve(deficiency);
    setIsResolveModalOpen(true);
  };

  const handleResolutionSuccess = ({ deficiencyId, reuploadedDocId, message }) => {
    // Immediate submission without any 2-minute scrutiny modal in applicant portal!
    fetchNotifications();
    fetchApplications();
    setActiveTab('status');
    setToastMessage(`Replacement document (${reuploadedDocId}) successfully submitted to Officer Cockpit for scrutiny!`);
    setTimeout(() => setToastMessage(null), 6000);
  };

  const handleApplicationSubmitSuccess = (newApp) => {
    fetchApplications();
    setSelectedApp(newApp);
    setActiveTab('status');
    setToastMessage(`Application for ${newApp.institutionName} (${newApp.appId}) successfully submitted and transmitted to Officer Scrutiny Cockpit!`);
    setTimeout(() => setToastMessage(null), 6000);
  };

  // SEQUENTIAL STREAM POLICY (AICTE Regulation):
  // An applicant institution can apply for all streams, but sequentially:
  // The current active stream must be completely approved by officer before applying for the next stream.
  const canApplyNextStream = collegeApplications.length === 0 || collegeApplications.every(a =>
    a.overallStatus === 'approved' || 
    Boolean(a.eoaCertificate)
  );

  const activePendingStream = collegeApplications.find(a =>
    a.overallStatus !== 'approved' && 
    !a.eoaCertificate
  );

  const handleSelectApp = (app) => {
    if (!app) return;
    setSelectedApp(app);
  };

  const handleStartNextStream = () => {
    if (!canApplyNextStream) {
      setToastMessage(`Sequential Rule: Complete verification for ${activePendingStream?.category || 'active stream'} first!`);
      setTimeout(() => setToastMessage(null), 5000);
      return;
    }
    setActiveTab('apply');
    setStartNewStreamSignal(prev => prev + 1);
  };

  // IF NOT AUTHENTICATED: Show Secure Login Screen
  if (!userSession) {
    return (
      <SecureLoginPage onLoginSuccess={handleLoginSuccess} />
    );
  }

  // IF AUTHENTICATED: Show Clean Institutional Approval Cockpit
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Real-time Alert Toast (Fired when officer dispatches notice) */}
      {realtimeAlertToast && (
        <div className="fixed top-20 right-6 z-50 bg-rose-700 text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3 text-xs max-w-md animate-in slide-in-from-top-4 border-2 border-rose-400">
          <div className="p-2 bg-rose-800 rounded-xl shrink-0 mt-0.5">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="font-extrabold text-sm tracking-wide text-rose-100 flex items-center justify-between">
              <span>{realtimeAlertToast.title}</span>
              <span className="font-mono text-[10px] text-rose-200">{realtimeAlertToast.timestamp}</span>
            </div>
            <p className="font-bold text-white">
              Document: {realtimeAlertToast.docId}
            </p>
            <p className="text-rose-100 text-[11px] leading-snug">
              {realtimeAlertToast.details}
            </p>
            <button
              onClick={() => {
                setActiveTab('messages');
                setRealtimeAlertToast(null);
              }}
              className="mt-2 bg-white text-rose-800 font-bold px-3 py-1 rounded-lg hover:bg-rose-50 transition-colors text-[11px]"
            >
              Open & Resolve Notice →
            </button>
          </div>
        </div>
      )}

      {/* Standard Success Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-4 border border-emerald-400">
          <div className="p-1 bg-emerald-700 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Applicant Portal Header - Clean, No Duplicates, Multi-Stream Aware */}
      <ApplicantHeader
        userSession={selectedApp || userSession}
        collegeApplications={collegeApplications}
        selectedApp={selectedApp}
        canApplyNextStream={canApplyNextStream}
        onSelectApp={handleSelectApp}
        onStartNextStream={handleStartNextStream}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        pendingCount={pendingDeficiencies.length}
        totalMessagesCount={activeDisplayNotifications.length}
        onLogout={handleLogout}
        onViewCertificate={() => setIsCertOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Prominent Red / Amber Deficiency Alert Banner (Appears on all views if officer has flagged an issue) */}
        <DeficiencyAlertBanner
          deficiencies={activeDisplayNotifications}
          onResolveClick={(def) => {
            setActiveTab('messages');
            handleOpenResolve(def);
          }}
        />

        {/* TAB 0: Institutional Overview - Application Tracker & Officer Communications */}
        {activeTab === 'home' && (
          <InstitutionalHomeDashboard
            userSession={selectedApp || userSession}
            applications={applications}
            collegeApplications={collegeApplications}
            selectedApp={selectedApp}
            canApplyNextStream={canApplyNextStream}
            activePendingStream={activePendingStream}
            onSelectApp={handleSelectApp}
            onStartNextStream={handleStartNextStream}
            notifications={activeDisplayNotifications}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onViewCertificate={() => setIsCertOpen(true)}
            onResolveDeficiency={handleOpenResolve}
          />
        )}

        {/* TAB 1: Apply for AICTE Approval Form */}
        {activeTab === 'apply' && (
          <ApplyApprovalForm
            userSession={selectedApp || userSession}
            collegeApplications={collegeApplications}
            canApplyNextStream={canApplyNextStream}
            activePendingStream={activePendingStream}
            startNewStreamSignal={startNewStreamSignal}
            onSubmitSuccess={handleApplicationSubmitSuccess}
            onSwitchToMessages={() => setActiveTab('messages')}
          />
        )}

        {/* TAB 2: Application Status & Documents */}
        {activeTab === 'status' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ApplicationStatusCard
                application={selectedApp || userSession}
                collegeApplications={collegeApplications}
                selectedApp={selectedApp}
                canApplyNextStream={canApplyNextStream}
                activePendingStream={activePendingStream}
                onSelectApp={handleSelectApp}
                onStartNextStream={handleStartNextStream}
                pendingDeficienciesCount={pendingDeficiencies.length}
                onNavigateToApply={() => setActiveTab('apply')}
                onNavigateToMessages={() => setActiveTab('messages')}
              />

              {/* Action Card: Modify Parameters or Start Application */}
              {(() => {
                const isSub = Boolean(
                  (selectedApp || userSession)?.submissionDate &&
                  (selectedApp || userSession)?.overallStatus &&
                  (selectedApp || userSession)?.overallStatus !== 'not_submitted'
                );

                return (
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-400" />
                        <span>
                          {isSub 
                            ? "Need to modify application parameters or re-upload documents?" 
                            : "Ready to file for AICTE Extension of Approval (EoA) 2026-27?"}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {isSub 
                          ? "You can update institutional land, infrastructure, and statutory documents in the application form."
                          : "Fill out the 5-step guided form with your land, infrastructure, faculty, and mandatory statutory PDFs."}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('apply')}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-colors shrink-0 cursor-pointer"
                    >
                      {isSub ? "Edit Application Form" : "Start Application Form →"}
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Right Column: Helpdesk & Officer Scrutiny Status */}
            <div className="space-y-6">
              {/* Officer Communication Summary */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>Officer Scrutiny Communication</span>
                  </h4>
                  {pendingDeficiencies.length > 0 && (
                    <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                      {pendingDeficiencies.length} Action Needed
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Review formal discrepancy memos, statutory notices, and compliance remarks dispatched in real-time by the AICTE Regional Scrutiny Officer.
                </p>

                <button
                  onClick={() => setActiveTab('messages')}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Open Officer Messages ({activeDisplayNotifications.length})</span>
                </button>
              </div>

              {/* AICTE Helpdesk Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-xs space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  <span>AICTE Approval Helpdesk</span>
                </h4>
                <p className="text-slate-500 leading-relaxed">
                  For assistance on Extension of Approval (EoA) guidelines or submitting compliance responses:
                </p>
                <div className="space-y-1.5 pt-1 text-slate-700 font-mono text-[11px]">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>+91 11 2958 1000 / 1050</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>helpdesk.approval@aicte-india.org</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Officer Messages & Discrepancies (Requirement 3: Anomaly & Approval Notifications) */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <NotificationsInbox
              notifications={(() => {
                const current = selectedApp || userSession;
                const isCouncilApproved = current?.overallStatus === 'approved' || 
                  Boolean(current?.eoaCertificate);

                const approvalNotif = isCouncilApproved ? [{
                  id: `appr-decree-${current?.appId || '1084'}`,
                  application_id: current?.appId || 'APP-2026-AICTE-1084',
                  document_id: current?.eoaCertificate?.orderNumber || `F.No. AICTE/AB/SWR/2026-27/${current?.appId || '1084'}`,
                  type: 'approval_granted',
                  status: 'approved',
                  discrepancy_details: `AICTE Extension of Approval (EoA) 2026-27 officially granted under Member Secretary Seal. All statutory compliance documents verified genuine with 0 regulatory discrepancies. Sanctioned Intake: ${current?.appliedIntake || 540} Seats. Order Number: ${current?.eoaCertificate?.orderNumber || `F.No. AICTE/AB/SWR/2026-27/${current?.appId || '1084'}`}.`,
                  applicant_email: current?.applicantEmail || 'principal@rmkec.ac.in',
                  applicant_phone: current?.applicantPhone || '+91 98401 23456',
                  created_at: current?.eoaCertificate?.approvalDate ? new Date(current.eoaCertificate.approvalDate).toISOString() : new Date().toISOString()
                }] : [];

                return [...approvalNotif, ...activeDisplayNotifications.filter(n => n.type !== 'approval_granted')];
              })()}
              loading={loading}
              onRefresh={fetchNotifications}
              onResolveClick={handleOpenResolve}
              onViewCertificate={() => setIsCertOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Resolve / Re-upload Modal */}
      <ResolveReuploadModal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        deficiency={activeDeficiencyForResolve}
        onResolutionSuccess={handleResolutionSuccess}
      />

      {/* Official AICTE Extension of Approval (EoA) Certificate Modal */}
      <EoaCertificateModal
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        application={selectedApp || userSession}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs text-center">
        <div className="w-full mx-auto px-6">
          <p>© 2026 All India Council for Technical Education (AICTE). Nelson Mandela Marg, Vasant Kunj, New Delhi-110070.</p>
          <p className="text-slate-500 mt-1">Multi-Modal Trust Engine • Prototype SIH26261 • Applicant Institution Gateway</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
