import React, { useState, useEffect } from 'react';
import { 
  Building, Search, Filter, ShieldCheck, MapPin, School, 
  Sparkles, ChevronLeft, ChevronRight, CheckCircle2, RefreshCw, 
  ArrowRight, Users, Compass, Globe
} from 'lucide-react';

export const NationalDirectoryView = ({ onScrutinizeCollege }) => {
  const [colleges, setColleges] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isScrutinizing, setIsScrutinizing] = useState(null);

  // Fetch National Directory Stats
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/institutions/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      console.warn("Could not fetch institution stats:", err);
    }
  };

  // Fetch Paginated / Filtered Colleges
  const fetchColleges = async (p = 1, q = searchQuery, type = selectedType) => {
    setLoading(true);
    try {
      let url = `/api/institutions?page=${p}&limit=15`;
      if (q.trim()) url += `&query=${encodeURIComponent(q.trim())}`;
      if (type && type !== 'all') url += `&type=${encodeURIComponent(type)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setColleges(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalRecords(data.total || 0);
        setPage(data.page || 1);
      }
    } catch (err) {
      console.warn("Could not fetch institutions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchColleges(1, '', 'all');
  }, []);

  // Debounced / Form submit search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchColleges(1, searchQuery, selectedType);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setPage(1);
    fetchColleges(1, searchQuery, type);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchColleges(newPage, searchQuery, selectedType);
  };

  const handleScrutinize = async (college) => {
    setIsScrutinizing(college.aicte_id);
    try {
      const res = await fetch(`/api/institutions/${college.aicte_id}/scrutinize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalType: "Extension of Approval (EoA) 2026-27",
          sanctionedIntake: college.institution_type?.includes('Government') ? 480 : 600
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        onScrutinizeCollege(data.data);
      }
    } catch (err) {
      console.error("Failed to initiate scrutiny:", err);
    } finally {
      setIsScrutinizing(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Summary Cards */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                Official Government Dataset
              </span>
              <span className="text-slate-400 text-xs font-mono">
                AY 2025-26 / 2026-27 Master
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1.5 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              <span>National AICTE Master Directory</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Centralized repository of verified unique AICTE-approved technical colleges, polytechnics, and universities across India. Initiate instantaneous AI-powered scrutiny audits for any institution.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                fetchColleges(1, '', 'all');
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* 4 Micro KPI Metric Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Total Unique Colleges</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
              {stats?.total ? stats.total.toLocaleString() : '12,746'}
            </div>
            <div className="text-[10px] text-emerald-400 font-medium mt-1">Deduplicated & Cleaned</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Districts Covered</div>
            <div className="text-2xl font-black text-indigo-400 font-mono mt-0.5">
              {stats?.uniqueDistricts || 628}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Pan-India territorial coverage</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Government & Aided</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
              {stats?.byType ? ((stats.byType['Government'] || 0) + (stats.byType['Govt aided'] || 0)).toLocaleString() : '10,011'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">State & Central institutions</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Private-Self Financing</div>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-0.5">
              {stats?.byType ? (stats.byType['Private-Self Financing'] || 0).toLocaleString() : '27,441'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Regulated trust & society colleges</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across verified colleges by Name, AICTE ID (1-...), District, Address..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors shrink-0 cursor-pointer shadow-xs"
            >
              Search
            </button>
          </form>

          {/* Type Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Type:
            </span>

            {[
              { id: 'all', label: 'All' },
              { id: 'Government', label: 'Government' },
              { id: 'Govt aided', label: 'Govt Aided' },
              { id: 'Private-Self Financing', label: 'Private' },
              { id: 'State Government University', label: 'State Univ' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTypeChange(tab.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedType === tab.id
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">AICTE Permanent ID</th>
                <th className="py-3 px-4">Institution Name & Campus Address</th>
                <th className="py-3 px-4">District / Region</th>
                <th className="py-3 px-4">Institution Type</th>
                <th className="py-3 px-4 text-center">Category Badges</th>
                <th className="py-3 px-4 text-right">Scrutiny Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>Querying AICTE National Master Directory (39,268 records)...</span>
                    </div>
                  </td>
                </tr>
              ) : colleges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No institutions matched your search filter "{searchQuery}".
                  </td>
                </tr>
              ) : (
                colleges.map((c) => (
                  <tr key={c.aicte_id} className="hover:bg-slate-50/80 transition-colors">
                    {/* AICTE ID */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-amber-500" />
                        <span>{c.aicte_id}</span>
                      </div>
                      {c.other_id && (
                        <div className="text-[10px] text-slate-400 font-normal">
                          Ref: {c.other_id}
                        </div>
                      )}
                    </td>

                    {/* Institution Name & Address */}
                    <td className="py-3 px-4 max-w-md">
                      <div className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                        {c.institute_name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5" title={c.address}>
                        {c.address || 'Address not listed'}
                      </div>
                    </td>

                    {/* District */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-semibold text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>{c.district || 'Pan-India'}</span>
                      </div>
                    </td>

                    {/* Institution Type */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                        c.institution_type?.toLowerCase().includes('government')
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : c.institution_type?.toLowerCase().includes('aided')
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {c.institution_type || 'Private'}
                      </span>
                    </td>

                    {/* Minority / Women Badges */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {c.women === 'Y' && (
                          <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.2 rounded" title="Women-Only Institution">
                            Women
                          </span>
                        )}
                        {c.minority === 'Y' && (
                          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.2 rounded" title="Minority Status">
                            Minority
                          </span>
                        )}
                        {c.women !== 'Y' && c.minority !== 'Y' && (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </div>
                    </td>

                    {/* Scrutiny Action */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleScrutinize(c)}
                        disabled={isScrutinizing === c.aicte_id}
                        className="bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 font-semibold text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ml-auto cursor-pointer disabled:opacity-50"
                        title="Load into AICTE Multi-Modal Trust Engine for automated scrutiny"
                      >
                        {isScrutinizing === c.aicte_id ? (
                          <>
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <span>Auditing...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500 group-hover:text-white" />
                            <span>Scrutinize Audit</span>
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{colleges.length}</strong> of <strong className="text-slate-800">{totalRecords.toLocaleString()}</strong> institutions
            {searchQuery && <span> matching "<span className="text-indigo-600 font-semibold">{searchQuery}</span>"</span>}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono">
              Page {page} of {totalPages.toLocaleString()}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
