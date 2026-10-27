import React, { useState, useEffect } from 'react';
import { 
  Building, ShieldCheck, Lock, User, Key, RefreshCw, 
  ArrowRight, CheckCircle2, Shield, AlertTriangle, Eye, EyeOff,
  Sparkles, ExternalLink, HelpCircle, Phone, Mail, FileCheck,
  Search, Globe, MapPin, Check, X
} from 'lucide-react';
import SearchableTypedDropdown from './SearchableTypedDropdown';

const INSTITUTION_PRESET_OPTIONS = [
  { value: "National Institute of Science & Polytechnic", label: "National Institute of Science & Polytechnic (Mumbai)", group: "Government & Autonomous", badge: "PID: 1-789123456" },
  { value: "Government Polytechnic Diglipur", label: "Government Polytechnic Diglipur (Andamans)", group: "Government & Autonomous", badge: "Govt Polytechnic" },
  { value: "Dr. B.R. Ambedkar Institute of Technology", label: "Dr. B.R. Ambedkar Institute of Technology (Port Blair)", group: "Government & Autonomous", badge: "Autonomous" },
  { value: "Central Institute of Petrochemicals Engineering and Technology", label: "Central Institute of Petrochemicals Engineering (CIPET)", group: "Government & Autonomous", badge: "Central Govt" },
  { value: "Government Polytechnic Chodavaram", label: "Government Polytechnic Chodavaram (Visakhapatnam)", group: "Government & Autonomous", badge: "Govt Polytechnic" },
  { value: "Government Polytechnic Bethamcherla", label: "Government Polytechnic Bethamcherla (Kurnool)", group: "Government & Autonomous", badge: "Govt Polytechnic" },
  { value: "University College of Engineering Narasaraopet", label: "University College of Engineering Narasaraopet", group: "Government & Autonomous", badge: "State Univ" },
  { value: "Government First Grade College of Engineering", label: "Government First Grade College of Engineering", group: "Government & Autonomous", badge: "Govt College" },
  { value: "Tech Engineering College", label: "Tech Engineering College (Chennai)", group: "Technical Institutes", badge: "PID: 1-456789123" },
  { value: "St. Xavier College of Engineering & Research", label: "St. Xavier College of Engineering & Research (Bengaluru)", group: "Technical Institutes", badge: "PID: 1-932148123" },
  { value: "Andhra Engineering College", label: "Andhra Engineering College (Nellore)", group: "Technical Institutes", badge: "Private-Self Financed" },
  { value: "DNR College of Engineering & Technology", label: "DNR College of Engineering & Technology (Bhimavaram)", group: "Technical Institutes", badge: "Private-Self Financed" },
  { value: "Kallam Haranadhareddy Institute of Technology", label: "Kallam Haranadhareddy Institute of Technology (Guntur)", group: "Technical Institutes", badge: "Private-Self Financed" },
  { value: "Sri Venkateswara College of Engineering", label: "Sri Venkateswara College of Engineering (Kadapa)", group: "Technical Institutes", badge: "Private-Self Financed" },
  { value: "Annamacharya Institute of Technology and Sciences", label: "Annamacharya Institute of Technology and Sciences (Rajampet)", group: "Technical Institutes", badge: "Autonomous" },
  { value: "Newton's Institute of Science & Technology", label: "Newton's Institute of Science & Technology (Macherla)", group: "Technical Institutes", badge: "Private-Self Financed" },
  { value: "Tadipatri Engineering College", label: "Tadipatri Engineering College (Anantapur)", group: "Technical Institutes", badge: "Private-Self Financed" },
  { value: "Nadimpalli Satyanarayana Raju Institute of Technology", label: "Nadimpalli Satyanarayana Raju Institute of Technology", group: "Technical Institutes", badge: "Private-Self Financed" },
  { value: "R.M.K. Engineering College", label: "R.M.K. Engineering College (Thiruvallur)", group: "Technical Institutes", badge: "Autonomous (Anna Univ)" },
  { value: "R.M.K. College of Engineering and Technology", label: "R.M.K. College of Engineering and Technology (Puduvoyal)", group: "Technical Institutes", badge: "Affiliated" },
  { value: "National Institute of Advanced Technology", label: "National Institute of Advanced Technology (Proposed AY 2026-27)", group: "Proposed New Campus", badge: "New Campus" },
  { value: "Indian Institute of Artificial Intelligence & Robotics", label: "Indian Institute of Artificial Intelligence & Robotics (Proposed)", group: "Proposed New Campus", badge: "New Campus" },
  { value: "Apex Institute of Technology & Management", label: "Apex Institute of Technology & Management (Kanpur)", group: "Proposed New Campus", badge: "New Campus" },
  { value: "Global Institute of Emerging Technologies", label: "Global Institute of Emerging Technologies (Proposed)", group: "Proposed New Campus", badge: "New Campus" }
];

const REGIONAL_JURISDICTION_OPTIONS = [
  { value: "Southern Region (Chennai)", label: "Southern Region (Chennai) - TN, Pondicherry, AN Islands", badge: "SRO" },
  { value: "South-Western Region (Bengaluru)", label: "South-Western Region (Bengaluru) - Karnataka, Kerala, Lakshadweep", badge: "SWRO" },
  { value: "Northern Region (Kanpur)", label: "Northern Region (Kanpur) - UP, Uttarakhand", badge: "NRO" },
  { value: "Western Region (Mumbai)", label: "Western Region (Mumbai) - Maharashtra, Goa, Daman & Diu", badge: "WRO" },
  { value: "Eastern Region (Kolkata)", label: "Eastern Region (Kolkata) - WB, Bihar, Jharkhand, Odisha, NE States", badge: "ERO" },
  { value: "North-Western Region (Chandigarh)", label: "North-Western Region (Chandigarh) - Punjab, Haryana, HP, J&K, Ladakh", badge: "NWRO" },
  { value: "Central Region (Bhopal)", label: "Central Region (Bhopal) - MP, Chhattisgarh, Gujarat", badge: "CRO" }
];

export const SecureLoginPage = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  
  // Login Form States — start empty; placeholders show eg: hints
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('K7M9P');
  const [showPassword, setShowPassword] = useState(false);
  const [require2FA, setRequire2FA] = useState(false); // Starts UNTICKED by default
  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // 2FA OTP Modal Verification States
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpValue, setOtpValue] = useState('849201');
  const [pendingTargetPreset, setPendingTargetPreset] = useState(null);

  // National Colleges Directory Live Search State
  const [collegeSearchQuery, setCollegeSearchQuery] = useState('');
  const [collegeSearchResults, setCollegeSearchResults] = useState([]);
  const [isSearchingColleges, setIsSearchingColleges] = useState(false);
  const [totalDatasetCount, setTotalDatasetCount] = useState(39268);

  // Search colleges from National Directory (39,268 dataset)
  useEffect(() => {
    if (!collegeSearchQuery.trim()) {
      setCollegeSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingColleges(true);
      try {
        const res = await fetch(`/api/institutions?query=${encodeURIComponent(collegeSearchQuery.trim())}&limit=5`);
        const data = await res.json();
        if (data.success) {
          // Strictly deduplicate to guarantee 100% unique institutions (no duplicates or repeated names)
          const seen = new Set();
          const clean = [];
          for (const col of data.data || []) {
            const id = (col.aicte_id || '').trim();
            const nameNorm = (col.institute_name || '').trim().toLowerCase().replace(/[\s\.\,\-]+/g, ' ');
            const key = id || nameNorm;
            if (!seen.has(key)) {
              seen.add(key);
              clean.push(col);
            }
          }
          setCollegeSearchResults(clean);
          if (data.total) setTotalDatasetCount(data.total);
        }
      } catch (err) {
        console.warn("Failed to search colleges from national dataset:", err);
      } finally {
        setIsSearchingColleges(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [collegeSearchQuery]);

  // Authenticate as any college from 39,268 National Directory
  const handleSelectCollege = (college) => {
    const cleanId = (college.aicte_id || '1-' + Math.floor(100000000 + Math.random() * 900000000)).replace(/[^0-9]/g, '').slice(-4);
    setIsAuthenticating(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsAuthenticating(false);
      onLoginSuccess({
        institutionName: college.institute_name,
        permanentId: college.aicte_id,
        region: college.district ? `${college.district} Jurisdiction` : "National AICTE Region",
        district: college.district,
        address: college.address,
        institutionType: college.institution_type,
        isMinority: college.minority === 'Y',
        isWomenOnly: college.women === 'Y',
        applicantEmail: `registrar@${(college.institute_name || 'college').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15)}.edu.in`,
        applicantPhone: "+91 98401 23456",
        principalName: `Dr. Head of Institute (${college.district || 'AICTE'})`
      });
    }, 400);
  };

  // Registration Form States — all start empty; placeholders show eg: hints
  const [regTrustName, setRegTrustName] = useState('');
  const [regCollegeName, setRegCollegeName] = useState('');
  const [customCollegeName, setCustomCollegeName] = useState('');
  const [regRegion, setRegRegion] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Handle dropdown / typed selection for College Name — just store the value, no auto-fill
  const handleRegisterCollegeChange = (val) => {
    setRegCollegeName(val);
  };

  // Refresh dynamic captcha
  const handleRefreshCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
  };

  // Quick Demo Login Handler
  const handleQuickLogin = (presetKey) => {
    setIsAuthenticating(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsAuthenticating(false);
      if (presetKey === 'st_xavier' || presetKey === 'rmk') {
        onLoginSuccess({
          institutionName: "R.M.K. Engineering College",
          permanentId: "1-932148123",
          region: "Southern Region (Chennai)",
          affiliatingUniversity: "Anna University, Chennai",
          applicantEmail: "principal@rmkec.ac.in",
          applicantPhone: "+91 98401 23456",
          principalName: "Dr. K. A. Mohamed Junaid, Ph.D."
        });
      } else if (presetKey === 'tech_eng') {
        onLoginSuccess({
          institutionName: "Tech Engineering College",
          permanentId: "1-456789123",
          region: "Southern Region (Chennai)",
          affiliatingUniversity: "Anna University, Chennai",
          applicantEmail: "principal@techengineering.edu.in",
          applicantPhone: "+91 94441 98765",
          principalName: "Dr. K. Vijayakumar, Ph.D."
        });
      } else if (presetKey === 'national_inst') {
        onLoginSuccess({
          institutionName: "National Institute of Science & Polytechnic",
          permanentId: "1-789123456",
          region: "Western Region (Mumbai)",
          affiliatingUniversity: "Maharashtra State Board of Technical Education (MSBTE)",
          applicantEmail: "director@nationalpoly.edu.in",
          applicantPhone: "+91 98220 11223",
          principalName: "Dr. Ramesh P. Patil, Ph.D."
        });
      }
    }, 600);
  };

  // Regular Form Login
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (captchaInput.toUpperCase() !== captchaCode) {
      setErrorMsg('Invalid Security Captcha code. Please try again.');
      handleRefreshCaptcha();
      return;
    }

    let targetPreset = 'st_xavier';
    if (identifier.includes('789123456') || identifier.toLowerCase().includes('national')) {
      targetPreset = 'national_inst';
    } else if (identifier.includes('456789123') || identifier.toLowerCase().includes('tech')) {
      targetPreset = 'tech_eng';
    }

    if (require2FA) {
      // 2FA was ticked by user: trigger simulated OTP verification modal
      setPendingTargetPreset(targetPreset);
      setShowOTPModal(true);
    } else {
      // 2FA unticked: proceed with standard direct authentication
      setIsAuthenticating(true);
      setTimeout(() => {
        setIsAuthenticating(false);
        handleQuickLogin(targetPreset);
      }, 700);
    }
  };

  // New Registration Submit
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setIsAuthenticating(true);

    const finalCollegeName = regCollegeName || customCollegeName || "Proposed Technical Campus";
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newAppId = `APP-2026-AICTE-${randomSuffix}`;
    const newPid = `1-${Math.floor(100000000 + Math.random() * 900000000)}`;

    setTimeout(() => {
      setIsAuthenticating(false);
      onLoginSuccess({
        institutionName: finalCollegeName || "National Technical Campus",
        permanentId: newPid,
        region: regRegion,
        affiliatingUniversity: "State Technological University",
        applicantEmail: regEmail || "admin@newcampus.edu.in",
        applicantPhone: regPhone || "+91 98765 43210",
        principalName: "Head of Institution"
      });
    }, 900);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-between text-white font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top AICTE Tricolor Flag Bar */}
      <div className="gov-tricolor-bar w-full" />

      {/* Main Container */}
      <div className="w-full mx-auto px-6 lg:px-10 flex-1 flex flex-col justify-center">
        {/* Header Branding */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center gap-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md mb-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase font-mono">
              Ministry of Education • Council for Technical Education
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            AICTE Institutional Approval Web Portal
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Authorized Single Sign-On (SSO) for Technical Institutions, Universities & Colleges applying for Annual Extension of Approval (EoA) 2026-27.
          </p>
        </div>

        {/* Center Grid: Secure Login Card & Info Rail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
          {/* Left Column: Security Credentials & Quick Demo Access */}
          <div className="lg:col-span-5 space-y-4">
            {/* Quick Demo Access Box */}
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-amber-300">
                  Instant Demo Login Presets
                </h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Click below to authenticate immediately into registered institutions:
              </p>

              <div className="space-y-2.5">
                {/* Preset 1 */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('st_xavier')}
                  disabled={isAuthenticating}
                  className="w-full text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/60 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                      R.M.K. Engineering College
                    </span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                      PID: 1-932148123
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                    <span>Unique ID: APP-2026-AICTE-1084</span>
                  </div>
                </button>

                {/* Preset 2 */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('tech_eng')}
                  disabled={isAuthenticating}
                  className="w-full text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/60 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors">
                      Tech Engineering College
                    </span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono font-bold">
                      PID: 1-456789123
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                    <span>Unique ID: APP-2026-AICTE-1081</span>
                  </div>
                </button>

                {/* Preset 3: National Institute */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('national_inst')}
                  disabled={isAuthenticating}
                  className="w-full text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/60 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors">
                      National Institute of Science & Polytechnic
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                      PID: 1-789123456
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between font-mono">
                    <span>Unique ID: APP-2026-AICTE-1083</span>
                    <span className="text-[10px] text-emerald-400 font-sans font-semibold">Clean Verified (600 Intake)</span>
                  </div>
                </button>
              </div>
            </div>

            {/* National AICTE Directory Search Card (39,268 Indian Colleges) */}
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-300">
                    Find Your College ({totalDatasetCount ? totalDatasetCount.toLocaleString() : '12,746'} Institutions)
                  </h3>
                </div>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  AY 2026-27
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-snug">
                Search any approved institution across India to authenticate and file AICTE approval:
              </p>

              {/* Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={collegeSearchQuery}
                  onChange={(e) => setCollegeSearchQuery(e.target.value)}
                  placeholder="e.g. Diglipur, Polytechnic, Xavier, Delhi..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                {isSearchingColleges && (
                  <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>

              {/* Live Search Results Dropdown / Cards */}
              {collegeSearchResults.length > 0 && (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {collegeSearchResults.map((col, idx) => (
                    <button
                      key={`${col.aicte_id || col.institute_name}-${idx}`}
                      type="button"
                      onClick={() => handleSelectCollege(col)}
                      className="w-full text-left p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-indigo-400 transition-all cursor-pointer group"
                    >
                      <div className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {col.institute_name}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          <span>{col.district || 'Pan-India'}</span>
                        </span>
                        <span className="text-amber-400 font-bold">{col.aicte_id}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Security Assurance Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Shield className="w-4 h-4" />
                <span>Certified End-to-End Encryption</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Submissions are cryptographically signed with SHA-256 ledger timestamps and synced live with the AICTE Central Scrutiny Engine on port 8000/5050.
              </p>
            </div>
          </div>

          {/* Right Column: Secure Login / Registration Form */}
          <div className="lg:col-span-7 bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
            {/* Form Mode Selector Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl mb-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'login' 
                    ? 'bg-white text-slate-950 font-bold shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In (Existing Institution)</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'register' 
                    ? 'bg-white text-slate-950 font-bold shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Register New Institution</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: Sign In Form */}
            {authMode === 'login' ? (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    AICTE Permanent Institute ID (PID) / Registered Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="eg: 1-932148123  or  registrar@yourcollege.edu.in"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Security Password / Master PIN *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      id="security-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="eg: your institution master PIN / password"
                      className="w-full pl-9 pr-11 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer focus:outline-hidden select-none"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-amber-600 transition-transform hover:scale-110" />
                      ) : (
                        <Eye className="w-4 h-4 hover:scale-110 transition-transform" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Dynamic Captcha */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Security Verification Captcha *
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="bg-slate-900 text-amber-300 font-mono font-extrabold text-sm px-4 py-2 rounded-xl tracking-widest select-none border border-slate-800">
                      {captchaCode}
                    </div>
                    <button
                      type="button"
                      onClick={handleRefreshCaptcha}
                      className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
                      title="Generate new Captcha"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      required
                      placeholder="Enter 5-character code"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      className="flex-1 py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 uppercase font-mono tracking-wider font-bold"
                      maxLength={5}
                    />
                  </div>
                </div>

                {/* 2FA Option Checkbox */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div 
                    onClick={() => setRequire2FA(!require2FA)}
                    className="flex items-center gap-2.5 cursor-pointer select-none group"
                    title={require2FA ? "Click to disable 2FA" : "Click to enable 2FA"}
                  >
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={require2FA}
                      onClick={(e) => {
                        e.stopPropagation();
                        setRequire2FA(!require2FA);
                      }}
                      className={`w-4 h-4 rounded-md flex items-center justify-center transition-all cursor-pointer border ${
                        require2FA 
                          ? 'bg-amber-600 border-amber-600 text-white shadow-xs' 
                          : 'bg-white border-slate-300 group-hover:border-slate-400'
                      }`}
                    >
                      {require2FA && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <span className="text-slate-600 group-hover:text-slate-900 transition-colors font-medium">
                      Simulate 2-Factor Authentication (OTP verified)
                    </span>
                  </div>

                  <a href="#help" className="text-amber-700 hover:underline font-semibold text-[11px]">
                    Forgot PIN?
                  </a>
                </div>

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isAuthenticating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Institutional Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Institutional Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* TAB 2: Register New Institution Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <SearchableTypedDropdown
                    label="Proposed Technical Institution Name"
                    required
                    value={regCollegeName}
                    onChange={(val) => handleRegisterCollegeChange(val)}
                    options={INSTITUTION_PRESET_OPTIONS}
                    placeholder="Search by name, select from directory, or type custom college name..."
                    helperText="Select from AICTE directory, type to search, or freely type your own custom institution name."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sponsoring Society / Educational Trust Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={regTrustName}
                    onChange={(e) => setRegTrustName(e.target.value)}
                    placeholder="eg: National Educational & Charitable Foundation"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <SearchableTypedDropdown
                      label="Regional Jurisdiction"
                      required
                      value={regRegion}
                      onChange={(val) => setRegRegion(val)}
                      options={REGIONAL_JURISDICTION_OPTIONS}
                      placeholder="Select or type regional office..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Official Contact Mobile *
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="eg: +91 98765 43210"
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Head of Institute / Registrar Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="eg: registrar@yourcollege.edu.in"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isAuthenticating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Generating Unique ID & Registering...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Generate Unique ID & Open Application</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950/80 border-t border-slate-800 text-slate-400 py-4 text-xs text-center">
        <div className="w-full mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 All India Council for Technical Education (AICTE), New Delhi.</span>
          <span className="font-mono text-[11px] text-slate-500">
            Secure 256-Bit Gateway • SIH26261 Multi-Modal Trust Engine
          </span>
        </div>
      </footer>
      {/* 2FA OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">2-Factor Authentication</h3>
                  <p className="text-[11px] text-slate-500">Security verification required</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowOTPModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 space-y-1">
              <div className="font-semibold flex items-center justify-between">
                <span>OTP dispatched to Registered Mobile</span>
                <span className="bg-amber-200 text-amber-900 font-mono px-1.5 py-0.5 rounded text-[10px] font-bold">Demo: 849201</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Please enter the 6-digit one-time password below to authenticate your institutional session.
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              setShowOTPModal(false);
              setIsAuthenticating(true);
              setTimeout(() => {
                setIsAuthenticating(false);
                handleQuickLogin(pendingTargetPreset || 'st_xavier');
              }, 400);
            }} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  6-Digit Verification Code *
                </label>
                <input 
                  type="text" 
                  maxLength={6} 
                  required 
                  value={otpValue} 
                  onChange={(e) => setOtpValue(e.target.value)} 
                  className="w-full text-center text-lg font-mono font-bold tracking-widest py-2 px-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-slate-50 text-slate-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOTPModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Verify & Sign In</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
