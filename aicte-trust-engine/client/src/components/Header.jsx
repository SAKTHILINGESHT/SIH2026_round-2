import React from 'react';
import { ShieldCheck, BookOpen, Upload, User } from 'lucide-react';

/**
 * Enterprise Navigation Header - AICTE Scrutiny Officer Cockpit
 * Official Government Portal (Port 3050)
 */
export const Header = ({ 
  currentView, 
  onNavigateHome, 
  onOpenUpload, 
  onOpenHandbook 
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      {/* AICTE National Tricolor Accent Bar */}
      <div className="gov-tricolor-bar w-full" />

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: AICTE Branding & System Title */}
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          {/* Emblem Icon */}
          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold group-hover:border-indigo-500 transition-colors">
            <ShieldCheck className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                AICTE Scrutiny Officer Cockpit
              </span>
              <span className="bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                PORTAL: 3050
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Government Automated Scrutiny & Regulatory Fraud Prevention System
            </p>
          </div>
        </div>

        {/* Right: Quick Actions & Officer Profile */}
        <div className="flex items-center gap-2.5 text-xs">
          {/* APH Handbook Rules Button (Officer Portal Only) */}
          <button
            onClick={onOpenHandbook}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition-colors cursor-pointer font-semibold shadow-xs"
            title="Browse AICTE Approval Process Handbook (APH) Regulatory Ruleset"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>APH Rules</span>
          </button>

          {/* Upload New Document */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ingest Document</span>
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Officer Profile Badge */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-2.5 py-1 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden md:block text-left text-[11px]">
              <div className="text-slate-200 font-semibold leading-tight">
                Dr. A. K. Sundaram
              </div>
              <div className="text-slate-400 text-[9px] leading-tight font-mono">
                Scrutiny Officer (RO-South)
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
