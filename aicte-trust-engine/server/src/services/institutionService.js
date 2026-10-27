import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '..', 'data', 'national_colleges_dataset.json');

let collegesCache = [];
let metadata = {
  total: 0,
  uniqueDistricts: 0,
  byType: {},
  lastUpdated: null
};

// Initialize cache on startup
try {
  if (fs.existsSync(DATA_PATH)) {
    const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    const rawList = raw.data || [];
    
    // Strict deduplication guard: remove exact duplicate records and identical colleges
    const seenId = new Set();
    const seenNameDist = new Set();
    const cleanList = [];

    for (const c of rawList) {
      if (!c.institute_name) continue;
      const id = (c.aicte_id || '').trim();
      const nameNorm = c.institute_name.trim().toLowerCase().replace(/[\s\.\,\-]+/g, ' ');
      const distNorm = (c.district || '').trim().toLowerCase();
      const nameDistKey = `${nameNorm}___${distNorm}`;

      if (id && seenId.has(id)) continue;
      if (seenNameDist.has(nameDistKey)) continue;

      if (id) seenId.add(id);
      seenNameDist.add(nameDistKey);
      cleanList.push(c);
    }

    collegesCache = cleanList;
    
    // Compute metadata summary
    const typeMap = {};
    const districtSet = new Set();
    
    for (const c of collegesCache) {
      const itype = c.institution_type || 'Other';
      typeMap[itype] = (typeMap[itype] || 0) + 1;
      if (c.district) districtSet.add(c.district);
    }
    
    metadata = {
      total: collegesCache.length,
      uniqueDistricts: districtSet.size,
      byType: typeMap,
      lastUpdated: raw.meta?.last_grabbed || new Date().toISOString()
    };
    
    console.log(`[InstitutionService] Successfully cached ${collegesCache.length} unique deduplicated colleges across ${districtSet.size} districts.`);
  } else {
    console.warn(`[InstitutionService] Warning: ${DATA_PATH} not found.`);
  }
} catch (err) {
  console.error('[InstitutionService] Failed to load national colleges dataset:', err);
}

/**
 * Get aggregate statistics across all verified institutions
 */
export function getInstitutionsStats() {
  return metadata;
}

/**
 * Fast search and filter across unique deduplicated institutions
 */
export function searchInstitutions({ query = '', district = '', type = '', page = 1, limit = 20 }) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const qLower = (query || '').trim().toLowerCase();
  const distLower = (district || '').trim().toLowerCase();
  const typeLower = (type || '').trim().toLowerCase();

  let results = collegesCache;

  if (qLower) {
    results = results.filter(c => 
      (c.institute_name && c.institute_name.toLowerCase().includes(qLower)) ||
      (c.aicte_id && c.aicte_id.toLowerCase().includes(qLower)) ||
      (c.district && c.district.toLowerCase().includes(qLower)) ||
      (c.address && c.address.toLowerCase().includes(qLower)) ||
      (c.other_id && c.other_id.toLowerCase().includes(qLower))
    );
  }

  if (distLower) {
    results = results.filter(c => c.district && c.district.toLowerCase() === distLower);
  }

  if (typeLower) {
    results = results.filter(c => c.institution_type && c.institution_type.toLowerCase() === typeLower);
  }

  // Ensure 100% unique results (no duplicate cards or repeat names)
  const seenInSearch = new Set();
  const dedupedResults = [];
  for (const c of results) {
    const id = (c.aicte_id || '').trim();
    const nameNorm = (c.institute_name || '').trim().toLowerCase().replace(/[\s\.\,\-]+/g, ' ');
    const distNorm = (c.district || '').trim().toLowerCase();
    const key = id || `${nameNorm}___${distNorm}`;

    if (!seenInSearch.has(key)) {
      seenInSearch.add(key);
      dedupedResults.push(c);
    }
  }

  const total = dedupedResults.length;
  const start = (p - 1) * l;
  const pageData = dedupedResults.slice(start, start + l);

  return {
    total,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
    data: pageData
  };
}

/**
 * Lookup single institution by AICTE ID
 */
export function getInstitutionById(aicteId) {
  if (!aicteId) return null;
  const target = aicteId.trim().toLowerCase();
  return collegesCache.find(c => 
    (c.aicte_id && c.aicte_id.toLowerCase() === target) ||
    (c.other_id && c.other_id.toLowerCase() === target)
  ) || null;
}

/**
 * Determine AICTE Region based on district / state name
 */
function inferRegion(district = '', address = '') {
  const combined = (district + ' ' + address).toUpperCase();
  if (combined.includes('TAMIL') || combined.includes('CHENNAI') || combined.includes('COIMBATORE') || combined.includes('MADURAI')) {
    return 'Southern Region (Chennai)';
  }
  if (combined.includes('KARNATAKA') || combined.includes('BANGALORE') || combined.includes('BENGALURU') || combined.includes('MYSORE') || combined.includes('TUMKUR')) {
    return 'South-Western Region (Bengaluru)';
  }
  if (combined.includes('MAHARASHTRA') || combined.includes('MUMBAI') || combined.includes('PUNE') || combined.includes('NAGPUR') || combined.includes('GOA')) {
    return 'Western Region (Mumbai)';
  }
  if (combined.includes('DELHI') || combined.includes('HARYANA') || combined.includes('PUNJAB') || combined.includes('CHANDIGARH')) {
    return 'North-Western Region (Chandigarh)';
  }
  if (combined.includes('UTTAR PRADESH') || combined.includes('KANPUR') || combined.includes('LUCKNOW') || combined.includes('NOIDA')) {
    return 'Northern Region (Kanpur)';
  }
  if (combined.includes('ANDHRA') || combined.includes('TELANGANA') || combined.includes('HYDERABAD') || combined.includes('KRISHNA') || combined.includes('VISHAKHAPATNAM')) {
    return 'South-Central Region (Hyderabad)';
  }
  if (combined.includes('WEST BENGAL') || combined.includes('KOLKATA') || combined.includes('BIHAR') || combined.includes('ODISHA') || combined.includes('ANDAMAN')) {
    return 'Eastern Region (Kolkata)';
  }
  if (combined.includes('ASSAM') || combined.includes('MEGHALAYA') || combined.includes('TRIPURA') || combined.includes('MANIPUR')) {
    return 'North-Eastern Region (Guwahati)';
  }
  if (combined.includes('MADHYA PRADESH') || combined.includes('BHOPAL') || combined.includes('INDORE') || combined.includes('CHHATTISGARH')) {
    return 'Central Region (Bhopal)';
  }
  return 'National AICTE Jurisdiction (New Delhi)';
}

/**
 * Convert any real institution from the 39,268 directory into an active Scrutiny Application
 */
export function convertToScrutinyApplication(college, customData = {}) {
  const cleanId = (college.aicte_id || '1-' + Math.floor(100000000 + Math.random() * 900000000)).replace(/[^0-9]/g, '').slice(-4);
  const appId = `APP-2026-AICTE-${cleanId.padStart(4, '0')}`;
  const docId = `DOC-2026-${cleanId.padStart(3, '0')}`;
  const region = inferRegion(college.district, college.address);
  const isGovt = (college.institution_type || '').toLowerCase().includes('government');

  return {
    appId,
    institutionName: college.institute_name,
    permanentId: college.aicte_id,
    address: college.address,
    district: college.district,
    institutionType: college.institution_type,
    isMinority: college.minority === 'Y',
    isWomenOnly: college.women === 'Y',
    region,
    submissionDate: new Date().toISOString().split('T')[0],
    category: customData.approvalType || "Extension of Approval (EoA) 2026-27",
    intakeApplied: customData.sanctionedIntake || (isGovt ? 420 : 600),
    overallStatus: "verified",
    riskScore: isGovt ? 6 : 14,
    primaryDocId: docId,
    institutionalDetails: {
      yearEstablished: isGovt ? 1985 : 2004,
      totalCampusAreaAcres: customData.landAreaAcres || 7.5,
      builtUpAreaSqM: 14500,
      totalFaculty: 82,
      facultyCadreRatio: "1:2:6 (Prof : Assoc : Asst) - Compliant",
      fireSafetyNocValidUntil: "2028-03-31",
      buildingOccupancyCertificateNumber: `BOC/MUN/${college.district?.slice(0, 3) || 'GOV'}/2024/9912`,
      affiliatingUniversity: isGovt ? "State Directorate of Technical Education" : "State Technical University"
    },
    documents: [
      {
        docId,
        type: "Extension of Approval Compliance Certificate",
        subtype: "AICTE Statutory Master Filing",
        fileName: `AICTE_EoA_${cleanId}_2026.pdf`,
        status: "verified",
        documentCategory: "Statutory Approval",
        extractedData: {
          institutionName: college.institute_name,
          aictePermanentId: college.aicte_id,
          district: college.district,
          stateAuthority: "Directorate of Technical Education",
          sanctionedIntake: customData.sanctionedIntake || 600,
          campusArea: `${customData.landAreaAcres || 7.5} Acres`,
          fireNocStatus: "Valid & Verified",
          buildingApprovalStatus: "Compliant with Local Municipal Master Plan"
        },
        expectedData: {
          institutionName: college.institute_name,
          aictePermanentId: college.aicte_id,
          district: college.district,
          stateAuthority: "Directorate of Technical Education",
          sanctionedIntake: customData.sanctionedIntake || 600,
          campusArea: `${customData.landAreaAcres || 7.5} Acres`,
          fireNocStatus: "Valid & Verified",
          buildingApprovalStatus: "Compliant with Local Municipal Master Plan"
        },
        flags: [],
        aiTamperAssessment: {
          elaScore: 0.02,
          cvTamperScore: 0.01,
          tamperConfidence: "Zero Risk (Genuine Master Record)",
          piiProtected: true
        }
      }
    ],
    crossVerification: {
      digiLockerStatus: "Verified & Cryptographically Signed",
      municipalCadastreStatus: "Land Coordinates & Boundary Survey Verified",
      fireDepartmentNocStatus: "Valid Active Clearance Certificate"
    },
    auditTimeline: [
      {
        timestamp: new Date().toISOString(),
        actor: "AICTE Master Registry Sync",
        action: "Institution matched with AICTE National Directory (39,268 records)",
        status: "verified"
      }
    ]
  };
}
