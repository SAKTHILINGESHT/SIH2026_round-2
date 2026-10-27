import React, { useState, useEffect } from 'react';
import { 
  Building, FileText, Upload, CheckCircle2, AlertTriangle, 
  Layers, Cpu, ShieldCheck, ArrowRight, ArrowLeft, HelpCircle, 
  Hash, Calendar, Users, Monitor, MapPin, Globe, Check, Award,
  CheckSquare, Trash2, Lock, AlertCircle, FileCheck, Plus,
  Briefcase, Clock, BookOpen
} from 'lucide-react';
import SearchableTypedDropdown from './SearchableTypedDropdown';

const UNIVERSITY_OPTIONS = [
  { value: "Anna University (Chennai)", label: "Anna University (Chennai)", badge: "State Tech Univ" },
  { value: "Visvesvaraya Technological University (VTU Belagavi)", label: "Visvesvaraya Technological University (VTU Belagavi)", badge: "State Tech Univ" },
  { value: "Maharashtra State Board of Technical Education (MSBTE)", label: "Maharashtra State Board of Technical Education (MSBTE)", badge: "Autonomous Board" },
  { value: "Dr. A.P.J. Abdul Kalam Technical University (AKTU Lucknow)", label: "Dr. A.P.J. Abdul Kalam Technical University (AKTU Lucknow)", badge: "State Tech Univ" },
  { value: "Jawaharlal Nehru Technological University (JNTU Hyderabad)", label: "Jawaharlal Nehru Technological University (JNTU Hyderabad)", badge: "State Tech Univ" },
  { value: "Jawaharlal Nehru Technological University (JNTU Kakinada)", label: "Jawaharlal Nehru Technological University (JNTU Kakinada)", badge: "State Tech Univ" },
  { value: "University of Mumbai (MU)", label: "University of Mumbai (MU)", badge: "State Univ" },
  { value: "Chhattisgarh Swami Vivekanand Technical University (CSVTU)", label: "Chhattisgarh Swami Vivekanand Technical University (CSVTU)", badge: "State Tech Univ" },
  { value: "Maulana Abul Kalam Azad University of Technology (MAKAUT)", label: "Maulana Abul Kalam Azad University of Technology (MAKAUT)", badge: "State Tech Univ" },
  { value: "Gujarat Technological University (GTU)", label: "Gujarat Technological University (GTU)", badge: "State Tech Univ" },
  { value: "Rajasthan Technical University (RTU)", label: "Rajasthan Technical University (RTU)", badge: "State Tech Univ" },
  { value: "APJ Abdul Kalam Technological University (KTU Kerala)", label: "APJ Abdul Kalam Technological University (KTU Kerala)", badge: "State Tech Univ" }
];

const REGIONAL_OFFICE_OPTIONS = [
  { value: "Southern Region (Chennai)", label: "Southern Region (Chennai) - Tamil Nadu, Pondicherry, AN Islands", badge: "SRO" },
  { value: "South-Western Region (Bengaluru)", label: "South-Western Region (Bengaluru) - Karnataka, Kerala, Lakshadweep", badge: "SWRO" },
  { value: "Northern Region (Kanpur)", label: "Northern Region (Kanpur) - Uttar Pradesh, Uttarakhand", badge: "NRO" },
  { value: "Western Region (Mumbai)", label: "Western Region (Mumbai) - Maharashtra, Goa, Daman & Diu", badge: "WRO" },
  { value: "Eastern Region (Kolkata)", label: "Eastern Region (Kolkata) - West Bengal, Bihar, Jharkhand, Odisha, NE States", badge: "ERO" },
  { value: "North-Western Region (Chandigarh)", label: "North-Western Region (Chandigarh) - Punjab, Haryana, HP, J&K, Ladakh", badge: "NWRO" },
  { value: "Central Region (Bhopal)", label: "Central Region (Bhopal) - Madhya Pradesh, Chhattisgarh, Gujarat", badge: "CRO" }
];

const DEGREE_BRANCH_OPTIONS = [
  { value: "B.Tech Computer Science & Engineering (180 Seats)", label: "B.Tech Computer Science & Engineering (CSE) - 180 Seats", badge: "Undergraduate" },
  { value: "B.Tech Artificial Intelligence & Machine Learning (120 Seats)", label: "B.Tech Artificial Intelligence & Machine Learning (AI&ML) - 120 Seats", badge: "Emerging Tech" },
  { value: "B.Tech Electronics & Communication Engineering (120 Seats)", label: "B.Tech Electronics & Communication Engineering (ECE) - 120 Seats", badge: "Undergraduate" },
  { value: "B.Tech Information Technology (120 Seats)", label: "B.Tech Information Technology (IT) - 120 Seats", badge: "Undergraduate" },
  { value: "B.Tech Mechanical Engineering (60 Seats)", label: "B.Tech Mechanical Engineering - 60 Seats", badge: "Undergraduate" },
  { value: "B.Tech Civil Engineering (60 Seats)", label: "B.Tech Civil Engineering - 60 Seats", badge: "Undergraduate" },
  { value: "B.Tech Data Science & Analytics (60 Seats)", label: "B.Tech Data Science & Analytics - 60 Seats", badge: "Emerging Tech" },
  { value: "B.Tech Electrical & Electronics Engineering (60 Seats)", label: "B.Tech Electrical & Electronics Engineering (EEE) - 60 Seats", badge: "Undergraduate" },
  { value: "Master of Business Administration (MBA - 120 Seats)", label: "Master of Business Administration (MBA) - 120 Seats", badge: "Postgraduate" },
  { value: "Master of Computer Applications (MCA - 60 Seats)", label: "Master of Computer Applications (MCA) - 60 Seats", badge: "Postgraduate" }
];

const APPROVAL_STREAM_DROPDOWN_OPTIONS = [
  { value: "Extension of Approval (EoA) 2026-27", label: "Extension of Approval (EoA) 2026-27", group: "Routine Renewal", badge: "APH Ch. I" },
  { value: "Increase in Intake / Additional Emerging Courses", label: "Increase in Intake / Additional Emerging Courses", group: "Capacity Expansion", badge: "APH Ch. II" },
  { value: "Introduction of Supernumerary Seats (FN / OCI / NRI / PMSSS)", label: "Introduction of Supernumerary Seats (FN / OCI / NRI / PMSSS)", group: "Global Intake Quota", badge: "APH Ch. III" },
  { value: "New Technical Institution Approval", label: "Setting Up New Technical Institution (Establishment)", group: "New Campus Setup", badge: "APH Ch. I" },
  { value: "Working Professionals / Flexible Timing Program", label: "Working Professionals / Flexible Timing Program", group: "Continuing Education", badge: "APH Ch. VII" },
  { value: "Foreign University Collaboration / Twinning", label: "Foreign University Collaboration / Twinning Program", group: "Global Tie-up", badge: "APH Ch. III" },
  { value: "Change of Site / Location / Trust", label: "Change of Site / Campus Relocation / Land Shifting", group: "Campus Restructuring", badge: "APH Ch. IV" },
  { value: "Conversion of Women's Institution to Co-Educational", label: "Conversion of Women's Institution to Co-Educational", group: "Campus Restructuring", badge: "APH Ch. V" }
];

/**
 * AICTE Approval Process Handbook (APH 2026-27)
 * Statutory Mandatory Documents Mapping by Approval Stream
 */
// Helper to make a clean pending-upload doc (no pre-filled file)
const pending = (base) => ({ ...base, fileName: null, fileSize: null, sha256: null, status: 'pending_upload' });

const STREAM_DOCUMENTS = {
  "Extension of Approval (EoA) 2026-27": [
    pending({ id: "doc-eoa-1", type: "University Affiliation Order", docId: "DOC-2026-885", requirement: "Mandatory", purpose: "Statutory proof of university academic concurrence & affiliation order for AY 2026-27." }),
    pending({ id: "doc-eoa-2", type: "Campus Land & Master Building Floor Plan", docId: "DOC-2026-882", requirement: "Mandatory", purpose: "Architectural blueprint showing sanctioned built-up area and carpet area compliance." }),
    pending({ id: "doc-eoa-3", type: "Fire Safety Department Clearance NOC", docId: "DOC-2026-884", requirement: "Mandatory", purpose: "Valid Fire & Emergency Services NOC issued by State Fire Department." }),
    pending({ id: "doc-eoa-4", type: "Statutory Anti-Ragging & EVC Affidavit", docId: "DOC-2026-886", requirement: "Mandatory", purpose: "Notarized affidavit on ₹100 stamp paper verifying anti-ragging & EVC compliance." }),
    pending({ id: "doc-eoa-5", type: "CAD & Computing Facilities Geotagged Photos", docId: "DOC-2026-883", requirement: "Mandatory", purpose: "Geotagged photos of central computing lab, licensed CAD software, and server setup." })
  ],

  "New Technical Institution Approval": [
    pending({ id: "doc-new-1", type: "Registered Land Title / 30-Year Lease Deed", docId: "DOC-2026-891", requirement: "Mandatory", purpose: "Registered sale deed / govt allotment / 30-year unencumbered lease with Sub-Registrar." }),
    pending({ id: "doc-new-2", type: "Municipal Approved Building Construction Plan", docId: "DOC-2026-892", requirement: "Mandatory", purpose: "Sanctioned building plan from Competent Urban/Town Planning Authority with area schedule." }),
    pending({ id: "doc-new-3", type: "State Directorate of Technical Education (DTE) NOC", docId: "DOC-2026-893", requirement: "Mandatory", purpose: "State Government clearance NOC for establishing a new technical institution." }),
    pending({ id: "doc-new-4", type: "Sponsoring Trust / Society Registration & By-laws", docId: "DOC-2026-894", requirement: "Mandatory", purpose: "Certificate of Registration under Societies / Trust Act and approved Memorandum of Association." }),
    pending({ id: "doc-new-5", type: "Structural Stability & Fire Safety Certificate", docId: "DOC-2026-895", requirement: "Mandatory", purpose: "Structural stability certificate by Chartered Structural Engineer & Fire Department NOC." })
  ],

  "Increase in Intake / Additional Emerging Courses": [
    pending({ id: "doc-intake-1", type: "Faculty Cadre & Ratio (1:20) Declaration", docId: "DOC-2026-901", requirement: "Mandatory", purpose: "Certified list of faculty meeting 1:20 teacher-to-student ratio and cadre ratio (1:2:6)." }),
    pending({ id: "doc-intake-2", type: "Specialized Laboratory & Equipment Audit Report", docId: "DOC-2026-902", requirement: "Mandatory", purpose: "Stock register & purchase invoices for specialized labs (AI/ML, Data Science, Cyber Security)." }),
    pending({ id: "doc-intake-3", type: "University Concurrence Letter for Additional Intake", docId: "DOC-2026-903", requirement: "Mandatory", purpose: "Affiliating University inspection clearance endorsing additional branch capacity." }),
    pending({ id: "doc-intake-4", type: "Audited Financial Balance Sheet (Latest FY)", docId: "DOC-2026-904", requirement: "Mandatory", purpose: "Audited statement of accounts certified by Chartered Accountant verifying financial reserves." })
  ],

  "Change of Site / Location / Trust": [
    pending({ id: "doc-site-1", type: "State Government Relocation NOC", docId: "DOC-2026-911", requirement: "Mandatory", purpose: "Formal NOC from State Government permitting change of institutional location." }),
    pending({ id: "doc-site-2", type: "New Campus Land Revenue Title & Cadastral Map", docId: "DOC-2026-912", requirement: "Mandatory", purpose: "Title deed & revenue survey map confirming contiguous land compliance at the proposed site." }),
    pending({ id: "doc-site-3", type: "Registrar of Societies Trust Restructuring Resolution", docId: "DOC-2026-913", requirement: "Mandatory", purpose: "Special resolution passed by Society/Trust board certified by the Registrar of Societies." }),
    pending({ id: "doc-site-4", type: "Town Planning Authority Land Use Clearance", docId: "DOC-2026-914", requirement: "Mandatory", purpose: "Zoning & land use conversion certificate from agricultural to educational use." })
  ],

  "Working Professionals / Flexible Timing Program": [
    pending({ id: "doc-wp-1", type: "Industry Practical Training & Apprenticeship MoU", docId: "DOC-2026-921", requirement: "Mandatory", purpose: "Formal bilateral agreement with industry partners for hands-on practical lab training & work-integrated learning." }),
    pending({ id: "doc-wp-2", type: "Flexible Shift Academic Schedule & Faculty Allocation", docId: "DOC-2026-922", requirement: "Mandatory", purpose: "Certified evening / weekend timetable confirming dedicated faculty workload without regular class overlap." }),
    pending({ id: "doc-wp-3", type: "Employer Sponsorship & Experience Verification Format", docId: "DOC-2026-923", requirement: "Mandatory", purpose: "Standardized employer No Objection Certificate and minimum 1-year industrial experience verification format." }),
    pending({ id: "doc-wp-4", type: "Blended Learning Infrastructure & LMS Readiness Audit", docId: "DOC-2026-924", requirement: "Mandatory", purpose: "Third-party server audit confirming Learning Management System (LMS) readiness for hybrid curriculum." })
  ],

  "Foreign University Collaboration / Twinning": [
    pending({ id: "doc-fu-1", type: "Bilateral Academic Agreement (MoU) with Foreign University", docId: "DOC-2026-931", requirement: "Mandatory", purpose: "Formal agreement with top 500 QS/THE ranked overseas university detailing joint degree & credit transfer." }),
    pending({ id: "doc-fu-2", type: "Association of Indian Universities (AIU) Equivalence Order", docId: "DOC-2026-932", requirement: "Mandatory", purpose: "AIU statutory equivalence certificate recognizing foreign degree eligibility and credit valuation in India." }),
    pending({ id: "doc-fu-3", type: "Joint Curriculum Mapping & Credit Harmonization Matrix", docId: "DOC-2026-933", requirement: "Mandatory", purpose: "Board of Studies joint syllabus mapping specifying 2+2 or 3+1 credit transfer equivalence." }),
    pending({ id: "doc-fu-4", type: "Ministry of External Affairs / Home Affairs Concurrence", docId: "DOC-2026-934", requirement: "Mandatory", purpose: "Government of India diplomatic and international student visa compliance clearance certificate." })
  ],

  "Supernumerary Seats (FN / OCI / NRI / PMSSS)": [
    pending({ id: "doc-sn-1", type: "International Student Dedicated Hostel & Security Audit", docId: "DOC-2026-941", requirement: "Mandatory", purpose: "Inspection certificate verifying separate secure residential facilities for international students." }),
    pending({ id: "doc-sn-2", type: "AICTE Supernumerary Quota Compliance Undertaking Affidavit", docId: "DOC-2026-942", requirement: "Mandatory", purpose: "Notarized affidavit on ₹100 stamp agreeing to 15% ceiling and statutory fee regulatory guidelines." }),
    pending({ id: "doc-sn-3", type: "Foreign Students Welfare Advisor & Liaison Cell Order", docId: "DOC-2026-943", requirement: "Mandatory", purpose: "Institutional office order establishing 24x7 international student grievance cell and faculty advisor." })
  ],

  "Conversion of Women's Institution to Co-Educational": [
    pending({ id: "doc-coed-1", type: "Sponsoring Trust Resolution for Co-Ed Conversion", docId: "DOC-2026-951", requirement: "Mandatory", purpose: "Unanimous governing body resolution approving transition from women's to co-educational campus." }),
    pending({ id: "doc-coed-2", type: "Campus Infrastructure Expansion & Restructuring Blueprint", docId: "DOC-2026-952", requirement: "Mandatory", purpose: "Sanctioned master plan showing separate boys/girls common rooms, washrooms, and hostel facilities." }),
    pending({ id: "doc-coed-3", type: "State Directorate of Technical Education Co-Ed NOC", docId: "DOC-2026-953", requirement: "Mandatory", purpose: "State Government formal concurrence NOC approving change of gender categorization for admissions." })
  ]
};

// Helper to clone stream documents
function getStreamDocuments(streamId) {
  if (!streamId) return [];
  const template = STREAM_DOCUMENTS[streamId] || STREAM_DOCUMENTS["Extension of Approval (EoA) 2026-27"];
  return JSON.parse(JSON.stringify(template));
}

export const ApplyApprovalForm = ({ 
  userSession, 
  collegeApplications = [],
  canApplyNextStream = true,
  activePendingStream = null,
  startNewStreamSignal = 0,
  onSubmitSuccess, 
  onSwitchToMessages 
}) => {
  // Specific Approval Source Categories (AICTE APH 2026-27)
  const APPROVAL_SOURCES = [
    {
      id: "Extension of Approval (EoA) 2026-27",
      title: "Extension of Approval (EoA) 2026-27",
      badge: "Annual Renewal",
      desc: "Annual renewal for existing technical institutions with ongoing degree / diploma programs.",
      icon: Building,
      docHighlight: "University Affiliation Letter + Building Safety NOC required"
    },
    {
      id: "New Technical Institution Approval",
      title: "New Technical Institution Setup",
      badge: "New Campus Setup",
      desc: "First-time approval to establish a new technical college / institute for Academic Year 2026-27.",
      icon: Award,
      docHighlight: "Master Land Deed + Municipal Building Completion Plan mandatory"
    },
    {
      id: "Increase in Intake / Additional Emerging Courses",
      title: "Increase in Intake / New Specialized Branch",
      badge: "Capacity Expansion",
      desc: "Adding new seats or introducing emerging branches (AI & ML, Cybersecurity, IoT, Data Science).",
      icon: Layers,
      docHighlight: "Additional CAD Labs & Faculty Cadre (1:20) compliance check"
    },
    {
      id: "Change of Site / Location / Trust",
      title: "Change of Site / Location / Governance",
      badge: "Statutory Amendment",
      desc: "Approval for campus relocation, trust restructuring, or institutional name modification.",
      icon: MapPin,
      docHighlight: "State Govt NOC + Registrar of Societies Resolution"
    },
    {
      id: "Working Professionals / Flexible Timing Program",
      title: "Degree / Diploma for Working Professionals",
      badge: "Continuing Education",
      desc: "AICTE-approved evening / weekend flexible shift programs for industry-employed professionals.",
      icon: Briefcase,
      docHighlight: "Industry Apprenticeship MoU + Flexible Shift Timetable & LMS Audit"
    },
    {
      id: "Foreign University Collaboration / Twinning",
      title: "Foreign University Twinning / Dual Degree",
      badge: "Global Tie-up",
      desc: "Joint academic degree or 2+2 / 3+1 credit transfer twinning with top-ranked foreign universities.",
      icon: Globe,
      docHighlight: "Bilateral Academic Agreement + AIU Degree Equivalence Certificate"
    },
    {
      id: "Supernumerary Seats (FN / OCI / NRI / PMSSS)",
      title: "Supernumerary Quota (FN / OCI / NRI & PMSSS)",
      badge: "Global Quota",
      desc: "Sanctioning 15% supernumerary intake for Foreign Nationals, OCI, Children of Gulf Workers & PMSSS.",
      icon: Users,
      docHighlight: "Dedicated International Hostel Audit + Supernumerary Undertaking"
    },
    {
      id: "Conversion of Women's Institution to Co-Educational",
      title: "Conversion of Women's College to Co-Ed",
      badge: "Campus Restructuring",
      desc: "Transitioning single-gender women's technical college into a full co-educational campus.",
      icon: ShieldCheck,
      docHighlight: "Expanded Amenities Blueprint + Trust Co-Ed Resolution"
    }
  ];

  // Check if this application has been formally submitted (locks editing unless user starts a fresh new stream application)
  const [forceNewApplication, setForceNewApplication] = useState(false);

  // Track all streams already applied for this institution
  const appliedStreamNames = collegeApplications.map(a => (a.category || a.approvalSource || "").trim().toLowerCase());

  // Enrich dropdown options so already completed streams are marked and cannot be duplicated
  const streamDropdownOptions = APPROVAL_STREAM_DROPDOWN_OPTIONS.map(opt => {
    const isAlreadyApplied = appliedStreamNames.includes(opt.value?.trim().toLowerCase());
    return {
      ...opt,
      disabled: isAlreadyApplied,
      badge: isAlreadyApplied ? "Applied & Verified ✓" : opt.badge,
      label: isAlreadyApplied ? `${opt.label} (Already Applied & Approved ✓)` : opt.label
    };
  });

  const isFormLocked = Boolean(
    !forceNewApplication &&
    userSession &&
    userSession.submissionDate &&
    userSession.overallStatus &&
    userSession.overallStatus !== 'not_submitted' &&
    userSession.overallStatus !== 'draft'
  );

  const isSubmitted = isFormLocked;

  // If application is already formally submitted and not forced new, use its submitted category; otherwise start EMPTY so applicant manually selects
  const initialStream = isFormLocked ? (userSession?.category || userSession?.approvalSource || "") : "";

  // Comprehensive Form State supporting Stream-Specific Parameters
  const [formData, setFormData] = useState({
    uniqueId: userSession?.appId || (userSession?.institutionName?.toLowerCase().includes('r.m.k') ? 'APP-2026-AICTE-1084' : `APP-2026-AICTE-${Math.floor(1000 + Math.random() * 9000)}`),
    institutionName: userSession?.institutionName || '',
    permanentId: userSession?.permanentId || '',
    approvalSource: initialStream, // Starts EMPTY for applicant to manually choose!
    region: userSession?.region || '',
    establishmentYear: '2008',
    minorityStatus: userSession?.isMinority ? 'Yes (Minority)' : 'Non-Minority',
    affiliatingUniversity: userSession?.affiliatingUniversity || '',
    trustName: userSession?.trustName || (userSession?.institutionName?.toLowerCase().includes('r.m.k') ? 'Lakshmikanthammal Educational Trust' : `${(userSession?.institutionName || 'Institutional').replace(/(College|Institute|Academy|of Engineering|and Technology)/gi, '').trim()} Educational Trust`),
    address: userSession?.address || (userSession?.institutionName?.toLowerCase().includes('r.m.k') ? 'RSM Nagar, Kavaraipettai, Gummidipoondi Taluk, Tiruvallur Dist, Tamil Nadu - 601206' : ''),
    email: userSession?.applicantEmail || '',
    phone: userSession?.applicantPhone || '',
    principalName: userSession?.principalName || '',

    // Standard Infrastructure
    landAcres: '',
    builtUpAreaSqFt: '',
    cadLabsCount: '',
    workstationsCount: '',
    internetBandwidthMbps: '',
    fireNocNumber: 'NOC-TNFS-2026/4102',

    // Stream-Specific: New Technical Institution Setup
    leaseDeedNo: '',
    powerBackupKva: '',
    centralComputingCarpetArea: '',
    dtcpOrderNo: '',
    directorPhdSpecialization: '',

    // Stream-Specific: Increase in Intake / Emerging Branches
    additionalLabAreaSqFt: '',
    hardwareCapexLakhs: '',
    emergingBranch: '',
    additionalSeats: '',

    // Stream-Specific: Working Professionals / Flexible Shift
    flexibleTimingHours: 'Evening 06:00 PM - 09:30 PM & Weekends',
    industryPartnerName: '',
    distanceIndustryKm: '',
    lmsCapacityUsers: '',
    industryMinExperienceYears: '1',
    adjunctFacultyCount: '',

    // Stream-Specific: Foreign University Collaboration
    foreignUniversityName: '',
    foreignCountry: '',
    qsWorldRank: '',
    twinningModel: '2+2 Years Articulation',
    telepresenceStudioCount: '',
    internationalHostelRooms: '',

    // Stream-Specific: Supernumerary Quota (FN/OCI/NRI)
    supernumeraryQuotaPercent: '15',
    supernumerarySeatsRequested: '',
    foreignAdvisorName: '',
    hostelBedsCount: '',
    cctvCoveragePoints: '',
    medicalCenterAreaSqFt: '',

    // Stream-Specific: Change of Site / Location
    proposedSiteLandAcres: '',
    khasraSurveyNo: '',
    townPlanningOrderNo: '',
    distanceOldToNewKm: '',
    enrolledStudentsCount: '',
    trustResolutionDate: '',

    // Stream-Specific: Conversion to Co-Educational
    boysCommonRoomSqFt: '',
    washroomRatio: '1:1 Gender Segregated',
    boysHostelBeds: '',
    sportsAmenitiesArea: '',
    iccPresidingOfficer: '',

    // Academic & Faculty
    courses: '',
    approvedIntake: '',
    appliedIntake: '',
    facultyCount: '',
    documents: initialStream ? getStreamDocuments(initialStream) : []
  });

  // Active step wizard: 1 (Approval Source & Entity), 2 (Infrastructure), 3 (Academic & Faculty), 4 (Documents), 5 (Final Submit)
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [declared, setDeclared] = useState(false);

  // ── Requirement 1: Per-step validation strictly stream-aware ─────────────────
  const step1Valid =
    !!formData.approvalSource &&
    !!formData.institutionName?.trim() &&
    !!formData.permanentId?.trim() &&
    !!formData.affiliatingUniversity?.trim() &&
    !!formData.region?.trim() &&
    !!formData.email?.trim();

  // Dynamic Step 2 validation tailored to chosen stream
  const step2Valid = (() => {
    if (!formData.approvalSource) return false;
    const s = formData.approvalSource;
    if (s === "New Technical Institution Approval") {
      return (
        Number(formData.landAcres) > 0 &&
        Number(formData.builtUpAreaSqFt) > 0 &&
        !!formData.leaseDeedNo?.trim() &&
        Number(formData.powerBackupKva) > 0 &&
        Number(formData.workstationsCount) > 0
      );
    }
    if (s === "Increase in Intake / Additional Emerging Courses") {
      return (
        Number(formData.builtUpAreaSqFt) > 0 &&
        Number(formData.additionalLabAreaSqFt) > 0 &&
        Number(formData.cadLabsCount) > 0 &&
        Number(formData.hardwareCapexLakhs) > 0 &&
        Number(formData.internetBandwidthMbps) > 0
      );
    }
    if (s === "Working Professionals / Flexible Timing Program") {
      return (
        Number(formData.cadLabsCount) > 0 &&
        Number(formData.lmsCapacityUsers) > 0 &&
        !!formData.industryPartnerName?.trim() &&
        Number(formData.distanceIndustryKm) >= 0 &&
        Number(formData.internetBandwidthMbps) > 0
      );
    }
    if (s === "Foreign University Collaboration / Twinning") {
      return (
        Number(formData.builtUpAreaSqFt) > 0 &&
        Number(formData.telepresenceStudioCount) > 0 &&
        Number(formData.internationalHostelRooms) > 0 &&
        Number(formData.internetBandwidthMbps) > 0
      );
    }
    if (s === "Supernumerary Seats (FN / OCI / NRI / PMSSS)") {
      return (
        Number(formData.hostelBedsCount) > 0 &&
        Number(formData.cctvCoveragePoints) > 0 &&
        Number(formData.medicalCenterAreaSqFt) > 0 &&
        Number(formData.internetBandwidthMbps) > 0
      );
    }
    if (s === "Change of Site / Location / Trust") {
      return (
        Number(formData.proposedSiteLandAcres) > 0 &&
        !!formData.khasraSurveyNo?.trim() &&
        Number(formData.builtUpAreaSqFt) > 0 &&
        Number(formData.distanceOldToNewKm) >= 0
      );
    }
    if (s === "Conversion of Women's Institution to Co-Educational") {
      return (
        Number(formData.boysCommonRoomSqFt) > 0 &&
        Number(formData.boysHostelBeds) > 0 &&
        Number(formData.sportsAmenitiesArea) > 0 &&
        !!formData.washroomRatio?.trim()
      );
    }
    // Default (EoA Routine Renewal)
    return (
      Number(formData.landAcres) > 0 &&
      Number(formData.builtUpAreaSqFt) > 0 &&
      Number(formData.cadLabsCount) > 0 &&
      Number(formData.workstationsCount) > 0 &&
      Number(formData.internetBandwidthMbps) > 0
    );
  })();

  // Dynamic Step 3 validation tailored to chosen stream
  const step3Valid = (() => {
    if (!formData.approvalSource) return false;
    const s = formData.approvalSource;
    if (s === "New Technical Institution Approval") {
      return (
        !!formData.courses?.trim() &&
        Number(formData.appliedIntake) > 0 &&
        Number(formData.facultyCount) > 0 &&
        !!formData.principalName?.trim()
      );
    }
    if (s === "Increase in Intake / Additional Emerging Courses") {
      return (
        !!formData.emergingBranch?.trim() &&
        Number(formData.approvedIntake) >= 0 &&
        Number(formData.additionalSeats) > 0 &&
        Number(formData.facultyCount) > 0
      );
    }
    if (s === "Working Professionals / Flexible Timing Program") {
      return (
        !!formData.courses?.trim() &&
        Number(formData.appliedIntake) > 0 &&
        Number(formData.industryMinExperienceYears) >= 1 &&
        Number(formData.adjunctFacultyCount) > 0
      );
    }
    if (s === "Foreign University Collaboration / Twinning") {
      return (
        !!formData.foreignUniversityName?.trim() &&
        !!formData.foreignCountry?.trim() &&
        Number(formData.qsWorldRank) > 0 &&
        Number(formData.appliedIntake) > 0
      );
    }
    if (s === "Supernumerary Seats (FN / OCI / NRI / PMSSS)") {
      return (
        !!formData.courses?.trim() &&
        Number(formData.supernumeraryQuotaPercent) > 0 &&
        Number(formData.appliedIntake) > 0 &&
        !!formData.foreignAdvisorName?.trim()
      );
    }
    if (s === "Change of Site / Location / Trust") {
      return (
        !!formData.courses?.trim() &&
        Number(formData.approvedIntake) > 0 &&
        Number(formData.enrolledStudentsCount) > 0 &&
        !!formData.trustResolutionDate?.trim()
      );
    }
    if (s === "Conversion of Women's Institution to Co-Educational") {
      return (
        !!formData.courses?.trim() &&
        Number(formData.appliedIntake) > 0 &&
        !!formData.iccPresidingOfficer?.trim() &&
        Number(formData.facultyCount) > 0
      );
    }
    // Default (EoA Routine Renewal)
    return (
      !!formData.courses?.trim() &&
      Number(formData.approvedIntake) >= 0 &&
      Number(formData.appliedIntake) > 0 &&
      Number(formData.facultyCount) > 0
    );
  })();

  const allDocsUploaded = Boolean(
    formData.documents &&
    formData.documents.length > 0 &&
    formData.documents.every(d => !!d.fileName)
  );

  const step4Valid = allDocsUploaded;

  // ALL prior steps must be 100% completed
  const allDetailsFilled = Boolean(step1Valid && step2Valid && step3Valid && step4Valid);

  // Final submit is enabled ONLY when ALL sections are complete AND legal declaration is ticked
  const step5Valid = Boolean(allDetailsFilled && declared);

  // Navigation Rule:
  // Can always navigate back to prior steps (target <= currentStep).
  // Can ONLY navigate forward to targetStep if ALL preceding steps are strictly valid!
  const canNavigateToStep = (targetStep) => {
    if (isFormLocked) return true;
    if (targetStep <= currentStep) return true;
    if (targetStep === 2) return step1Valid;
    if (targetStep === 3) return step1Valid && step2Valid;
    if (targetStep === 4) return step1Valid && step2Valid && step3Valid;
    if (targetStep === 5) return step1Valid && step2Valid && step3Valid && step4Valid;
    return false;
  };

  // Completed Status: ONLY displays green checkmark if the step's required details are ACTUALLY filled!
  const getStepCompleted = (stepNum) => {
    if (stepNum === 1) return step1Valid;
    if (stepNum === 2) return step2Valid;
    if (stepNum === 3) return step3Valid;
    if (stepNum === 4) return step4Valid;
    if (stepNum === 5) return step5Valid;
    return false;
  };
  // ─────────────────────────────────────────────────────────────────────────────

  // Keep synced with userSession
  useEffect(() => {
    if (userSession) {
      if (isSubmitted) {
        // Locked / already submitted application: sync submitted historical data
        const activeStream = userSession.category || userSession.approvalSource || "";
        const initialDocs = (userSession.documents && userSession.documents.length > 0)
          ? userSession.documents
          : getStreamDocuments(activeStream);

        setFormData(prev => ({
          ...prev,
          uniqueId: userSession.appId || prev.uniqueId,
          institutionName: userSession.institutionName || prev.institutionName,
          permanentId: userSession.permanentId || prev.permanentId,
          approvalSource: activeStream || prev.approvalSource,
          region: userSession.region || prev.region,
          address: userSession.address || prev.address,
          affiliatingUniversity: userSession.affiliatingUniversity || prev.affiliatingUniversity,
          email: userSession.applicantEmail || prev.email,
          phone: userSession.applicantPhone || prev.phone,
          principalName: userSession.principalName || prev.principalName,
          documents: initialDocs
        }));
      } else {
        // Active editable application: only sync basic identity credentials, DO NOT auto-select stream or auto-fill values
        setFormData(prev => ({
          ...prev,
          uniqueId: userSession.appId || prev.uniqueId || (userSession.institutionName?.toLowerCase().includes('r.m.k') ? 'APP-2026-AICTE-1084' : `APP-2026-AICTE-${Math.floor(1000 + Math.random() * 9000)}`),
          institutionName: userSession.institutionName || prev.institutionName,
          permanentId: userSession.permanentId || prev.permanentId,
          region: userSession.region || prev.region,
          affiliatingUniversity: userSession.affiliatingUniversity || prev.affiliatingUniversity,
          address: userSession.address || prev.address || (userSession.institutionName?.toLowerCase().includes('r.m.k') ? 'RSM Nagar, Kavaraipettai, Gummidipoondi Taluk, Tiruvallur Dist, Tamil Nadu - 601206' : ''),
          principalName: userSession.principalName || prev.principalName,
          email: userSession.applicantEmail || prev.email,
          phone: userSession.applicantPhone || prev.phone,
          approvalSource: prev.approvalSource || '', // remains empty until manually chosen
          documents: prev.approvalSource ? getStreamDocuments(prev.approvalSource) : prev.documents
        }));
      }
    }
  }, [userSession?.appId, isSubmitted]);

  const handleFieldChange = (field, value) => {
    if (isSubmitted) return; // Locked once submitted
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Dynamic Approval Source Change with automatic statutory document list update
  const handleApprovalSourceSelect = (sourceId) => {
    if (isSubmitted) return; // Cannot modify once submitted
    const newDocs = sourceId ? getStreamDocuments(sourceId) : [];
    setFormData(prev => ({
      ...prev,
      approvalSource: sourceId,
      documents: newDocs
    }));
  };

  // Handle uploading or replacing exact document
  const handleDocumentFileUpload = (docId, file) => {
    if (isSubmitted || !file) return;
    const fakeHash = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map(d => 
        d.id === docId 
          ? { 
              ...d, 
              fileName: file.name, 
              fileSize: `${sizeMb} MB`,
              sha256: fakeHash,
              status: "Uploaded (SHA-256 Hashed)"
            } 
          : d
      )
    }));
  };

  // Handle deleting / clearing document
  const handleDeleteDocument = (docId) => {
    if (isSubmitted) return;
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map(d => 
        d.id === docId 
          ? { 
              ...d, 
              fileName: null, 
              fileSize: null,
              sha256: null,
              status: "pending_upload"
            } 
          : d
      )
    }));
  };

  // Handle Final Submission to AICTE Multi-Modal Scrutiny Engine
  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (isSubmitted) {
      alert("This application has already been formally submitted.");
      return;
    }

    if (!declared) {
      alert("Please accept the statutory declaration before submitting.");
      return;
    }

    // Check if any mandatory document is missing
    const missingDocs = formData.documents.filter(d => !d.fileName);
    if (missingDocs.length > 0) {
      const confirmSubmit = window.confirm(
        `Warning: ${missingDocs.length} required statutory document(s) have not been uploaded. Do you wish to proceed? Unsubmitted documents may trigger formal deficiency notices.`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    try {
      const nextStreamAppId = forceNewApplication 
        ? `APP-2026-AICTE-1084-S${collegeApplications.length + 1}` 
        : formData.uniqueId;

      const payload = {
        isNewStream: forceNewApplication,
        appId: nextStreamAppId,
        institutionName: formData.institutionName,
        permanentId: formData.permanentId,
        category: formData.approvalSource,
        region: formData.region,
        affiliatingUniversity: formData.affiliatingUniversity,
        address: formData.address,
        email: formData.email,
        phone: formData.phone,
        landAcres: Number(formData.landAcres),
        builtUpAreaSqFt: Number(formData.builtUpAreaSqFt),
        cadLabsCount: Number(formData.cadLabsCount),
        workstationsCount: Number(formData.workstationsCount),
        internetBandwidthMbps: Number(formData.internetBandwidthMbps),
        appliedIntake: Number(formData.appliedIntake),
        facultyCount: Number(formData.facultyCount),
        principalName: formData.principalName,
        programs: (formData.courses || '').split(',').map(s => s.trim()),
        uploadedDocuments: formData.documents.map(d => ({
          docId: d.docId,
          type: d.type,
          title: d.fileName || `${d.type}.pdf`,
          mimeType: "application/pdf",
          pageCount: 3,
          status: "pending_review",
          sha256: d.sha256 || Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
          flags: [],
          apiVerification: { service: "State Technical University Registry", status: "VERIFIED", httpCode: 200 }
        }))
      };

      const res = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.ok && result.success) {
        if (onSubmitSuccess) onSubmitSuccess(result.data);
      } else {
        alert(result.message || "Failed to submit application.");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Error submitting application. Backend may be offline.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartNewStreamApplication = () => {
    if (!canApplyNextStream) {
      alert(`Sequential Stream Rule: Application ${activePendingStream?.appId || ''} for "${activePendingStream?.category || 'active stream'}" is currently undergoing scrutiny. Under AICTE regulations, each stream must be completely verified and approved before applying for the next stream.`);
      return;
    }
    setForceNewApplication(true);
    setFormData({
      uniqueId: `APP-2026-AICTE-1084-S${collegeApplications.length + 1}`,
      institutionName: userSession?.institutionName || 'R.M.K. Engineering College',
      permanentId: userSession?.permanentId || '1-932148123',
      approvalSource: '', // Blank so applicant manually chooses stream!
      region: userSession?.region || 'Southern Region (Chennai)',
      establishmentYear: '2008',
      minorityStatus: userSession?.isMinority ? 'Yes (Minority)' : 'Non-Minority',
      affiliatingUniversity: userSession?.affiliatingUniversity || 'Anna University (Chennai)',
      trustName: 'Lakshmikanthammal Educational Trust',
      address: userSession?.address || 'RSM Nagar, Kavaraipettai, Gummidipoondi Taluk, Tiruvallur Dist, Tamil Nadu - 601206',
      email: userSession?.applicantEmail || 'principal@rmkec.ac.in',
      phone: userSession?.applicantPhone || '+91 98401 23456',
      principalName: userSession?.principalName || 'Dr. K. A. Mohamed Junaid, M.E., Ph.D.',
      landAcres: '',
      builtUpAreaSqFt: '',
      cadLabsCount: '',
      workstationsCount: '',
      internetBandwidthMbps: '',
      fireNocNumber: 'NOC-TNFS-2026/4102',
      leaseDeedNo: '',
      powerBackupKva: '',
      centralComputingCarpetArea: '',
      dtcpOrderNo: '',
      directorPhdSpecialization: '',
      additionalLabAreaSqFt: '',
      hardwareCapexLakhs: '',
      emergingBranch: '',
      additionalSeats: '',
      flexibleTimingHours: 'Evening 06:00 PM - 09:30 PM & Weekends',
      industryPartnerName: '',
      distanceIndustryKm: '',
      lmsCapacityUsers: '',
      industryMinExperienceYears: '1',
      adjunctFacultyCount: '',
      foreignUniversityName: '',
      foreignCountry: '',
      qsWorldRank: '',
      twinningModel: '2+2 Years Articulation',
      telepresenceStudioCount: '',
      internationalHostelRooms: '',
      supernumeraryQuotaPercent: '15',
      supernumerarySeatsRequested: '',
      foreignAdvisorName: '',
      hostelBedsCount: '',
      cctvCoveragePoints: '',
      medicalCenterAreaSqFt: '',
      proposedSiteLandAcres: '',
      khasraSurveyNo: '',
      townPlanningOrderNo: '',
      distanceOldToNewKm: '',
      enrolledStudentsCount: '',
      trustResolutionDate: '',
      boysCommonRoomSqFt: '',
      washroomRatio: '1:1 Gender Segregated',
      boysHostelBeds: '',
      sportsAmenitiesArea: '',
      iccPresidingOfficer: '',
      courses: '',
      approvedIntake: '',
      appliedIntake: '',
      facultyCount: '',
      documents: []
    });
    setCurrentStep(1);
    setDeclared(false);
  };

  // React to startNewStreamSignal from parent
  useEffect(() => {
    if (startNewStreamSignal > 0) {
      handleStartNewStreamApplication();
    }
  }, [startNewStreamSignal]);

  const steps = [
    { num: 1, label: "Approval Stream" },
    { num: 2, label: "Infrastructure" },
    { num: 3, label: "Academic Intake" },
    { num: 4, label: "Documents (SHA-256)" },
    { num: 5, label: "Review & Submit" }
  ];

  return (
    <div className="space-y-6">
      {/* Locked Submission Banner (if application is already submitted) */}
      {isSubmitted && !forceNewApplication && (
        <div className={`border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs ${
          canApplyNextStream 
            ? 'bg-emerald-500/10 border-emerald-300 text-emerald-950' 
            : 'bg-amber-500/10 border-amber-300 text-amber-950'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
              canApplyNextStream ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'
            }`}>
              {canApplyNextStream ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <span className="font-extrabold text-sm block">
                {canApplyNextStream 
                  ? `Stream Verified & Approved (${formData.approvalSource || userSession?.category || 'Active Stream'})`
                  : `Stream Under Scrutiny (${formData.approvalSource || userSession?.category || 'Active Stream'})`}
              </span>
              <span className={`text-[11px] ${canApplyNextStream ? 'text-emerald-800' : 'text-amber-800'}`}>
                {canApplyNextStream
                  ? "All statutory compliance checks cleared! Under AICTE regulatory policy, your institution is now eligible to apply for your next approval stream."
                  : <span>Application is currently undergoing AI Scrutiny. Sequential rule: Once this stream is completely verified & approved, you can apply for the next stream.</span>}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canApplyNextStream ? (
              <button
                type="button"
                onClick={handleStartNewStreamApplication}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer text-xs hover:scale-105 ring-1 ring-emerald-400"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Apply for Next Stream (AY 2026-27)</span>
              </button>
            ) : (
              <div className="bg-amber-200/90 text-amber-900 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-amber-800 shrink-0" />
                <span>Next Stream Locked (Under Scrutiny)</span>
              </div>
            )}
            <span className="bg-slate-800 text-slate-200 font-mono text-[10px] font-bold px-2 py-1 rounded-lg">
              {canApplyNextStream ? 'Eligible' : 'Read-Only'}
            </span>
          </div>
        </div>
      )}

      {/* Mode Indicator when applicant is drafting a new stream application */}
      {forceNewApplication && (
        <div className="bg-indigo-50 border border-indigo-300 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-indigo-950 shadow-xs">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Sequential Stream Application Mode (Stream #{collegeApplications.length + 1} of 8):</strong> All colleges can apply for all streams sequentially. Select an unapplied stream below.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setForceNewApplication(false)}
            className="text-indigo-700 hover:text-indigo-900 underline font-semibold text-xs shrink-0 cursor-pointer"
          >
            Cancel & Return
          </button>
        </div>
      )}

      {/* Top 5-Step Guided Navigation Wizard */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between">
          {steps.map((s) => {
            const isActive = currentStep === s.num;
            const isDone = getStepCompleted(s.num);
            const isAccessible = canNavigateToStep(s.num);

            return (
              <button
                key={s.num}
                type="button"
                disabled={!isAccessible}
                onClick={() => {
                  if (isAccessible) setCurrentStep(s.num);
                }}
                title={
                  !isAccessible
                    ? `Please complete previous steps before moving to ${s.label}`
                    : isDone
                    ? `${s.label} (Completed)`
                    : `${s.label} (Details Required)`
                }
                className={`flex items-center gap-2 group transition-all select-none ${
                  isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isActive 
                    ? 'bg-amber-600 text-white ring-4 ring-amber-100 shadow-xs' 
                    : isDone 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : isAccessible
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                </div>
                <span className={`text-xs font-semibold hidden md:inline transition-colors ${
                  isActive 
                    ? 'text-amber-800 font-bold' 
                    : isDone 
                    ? 'text-emerald-800 font-bold' 
                    : isAccessible
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleSubmitApplication} className="space-y-6">
        {/* STEP 1: Specific Approval Stream & Entity Profile */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
            {/* Approval Source Selector Tiles */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Select Specific AICTE Approval Source / Stream</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Statutory documents checklist in Step 4 will dynamically adapt to the stream selected here
                  </p>
                </div>
                {isSubmitted && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Stream Locked</span>
                  </span>
                )}
              </div>

              {/* Searchable Typed Combobox for Approval Stream */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
                <SearchableTypedDropdown
                  label="Search or Select Approval Stream (or Type Custom Stream)"
                  disabled={isSubmitted}
                  value={formData.approvalSource}
                  onChange={(val) => handleApprovalSourceSelect(val)}
                  options={streamDropdownOptions}
                  placeholder="eg: Select or type approval stream (e.g. Extension of Approval, New Technical Institution Setup, Increase in Intake...)"
                  helperText="Search by keywords (e.g. EoA, Intake, Supernumerary, Foreign, Flexible) or click any tile below."
                />
                {!formData.approvalSource && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200/80 rounded-lg p-2.5 flex items-center gap-1.5 font-medium">
                    <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Please click an approval stream tile below or choose from the dropdown above to begin.</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {APPROVAL_SOURCES.map((source) => {
                  const isSelected = formData.approvalSource === source.id;
                  const isAlreadyApplied = appliedStreamNames.includes(source.id.toLowerCase());
                  const IconComponent = source.icon;

                  return (
                    <div
                      key={source.id}
                      onClick={() => {
                        if (isSubmitted || isAlreadyApplied) return;
                        handleApprovalSourceSelect(source.id);
                      }}
                      className={`p-4 rounded-xl border-2 transition-all relative ${
                        isAlreadyApplied
                          ? 'border-emerald-300 bg-emerald-50/40 opacity-70 cursor-not-allowed'
                          : isSubmitted 
                          ? 'cursor-not-allowed opacity-90 border-slate-200 bg-white' 
                          : 'cursor-pointer hover:border-amber-400 bg-white'
                      } ${
                        isSelected 
                          ? 'border-amber-500 bg-amber-50/50 shadow-xs ring-2 ring-amber-200' 
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${
                          isAlreadyApplied
                            ? 'bg-emerald-100 text-emerald-700'
                            : isSelected 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="space-y-1 min-w-0 pr-6">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-900">{source.title}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                              isAlreadyApplied
                                ? 'bg-emerald-200 text-emerald-900'
                                : isSelected 
                                ? 'bg-amber-200 text-amber-900' 
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {isAlreadyApplied ? 'Applied & Verified ✓' : source.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">
                            {source.desc}
                          </p>
                          <div className="text-[10px] text-indigo-600 font-semibold pt-1">
                            📄 {source.docHighlight}
                          </div>
                        </div>
                      </div>

                      {isAlreadyApplied ? (
                        <div className="absolute top-3 right-3 bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 shadow-xs font-mono">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Done</span>
                        </div>
                      ) : isSelected ? (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Institution Profile */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Institution Legal Details
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Assigned Unique ID: <strong className="text-amber-700">{formData.uniqueId}</strong> • PID: <strong className="text-slate-800">{formData.permanentId}</strong>
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-emerald-900 font-semibold text-[11px]">
                    AICTE National Master Registry Record
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Full Institution Name *</label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitted}
                    value={formData.institutionName}
                    onChange={(e) => handleFieldChange('institutionName', e.target.value)}
                    placeholder="eg: St. Xavier College of Engineering & Research"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Permanent Institute ID (PID) *</label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitted}
                    value={formData.permanentId}
                    onChange={(e) => handleFieldChange('permanentId', e.target.value)}
                    placeholder="eg: 1-932148123"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <SearchableTypedDropdown
                    label="Affiliating University"
                    required
                    disabled={isSubmitted}
                    value={formData.affiliatingUniversity}
                    onChange={(val) => handleFieldChange('affiliatingUniversity', val)}
                    options={UNIVERSITY_OPTIONS}
                    placeholder="Select or type affiliating university..."
                    helperText="Select or type custom university name."
                  />
                </div>

                <div>
                  <SearchableTypedDropdown
                    label="Regional Office"
                    required
                    disabled={isSubmitted}
                    value={formData.region}
                    onChange={(val) => handleFieldChange('region', val)}
                    options={REGIONAL_OFFICE_OPTIONS}
                    placeholder="Select or type regional office..."
                    helperText="Select or type official jurisdiction."
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Regulatory Email *</label>
                  <input
                    type="email"
                    required
                    disabled={isSubmitted}
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    placeholder="eg: registrar@yourcollege.edu.in"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-mono disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!step1Valid}
                  title={!step1Valid ? 'Fill all required fields above to proceed' : ''}
                  className={`font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all ${
                    step1Valid
                      ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-md'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>Proceed to Infrastructure Norms</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Infrastructure & Land Norms (Dynamically Adapting to Stream) */}
        {currentStep === 2 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-600" />
                  <span>2. Infrastructure & Statutory Norms Compliance</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Parameters dynamically customized for: <strong className="text-indigo-900">{formData.approvalSource || 'Selected Stream'}</strong>
                </p>
              </div>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded-lg font-bold">
                APH 2026-27 Specific Norms
              </span>
            </div>

            {/* Stream 1: New Technical Institution Setup */}
            {formData.approvalSource === "New Technical Institution Approval" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Campus Land (Acres) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    disabled={isSubmitted}
                    value={formData.landAcres}
                    onChange={(e) => handleFieldChange('landAcres', e.target.value)}
                    placeholder="eg: 7.5  (min. 7.5 rural / 2.5 urban)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">30-Yr Lease / Sale Title Deed Reg No. *</label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitted}
                    value={formData.leaseDeedNo}
                    onChange={(e) => handleFieldChange('leaseDeedNo', e.target.value)}
                    placeholder="eg: SRO/CH-2026/7891"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Sanctioned Built-Up Area (Sq. Ft) *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.builtUpAreaSqFt}
                    onChange={(e) => handleFieldChange('builtUpAreaSqFt', e.target.value)}
                    placeholder="eg: 165000"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Central Computing Workstations *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.workstationsCount}
                    onChange={(e) => handleFieldChange('workstationsCount', e.target.value)}
                    placeholder="eg: 240  (min. 1:1 per student)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Power Backup Generator (kVA) *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.powerBackupKva}
                    onChange={(e) => handleFieldChange('powerBackupKva', e.target.value)}
                    placeholder="eg: 125  (min. 62.5 kVA standard)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Municipal / DTCP Building Order No.</label>
                  <input
                    type="text"
                    disabled={isSubmitted}
                    value={formData.dtcpOrderNo}
                    onChange={(e) => handleFieldChange('dtcpOrderNo', e.target.value)}
                    placeholder="eg: DTCP/TN/CMDA-2026-92"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {/* Stream 2: Increase in Intake / Emerging Branches */}
            {formData.approvalSource === "Increase in Intake / Additional Emerging Courses" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Existing Built-Up Area (Sq. Ft) *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.builtUpAreaSqFt}
                    onChange={(e) => handleFieldChange('builtUpAreaSqFt', e.target.value)}
                    placeholder="eg: 145000"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Additional Lab Carpet Area (Sq. Ft) *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.additionalLabAreaSqFt}
                    onChange={(e) => handleFieldChange('additionalLabAreaSqFt', e.target.value)}
                    placeholder="eg: 12500  (for AI/ML labs)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Specialized CAD / AI-ML Labs *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.cadLabsCount}
                    onChange={(e) => handleFieldChange('cadLabsCount', e.target.value)}
                    placeholder="eg: 4  (high-performance compute)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Equipment Capex (₹ in Lakhs) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    disabled={isSubmitted}
                    value={formData.hardwareCapexLakhs}
                    onChange={(e) => handleFieldChange('hardwareCapexLakhs', e.target.value)}
                    placeholder="eg: 45.5  (hardware/GPU servers)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dedicated Bandwidth (Mbps) *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.internetBandwidthMbps}
                    onChange={(e) => handleFieldChange('internetBandwidthMbps', e.target.value)}
                    placeholder="eg: 1000  (min. 500 Mbps)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {/* Stream 3: Working Professionals / Flexible Shift */}
            {formData.approvalSource === "Working Professionals / Flexible Timing Program" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Evening / Weekend Dedicated Labs *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.cadLabsCount}
                    onChange={(e) => handleFieldChange('cadLabsCount', e.target.value)}
                    placeholder="eg: 6  (smart computer labs)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">LMS Concurrent User Capacity *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.lmsCapacityUsers}
                    onChange={(e) => handleFieldChange('lmsCapacityUsers', e.target.value)}
                    placeholder="eg: 500  (hybrid student load)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Partner Industry Corporate Name *</label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitted}
                    value={formData.industryPartnerName}
                    onChange={(e) => handleFieldChange('industryPartnerName', e.target.value)}
                    placeholder="eg: Larsen & Toubro / Hyundai Motors"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Distance to Industry Facility (Km) *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.distanceIndustryKm}
                    onChange={(e) => handleFieldChange('distanceIndustryKm', e.target.value)}
                    placeholder="eg: 14  (within 50 km zone)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">LMS Bandwidth (Mbps) *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.internetBandwidthMbps}
                    onChange={(e) => handleFieldChange('internetBandwidthMbps', e.target.value)}
                    placeholder="eg: 500  (live streaming)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {/* Stream 4: Foreign University Collaboration */}
            {formData.approvalSource === "Foreign University Collaboration / Twinning" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Campus Built-Up Area (Sq. Ft) *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.builtUpAreaSqFt}
                    onChange={(e) => handleFieldChange('builtUpAreaSqFt', e.target.value)}
                    placeholder="eg: 180000"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tele-Presence / HD Studio Labs *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.telepresenceStudioCount}
                    onChange={(e) => handleFieldChange('telepresenceStudioCount', e.target.value)}
                    placeholder="eg: 2  (for global faculty lectures)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">International Hostel Rooms *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.internationalHostelRooms}
                    onChange={(e) => handleFieldChange('internationalHostelRooms', e.target.value)}
                    placeholder="eg: 45  (accommodating visiting scholars)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Network Bandwidth (Mbps) *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.internetBandwidthMbps}
                    onChange={(e) => handleFieldChange('internetBandwidthMbps', e.target.value)}
                    placeholder="eg: 1000  (seamless video conference)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {/* Stream 5: Supernumerary Quota (FN/OCI/NRI) */}
            {formData.approvalSource === "Supernumerary Seats (FN / OCI / NRI / PMSSS)" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">International Hostel Beds *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.hostelBedsCount}
                    onChange={(e) => handleFieldChange('hostelBedsCount', e.target.value)}
                    placeholder="eg: 120  (dedicated international wing)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Health Center Area (Sq. Ft) *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.medicalCenterAreaSqFt}
                    onChange={(e) => handleFieldChange('medicalCenterAreaSqFt', e.target.value)}
                    placeholder="eg: 3500  (with 24x7 nurse/ambulance)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CCTV Surveillance Points *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.cctvCoveragePoints}
                    onChange={(e) => handleFieldChange('cctvCoveragePoints', e.target.value)}
                    placeholder="eg: 64  (complete perimeter coverage)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hostel Wi-Fi Bandwidth (Mbps) *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.internetBandwidthMbps}
                    onChange={(e) => handleFieldChange('internetBandwidthMbps', e.target.value)}
                    placeholder="eg: 500"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {/* Stream 6: Change of Site / Location */}
            {formData.approvalSource === "Change of Site / Location / Trust" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Proposed Site Land (Acres) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    disabled={isSubmitted}
                    value={formData.proposedSiteLandAcres}
                    onChange={(e) => handleFieldChange('proposedSiteLandAcres', e.target.value)}
                    placeholder="eg: 10.25  (contiguous land parcel)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Site Survey / Khasra Nos. *</label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitted}
                    value={formData.khasraSurveyNo}
                    onChange={(e) => handleFieldChange('khasraSurveyNo', e.target.value)}
                    placeholder="eg: Survey Nos. 142/1, 142/2"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Built-Up at New Site (Sq. Ft) *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.builtUpAreaSqFt}
                    onChange={(e) => handleFieldChange('builtUpAreaSqFt', e.target.value)}
                    placeholder="eg: 155000"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Relocation Distance (Km) *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.distanceOldToNewKm}
                    onChange={(e) => handleFieldChange('distanceOldToNewKm', e.target.value)}
                    placeholder="eg: 18  (distance old to new site)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Town Planning Conversion Order No.</label>
                  <input
                    type="text"
                    disabled={isSubmitted}
                    value={formData.townPlanningOrderNo}
                    onChange={(e) => handleFieldChange('townPlanningOrderNo', e.target.value)}
                    placeholder="eg: TCP/REV/2026/041"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {/* Stream 7: Conversion of Women's Institution to Co-Educational */}
            {formData.approvalSource === "Conversion of Women's Institution to Co-Educational" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Boys Common Room Area (Sq. Ft) *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.boysCommonRoomSqFt}
                    onChange={(e) => handleFieldChange('boysCommonRoomSqFt', e.target.value)}
                    placeholder="eg: 4500  (dedicated male student room)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Washroom Units Ratio *</label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitted}
                    value={formData.washroomRatio}
                    onChange={(e) => handleFieldChange('washroomRatio', e.target.value)}
                    placeholder="eg: 1:1 Gender Segregated Units"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Boys Hostel Beds Capacity *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.boysHostelBeds}
                    onChange={(e) => handleFieldChange('boysHostelBeds', e.target.value)}
                    placeholder="eg: 250  (newly constructed hostel)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sports & Gym Amenities (Sq. Ft) *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.sportsAmenitiesArea}
                    onChange={(e) => handleFieldChange('sportsAmenitiesArea', e.target.value)}
                    placeholder="eg: 18000"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {/* Default Stream: Extension of Approval (EoA) Routine Renewal */}
            {(formData.approvalSource === "Extension of Approval (EoA) 2026-27" || !formData.approvalSource || ![
              "New Technical Institution Approval",
              "Increase in Intake / Additional Emerging Courses",
              "Working Professionals / Flexible Timing Program",
              "Foreign University Collaboration / Twinning",
              "Supernumerary Seats (FN / OCI / NRI / PMSSS)",
              "Change of Site / Location / Trust",
              "Conversion of Women's Institution to Co-Educational"
            ].includes(formData.approvalSource)) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Contiguous Land (Acres) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    disabled={isSubmitted}
                    value={formData.landAcres}
                    onChange={(e) => handleFieldChange('landAcres', e.target.value)}
                    placeholder="eg: 7.5  (min. 2.5 acres for B.Tech)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Built-Up Area (Sq. Ft) *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.builtUpAreaSqFt}
                    onChange={(e) => handleFieldChange('builtUpAreaSqFt', e.target.value)}
                    placeholder="eg: 145000"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CAD & Specialized Labs *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.cadLabsCount}
                    onChange={(e) => handleFieldChange('cadLabsCount', e.target.value)}
                    placeholder="eg: 6"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Workstations Count *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.workstationsCount}
                    onChange={(e) => handleFieldChange('workstationsCount', e.target.value)}
                    placeholder="eg: 180  (min. 1 per student)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Internet Bandwidth (Mbps) *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.internetBandwidthMbps}
                    onChange={(e) => handleFieldChange('internetBandwidthMbps', e.target.value)}
                    placeholder="eg: 500  (min. 512 Kbps per 25 students)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                disabled={!step2Valid}
                title={!step2Valid ? 'Fill all stream-specific infrastructure fields above to proceed' : ''}
                className={`font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all ${
                  step2Valid
                    ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                <span>Proceed to Academic Intake</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Academic Intake & Faculty (Dynamically Adapting to Stream) */}
        {currentStep === 3 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>3. Academic Program & Sanctioned Intake Capacity</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Intake & faculty norms customized for: <strong className="text-indigo-900">{formData.approvalSource || 'Selected Stream'}</strong>
                </p>
              </div>
              <span className="text-[10px] font-mono bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg font-bold">
                Cadre Ratio 1:20
              </span>
            </div>

            {/* Stream 1: New Technical Institution Setup */}
            {formData.approvalSource === "New Technical Institution Approval" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-3">
                  <SearchableTypedDropdown
                    label="Proposed Starting Degrees / Branches"
                    required
                    disabled={isSubmitted}
                    value={formData.courses}
                    onChange={(val) => handleFieldChange('courses', val)}
                    options={DEGREE_BRANCH_OPTIONS}
                    placeholder="eg: B.Tech Computer Science & Engineering (180 Seats), B.Tech AI & ML (120 Seats)..."
                    helperText="Select starting undergraduate / postgraduate branches proposed for inaugural AY 2026-27 batch."
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First-Year Proposed Intake *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.appliedIntake}
                    onChange={(e) => handleFieldChange('appliedIntake', e.target.value)}
                    placeholder="eg: 360  (total starting seats)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-800 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sanctioned Core Faculty Cadre *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.facultyCount}
                    onChange={(e) => handleFieldChange('facultyCount', e.target.value)}
                    placeholder="eg: 24  (cadre ratio 1:20)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Proposed Principal / Director Name *</label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitted}
                    value={formData.principalName}
                    onChange={(e) => handleFieldChange('principalName', e.target.value)}
                    placeholder="eg: Dr. R. Sivakumar, M.E., Ph.D."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {/* Stream 2: Increase in Intake / Emerging Branches */}
            {formData.approvalSource === "Increase in Intake / Additional Emerging Courses" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Previous Approved Intake *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.approvedIntake}
                    onChange={(e) => handleFieldChange('approvedIntake', e.target.value)}
                    placeholder="eg: 480"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Emerging Branch / Specialization Applied *</label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitted}
                    value={formData.emergingBranch}
                    onChange={(e) => handleFieldChange('emergingBranch', e.target.value)}
                    placeholder="eg: B.Tech Artificial Intelligence & Machine Learning"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-indigo-700 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Additional Seats Applied *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.additionalSeats}
                    onChange={(e) => {
                      handleFieldChange('additionalSeats', e.target.value);
                      const base = Number(formData.approvedIntake) || 0;
                      handleFieldChange('appliedIntake', String(base + (Number(e.target.value) || 0)));
                    }}
                    placeholder="eg: 60  (or 120)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-amber-700 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Resulting Campus Intake</label>
                  <input
                    type="number"
                    disabled
                    value={Number(formData.approvedIntake || 0) + Number(formData.additionalSeats || 0)}
                    className="w-full p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl font-mono font-bold text-emerald-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Additional Faculty Recruited *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.facultyCount}
                    onChange={(e) => handleFieldChange('facultyCount', e.target.value)}
                    placeholder="eg: 8  (for the new division)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {/* Stream 3: Working Professionals / Flexible Timing */}
            {formData.approvalSource === "Working Professionals / Flexible Timing Program" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <SearchableTypedDropdown
                    label="Flexible Program Specialization"
                    required
                    disabled={isSubmitted}
                    value={formData.courses}
                    onChange={(val) => handleFieldChange('courses', val)}
                    options={DEGREE_BRANCH_OPTIONS}
                    placeholder="eg: B.Tech Computer Science (Working Professionals Shift)"
                    helperText="Degree or diploma specialization sanctioned for industry professionals."
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Applied Flexible Intake *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.appliedIntake}
                    onChange={(e) => handleFieldChange('appliedIntake', e.target.value)}
                    placeholder="eg: 30  (max 60 per division)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-800 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Minimum Industry Experience (Years) *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.industryMinExperienceYears}
                    onChange={(e) => handleFieldChange('industryMinExperienceYears', e.target.value)}
                    placeholder="eg: 1  (statutory minimum 1 year)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Industry Practical Mentors *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.adjunctFacultyCount}
                    onChange={(e) => handleFieldChange('adjunctFacultyCount', e.target.value)}
                    placeholder="eg: 6  (adjunct corporate faculty)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shift Timings</label>
                  <input
                    type="text"
                    disabled={isSubmitted}
                    value={formData.flexibleTimingHours}
                    onChange={(e) => handleFieldChange('flexibleTimingHours', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] disabled:opacity-75"
                  />
                </div>
              </div>
            )}

            {/* Stream 4: Foreign University Collaboration */}
            {formData.approvalSource === "Foreign University Collaboration / Twinning" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Foreign Partner University Name *</label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitted}
                    value={formData.foreignUniversityName}
                    onChange={(e) => handleFieldChange('foreignUniversityName', e.target.value)}
                    placeholder="eg: Purdue University / University of Melbourne"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitted}
                    value={formData.foreignCountry}
                    onChange={(e) => handleFieldChange('foreignCountry', e.target.value)}
                    placeholder="eg: United States / Australia"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">QS / THE World University Rank *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.qsWorldRank}
                    onChange={(e) => handleFieldChange('qsWorldRank', e.target.value)}
                    placeholder="eg: 142  (top 500 mandatory)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Articulation Twinning Model</label>
                  <input
                    type="text"
                    disabled={isSubmitted}
                    value={formData.twinningModel}
                    onChange={(e) => handleFieldChange('twinningModel', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] disabled:opacity-75"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Joint Degree Applied Intake *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.appliedIntake}
                    onChange={(e) => handleFieldChange('appliedIntake', e.target.value)}
                    placeholder="eg: 60"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-800 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {/* Stream 5: Supernumerary Quota (FN/OCI/NRI) */}
            {formData.approvalSource === "Supernumerary Seats (FN / OCI / NRI / PMSSS)" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-3">
                  <SearchableTypedDropdown
                    label="Eligible Degrees for Supernumerary Intake"
                    required
                    disabled={isSubmitted}
                    value={formData.courses}
                    onChange={(val) => handleFieldChange('courses', val)}
                    options={DEGREE_BRANCH_OPTIONS}
                    placeholder="eg: B.Tech Computer Science, B.Tech ECE, B.Tech IT..."
                    helperText="AICTE sanctioned undergraduate/postgraduate programs eligible for 15% quota."
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supernumerary Quota % *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.supernumeraryQuotaPercent}
                    onChange={(e) => handleFieldChange('supernumeraryQuotaPercent', e.target.value)}
                    placeholder="eg: 15  (max 15% under APH)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-amber-700 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Supernumerary Intake *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.appliedIntake}
                    onChange={(e) => handleFieldChange('appliedIntake', e.target.value)}
                    placeholder="eg: 72  (seats requested)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-800 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Foreign Student Welfare Advisor Name *</label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitted}
                    value={formData.foreignAdvisorName}
                    onChange={(e) => handleFieldChange('foreignAdvisorName', e.target.value)}
                    placeholder="eg: Prof. V. Geetha, Ph.D."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {/* Stream 6: Change of Site / Location */}
            {formData.approvalSource === "Change of Site / Location / Trust" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-3">
                  <SearchableTypedDropdown
                    label="Relocating Program Branches"
                    required
                    disabled={isSubmitted}
                    value={formData.courses}
                    onChange={(val) => handleFieldChange('courses', val)}
                    options={DEGREE_BRANCH_OPTIONS}
                    placeholder="eg: All sanctioned programs..."
                    helperText="Specify degree programs moving to the new proposed campus location."
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Approved Intake Transferred *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.approvedIntake}
                    onChange={(e) => handleFieldChange('approvedIntake', e.target.value)}
                    placeholder="eg: 480"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Enrolled Students Transitioning *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.enrolledStudentsCount}
                    onChange={(e) => handleFieldChange('enrolledStudentsCount', e.target.value)}
                    placeholder="eg: 1650"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Trust Resolution Date *</label>
                  <input
                    type="date"
                    required
                    disabled={isSubmitted}
                    value={formData.trustResolutionDate}
                    onChange={(e) => handleFieldChange('trustResolutionDate', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {/* Stream 7: Conversion to Co-Educational */}
            {formData.approvalSource === "Conversion of Women's Institution to Co-Educational" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-3">
                  <SearchableTypedDropdown
                    label="Co-Educational Degree Branches"
                    required
                    disabled={isSubmitted}
                    value={formData.courses}
                    onChange={(val) => handleFieldChange('courses', val)}
                    options={DEGREE_BRANCH_OPTIONS}
                    placeholder="Select branches transitioning to co-ed..."
                    helperText="All undergraduate & postgraduate courses open for general admission."
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Proposed Co-Ed Intake (AY 2026-27) *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.appliedIntake}
                    onChange={(e) => handleFieldChange('appliedIntake', e.target.value)}
                    placeholder="eg: 480"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-800 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ICC Presiding Officer Name *</label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitted}
                    value={formData.iccPresidingOfficer}
                    onChange={(e) => handleFieldChange('iccPresidingOfficer', e.target.value)}
                    placeholder="eg: Dr. Nalini Sundaram, Ph.D."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Faculty Cadre (Diversity Compliant) *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.facultyCount}
                    onChange={(e) => handleFieldChange('facultyCount', e.target.value)}
                    placeholder="eg: 64"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {/* Default Stream: Extension of Approval Routine Renewal */}
            {(formData.approvalSource === "Extension of Approval (EoA) 2026-27" || !formData.approvalSource || ![
              "New Technical Institution Approval",
              "Increase in Intake / Additional Emerging Courses",
              "Working Professionals / Flexible Timing Program",
              "Foreign University Collaboration / Twinning",
              "Supernumerary Seats (FN / OCI / NRI / PMSSS)",
              "Change of Site / Location / Trust",
              "Conversion of Women's Institution to Co-Educational"
            ].includes(formData.approvalSource)) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-3">
                  <SearchableTypedDropdown
                    label="Approved Degrees / Branches"
                    required
                    disabled={isSubmitted}
                    value={formData.courses}
                    onChange={(val) => handleFieldChange('courses', val)}
                    options={DEGREE_BRANCH_OPTIONS}
                    placeholder="Select approved degree/branch or type custom course combination..."
                    helperText="Choose standard AICTE approved branches or freely type specialized/emerging combinations."
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Previous Approved Intake</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.approvedIntake}
                    onChange={(e) => handleFieldChange('approvedIntake', e.target.value)}
                    placeholder="eg: 480"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Applied Intake (AY 2026-27) *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.appliedIntake}
                    onChange={(e) => handleFieldChange('appliedIntake', e.target.value)}
                    placeholder="eg: 540"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-800 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Faculty on Roll *</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitted}
                    value={formData.facultyCount}
                    onChange={(e) => handleFieldChange('facultyCount', e.target.value)}
                    placeholder="eg: 64  (cadre ratio 1:2:6 required)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                disabled={!step3Valid}
                title={!step3Valid ? 'Fill all stream-specific academic fields above to proceed' : ''}
                className={`font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all ${
                  step3Valid
                    ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                <span>Proceed to Statutory Documents</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Mandatory Statutory Documents (Customized to Selected Approval Stream) */}
        {currentStep === 4 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5 animate-in fade-in">
            {/* Step Header */}
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>4. Mandatory Statutory Documents (Cryptographic SHA-256 Hashed)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Statutory checklist dynamically customized for: <strong className="text-indigo-900">{formData.approvalSource}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg font-mono font-bold">
                  {formData.documents.filter(d => d.fileName).length} of {formData.documents.length} Files Ready
                </span>
                {isSubmitted && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Locked (Submitted)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Lock Notice if Already Submitted */}
            {isSubmitted ? (
              <div className="bg-amber-500/10 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-950">
                <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-xs">
                    Application Formally Submitted — Document Editing Disabled
                  </div>
                  <div className="text-[11px] text-amber-800 mt-0.5 leading-snug">
                    This application has been transmitted to the AICTE Scrutiny Officer for evaluation. To preserve regulatory audit trails, modifying or deleting documents is disabled. If the officer raises a discrepancy, you will receive a deficiency notice in the <strong>Officer Messages</strong> tab with an authorized re-upload channel.
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-indigo-950 font-medium">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    Upload the exact statutory documents specified below for <strong>{formData.approvalSource}</strong>.
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  SHA-256 Fingerprint Generated Upon Upload
                </span>
              </div>
            )}

            {/* Dynamic Documents List for the Selected Stream */}
            <div className="space-y-3">
              {formData.documents.map((doc, idx) => {
                const hasFile = Boolean(doc.fileName);

                return (
                  <div 
                    key={doc.id || idx}
                    className={`p-4 rounded-xl border transition-all ${
                      hasFile
                        ? 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                        : 'bg-rose-50/40 border-rose-200'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      {/* Document Details & Statutory Purpose */}
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                          hasFile ? 'bg-white border-slate-200 text-indigo-600' : 'bg-rose-100 border-rose-200 text-rose-600'
                        }`}>
                          <FileText className="w-4 h-4" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">{doc.type}</span>
                            <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-bold">
                              {doc.docId}
                            </span>
                            <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold uppercase">
                              {doc.requirement || 'Mandatory'}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 leading-snug">
                            {doc.purpose || 'Statutory AICTE Approval Process Handbook (APH 2026-27) Norm.'}
                          </p>

                          {/* File status */}
                          {hasFile ? (
                            <div className="text-slate-700 font-mono text-[11px] pt-0.5 flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-slate-900">{doc.fileName}</span>
                              {doc.fileSize && <span className="text-slate-400">({doc.fileSize})</span>}
                              <span className="text-slate-300">•</span>
                              <span className="text-[10px] text-slate-500 truncate max-w-xs" title={`SHA-256: ${doc.sha256}`}>
                                Hash: {doc.sha256 ? `${doc.sha256.slice(0, 16)}...` : 'Pending'}
                              </span>
                            </div>
                          ) : (
                            <div className="text-rose-600 font-bold text-[11px] pt-0.5 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Document Not Uploaded — Mandatory for AICTE Approval</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons: Upload/Replace & Delete */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        {hasFile && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 mr-1">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            <span>Hashed</span>
                          </span>
                        )}

                        {/* Upload / Replace Button */}
                        {isSubmitted ? (
                          <button
                            type="button"
                            disabled
                            className="bg-slate-100 border border-slate-200 text-slate-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-not-allowed opacity-60"
                            title="Editing disabled once application is submitted"
                          >
                            <Lock className="w-3 h-3" />
                            <span>Locked</span>
                          </button>
                        ) : (
                          <label className="cursor-pointer bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg text-slate-800 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs">
                            <Upload className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{hasFile ? 'Replace' : 'Upload File'}</span>
                            <input 
                              type="file" 
                              accept=".pdf,.png,.jpg,.jpeg"
                              className="hidden" 
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleDocumentFileUpload(doc.id, e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                        )}

                        {/* Delete Button (clears uploaded file for this requirement) */}
                        {hasFile && (
                          isSubmitted ? (
                            <button
                              type="button"
                              disabled
                              className="p-1.5 text-slate-300 border border-slate-200 rounded-lg cursor-not-allowed opacity-50"
                              title="Deleting disabled once application is submitted"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                              title="Delete / Remove this document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step Navigation Buttons */}
            <div className="flex justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                disabled={!step4Valid}
                title={!step4Valid ? `Upload all ${formData.documents.length} mandatory documents to proceed` : ''}
                className={`font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all ${
                  step4Valid
                    ? 'bg-emerald-700 hover:bg-emerald-600 text-white cursor-pointer shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                <span>Proceed to Review & Submit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Final Review & Legal Affirmation */}
        {currentStep === 5 && (
          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 animate-in fade-in">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
                <span>5. Final Review & AICTE Statutory Submission</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Review your parameters for Unique ID <strong className="text-amber-300 font-mono">{formData.uniqueId}</strong>
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-xs space-y-2 font-mono">
              <div className="flex justify-between border-b border-slate-700 pb-1.5">
                <span className="text-slate-400">Unique Application ID:</span>
                <span className="text-amber-300 font-bold">{formData.uniqueId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-1.5">
                <span className="text-slate-400">Approval Category:</span>
                <span className="text-white font-semibold">{formData.approvalSource}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-1.5">
                <span className="text-slate-400">Institution:</span>
                <span className="text-white font-semibold">{formData.institutionName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-1.5">
                <span className="text-slate-400">Documents Attached:</span>
                <span className="text-amber-300 font-bold">{formData.documents.filter(d => d.fileName).length} Files</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Applied Intake AY 2026-27:</span>
                <span className="text-emerald-400 font-bold">{formData.appliedIntake} Seats</span>
              </div>
            </div>

            {/* Detailed Section Status Overview */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-2.5 text-xs">
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Application Completeness Audit</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  allDetailsFilled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {allDetailsFilled ? 'All Details Complete' : 'Action Required'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div 
                  onClick={() => setCurrentStep(1)}
                  className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                    step1Valid ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300' : 'bg-rose-950/40 border-rose-600/50 text-rose-300 hover:bg-rose-950/60'
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    {step1Valid ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                    <span>1. Approval Stream & Identity</span>
                  </span>
                  <span className="font-mono text-[10px]">{step1Valid ? 'Completed' : 'Edit'}</span>
                </div>

                <div 
                  onClick={() => setCurrentStep(2)}
                  className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                    step2Valid ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300' : 'bg-rose-950/40 border-rose-600/50 text-rose-300 hover:bg-rose-950/60'
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    {step2Valid ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                    <span>2. Land & Infrastructure</span>
                  </span>
                  <span className="font-mono text-[10px]">{step2Valid ? 'Completed' : 'Edit'}</span>
                </div>

                <div 
                  onClick={() => setCurrentStep(3)}
                  className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                    step3Valid ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300' : 'bg-rose-950/40 border-rose-600/50 text-rose-300 hover:bg-rose-950/60'
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    {step3Valid ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                    <span>3. Academic Intake & Faculty</span>
                  </span>
                  <span className="font-mono text-[10px]">{step3Valid ? 'Completed' : 'Edit'}</span>
                </div>

                <div 
                  onClick={() => setCurrentStep(4)}
                  className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                    step4Valid ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300' : 'bg-rose-950/40 border-rose-600/50 text-rose-300 hover:bg-rose-950/60'
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    {step4Valid ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                    <span>4. Statutory Documents</span>
                  </span>
                  <span className="font-mono text-[10px]">{step4Valid ? 'Completed' : 'Upload'}</span>
                </div>
              </div>

              {!allDetailsFilled && (
                <p className="text-[11px] text-amber-400/90 pt-1 font-medium">
                  ⚠️ Note: Every section above must be completely filled out before the final submission button is enabled.
                </p>
              )}
            </div>

            {isSubmitted ? (
              <div className="bg-emerald-950/80 border border-emerald-500/60 p-4 rounded-xl text-xs space-y-1">
                <div className="text-emerald-300 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Application Successfully Submitted for Scrutiny</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Submitted on {userSession.submissionDate}. Application is currently being audited by the AICTE Regional Scrutiny Officer.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="legal-affirmation"
                  checked={declared}
                  onChange={(e) => setDeclared(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-amber-500 cursor-pointer"
                />
                <label htmlFor="legal-affirmation" className="text-xs text-slate-300 leading-relaxed cursor-pointer select-none">
                  I hereby declare that all information furnished under Unique ID <strong>{formData.uniqueId}</strong> strictly conforms to the <strong>AICTE Approval Process Handbook (APH) 2026-27</strong>. All statutory documents uploaded are authentic and verifiable.
                </label>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2 border border-slate-700 text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Documents</span>
              </button>

              {isSubmitted ? (
                <div className="bg-emerald-600/30 border border-emerald-500 text-emerald-300 font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Application Formally Submitted (Locked)</span>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !step5Valid}
                  title={
                    !allDetailsFilled
                      ? 'Please complete all details across Steps 1 to 4 first'
                      : !declared
                      ? 'Please accept the statutory declaration checkbox below'
                      : 'Click to submit for AICTE Approval'
                  }
                  className={`font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 ${
                    step5Valid && !isSubmitting
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 cursor-pointer'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Transmitting to Central Scrutiny Engine...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application for AICTE Approval 🚀</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ApplyApprovalForm;
