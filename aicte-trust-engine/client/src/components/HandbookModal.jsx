import React, { useState, useEffect } from 'react';
import { X, BookOpen, ShieldAlert, CheckCircle, Search, ExternalLink } from 'lucide-react';

/**
 * AICTE Approval Process Handbook (APH) Regulatory Rules Browser
 */
export const HandbookModal = ({ isOpen, onClose }) => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/rules/handbook')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setRules(data.data.rules || []);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredRules = rules.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.ruleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm">AICTE Approval Process Handbook (APH) 2026-27</h3>
              <p className="text-[11px] text-slate-400">Configurable Regulatory Ruleset Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search APH rules by ID (e.g. APH-RULE-201), category, keyword..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>
        </div>

        {/* Rules List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {filteredRules.map(rule => (
            <div key={rule.ruleId} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {rule.ruleId}
                  </span>
                  <span className="text-slate-500 font-medium">{rule.category}</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                  rule.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {rule.severity}
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm mb-1">{rule.title}</h4>
              <p className="text-slate-600 leading-relaxed mb-3">{rule.description}</p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-[11px] font-mono text-slate-500">
                <span>Action on Non-Compliance: <strong className="text-rose-600">{rule.actionOnFailure}</strong></span>
                <span>AICTE Bureau: Regulation (New Delhi)</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors"
          >
            Close Ruleset
          </button>
        </div>
      </div>
    </div>
  );
};
