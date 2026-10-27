import React, { useState } from 'react';
import { 
  Search, Filter, ShieldCheck, AlertOctagon, AlertTriangle, 
  CheckCircle2, ArrowRight, Upload, BookOpen, Clock, Activity, 
  FileCheck, Shield, ChevronRight, Trash2, Globe
} from 'lucide-react';

/**
 * Global Application Dashboard
 * Implements Blueprint Specification:
 * "Global Application Dashboard: A clean data table listing institutions. Columns: App ID, Institution Name,
 * Submission Date, AI Status (Pill badges), Action button."
 */
export const GlobalDashboard = ({ 
  applications, 
  stats, 
  onSelectApplication, 
  onDeleteApplication,
  onOpenUploadModal, 
  onOpenHandbookModal,
  onSwitchToDirectory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredApps = (applications || []).filter(app => {
    const matchesSearch = 
      app.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.appId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.region?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      selectedFilter === 'all' || 
      app.overallStatus === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ingested */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Total EoA Applications</span>
            <FileCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.total || applications.length}</div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1 font-mono">
            <span>Academic Cycle: 2026-27</span>
          </div>
        </div>

        {/* Anomaly Detected (Rose-500) */}
        <div className="bg-white border border-rose-200/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Anomalies Flagged</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600">
            {stats?.anomalyDetected || applications.filter(a => a.overallStatus === 'anomaly_detected').length}
          </div>
          <div className="mt-2 text-xs text-rose-600/80 font-mono">
            Forensic ELA & CV Tamper Triggers
          </div>
        </div>

        {/* Review Needed (Amber-500) */}
        <div className="bg-white border border-amber-200/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Review Needed</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {stats?.reviewNeeded || applications.filter(a => a.overallStatus === 'review_needed').length}
          </div>
          <div className="mt-2 text-xs text-amber-700/80 font-mono">
            Conditional / Registry Discrepancies
          </div>
        </div>

        {/* Verified (Emerald-500) */}
        <div className="bg-white border border-emerald-200/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Clean Verified</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {stats?.verified || applications.filter(a => a.overallStatus === 'verified').length}
          </div>
          <div className="mt-2 text-xs text-emerald-700/80 font-mono">
            DigiLocker & APH Compliant
          </div>
        </div>
      </div>

      {/* Active AI Forensic / Re-Audit Live Alert Banner */}
      {applications?.some(a => a.overallStatus === 'reaudit_in_progress') && (
        <div className="bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-purple-900/10 border border-purple-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs text-purple-950 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping" />
            <span>
              <strong>Automated AI Re-Audit Active (~30s):</strong> Corrected compliance document ingested for{' '}
              <span className="font-mono font-bold text-purple-900">
                {applications.find(a => a.overallStatus === 'reaudit_in_progress')?.appId}
              </span>{' '}
              ({applications.find(a => a.overallStatus === 'reaudit_in_progress')?.institutionName}).
            </span>
          </div>
          <button
            onClick={() => {
              const activeApp = applications.find(a => a.overallStatus === 'reaudit_in_progress');
              if (activeApp) onSelectApplication(activeApp);
            }}
            className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto shadow-xs flex items-center gap-1.5"
          >
            <span>Inspect Live Re-Audit</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Table Action Controls Header */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Institution Name, App ID (e.g. 1081), or Region..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>

            {[
              { id: 'all', label: 'All Cases' },
              { id: 'anomaly_detected', label: 'Anomaly Detected', color: 'rose' },
              { id: 'review_needed', label: 'Review Needed', color: 'amber' },
              { id: 'verified', label: 'Verified', color: 'emerald' }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setSelectedFilter(pill.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedFilter === pill.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {pill.label}
              </button>
            ))}

            {/* National Directory Shortcut Button */}
            {onSwitchToDirectory && (
              <button
                onClick={onSwitchToDirectory}
                className="ml-auto md:ml-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                title="Search across verified AICTE-approved colleges in India"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Colleges Directory</span>
              </button>
            )}

            {/* APH Handbook Rules Button (Officer Portal Only) */}
            {onOpenHandbookModal && (
              <button
                onClick={onOpenHandbookModal}
                className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                title="Browse AICTE Approval Process Handbook (APH) 2026-27 Regulatory Rules"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>APH Rules</span>
              </button>
            )}

            {/* Ingest Live Doc Button */}
            <button
              onClick={onOpenUploadModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Document
            </button>
          </div>
        </div>

        {/* Clean Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">App ID</th>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">Region / Office</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Submission Date</th>
                <th className="py-3 px-4 text-center">AI Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No institutional applications matched your search.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr 
                    key={app.appId} 
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectApplication(app)}
                  >
                    {/* App ID */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {app.appId}
                    </td>

                    {/* Institution Name */}
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{app.institutionName}</span>
                        {app.appId === 'APP-2026-AICTE-1081' && (
                          <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.2 rounded font-sans font-medium">
                            Blueprint Sample (DOC-2026-881)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal">
                        Intake: {app.intakeApplied} seats • {app.documents?.length || 1} Document(s) attached
                      </div>
                    </td>

                    {/* Region */}
                    <td className="py-3 px-4 text-slate-600">
                      {app.region}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-slate-700">
                      {app.category}
                    </td>

                    {/* Submission Date */}
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {app.submissionDate}
                    </td>

                    {/* AI Status (Pill badges) */}
                    <td className="py-3 px-4 text-center">
                      {app.overallStatus === 'ai_validation_in_progress' ? (
                        <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-300 text-indigo-700 px-2.5 py-1 rounded-full font-bold text-[11px] animate-pulse shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
                          AI Forensic Analysis (~30s)
                        </span>
                      ) : app.overallStatus === 'reaudit_in_progress' ? (
                        <span className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-300 text-purple-700 px-2.5 py-1 rounded-full font-bold text-[11px] animate-pulse shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
                          AI Re-Audit Active (~30s)
                        </span>
                      ) : app.documents?.some(d => d.complianceSubmission?.status === 'pending_rescan' || d.status === 'pending_rescan') ? (
                        <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-300 text-indigo-700 px-2.5 py-1 rounded-full font-bold text-[11px] animate-pulse shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                          Compliance Received (Re-Scan Ready)
                        </span>
                      ) : app.overallStatus === 'anomaly_detected' ? (
                        <span className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-1 rounded-full font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          Anomaly Detected
                        </span>
                      ) : app.overallStatus === 'review_needed' ? (
                        <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Review Needed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Verified
                        </span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectApplication(app);
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1 transition-colors shadow-xs"
                        >
                          <span>Scrutinize</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>

                        {onDeleteApplication && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete application ${app.appId} (${app.institutionName})?`)) {
                                onDeleteApplication(app.appId);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title={`Delete application ${app.appId}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Showing {filteredApps.length} of {applications.length} applications</span>
          <span className="font-mono text-[11px]">AICTE Regulation Bureau • Decision Support System</span>
        </div>
      </div>
    </div>
  );
};
