import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GlobalDashboard } from './components/GlobalDashboard';
import { VerificationView } from './components/VerificationView';
import { NationalDirectoryView } from './components/NationalDirectoryView';
import { UploadModal } from './components/UploadModal';
import { HandbookModal } from './components/HandbookModal';
import { ScrutinyReportModal } from './components/ScrutinyReportModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FileText, Globe, Sparkles } from 'lucide-react';

export function App() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active view tab when in dashboard mode: 'queue' (active scrutiny cases) | 'directory' (39,268 national colleges)
  const [dashboardTab, setDashboardTab] = useState('queue');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isHandbookOpen, setIsHandbookOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Fetch applications from server with live sync
  const fetchApplications = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/applications`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setApplications(data.data);
        if (data.stats) setStats(data.stats);

        setSelectedApplication(prev => {
          // 1. If an application is already open in the Verification View,
          // keep it synchronized with the latest live server updates
          if (prev) {
            const fresh = data.data.find(a => a.appId === prev.appId);
            return fresh ? { ...prev, ...fresh } : prev;
          }

          // 2. Otherwise, ALWAYS display the Home Page Dashboard first!
          // The officer will choose which application to scrutinize.
          return null;
        });
      }
    } catch (err) {
      console.warn("Could not connect to backend API, using client fallback dataset:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear any previous cached selection so the Home Page is always the first view
    localStorage.removeItem('aicte_officer_selected_appId');
    sessionStorage.removeItem('aicte_officer_view_dashboard');

    // Support optional deep link query: ?appId=...
    const params = new URLSearchParams(window.location.search);
    const requestedAppId = params.get('appId');
    if (requestedAppId) {
      fetch(`/api/applications/${requestedAppId}`)
        .then(r => r.json())
        .then(d => {
          if (d && d.success && d.data) {
            setSelectedApplication(d.data);
          }
        })
        .catch(() => {});
    }

    fetchApplications();
    const interval = setInterval(fetchApplications, 2500);
    return () => clearInterval(interval);
  }, []);

  // Handle Official Decision Submission
  const handleDecisionSubmit = async ({ decision, remarks, officerName }) => {
    if (!selectedApplication) return;

    try {
      const res = await fetch(`/api/decisions/${selectedApplication.appId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, remarks, officerName })
      });
      const data = await res.json();
      if (data.success) {
        const isApprovedNow = data.newStatus === 'approved';
        const updatedApp = {
          ...selectedApplication,
          ...(data.application || {}),
          overallStatus: data.newStatus,
          riskScore: isApprovedNow ? 0 : (data.application?.riskScore ?? selectedApplication.riskScore),
          eoaCertificate: data.eoaCertificate || selectedApplication.eoaCertificate,
          documents: data.application?.documents || (selectedApplication.documents?.map(d => isApprovedNow ? { ...d, status: 'verified', flags: [] } : d)),
          auditTimeline: [...selectedApplication.auditTimeline, data.auditEntry]
        };
        setSelectedApplication(updatedApp);
        setApplications(prev => prev.map(a => a.appId === updatedApp.appId ? updatedApp : a));
      }
    } catch (err) {
      console.error("Failed to commit decision:", err);
    }
  };

  // Handle Return to Dashboard Queue
  // Handle Return to Dashboard Queue
  const handleBackToDashboard = () => {
    setSelectedApplication(null);
  };

  // Handle New Uploaded Application
  const handleUploadSuccess = (newApp) => {
    setApplications(prev => [newApp, ...prev]);
    setSelectedApplication(newApp);
  };

  // Safe Application Selection for Official Scrutiny
  const handleSelectApplication = (app) => {
    setSelectedApplication(app);
  };

  // Initiate Scrutiny on any institution from the 39,268 National Directory
  const handleScrutinizeDirectoryCollege = (scrutinyApp) => {
    setApplications(prev => [scrutinyApp, ...prev.filter(a => a.appId !== scrutinyApp.appId)]);
    setSelectedApplication(scrutinyApp);
  };

  // Delete Application
  const handleDeleteApplication = async (appId) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setApplications(prev => prev.filter(a => a.appId !== appId));
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to delete application:", err);
      // Fallback local update
      setApplications(prev => prev.filter(a => a.appId !== appId));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header - AICTE Scrutiny Officer View */}
      <Header
        currentView={selectedApplication ? 'verification' : 'dashboard'}
        onNavigateHome={handleBackToDashboard}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenHandbook={() => setIsHandbookOpen(true)}
      />

      {/* Main Body View */}
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {loading ? (
          <div className="h-96 flex items-center justify-center text-slate-500 text-xs">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>Initializing Multi-Modal Trust Engine...</span>
            </div>
          </div>
        ) : selectedApplication ? (
          <ErrorBoundary onNavigateHome={handleBackToDashboard}>
            <VerificationView
              application={selectedApplication}
              onBackToDashboard={handleBackToDashboard}
              onDecisionSubmit={handleDecisionSubmit}
              onOpenReportModal={() => setIsReportOpen(true)}
              onDeleteApplication={async (appId) => {
                await handleDeleteApplication(appId);
                handleBackToDashboard();
              }}
              onApplicationUpdated={(updated) => {
                if (updated && updated.appId) {
                  setSelectedApplication(prev => prev && prev.appId === updated.appId ? { ...prev, ...updated } : updated);
                  setApplications(prev => prev.map(a => a.appId === updated.appId ? { ...a, ...updated } : a));
                }
              }}
            />
          </ErrorBoundary>
        ) : (
          <div className="space-y-6">
            {/* Top View Selector: Scrutiny Applications Queue vs National Directory */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-2 rounded-2xl shadow-xs">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                {/* Tab 1: Active Scrutiny Applications Queue */}
                <button
                  onClick={() => setDashboardTab('queue')}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                    dashboardTab === 'queue'
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Scrutiny Queue</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    dashboardTab === 'queue' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {applications.length}
                  </span>
                </button>

                {/* Tab 2: AICTE National Master Directory (39,268 Colleges) */}
                <button
                  onClick={() => setDashboardTab('directory')}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                    dashboardTab === 'directory'
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe className="w-4 h-4 text-amber-300" />
                  <span>National Master Directory</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    dashboardTab === 'directory' ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-800'
                  }`}>
                    12,746 Colleges
                  </span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 px-3 hidden md:flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>AICTE Trust Engine • Pan-India Scrutiny System</span>
              </div>
            </div>

            {/* Render Selected View */}
            {dashboardTab === 'queue' ? (
              <GlobalDashboard
                applications={applications}
                stats={stats}
                onSelectApplication={handleSelectApplication}
                onDeleteApplication={handleDeleteApplication}
                onOpenUploadModal={() => setIsUploadOpen(true)}
                onOpenHandbookModal={() => setIsHandbookOpen(true)}
                onSwitchToDirectory={() => setDashboardTab('directory')}
              />
            ) : (
              <NationalDirectoryView
                onScrutinizeCollege={handleScrutinizeDirectoryCollege}
              />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      <HandbookModal
        isOpen={isHandbookOpen}
        onClose={() => setIsHandbookOpen(false)}
      />

      <ScrutinyReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        application={selectedApplication}
      />
    </div>
  );
}

export default App;
