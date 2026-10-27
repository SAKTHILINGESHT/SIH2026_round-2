import React, { useState } from 'react';
import { 
  Bell, Mail, MessageSquare, AlertTriangle, CheckCircle2, 
  Upload, Clock, FileText, ChevronRight, ShieldCheck, RefreshCw,
  Building, AlertOctagon, Award, ArrowRight
} from 'lucide-react';

export const NotificationsInbox = ({ 
  notifications, 
  loading, 
  onRefresh, 
  onResolveClick,
  onViewCertificate
}) => {
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'approvals' | 'resolved' | 'verified'

  const isApproval = (notif) => notif.type === 'approval_granted' || notif.status === 'approved';
  const isVerified = (status) => status === 're_audit_passed' || status === 'verified';
  const isAwaitingOfficer = (status) => status === 'resolved_by_applicant' || status === 'resolved';
  const isPendingAction = (status) => status === 'pending_applicant_action';

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'approvals') return isApproval(n);
    if (filter === 'pending') return isPendingAction(n.status);
    if (filter === 'resolved') return isAwaitingOfficer(n.status) && !isApproval(n);
    if (filter === 'verified') return isVerified(n.status) && !isApproval(n);
    return true;
  });

  const approvalCount = notifications.filter(n => isApproval(n)).length;
  const pendingCount = notifications.filter(n => isPendingAction(n.status)).length;
  const resolvedCount = notifications.filter(n => isAwaitingOfficer(n.status) && !isApproval(n)).length;
  const verifiedCount = notifications.filter(n => isVerified(n.status) && !isApproval(n)).length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Inbox Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Regulatory Scrutiny Communications (Deficiencies & Official Approval Decrees)</span>
              {pendingCount > 0 && (
                <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  {pendingCount} Action Required
                </span>
              )}
              {approvalCount > 0 && (
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-500" />
                  <span>{approvalCount} Approval Issued</span>
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              Official discrepancy memos dispatched by AICTE Scrutiny Officers and council Extension of Approval (EoA) decrees
            </p>
          </div>
        </div>

        {/* Filter Pills & Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                filter === 'all' 
                  ? 'bg-white text-slate-900 font-bold shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({notifications.length})
            </button>
            {approvalCount > 0 && (
              <button
                onClick={() => setFilter('approvals')}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  filter === 'approvals' 
                    ? 'bg-white text-emerald-800 font-bold shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Approvals ({approvalCount})</span>
              </button>
            )}
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                filter === 'pending' 
                  ? 'bg-white text-rose-700 font-bold shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${pendingCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`} />
              Action Required ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                filter === 'resolved' 
                  ? 'bg-white text-amber-800 font-bold shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Pending Review ({resolvedCount})</span>
            </button>
            {verifiedCount > 0 && (
              <button
                onClick={() => setFilter('verified')}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  filter === 'verified' 
                    ? 'bg-white text-emerald-800 font-bold shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Verified ({verifiedCount})</span>
              </button>
            )}
          </div>

          <button
            onClick={onRefresh}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh Notifications"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-slate-100">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Fetching latest discrepancy notices from AICTE Server...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold text-slate-700">No notifications in this category</p>
            <p className="text-xs text-slate-400 mt-1">
              All submitted documents are currently in good standing or awaiting officer review.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isAppr = isApproval(notif);

            if (isAppr) {
              return (
                <div
                  key={notif.id}
                  className="p-5 bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-amber-50/30 border-l-4 border-l-emerald-600 border-b border-slate-100 hover:bg-emerald-50/90 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2.5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl shadow-sm shrink-0 mt-0.5">
                        <Award className="w-6 h-6 text-amber-300" />
                      </div>

                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-extrabold px-3 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                            COUNCIL APPROVAL ORDER ISSUED
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded border border-emerald-300 shadow-2xs">
                            {notif.document_id}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            App: {notif.application_id}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 ml-auto font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{notif.created_at ? new Date(notif.created_at).toLocaleDateString() : 'Active'}</span>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs space-y-1.5 text-xs text-slate-800">
                          <div className="font-bold text-emerald-950 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Official AICTE Extension of Approval (EoA) AY 2026-27 Granted</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed">
                            {notif.discrepancy_details}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-indigo-500" />
                            Order Copy Dispatched to: <strong className="font-mono text-slate-700">{notif.applicant_email}</strong>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                            SMS Notice to: <strong className="font-mono text-slate-700">{notif.applicant_phone}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 sm:self-center">
                      <button
                        onClick={onViewCertificate}
                        className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer hover:scale-105 ring-2 ring-emerald-400/60"
                      >
                        <Award className="w-4 h-4 text-amber-300" />
                        <span>View Official EoA Certificate</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            const isPending = isPendingAction(notif.status);
            const isDone = isVerified(notif.status);
            const isAwaiting = isAwaitingOfficer(notif.status);

            return (
              <div
                key={notif.id}
                className={`p-4 sm:p-5 transition-colors ${
                  isPending 
                    ? 'bg-rose-50/40 hover:bg-rose-50/70' 
                    : isDone 
                    ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                    : 'hover:bg-slate-50/70'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  {/* Left: Indicator & Message Content */}
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isPending 
                        ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                        : isDone 
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {isPending ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-2 flex-1">
                      {/* Meta Tags */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          isPending 
                            ? 'bg-rose-600 text-white' 
                            : isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 text-slate-950 font-bold'
                        }`}>
                          {isPending ? 'ACTION REQUIRED' : isDone ? 'VERIFIED (RE-AUDIT PASSED)' : 'PENDING REVIEW'}
                        </span>

                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {notif.document_id}
                        </span>

                        <span className="font-mono text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                          App: {notif.application_id}
                        </span>

                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 ml-auto">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{notif.created_at ? new Date(notif.created_at).toLocaleString() : 'Recent'}</span>
                        </div>
                      </div>

                      {/* Full Text of the Deficiency Message */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs text-xs text-slate-800 leading-relaxed font-sans">
                        <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>Official Scrutiny Finding:</span>
                        </div>
                        <p className="text-slate-700 whitespace-pre-line">
                          {notif.discrepancy_details}
                        </p>
                      </div>

                      {/* Applicant Resolution Response */}
                      {notif.applicant_response && (
                        <div className={`p-3 rounded-xl border text-xs ${
                          isDone 
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                            : 'bg-amber-50/70 border-amber-200 text-amber-950'
                        }`}>
                          <div className="font-semibold flex items-center gap-1.5 text-slate-800 mb-0.5">
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                            )}
                            <span>Applicant Institution Response:</span>
                          </div>
                          <p className="italic">"{notif.applicant_response}"</p>
                          {notif.reuploaded_document_id && (
                            <div className="mt-1 font-mono text-[11px] font-semibold">
                              Re-uploaded Replacement Doc: <strong>{notif.reuploaded_document_id}</strong>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Re-audit Passed Notice */}
                      {isDone && (
                        <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2 font-medium">
                          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>AICTE Officer verified this document via AI Forensic Re-Scan. Compliance cleared!</span>
                        </div>
                      )}

                      {/* Delivery Audit Badges */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-indigo-500" />
                          Dispatched to: <strong className="font-mono text-slate-700">{notif.applicant_email}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                          SMS to: <strong className="font-mono text-slate-700">{notif.applicant_phone}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Resolve / Re-upload Button or Status */}
                  <div className="shrink-0 sm:self-center">
                    {isPending ? (
                      <button
                        onClick={() => onResolveClick(notif)}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Resolve / Re-upload</span>
                      </button>
                    ) : isDone ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-xl shadow-xs">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pending</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
