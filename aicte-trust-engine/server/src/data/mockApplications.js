/**
 * Mock Applications Dataset for AICTE Multi-Modal Trust Engine (SIH26261)
 * Adheres strictly to the Blueprint Schema:
 * {
 *   "docId": "DOC-2026-881",
 *   "type": "No Objection Certificate",
 *   "status": "anomaly_detected",
 *   "extractedData": { "institutionName": "Tech Engineering College", "expiryDate": "2028-12-31" },
 *   "flags": [ { "type": "ELA_Mismatch", "message": "Possible date tampering detected", "box": [120, 45, 180, 60] } ]
 * }
 * 
 * Enhanced with Advanced Features:
 * 1. Automated PII Redaction (Aadhaar, PAN, Phone, Bank Account masks)
 * 2. Cryptographic Document Hashing & Anti-Duplication Ledger (SHA-256 / pHash)
 * 3. RAG Regulatory Co-Pilot data mapping
 */

export const mockApplications = [
  {
    appId: "APP-2026-AICTE-8917",
    institutionName: "Test Tech College",
    permanentId: "1-891724012",
    applicantEmail: "principal@testtech.edu.in",
    applicantPhone: "+91 98401 23456",
    affiliatingUniversity: "Anna University, Chennai",
    region: "Southern Region (Chennai)",
    submissionDate: "2026-10-27",
    category: "Extension of Approval (EoA)",
    intakeApplied: 540,
    facultyCount: 64,
    address: "Central Tech Campus, Chennai - 600 025",
    overallStatus: "anomaly_detected",
    riskScore: 82,
    primaryDocId: "DOC-2026-885",
    documents: [
      {
        docId: "DOC-2026-885",
        type: "University Affiliation Order",
        subtype: "Annual Statutory Affiliation (AY 2026-27)",
        fileName: "University_Affiliation_Order.pdf",
        status: "anomaly_detected",
        documentCategory: "Statutory Approval",
        tamperScore: 0.78,
        extractedData: {
          institutionName: "Test Tech College",
          docNumber: "AU/ACA-AFFIL/2024/982",
          issueDate: "2024-05-12",
          expiryDate: "2024-06-30",
          signatory: "Registrar, Anna University",
          affiliatingUniversity: "Anna University, Chennai",
          sanctionedIntake: 540,
          affiliationType: "Provisional (Expired)"
        },
        expectedData: {
          institutionName: "Test Tech College",
          docNumber: "AU/ACA-AFFIL/2026/4812",
          expiryDate: "2027-06-30",
          signatory: "Registrar, Anna University",
          affiliatingUniversity: "Anna University, Chennai",
          sanctionedIntake: 540,
          affiliationType: "Permanent / Continuous Affiliation (AY 2026-27)"
        },
        flags: [
          {
            type: "Authority_API_Discrepancy",
            message: "State University Registry API records affiliation as expired on 2024-06-30. Uploaded letter claims valid affiliation for AY 2026-27.",
            box: [120, 110, 180, 40],
            relativeBox: { x: 58, y: 48, width: 28, height: 6 },
            severity: "CRITICAL",
            confidence: 0.98
          },
          {
            type: "APH_Mandatory_Clause_Missing",
            message: "Mandatory AICTE APH Chapter I Clause 4.2.8 undertaking regarding unconditional consent for surprise EVC audit is missing from uploaded schedule.",
            box: [120, 45, 180, 60],
            relativeBox: { x: 58, y: 39, width: 28, height: 7 },
            severity: "HIGH",
            confidence: 0.94
          }
        ],
        piiEntities: [
          {
            type: "AADHAAR",
            label: "Signatory Aadhaar No.",
            original: "7489 1204 8831",
            masked: "•••• •••• 8831",
            relativeBox: { x: 8, y: 79, width: 26, height: 4 }
          }
        ],
        cryptographicFingerprint: {
          sha256: "8e9201ba4910cf28ae3901bce4710103a89dc100a941ef889123049102938475",
          pHash: "b2c1409ef120",
          antiDuplicationStatus: "UNIQUE",
          collisionDetected: false,
          historicalDuplicatesCount: 0
        },
        apiVerification: {
          service: "DigiLocker / State University Registry Gateway",
          status: "MISMATCH",
          httpCode: 200,
          latencyMs: 110,
          authorityPayload: {
            validInRegistry: false,
            registeredExpiry: "2024-06-30",
            discrepancy: "Provisional affiliation lapsed. Continuous renewal certificate for AY 2026-27 not on file."
          }
        },
        elaAnalysis: {
          method: "OpenCV ELA / Fourier Analysis",
          meanErrorLevel: 0.28,
          maxDiff: 42,
          anomalyContourCount: 2,
          splicingDetected: true
        }
      }
    ],
    auditTimeline: [
      {
        id: "EVT-8901",
        timestamp: "2026-10-27T09:30:00Z",
        stage: "Submission",
        actor: "Applicant Institution Gateway",
        action: "AICTE Approval Application Submitted",
        details: "Institution Test Tech College submitted application for Extension of Approval (EoA) 2026-27.",
        hash: "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678",
        status: "INFO"
      },
      {
        id: "EVT-8902",
        timestamp: "2026-10-27T09:30:15Z",
        stage: "AI Automated Scrutiny",
        actor: "AI Multi-Modal Trust Engine",
        action: "Anomaly Detected by AI Forensics (Officer Review Triggered)",
        details: "AI Forensics identified regulatory anomaly in DOC-2026-885. Flagged in Regional Officer Scrutiny Console.",
        hash: "b2c3d4e5f60718293a4b5c6d7e8f90123456789a",
        status: "CRITICAL"
      }
    ]
  },
  {
    appId: "APP-2026-AICTE-1081",
    institutionName: "Tech Engineering College",
    region: "Southern Region (Chennai)",
    submissionDate: "2026-10-18",
    category: "Extension of Approval (EoA)",
    intakeApplied: 480,
    overallStatus: "anomaly_detected",
    riskScore: 88,
    primaryDocId: "DOC-2026-881",
    documents: [
      {
        docId: "DOC-2026-881",
        type: "No Objection Certificate",
        subtype: "State Directorate of Technical Education NOC",
        fileName: "DTE_NOC_Tech_Engg_2026.pdf",
        status: "anomaly_detected",
        documentCategory: "Statutory Approval",
        extractedData: {
          institutionName: "Tech Engineering College",
          docNumber: "DTE/TN/NOC/2021/881",
          issueDate: "2021-07-15",
          expiryDate: "2028-12-31",
          issuingAuthority: "Directorate of Technical Education, Guindy",
          signatory: "Dr. K. R. Ramanathan, Director",
          sanctionedBranches: "CSE, ECE, Mech, Civil",
          signatoryAadhaar: "•••• •••• 8831",
          officialContact: "+91 98••• ••456",
          trustPan: "•••••8492K"
        },
        expectedData: {
          institutionName: "Tech Engineering College",
          docNumber: "DTE/TN/NOC/2021/881",
          issueDate: "2021-07-15",
          expiryDate: "2024-06-30",
          issuingAuthority: "Directorate of Technical Education, Guindy",
          signatory: "Dr. K. R. Ramanathan, Director",
          sanctionedBranches: "CSE, ECE, Mech, Civil",
          signatoryAadhaar: "•••• •••• 8831",
          officialContact: "+91 98••• ••456",
          trustPan: "•••••8492K"
        },
        tamperScore: 0.89,
        // Advanced Feature 1: Automated PII Redaction
        piiEntities: [
          {
            type: "AADHAAR",
            label: "Signatory Aadhaar No.",
            original: "7489 1204 8831",
            masked: "•••• •••• 8831",
            box: [38, 325, 145, 18],
            relativeBox: { x: 8, y: 79, width: 26, height: 4 }
          },
          {
            type: "PAN",
            label: "Trust PAN Card",
            original: "AAACT8492K",
            masked: "•••••8492K",
            box: [210, 325, 110, 18],
            relativeBox: { x: 50, y: 79, width: 20, height: 4 }
          },
          {
            type: "PHONE",
            label: "Direct Dial Telephone",
            original: "+91 98401 23456",
            masked: "+91 98••• ••456",
            box: [38, 345, 130, 18],
            relativeBox: { x: 8, y: 84, width: 23, height: 4 }
          }
        ],
        // Advanced Feature 2: Cryptographic Document Hashing & Anti-Duplication
        cryptographicFingerprint: {
          sha256: "e3a8901bce4710103a89dc100a941ef889123049102938475610293847561029",
          pHash: "a1c490e8f120",
          antiDuplicationStatus: "UNIQUE",
          collisionDetected: false,
          historicalDuplicatesCount: 0,
          hashRegistryTimestamp: "2026-10-18T09:30:14Z",
          message: "Unique document fingerprint. 0 collisions across 48,920 AICTE repository records."
        },
        flags: [
          {
            type: "ELA_Mismatch",
            message: "Possible date tampering detected: Compression artifacts spike in '2028-12-31' region",
            box: [120, 45, 180, 60],
            relativeBox: { x: 58, y: 39, width: 28, height: 7 },
            severity: "CRITICAL",
            confidence: 0.94
          },
          {
            type: "Authority_API_Discrepancy",
            message: "State DTE API records document expiry as 2024-06-30 (Expired 28 months ago)",
            box: [120, 110, 180, 40],
            relativeBox: { x: 58, y: 48, width: 28, height: 6 },
            severity: "CRITICAL",
            confidence: 1.0
          }
        ],
        apiVerification: {
          service: "DigiLocker / State DTE Gateway",
          endpoint: "https://api.digitallocker.gov.in/public/dte/v2/verify",
          status: "MISMATCH",
          httpCode: 200,
          latencyMs: 142,
          authorityPayload: {
            validInRegistry: true,
            originalDocHash: "7b4a2f891100cead2b591901c8741",
            submittedDocHash: "e3a8901bce4710103a89dc100a941",
            hashMatched: false,
            registeredExpiry: "2024-06-30"
          }
        },
        elaAnalysis: {
          method: "OpenCV ELA / PIL Chops (Quality: 90, Factor: 15x)",
          meanErrorLevel: 0.28,
          maxDiff: 42,
          anomalyContourCount: 2,
          splicingDetected: true
        }
      },
      {
        docId: "DOC-2026-882",
        type: "Building & Fire Safety Certificate",
        subtype: "Fire Services NOC",
        fileName: "Fire_Safety_Certificate_2026.pdf",
        status: "verified",
        documentCategory: "Safety Compliance",
        extractedData: {
          institutionName: "Tech Engineering College",
          certificateNo: "TN-FIRE-DIV3-4921",
          issueDate: "2026-02-10",
          validUntil: "2027-02-09",
          station: "Central Fire Division",
          officerName: "M. Vasanth, Divisional Fire Officer"
        },
        expectedData: {
          institutionName: "Tech Engineering College",
          certificateNo: "TN-FIRE-DIV3-4921",
          issueDate: "2026-02-10",
          validUntil: "2027-02-09",
          station: "Central Fire Division",
          officerName: "M. Vasanth, Divisional Fire Officer"
        },
        tamperScore: 0.04,
        piiEntities: [],
        cryptographicFingerprint: {
          sha256: "91e0a29384756102938475610293847561029384756102938475610293847561",
          pHash: "c41098a72b01",
          antiDuplicationStatus: "UNIQUE",
          collisionDetected: false,
          historicalDuplicatesCount: 0
        },
        flags: [],
        apiVerification: {
          service: "Fire Safety Portal (National e-Services)",
          endpoint: "https://firesafety.tn.gov.in/api/v1/certificates/TN-FIRE-DIV3-4921",
          status: "VERIFIED",
          httpCode: 200,
          latencyMs: 98,
          authorityPayload: {
            validInRegistry: true,
            hashMatched: true,
            inspectionPassed: true
          }
        }
      }
    ],
    auditTimeline: [
      {
        id: "EVT-1001",
        timestamp: "2026-10-18T09:30:14Z",
        stage: "Ingestion",
        actor: "AICTE Portal Subsystem",
        action: "Application Received & PDF Ingested",
        details: "Institutional application submitted with 2 statutory documents. File hashes registered.",
        hash: "6f52a714b18c0e7da3c0b1ff9196b270a4a8",
        status: "INFO"
      },
      {
        id: "EVT-1002",
        timestamp: "2026-10-18T09:30:22Z",
        stage: "Confidentiality AI",
        actor: "Automated PII Redaction Engine",
        action: "Sensitive PII Masked (Privacy Guard Active)",
        details: "Detected and redacted Signatory Aadhaar No. (7489 1204 8831) and Trust PAN (AAACT8492K) per AICTE Confidentiality Protocol.",
        hash: "7e2a9b0114cc90ef11dae619c01bcde88390",
        status: "INFO"
      },
      {
        id: "EVT-1003",
        timestamp: "2026-10-18T09:30:31Z",
        stage: "Forensic CV",
        actor: "OpenCV ELA Forensics Service",
        action: "Error Level Analysis (ELA) Scan Executed",
        details: "Compression artifact anomaly detected in box [120, 45, 180, 60]. High variance (maxDiff: 42) indicates digital splicing of expiry date font layer.",
        hash: "3d99cb109012bbec4091aae0041288cba17e",
        status: "ALERT"
      },
      {
        id: "EVT-1004",
        timestamp: "2026-10-18T09:30:45Z",
        stage: "API Cross-Check",
        actor: "Simulated DigiLocker REST Client",
        action: "Mock API Pinged: State DTE Database",
        details: "Registry query for DTE/TN/NOC/2021/881 returned mismatch: Database expiry is 2024-06-30 vs document claimed 2028-12-31.",
        hash: "49a12c8b0fe91244e88102941bcae89012aa",
        status: "ALERT"
      },
      {
        id: "EVT-1005",
        timestamp: "2026-10-18T09:31:00Z",
        stage: "Decision Support",
        actor: "Regulatory Engine (AICTE APH 2026)",
        action: "AICTE Handbook Rule APH-RULE-201 Triggered",
        details: "Flagged CRITICAL Anomaly: Expired NOC presented with forged extension date. Automated recommendation: Issue Deficiency Memo & Halt EoA.",
        hash: "c2901aefb900118237e192004bb1ae883011",
        status: "CRITICAL"
      }
    ]
  },
  {
    appId: "APP-2026-AICTE-1082",
    institutionName: "Apex Institute of Technology & Management",
    region: "Northern Region (Kanpur)",
    submissionDate: "2026-10-19",
    category: "Extension of Approval (EoA) - Intake Increase",
    intakeApplied: 360,
    overallStatus: "anomaly_detected",
    riskScore: 76,
    primaryDocId: "DOC-2026-883",
    documents: [
      {
        docId: "DOC-2026-883",
        type: "Infrastructure Photo Evidence",
        subtype: "Central Computing Facility (Lab A)",
        fileName: "Apex_Computer_Lab_GeoPhoto_2026.jpg",
        status: "anomaly_detected",
        documentCategory: "Infrastructure Validation",
        extractedData: {
          facilityName: "Central Computing Center - Hall 1",
          claimedComputers: 60,
          processorSpecs: "Intel Core i7 12th Gen, 16GB RAM",
          lanInfrastructure: "Gigabit Ethernet switch 48-port",
          roomAreaSqM: 185
        },
        expectedData: {
          facilityName: "Central Computing Center - Hall 1",
          claimedComputers: 60,
          yoloDetectedComputers: 24,
          deficit: 36,
          regulatoryMinRequirement: 60,
          complianceStatus: "NON_COMPLIANT"
        },
        tamperScore: 0.15,
        piiEntities: [],
        // Advanced Feature 2: Evidence Recycling Collision
        cryptographicFingerprint: {
          sha256: "a4f89d01248100bcdaef1290bb3410ea9104bce8110029384756102938475610",
          pHash: "bf84a209c118",
          antiDuplicationStatus: "FRAUD_DUPLICATE_COLLISION",
          collisionDetected: true,
          matchConfidence: 1.0,
          collidingAppId: "APP-2024-AICTE-0419",
          collidingInstitution: "Horizon Engineering Academy, Meerut",
          historicalCycle: "2024-25",
          message: "CRITICAL COLLISION: 100% SHA-256 match found in AICTE National Repository. Exactly identical photograph submitted 2 years ago by 'Horizon Engineering Academy, Meerut' (APP-2024-AICTE-0419). Fraudulent evidence recycling!"
        },
        flags: [
          {
            type: "CrossModal_CV_Deficit",
            message: "Cross-Modal CV: YOLOv8 detected only 24 operational computer terminals vs 60 claimed in application (36 units deficit)",
            box: [80, 60, 320, 210],
            relativeBox: { x: 12, y: 15, width: 76, height: 65 },
            severity: "CRITICAL",
            confidence: 0.96
          },
          {
            type: "Cryptographic_Evidence_Recycling",
            message: "Anti-Duplication Ledger: 100% SHA-256 Collision with 2024 photo from another institution (Horizon Engineering Academy)",
            box: [80, 10, 320, 35],
            relativeBox: { x: 12, y: 2, width: 76, height: 10 },
            severity: "CRITICAL",
            confidence: 1.0
          }
        ],
        crossModalCV: {
          model: "YOLOv8x Infrastructure Object Detector",
          claimedCount: 60,
          detectedCount: 24,
          breakdown: {
            "monitors_detected": 24,
            "cpus_detected": 21,
            "keyboards_detected": 24,
            "empty_desks": 18
          },
          handbookThreshold: 60,
          verdict: "FAILED_MINIMUM_COMPUTER_NORM"
        },
        apiVerification: {
          service: "Geotag & Time-Lock Registry",
          endpoint: "https://geotag.aicte-india.org/api/v1/exif-verify",
          status: "VERIFIED_GEOLOC",
          httpCode: 200,
          latencyMs: 88,
          authorityPayload: {
            lat: 26.8467,
            lon: 80.9462,
            matchesCampusGeoFence: true
          }
        }
      }
    ],
    auditTimeline: [
      {
        id: "EVT-2001",
        timestamp: "2026-10-19T11:15:00Z",
        stage: "Ingestion",
        actor: "AICTE Portal Subsystem",
        action: "Infrastructure Geotagged Photo Uploaded",
        details: "Photo evidence ingested for Lab Hall 1 claiming 60 terminals for intake expansion.",
        hash: "1b88e100aa74b291c900eef182a710183301",
        status: "INFO"
      },
      {
        id: "EVT-2002",
        timestamp: "2026-10-19T11:15:15Z",
        stage: "Anti-Duplication Engine",
        actor: "Cryptographic Hash Ledger",
        action: "100% SHA-256 Collision Flagged",
        details: "File hash matches APP-2024-AICTE-0419 submitted by Horizon Engineering Academy in Meerut. Evidence recycling detected.",
        hash: "2c79a900bb61c828da11fee271b820194412",
        status: "CRITICAL"
      },
      {
        id: "EVT-2003",
        timestamp: "2026-10-19T11:15:25Z",
        stage: "Cross-Modal CV",
        actor: "YOLOv8 Computer Vision Pipeline",
        action: "Object Counting Inference Executed",
        details: "Identified 24 monitors and 18 vacant desks. Claim of 60 machines not supported by visual evidence.",
        hash: "3d6aa811cc52d739eb22ffd362c930105523",
        status: "CRITICAL"
      },
      {
        id: "EVT-2004",
        timestamp: "2026-10-19T11:15:40Z",
        stage: "Regulatory Engine",
        actor: "AICTE Handbook APH-RULE-304",
        action: "Deficiency Flagged: Computer Norm Breach",
        details: "Required: 60 PCs. Actual count: 24. Deficit of 36 units violates Chapter VII Table 7.1.",
        hash: "4e5bb722dd43e640fc3300e453da40116634",
        status: "CRITICAL"
      }
    ]
  },
  {
    appId: "APP-2026-AICTE-1083",
    institutionName: "National Institute of Science & Polytechnic",
    permanentId: "1-789123456",
    applicantEmail: "director@nationalpoly.edu.in",
    applicantPhone: "+91 98220 11223",
    affiliatingUniversity: "Maharashtra State Board of Technical Education (MSBTE)",
    region: "Western Region (Mumbai)",
    submissionDate: "2026-10-20",
    category: "Extension of Approval (EoA)",
    intakeApplied: 600,
    overallStatus: "verified",
    riskScore: 6,
    primaryDocId: "DOC-2026-884",
    documents: [
      {
        docId: "DOC-2026-884",
        type: "Land Ownership Title & Lease Deed",
        subtype: "Sub-Registrar Registered Deed",
        fileName: "Land_Deed_National_Poly_2026.pdf",
        status: "verified",
        documentCategory: "Land & Building Norms",
        extractedData: {
          institutionName: "National Institute of Science & Polytechnic",
          deedRegistrationNo: "REG-MH-PUNE-2015-9921",
          totalAcreage: "8.25 Acres",
          landUseCategory: "Educational / Institutional Zone",
          leasePeriod: "99 Years (Unexpired: 88 Years)",
          encumbranceStatus: "Nil / Clear Title",
          trusteeAadhaar: "•••• •••• 9912"
        },
        expectedData: {
          institutionName: "National Institute of Science & Polytechnic",
          deedRegistrationNo: "REG-MH-PUNE-2015-9921",
          totalAcreage: "8.25 Acres",
          landUseCategory: "Educational / Institutional Zone",
          leasePeriod: "99 Years (Unexpired: 88 Years)",
          encumbranceStatus: "Nil / Clear Title",
          trusteeAadhaar: "•••• •••• 9912"
        },
        tamperScore: 0.02,
        piiEntities: [
          {
            type: "AADHAAR",
            label: "Trustee Aadhaar No.",
            original: "9102 4491 9912",
            masked: "•••• •••• 9912",
            box: [40, 310, 135, 18],
            relativeBox: { x: 10, y: 78, width: 25, height: 4 }
          }
        ],
        cryptographicFingerprint: {
          sha256: "7b2ee4550016b773cf6633d726ad701499671029384756102938475610293847",
          pHash: "d1948ba024c1",
          antiDuplicationStatus: "UNIQUE",
          collisionDetected: false,
          historicalDuplicatesCount: 0,
          message: "0 collisions across 48,920 records. Authentic land deed."
        },
        flags: [],
        apiVerification: {
          service: "State Land Records (MahaBhulekh) / DigiLocker",
          endpoint: "https://bhulekh.mahabhumi.gov.in/api/v2/verify-title",
          status: "VERIFIED",
          httpCode: 200,
          latencyMs: 110,
          authorityPayload: {
            validInRegistry: true,
            registeredOwner: "National Educational Trust",
            khataNumber: "KH-40291",
            hashMatched: true
          }
        }
      }
    ],
    auditTimeline: [
      {
        id: "EVT-3001",
        timestamp: "2026-10-20T14:10:00Z",
        stage: "Ingestion",
        actor: "AICTE Portal Subsystem",
        action: "Registered Land Deed Ingested",
        details: "Deed REG-MH-PUNE-2015-9921 received with digital signature certificate.",
        hash: "5f4cc633ee34f551ad4411f544eb50127745",
        status: "INFO"
      },
      {
        id: "EVT-3002",
        timestamp: "2026-10-20T14:10:15Z",
        stage: "Forensic ELA",
        actor: "OpenCV ELA Forensics Service",
        action: "Error Level Analysis: Clean Pass",
        details: "Uniform compression gradient across all pages. Tamper score 0.02 (well below threshold).",
        hash: "6a3dd544ff25a662be5522e635fc60138856",
        status: "SUCCESS"
      },
      {
        id: "EVT-3003",
        timestamp: "2026-10-20T14:10:28Z",
        stage: "API Ping",
        actor: "State Land Registry Integration",
        action: "MahaBhulekh REST Gateway Queried",
        details: "Survey No. 42/1 confirmed institutional zone, 8.25 contiguous acres, 88 years unexpired.",
        hash: "7b2ee4550016b773cf6633d726ad70149967",
        status: "SUCCESS"
      },
      {
        id: "EVT-3004",
        timestamp: "2026-10-20T14:10:35Z",
        stage: "Regulatory Engine",
        actor: "AICTE Regulatory Ruleset APH-RULE-412",
        action: "Rule Check: Passed All Regulatory Norms",
        details: "All AICTE APH requirements satisfied. Ready for automated green-channel clearance.",
        hash: "8c1ff3661107c884da7744c817be80150078",
        status: "SUCCESS"
      }
    ]
  },
  {
    appId: "APP-2026-AICTE-1085",
    institutionName: "Greenfield Technical Academy",
    region: "Central Region (Bhopal)",
    submissionDate: "2026-10-22",
    category: "Extension of Approval (EoA)",
    intakeApplied: 300,
    overallStatus: "anomaly_detected",
    riskScore: 79,
    primaryDocId: "DOC-2026-886",
    documents: [
      {
        docId: "DOC-2026-886",
        type: "Statutory Affidavit (Rs 100 Non-Judicial)",
        subtype: "Form 1 Undertaking Affidavit",
        fileName: "Greenfield_Statutory_Affidavit_2026.pdf",
        status: "anomaly_detected",
        documentCategory: "Statutory Undertakings",
        extractedData: {
          institutionName: "Greenfield Technical Academy",
          stampPaperSerial: "MP-STAMP-849201",
          notaryRegNo: "NOTARY/MP/2018/142",
          notarizedDate: "2026-10-14",
          deponentName: "Rajeshwar Sharma, Secretary",
          deponentAadhaar: "•••• •••• 7182"
        },
        expectedData: {
          institutionName: "Greenfield Technical Academy",
          stampPaperSerial: "MP-STAMP-849201",
          missingClauses: [
            "Clause 4.2.1: Prevention and Prohibition of Ragging",
            "Clause 4.2.8: Unconditional Consent for Surprise AICTE EVC Audit"
          ],
          statutoryCompliance: "INCOMPLETE"
        },
        tamperScore: 0.12,
        piiEntities: [
          {
            type: "AADHAAR",
            label: "Deponent Aadhaar No.",
            original: "8492 0184 7182",
            masked: "•••• •••• 7182",
            box: [45, 305, 140, 18],
            relativeBox: { x: 10, y: 84, width: 25, height: 4 }
          }
        ],
        cryptographicFingerprint: {
          sha256: "2ab113005541ac28be1188ec31f2c01944121029384756102938475610293847",
          pHash: "f10928bb4910",
          antiDuplicationStatus: "UNIQUE",
          collisionDetected: false,
          historicalDuplicatesCount: 0
        },
        flags: [
          {
            type: "Missing_Mandatory_Clause",
            message: "Missing mandatory statutory clause 4.2.1 (Anti-Ragging Declaration) and clause 4.2.8 (EVC Consent) required under APH 2026-27",
            box: [50, 240, 360, 60],
            relativeBox: { x: 10, y: 68, width: 80, height: 12 },
            severity: "CRITICAL",
            confidence: 0.99
          }
        ],
        apiVerification: {
          service: "e-Stamp Verification Portal (SHCIL)",
          endpoint: "https://shcilestamp.com/api/v1/verify-certificate",
          status: "VERIFIED_STAMP",
          httpCode: 200,
          latencyMs: 120,
          authorityPayload: {
            stampPaperValid: true,
            purchaser: "Greenfield Technical Academy",
            amount: 100
          }
        }
      }
    ],
    auditTimeline: [
      {
        id: "EVT-5001",
        timestamp: "2026-10-22T06:10:00Z",
        stage: "Ingestion",
        actor: "AICTE Portal Subsystem",
        action: "Statutory Affidavit Ingested",
        details: "Stamp paper MP-STAMP-849201 OCR scanned.",
        hash: "2ab113005541ac28be1188ec31f2c0194412",
        status: "INFO"
      },
      {
        id: "EVT-5002",
        timestamp: "2026-10-22T06:10:14Z",
        stage: "Contextual NLP",
        actor: "SpaCy Clause Extractor",
        action: "Statutory Clause Coverage Evaluation",
        details: "Found only 2 of 4 required mandatory undertakings. Omitted anti-ragging & EVC audit consent clauses.",
        hash: "3bc224116652bd39cf2299fd42a3d0205523",
        status: "CRITICAL"
      },
      {
        id: "EVT-5003",
        timestamp: "2026-10-22T06:10:25Z",
        stage: "Regulatory Engine",
        actor: "AICTE Handbook APH-RULE-619",
        action: "Non-Compliance Flagged: Mandatory Clause Deficit",
        details: "Automated deficiency memo drafted for immediate applicant rectification.",
        hash: "4cd335227763ce40da33000e53b4e0216634",
        status: "CRITICAL"
      }
    ]
  }
];


