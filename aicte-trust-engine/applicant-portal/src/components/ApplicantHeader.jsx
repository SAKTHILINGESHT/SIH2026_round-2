import React from 'react';
import { 
  Building, User, Bell, Award,
  FileText, CheckCircle2, AlertTriangle, LogOut 
} from 'lucide-react';

export const ApplicantHeader = ({ 
  userSession, 
  collegeApplications = [],
  selectedApp,
  canApplyNextStream = true,
  onSelectApp,
  onStartNextStream,
  activeTab, 
  onTabChange, 
  pendingCount, 
  totalMessagesCount, 
  onLogout,
  onViewCertificate
}) => {
  const current = selectedApp || userSession;
  const isApproved = current?.overallStatus === 'approved' || 
    Boolean(current?.eoaCertificate);
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      {/* AICTE National Tricolor Accent Bar */}
      <div className="gov-tricolor-bar w-full" />

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: AICTE Institutional Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shrink-0">
            <Building className="w-5 h-5 text-amber-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                AICTE Institutional Portal
              </span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                AY 2026-27
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Annual Approval & Officer Regulatory Communications
            </p>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {/* Tab 0: Overview / Home */}
          <button
            onClick={() => onTabChange('home')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'home'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          {/* Tab 1: Apply for Approval */}
          <button
            onClick={() => onTabChange('apply')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'apply'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Apply for Approval</span>
          </button>

          {/* Tab 2: My Application Status */}
          <button
            onClick={() => onTabChange('status')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'status'
                ? 'bg-slate-800 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Application Status</span>
            <span className="md:hidden">Status</span>
          </button>

          {/* Tab 3: Officer Messages & Deficiencies */}
          <button
            onClick={() => onTabChange('messages')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 relative cursor-pointer ${
              activeTab === 'messages'
                ? 'bg-rose-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Officer Messages</span>
            {pendingCount > 0 ? (
              <span className="bg-rose-400 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full animate-pulse ml-0.5">
                {pendingCount}
              </span>
            ) : totalMessagesCount > 0 ? (
              <span className="bg-slate-700 text-slate-300 text-[10px] font-mono px-1.5 py-0.2 rounded-full ml-0.5">
                {totalMessagesCount}
              </span>
            ) : null}
          </button>
        </div>

        {/* Right: Session Badge & Logout */}
        <div className="flex items-center gap-2.5">
          {/* Certificate Action Button (When Approved) */}
          {isApproved && (
            <button
              onClick={onViewCertificate}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer transition-all ring-1 ring-emerald-400 hover:scale-105"
              title="View Official AICTE Extension of Approval (EoA) Certificate"
            >
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden md:inline">View EoA Certificate</span>
              <span className="md:hidden">Certificate</span>
            </button>
          )}

          {/* Multi-Stream Switcher in Header */}
          {collegeApplications.length > 1 && (
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs">
              <span className="text-[10px] text-amber-400 font-mono font-bold">Stream:</span>
              <select
                value={selectedApp?.appId || userSession?.appId}
                onChange={(e) => {
                  const match = collegeApplications.find(a => a.appId === e.target.value);
                  if (match && onSelectApp) onSelectApp(match);
                }}
                className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer max-w-[130px] truncate"
              >
                {collegeApplications.map((app, idx) => (
                  <option key={app.appId} value={app.appId} className="bg-slate-900 text-white">
                    S{idx + 1}: {app.category?.slice(0, 18)}...
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* User Session Profile */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-2.5 py-1 rounded-lg text-xs">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-[10px]">
              PID
            </div>
            <div className="hidden sm:block text-left text-[11px]">
              <div className="text-slate-200 font-semibold leading-tight truncate max-w-[150px]">
                {userSession?.institutionName || 'R.M.K. Engineering College'}
              </div>
              <div className="text-slate-400 text-[9px] leading-tight font-mono">
                PID: {userSession?.permanentId || '1-932148123'}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Sign Out / Switch Institution Account"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
