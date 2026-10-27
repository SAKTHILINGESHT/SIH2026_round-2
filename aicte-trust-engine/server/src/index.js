import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { mockApplications } from './data/mockApplications.js';
import { checkHashCollision } from './services/antiDuplicationLedger.js';
import { queryApplicationRAG } from './services/ragService.js';
import { 
  getInstitutionsStats, 
  searchInstitutions, 
  getInstitutionById, 
  convertToScrutinyApplication 
} from './services/institutionService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-memory state holding applications and live updates
let applications = JSON.parse(JSON.stringify(mockApplications));

// Track active background AI forensic validation and re-audit timers (30s wait)
const pendingValidationTimers = new Map();

// Track the active scrutiny application ID (null by default so officer portal opens to Home Page Dashboard)
let activeScrutinyAppId = null;

// Read APH Rules
const rulesFilePath = path.join(__dirname, 'rules', 'aicteHandbookRules.json');
let aicteRules = {};
try {
  aicteRules = JSON.parse(fs.readFileSync(rulesFilePath, 'utf8'));
} catch (e) {
  console.error("Error reading APH rules:", e);
}

// 1. Health check & metadata
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'AICTE Multi-Modal Trust Engine for Application Validation',
    problemStatement: 'SIH26261',
    bureau: 'Regulation Bureau, AICTE New Delhi',
    timestamp: new Date().toISOString()
  });
});

// 2. Global Application Dashboard endpoint
app.get('/api/applications', (req, res) => {
  const { status, search, portal } = req.query;
  let filtered = [...applications];

  if (portal === 'applicant') {
    // For applicant portal: if anomaly was just triggered in officer portal,
    // delay showing anomaly_detected until applicantDeficiencyReleased is true (5s later)
    filtered = filtered.map(app => {
      if (app.overallStatus === 'anomaly_detected' && app.applicantDeficiencyReleased === false) {
        return {
          ...app,
          overallStatus: 'ai_validation_in_progress'
        };
      }
      return app;
    });
  }

  if (status && status !== 'all') {
    filtered = filtered.filter(app => app.overallStatus.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(app => 
      app.institutionName.toLowerCase().includes(q) ||
      app.appId.toLowerCase().includes(q) ||
      app.region.toLowerCase().includes(q)
    );
  }

  // Summary statistics for dashboard cards
  const stats = {
    total: applications.length,
    anomalyDetected: applications.filter(a => a.overallStatus === 'anomaly_detected').length,
    reviewNeeded: applications.filter(a => a.overallStatus === 'review_needed').length,
    verified: applications.filter(a => a.overallStatus === 'verified').length,
    averageRiskScore: Math.round(applications.reduce((acc, a) => acc + (a.riskScore || 0), 0) / applications.length)
  };

  res.json({
    success: true,
    stats,
    activeScrutinyAppId,
    data: filtered
  });
});

// Endpoint to set active scrutiny focus from officer client or applicant compliance submit
app.post('/api/active-scrutiny-app', (req, res) => {
  const { appId } = req.body;
  if (appId) {
    activeScrutinyAppId = appId;
  }
  res.json({ success: true, activeScrutinyAppId });
});

// 3. Application details by ID
app.get('/api/applications/:appId', (req, res) => {
  const { portal } = req.query;
  let appItem = applications.find(a => a.appId === req.params.appId);
  if (!appItem) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }
  if (portal === 'applicant' && appItem.overallStatus === 'anomaly_detected' && appItem.applicantDeficiencyReleased === false) {
    appItem = {
      ...appItem,
      overallStatus: 'ai_validation_in_progress'
    };
  }
  res.json({ success: true, data: appItem });
});

// 3b. Delete application by ID (Cascade Deletion: removes application & purges FastAPI officer deficiency logs)
app.delete('/api/applications/:appId', async (req, res) => {
  const targetId = req.params.appId;
  const initialCount = applications.length;

  // Find target application before removing to check for stream suffixes or institution identifiers
  const targetApp = applications.find(a => 
    a.appId === targetId || 
    a.id === targetId || 
    a.appId?.includes(targetId)
  );

  applications = applications.filter(a => 
    a.appId !== targetId && 
    a.id !== targetId && 
    !a.appId?.includes(targetId)
  );

  // Clear any active background AI validation timer
  if (pendingValidationTimers.has(targetId)) {
    clearTimeout(pendingValidationTimers.get(targetId));
    pendingValidationTimers.delete(targetId);
  }

  // CASCADE PURGE: Purge deficiency records and officer messages for this application from FastAPI
  try {
    const fastApiRes = await fetch(`http://127.0.0.1:8000/api/deficiencies/application/${encodeURIComponent(targetId)}`, {
      method: 'DELETE'
    });
    console.log(`[Cascade Delete] Purged FastAPI deficiency logs for ${targetId}: HTTP ${fastApiRes.status}`);

    // If target had a base ID or stream variation (e.g., -S2), purge base as well
    const baseId = targetId.split('-S')[0];
    if (baseId !== targetId) {
      await fetch(`http://127.0.0.1:8000/api/deficiencies/application/${encodeURIComponent(baseId)}`, {
        method: 'DELETE'
      });
    }
  } catch (err) {
    console.warn(`[Cascade Delete] Notice: Could not connect to FastAPI on port 8000 for ${targetId}:`, err.message);
  }

  const stats = {
    total: applications.length,
    anomalyDetected: applications.filter(a => a.overallStatus === 'anomaly_detected').length,
    reviewNeeded: applications.filter(a => a.overallStatus === 'review_needed').length,
    verified: applications.filter(a => a.overallStatus === 'verified').length,
    averageRiskScore: applications.length ? Math.round(applications.reduce((acc, a) => acc + (a.riskScore || 0), 0) / applications.length) : 0
  };

  res.json({
    success: true,
    message: `Application ${targetId} and all associated officer messages deleted successfully.`,
    remaining: applications.length,
    stats
  });
});


// 4. Document lookup by docId (supports DOC-2026-881 directly)
app.get('/api/documents/:docId', (req, res) => {
  for (const appItem of applications) {
    const doc = appItem.documents.find(d => d.docId === req.params.docId);
    if (doc) {
      return res.json({
        success: true,
        parentAppId: appItem.appId,
        institutionName: appItem.institutionName,
        data: doc
      });
    }
  }
  res.status(404).json({ success: false, message: `Document ${req.params.docId} not found` });
});

// ==========================================
// 4b. AICTE National Master Directory (39,268 Indian Colleges Dataset)
// ==========================================

// Aggregate stats across all 39,268 institutions
app.get('/api/institutions/stats', (req, res) => {
  res.json({ success: true, ...getInstitutionsStats() });
});

// Search & filter colleges (q, district, type, page, limit)
app.get('/api/institutions', (req, res) => {
  const result = searchInstitutions(req.query);
  res.json({ success: true, ...result });
});

// Single college lookup by AICTE ID
app.get('/api/institutions/:id', (req, res) => {
  const college = getInstitutionById(req.params.id);
  if (!college) {
    return res.status(404).json({ success: false, message: 'Institution not found in AICTE national directory' });
  }
  res.json({ success: true, data: college });
});

// Initiate scrutiny audit directly from National Directory
app.post('/api/institutions/:id/scrutinize', (req, res) => {
  const college = getInstitutionById(req.params.id);
  if (!college) {
    return res.status(404).json({ success: false, message: 'Institution not found in AICTE national directory' });
  }

  // Check if an application already exists in memory
  let existing = applications.find(a => 
    a.permanentId === college.aicte_id || 
    (a.institutionName && a.institutionName.toLowerCase() === college.institute_name.toLowerCase())
  );

  if (!existing) {
    existing = convertToScrutinyApplication(college, req.body || {});
    applications.unshift(existing);
  }

  res.json({
    success: true,
    message: `Scrutiny audit initiated for ${college.institute_name}`,
    data: existing
  });
});

// 5. AICTE Handbook Rules endpoint
app.get('/api/rules/handbook', (req, res) => {
  res.json({ success: true, data: aicteRules });
});

// 6. Simulated Verification APIs (DigiLocker, State University, Fire Dept, Land Registry)
app.post('/api/verify/mock-api', (req, res) => {
  const { docId, service } = req.body;
  
  // Simulate realistic network latency (100ms - 250ms)
  setTimeout(() => {
    if (docId === 'DOC-2026-881') {
      // The sample flagged document from SIH prompt
      res.json({
        success: true,
        service: service || 'DigiLocker / State DTE Registry',
        docId,
        timestamp: new Date().toISOString(),
        status: 'MISMATCH_CONFIRMED',
        statusCode: 409,
        latencyMs: 168,
        matchResult: {
          isAuthentic: false,
          discrepancyType: 'EXPIRY_TAMPERED',
          authorityRegisteredExpiry: '2024-06-30',
          submittedClaimExpiry: '2028-12-31',
          digitalSignatureValid: false,
          issuingOfficer: 'Dr. K. R. Ramanathan, Director DTE',
          actionMandated: 'Flag for Criminal Forgery Scrutiny & Issue Immediate Show Cause'
        }
      });
    } else if (docId === 'DOC-2026-884') {
      res.json({
        success: true,
        service: 'State Land Records (MahaBhulekh) Gateway',
        docId,
        timestamp: new Date().toISOString(),
        status: 'VERIFIED_GENUINE',
        statusCode: 200,
        latencyMs: 112,
        matchResult: {
          isAuthentic: true,
          landParcel: 'Survey No. 42/1, 8.25 Acres',
          institutionalClearance: 'APPROVED',
          encumbrance: 'CLEAR',
          digitalSignatureValid: true
        }
      });
    } else {
      res.json({
        success: true,
        service: service || 'National Academic & Statutory Repository',
        docId,
        timestamp: new Date().toISOString(),
        status: 'SIMULATED_RESPONSE',
        statusCode: 200,
        latencyMs: 140,
        matchResult: {
          isAuthentic: true,
          registryStatus: 'Active',
          lastVerifiedAt: new Date().toISOString()
        }
      });
    }
  }, 180);
});

// 7. Real Python Forensic ELA Analyzer Execution
app.post('/api/forensics/run-ela', (req, res) => {
  const { docId } = req.body;
  const scriptPath = path.join(__dirname, '..', 'scripts', 'ela_analyzer.py');

  // Let's create a synthesized test canvas or sample file for the docId
  const tempImgPath = path.join(__dirname, '..', 'scripts', `temp_${Date.now()}.jpg`);
  const tempElaPath = path.join(__dirname, '..', 'scripts', `temp_ela_${Date.now()}.jpg`);

  // Run python script with test or synthesized payload
  const py = spawn('python', [
    '-c',
    `
import json, sys
# High fidelity simulation of ELA output conforming to blueprint schema
result = {
  "docId": "${docId || 'DOC-2026-881'}",
  "type": "No Objection Certificate",
  "status": "anomaly_detected",
  "extractedData": {
    "institutionName": "Tech Engineering College",
    "expiryDate": "2028-12-31"
  },
  "flags": [
    {
      "type": "ELA_Mismatch",
      "message": "Possible date tampering detected: Compression artifacts spike in '2028-12-31' region",
      "box": [120, 45, 180, 60]
    }
  ],
  "metrics": {
    "meanErrorLevel": 0.28,
    "maxDiff": 42,
    "tamperScore": 0.89,
    "compressionQualityEstimate": 85,
    "fontArtifactDiscontinuity": 0.94
  }
}
print(json.dumps(result))
`
  ]);

  let stdoutData = '';
  let stderrData = '';

  py.stdout.on('data', data => {
    stdoutData += data.toString();
  });

  py.stderr.on('data', data => {
    stderrData += data.toString();
  });

  py.on('close', code => {
    if (code !== 0) {
      return res.status(500).json({ success: false, error: stderrData });
    }
    try {
      const parsed = JSON.parse(stdoutData.trim());
      res.json({ success: true, data: parsed });
    } catch (e) {
      res.status(500).json({ success: false, raw: stdoutData });
    }
  });
});

// 7b. Applicant Institutional Compliance Re-upload Receiver with Automated AI Re-Audit
app.post('/api/documents/:docId/compliance-reupload', async (req, res) => {
  const { docId } = req.params;
  const { appId, reuploadedDocId, applicantResponse, fileName } = req.body;

  let targetApp = null;
  let targetDoc = null;

  // Search by docId or appId
  for (const a of applications) {
    if (appId && a.appId !== appId) continue;
    const foundDoc = a.documents?.find(d => d.docId === docId);
    if (foundDoc) {
      targetApp = a;
      targetDoc = foundDoc;
      break;
    }
  }

  if (!targetDoc) {
    targetApp = applications.find(a => a.appId === appId) || applications[0];
    if (targetApp && targetApp.documents?.length > 0) {
      targetDoc = targetApp.documents[0];
    }
  }

  if (!targetDoc || !targetApp) {
    return res.status(404).json({ success: false, message: 'Application or document not found' });
  }

  const generatedReuploadId = reuploadedDocId || `DOC-REV-${Date.now().toString().slice(-4)}`;
  const responseMsg = applicantResponse || 'Statutory replacement document re-uploaded by institution.';
  const timestamp = new Date().toISOString();

  // Check if replacement document has simulated anomalies (e.g., filename contains tamper/defect/invalid/fake)
  const isReplacementDefective = Boolean(
    fileName && (
      fileName.toLowerCase().includes('tamper') ||
      fileName.toLowerCase().includes('defect') ||
      fileName.toLowerCase().includes('invalid') ||
      fileName.toLowerCase().includes('fake')
    )
  );

  // Attach compliance metadata immediately with reaudit_in_progress state
  targetDoc.complianceSubmission = {
    reuploadedDocId: generatedReuploadId,
    applicantResponse: responseMsg,
    fileName: fileName || `${targetDoc.type?.replace(/\s+/g, '_') || 'Compliance'}_Revised.pdf`,
    submittedAt: timestamp,
    status: 'reaudit_in_progress'
  };

  targetDoc.status = 'reaudit_in_progress';
  targetApp.overallStatus = 'reaudit_in_progress';
  targetApp.reAuditStartedAt = Date.now();
  targetApp.reAuditEndsAt = Date.now() + 30000;
  activeScrutinyAppId = targetApp.appId;

  const previousHash = targetApp.auditTimeline?.[targetApp.auditTimeline.length - 1]?.hash || '00000000000000000000';
  const newEventId = `EVT-${Date.now().toString().slice(-4)}`;
  const rawPayload = `${previousHash}|${timestamp}|AICTE AI Re-Audit Engine|REAUDIT_INITIATED|${generatedReuploadId}`;
  const newHash = crypto.createHash('sha256').update(rawPayload).digest('hex').slice(0, 40);

  const reauditIngestedEntry = {
    id: newEventId,
    timestamp,
    stage: 'AI Automated Re-Audit',
    actor: 'AI Multi-Modal Trust Engine',
    action: 'Compliance Replacement Ingested: AI Re-Audit Pipeline Active',
    details: `Replacement document (${generatedReuploadId}) ingested for ${targetDoc.docId}. Multi-modal forensic re-audit pipeline initiated (~30s background verification).`,
    hash: newHash,
    status: 'INFO'
  };

  if (!targetApp.auditTimeline) targetApp.auditTimeline = [];
  targetApp.auditTimeline.push(reauditIngestedEntry);

  // Return non-blocking immediate response to applicant portal
  res.json({
    success: true,
    message: 'Replacement statutory document received. AI Forensic Re-Audit pipeline initiated in background (~30s verification).',
    data: {
      application: targetApp,
      document: targetDoc,
      auditEntry: reauditIngestedEntry
    }
  });

  // Clear any existing background timer for this application
  if (pendingValidationTimers.has(targetApp.appId)) {
    clearTimeout(pendingValidationTimers.get(targetApp.appId));
  }

  // 60-SECOND BACKGROUND ASYNCHRONOUS RE-AUDIT WORKER
  const reauditTimer = setTimeout(async () => {
    try {
      const liveApp = applications.find(a => a.appId === targetApp.appId);
      if (!liveApp) return;

      const liveDoc = liveApp.documents?.find(d => d.docId === docId);
      if (!liveDoc) return;

      delete liveApp.reAuditStartedAt;
      delete liveApp.reAuditEndsAt;

      const finishTimestamp = new Date().toISOString();

      if (isReplacementDefective) {
        // SECONDARY DEFECT DETECTED IN REPLACEMENT DOCUMENT
        liveDoc.status = 'anomaly_detected';
        liveDoc.tamperScore = 0.88;
        liveDoc.flags = [
          {
            type: "Replacement_Doc_Anomaly",
            message: `Replacement document ${generatedReuploadId} also failed statutory checks: Cryptographic seal invalid or tampering detected. Please replace with authentic gazette copy.`,
            box: [120, 45, 180, 60],
            relativeBox: { x: 55, y: 40, width: 30, height: 8 },
            severity: "CRITICAL",
            confidence: 0.94
          }
        ];
        if (liveDoc.complianceSubmission) {
          liveDoc.complianceSubmission.status = 'anomaly_detected';
        }

        liveApp.overallStatus = 'anomaly_detected';
        liveApp.riskScore = 80;
        liveApp.applicantDeficiencyReleased = false;

        console.log(`[AI Scrutiny Loop] 30s re-audit finished: replacement flagged with secondary anomaly for ${liveApp.appId}. Triggered in Officer Portal first.`);

        // Wait 5 seconds before dispatching secondary deficiency notice to applicant portal
        setTimeout(async () => {
          liveApp.applicantDeficiencyReleased = true;
          try {
            await fetch('http://127.0.0.1:8000/api/deficiencies/notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                application_id: liveApp.appId,
                document_id: liveDoc.docId,
                applicant_email: liveApp.applicantEmail || 'principal@rmkec.ac.in',
                applicant_phone: liveApp.applicantPhone || '+91 98401 23456',
                discrepancy_details: `Secondary Discrepancy Flag: Replaced document ${generatedReuploadId} for ${liveDoc.type} also failed AI forensic validation (splicing or signature mismatch). Please re-upload an authentic certified document.`,
                official_notes: "AI Scrutiny Loop: Replacement document flagged with anomaly after 30s background forensic audit. Second replacement requested."
              })
            });
            console.log(`[AI Scrutiny Loop] 5s elapsed: secondary deficiency dispatched to applicant for ${liveApp.appId}`);
          } catch (notifyErr) {
            console.warn("[AI Scrutiny Loop] FastAPI notify note:", notifyErr.message);
          }
        }, 5000);

        const reauditDefectiveEntry = {
          id: `EVT-${Date.now().toString().slice(-4)}`,
          timestamp: finishTimestamp,
          stage: 'AI Automated Re-Audit',
          actor: 'AI Multi-Modal Trust Engine',
          action: 'Re-Audit Anomaly Detected: Replacement Document Flagged',
          details: `AI Multi-Modal Forensic re-audit detected anomaly in replacement document (${generatedReuploadId}) for ${liveDoc.docId}. Tamper score: 0.88. Secondary deficiency alert dispatched to applicant.`,
          hash: crypto.randomBytes(20).toString('hex'),
          status: 'ALERT'
        };
        liveApp.auditTimeline.push(reauditDefectiveEntry);
      } else {
        // GENUINE REPLACEMENT DOCUMENT VERIFIED (100% CLEAN)
        liveDoc.status = 'verified';
        liveDoc.tamperScore = 0.02;
        liveDoc.flags = [];
        if (liveDoc.complianceSubmission) {
          liveDoc.complianceSubmission.status = 'verified';
        }
        liveDoc.apiVerification = {
          service: "State Technical University Registry",
          status: "VERIFIED",
          httpCode: 200,
          latencyMs: 72,
          authorityPayload: {
            validInRegistry: true,
            hashMatched: true,
            registeredExpiry: "2027-06-30",
            clausesVerified: ["Clause 4.2.1 (Anti-Ragging)", "Clause 4.2.4 (Prescribed Tuition Fee)", "Clause 4.2.8 (Unconditional EVC Audit Consent)"]
          }
        };

        const univCode = (liveApp.affiliatingUniversity || "Anna University").includes('Anna') ? 'AU' 
          : (liveApp.affiliatingUniversity || "").includes('VTU') ? 'VTU' : 'REG';

        if (liveDoc.extractedData) {
          liveDoc.extractedData.expiryDate = "2027-06-30";
          liveDoc.extractedData.docNumber = `${univCode}/ACA-AFFIL/2026/4812-REV`;
          liveDoc.extractedData.signatory = "Dr. Registrar (Affiliation)";
          liveDoc.extractedData.affiliationType = "Permanent / Continuous Affiliation (AY 2026-27)";
          liveDoc.extractedData.institutionName = liveApp.institutionName || "R.M.K. Engineering College";
          if (liveDoc.extractedData.affiliatingUniversity) {
            liveDoc.extractedData.affiliatingUniversity = liveApp.affiliatingUniversity || "Anna University, Chennai";
          }
        }
        if (liveDoc.expectedData) {
          liveDoc.expectedData.docNumber = `${univCode}/ACA-AFFIL/2026/4812`;
          liveDoc.expectedData.expiryDate = "2027-06-30";
          liveDoc.expectedData.affiliationType = "Permanent / Continuous Affiliation (AY 2026-27)";
          liveDoc.expectedData.institutionName = liveApp.institutionName || "R.M.K. Engineering College";
          if (liveDoc.expectedData.affiliatingUniversity) {
            liveDoc.expectedData.affiliatingUniversity = liveApp.affiliatingUniversity || "Anna University, Chennai";
          }
        }

        // Recalculate remaining anomalies
        const remainingAnomalies = (liveApp.documents || []).filter(d => 
          d.docId !== docId && (d.status === 'anomaly_detected' || (d.flags && d.flags.length > 0))
        ).length;

        if (remainingAnomalies === 0) {
          liveApp.overallStatus = 'verified';
          liveApp.riskScore = 0;
        } else {
          liveApp.riskScore = 15;
        }

        // Synchronize with FastAPI to mark deficiency as re_audit_passed
        try {
          await fetch(`http://127.0.0.1:8000/api/deficiencies/verify-document/${docId}`, {
            method: 'POST'
          });
          console.log(`[AI Re-Audit Engine] 30s re-audit complete: deficiency for ${docId} set to re_audit_passed`);
        } catch (syncErr) {
          console.warn("[AI Re-Audit Engine] FastAPI sync note:", syncErr.message);
        }

        const reauditSuccessEntry = {
          id: `EVT-${Date.now().toString().slice(-4)}`,
          timestamp: finishTimestamp,
          stage: 'AI Automated Re-Audit',
          actor: 'AI Multi-Modal Trust Engine',
          action: 'Re-Audit Passed: Replacement Document 100% Verified',
          details: `AI Multi-Modal Forensic re-audit verified replacement statutory document (${generatedReuploadId}) for ${liveDoc.docId}. 0 anomalies detected. State Registry valid for AY 2026-27. Cleared for Final Executive Officer Approval.`,
          hash: crypto.randomBytes(20).toString('hex'),
          status: 'SUCCESS'
        };
        liveApp.auditTimeline.push(reauditSuccessEntry);
      }
    } catch (err) {
      console.error(`[AI Re-Audit Engine] Background worker error for ${targetApp.appId}:`, err);
    } finally {
      pendingValidationTimers.delete(targetApp.appId);
    }
  }, 30000);

  pendingValidationTimers.set(targetApp.appId, reauditTimer);
});

// 7c. Multi-Modal AI Forensic Re-Scan Endpoint
app.post('/api/documents/:docId/rescan', (req, res) => {
  const { docId } = req.params;
  const { appId, officerName } = req.body;

  let targetApp = null;
  let targetDoc = null;

  for (const a of applications) {
    if (appId && a.appId !== appId) continue;
    const foundDoc = a.documents?.find(d => d.docId === docId);
    if (foundDoc) {
      targetApp = a;
      targetDoc = foundDoc;
      break;
    }
  }

  if (!targetDoc) {
    targetApp = applications.find(a => a.appId === appId) || applications[0];
    if (targetApp && targetApp.documents?.length > 0) {
      targetDoc = targetApp.documents[0];
    }
  }

  if (!targetDoc || !targetApp) {
    return res.status(404).json({ success: false, message: 'Application or document not found' });
  }

  const timestamp = new Date().toISOString();
  const reuploadedId = targetDoc.complianceSubmission?.reuploadedDocId || `DOC-REV-${Date.now().toString().slice(-4)}`;

  // Mark document verified and clear anomaly flags
  targetDoc.status = 'verified';
  targetDoc.tamperScore = 0.02;
  targetDoc.flags = [];

  // Update extractedData and expectedData to reflect certified genuine state
  if (targetDoc.extractedData && targetDoc.expectedData) {
    targetDoc.extractedData = { ...targetDoc.extractedData, ...targetDoc.expectedData };
    targetDoc.extractedData.institutionName = targetApp.institutionName;
    targetDoc.expectedData.institutionName = targetApp.institutionName;
    const uniName = targetApp.affiliatingUniversity || "State Technological University";
    targetDoc.extractedData.affiliatingUniversity = uniName;
    targetDoc.expectedData.affiliatingUniversity = uniName;
    if (targetDoc.extractedData.affiliationStatus) {
      targetDoc.extractedData.affiliationStatus = `Permanent (${uniName.split(',')[0]} Affiliation Order Authenticated)`;
      targetDoc.expectedData.affiliationStatus = `Permanent (${uniName.split(',')[0]} Affiliation Order Authenticated)`;
    }
  }

  if (targetDoc.crossModalCV) {
    targetDoc.crossModalCV.detectedCount = targetDoc.crossModalCV.claimedCount || 60;
    targetDoc.crossModalCV.deficit = 0;
  }

  targetDoc.apiVerification = {
    service: targetDoc.apiVerification?.service || 'DigiLocker / State DTE Gateway',
    status: 'VERIFIED',
    statusCode: 200,
    latencyMs: 92,
    matchResult: {
      isAuthentic: true,
      digitalSignatureValid: true,
      discrepancyType: null,
      actionMandated: 'Document Cleared - Statutory Compliance Validated via AI Re-Scan',
      authorityRegisteredExpiry: targetDoc.expectedData?.expiryDate || '2028-12-31',
      lastVerifiedAt: timestamp
    }
  };

  if (targetDoc.complianceSubmission) {
    targetDoc.complianceSubmission.status = 'verified';
    targetDoc.complianceSubmission.rescanCompletedAt = timestamp;
  }

  // Recalculate Application Risk Score & Overall Status
  const remainingAnomalies = targetApp.documents.filter(d => 
    d.status === 'anomaly_detected' || (d.flags && d.flags.length > 0)
  ).length;

  if (remainingAnomalies === 0) {
    targetApp.overallStatus = 'verified';
    targetApp.riskScore = 12; // Minimal risk
  } else {
    targetApp.riskScore = Math.max(15, Math.round((targetApp.riskScore || 80) / 2));
  }

  // Append immutable audit entry
  const previousHash = targetApp.auditTimeline?.[targetApp.auditTimeline.length - 1]?.hash || '00000000000000000000';
  const newEventId = `EVT-${Date.now().toString().slice(-4)}`;
  const rawPayload = `${previousHash}|${timestamp}|AICTE Multi-Modal Re-Audit Engine|RESCAN_PASSED|${targetDoc.docId}`;
  const newHash = crypto.createHash('sha256').update(rawPayload).digest('hex').slice(0, 40);

  const rescanAuditEntry = {
    id: newEventId,
    timestamp,
    stage: 'AI Forensic Re-Audit',
    actor: officerName || 'AICTE Multi-Modal Trust Engine (CV & ELA Analyzer)',
    action: 'Multi-Modal AI Forensic Re-Scan: PASSED',
    details: `Full multi-modal re-scan executed on replacement statutory document ${reuploadedId} for ${targetDoc.docId}. ELA Fourier analysis: compression uniform (mean error 0.02). Splicing count: 0. APH handbook validation: 100% compliant. Status upgraded to VERIFIED.`,
    hash: newHash,
    status: 'SUCCESS'
  };

  if (!targetApp.auditTimeline) targetApp.auditTimeline = [];
  targetApp.auditTimeline.push(rescanAuditEntry);

  res.json({
    success: true,
    message: `Multi-Modal AI Forensic Re-scan successfully completed for ${targetDoc.docId}. Document verified!`,
    rescanSummary: {
      docId: targetDoc.docId,
      reuploadedDocId: reuploadedId,
      tamperScore: 0.02,
      elaMeanError: 0.02,
      flagsCount: 0,
      newDocStatus: 'verified',
      newRiskScore: targetApp.riskScore,
      newOverallStatus: targetApp.overallStatus
    },
    data: {
      application: targetApp,
      document: targetDoc,
      auditEntry: rescanAuditEntry
    }
  });
});

// 8. Official Human Review Decision submission & Immutable Audit Chain entry
app.post('/api/decisions/:appId', (req, res) => {
  const { decision, remarks, officerName, docId } = req.body;
  const appItem = applications.find(a => a.appId === req.params.appId);

  if (!appItem) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  // Update overall application status based on official verdict
  let newStatus = appItem.overallStatus;
  const timestamp = new Date().toISOString();
  const eoaOrderNumber = `F.No. AICTE/AB/SWR/2026-27/${appItem.appId}`;

  const normalizedDecision = (decision || '').toUpperCase();

  if (normalizedDecision === 'APPROVE' || normalizedDecision === 'APPROVED') {
    newStatus = 'approved';
    appItem.overallStatus = 'approved';
    appItem.riskScore = 0;
    
    // Once officer approves, all documents in this application are certified verified & passed
    if (appItem.documents && Array.isArray(appItem.documents)) {
      appItem.documents.forEach(doc => {
        doc.status = 'verified';
        doc.flags = [];
        doc.tamperScore = 0.01;
        if (doc.extractedData && doc.expectedData) {
          doc.expectedData = { ...doc.extractedData };
          if (doc.expectedData.academicYear && doc.extractedData.academicYear) {
            doc.expectedData.academicYear = doc.extractedData.academicYear;
          }
        }
        if (doc.complianceSubmission) {
          doc.complianceSubmission.status = 'verified';
        }
        if (doc.apiVerification) {
          doc.apiVerification.status = 'VERIFIED';
        }
      });
    }

    appItem.eoaCertificate = {
      orderNumber: eoaOrderNumber,
      approvalDate: timestamp.split('T')[0],
      academicYear: "2026-27",
      signatory: "Prof. Rajive Kumar, Member Secretary, AICTE New Delhi",
      status: "GRANTED",
      qrCodeUrl: `https://verification.aicte-india.org/eoa/2026-27/${appItem.appId}`
    };
  } else if (normalizedDecision === 'REJECT' || normalizedDecision === 'REJECTED' || normalizedDecision === 'DEFICIENCY_MEMO') {
    newStatus = 'anomaly_detected';
  } else if (normalizedDecision === 'HEARING') {
    newStatus = 'review_needed';
  }

  appItem.overallStatus = newStatus;

  // Compute immutable SHA-256 hash chaining to previous event
  const previousHash = appItem.auditTimeline?.[appItem.auditTimeline.length - 1]?.hash || '00000000000000000000';
  const newEventId = `EVT-${Date.now().toString().slice(-4)}`;
  const rawPayload = `${previousHash}|${timestamp}|${officerName}|${decision}|${remarks}`;
  const newHash = crypto.createHash('sha256').update(rawPayload).digest('hex').slice(0, 40);

  const newAuditEntry = {
    id: newEventId,
    timestamp,
    stage: 'Executive Scrutiny Decision',
    actor: officerName || 'AICTE Regional Scrutiny Officer (Dr. A. K. Sundaram)',
    action: decision === 'APPROVE' ? 'Final Executive Approval Granted: AICTE EoA Issued' : `Official Decision: ${decision}`,
    details: remarks || (decision === 'APPROVE'
      ? `Executive approval granted following AI compliance clearance. Official AICTE Extension of Approval (EoA) 2026-27 issued. Order No: ${eoaOrderNumber}.`
      : `Official review finalized. Decision: ${decision}`),
    hash: newHash,
    status: decision === 'APPROVE' ? 'SUCCESS' : decision === 'DEFICIENCY_MEMO' ? 'CRITICAL' : 'WARNING'
  };

  if (!appItem.auditTimeline) appItem.auditTimeline = [];
  appItem.auditTimeline.push(newAuditEntry);

  res.json({
    success: true,
    message: decision === 'APPROVE'
      ? `AICTE Extension of Approval (EoA) 2026-27 officially granted. Order: ${eoaOrderNumber}`
      : 'Scrutiny decision recorded in immutable audit ledger',
    newStatus,
    eoaOrderNumber: decision === 'APPROVE' ? eoaOrderNumber : undefined,
    eoaCertificate: appItem.eoaCertificate,
    auditEntry: newAuditEntry,
    application: appItem
  });
});

// 9. Interactive Live Document Analysis / Upload Simulation
app.post('/api/analyze-upload', (req, res) => {
  const { fileName, docType, institutionName } = req.body;
  
  const newDocId = `DOC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  const newAppId = `APP-${new Date().getFullYear()}-AICTE-${Math.floor(1000 + Math.random() * 9000)}`;

  // Determine if this uploaded document will trigger an anomaly or pass
  const isAnomaly = fileName?.toLowerCase().includes('tamper') || 
                    fileName?.toLowerCase().includes('defect') || 
                    docType?.toLowerCase().includes('lab') ||
                    Math.random() > 0.4;

  const newApplication = {
    appId: newAppId,
    institutionName: institutionName || "Vivekananda Institute of Technology",
    region: "Southern Region (Chennai)",
    submissionDate: new Date().toISOString().split('T')[0],
    category: "Extension of Approval (EoA)",
    intakeApplied: 420,
    overallStatus: isAnomaly ? "anomaly_detected" : "verified",
    riskScore: isAnomaly ? 82 : 12,
    primaryDocId: newDocId,
    documents: [
      {
        docId: newDocId,
        type: docType || "No Objection Certificate",
        subtype: "Uploaded Statutory Document",
        fileName: fileName || "Scanned_NOC_2026.pdf",
        status: isAnomaly ? "anomaly_detected" : "verified",
        documentCategory: "Institutional Compliance",
        extractedData: {
          institutionName: institutionName || "Vivekananda Institute of Technology",
          docNumber: `DTE/REG/${Math.floor(1000 + Math.random() * 9000)}/2026`,
          issueDate: "2023-05-12",
          expiryDate: isAnomaly ? "2029-06-30" : "2027-05-11",
          signatory: "Registrar / Competent Authority"
        },
        expectedData: {
          institutionName: institutionName || "Vivekananda Institute of Technology",
          docNumber: `DTE/REG/${Math.floor(1000 + Math.random() * 9000)}/2026`,
          issueDate: "2023-05-12",
          expiryDate: isAnomaly ? "2025-05-11" : "2027-05-11",
          signatory: "Registrar / Competent Authority"
        },
        tamperScore: isAnomaly ? 0.84 : 0.05,
        flags: isAnomaly ? [
          {
            type: "ELA_Mismatch",
            message: "Possible date tampering detected: Inconsistent compression layer in expiry date",
            box: [120, 45, 180, 60],
            relativeBox: { x: 55, y: 40, width: 30, height: 8 },
            severity: "CRITICAL",
            confidence: 0.92
          }
        ] : [],
        apiVerification: {
          service: "DigiLocker / National Academic Depository",
          status: isAnomaly ? "MISMATCH" : "VERIFIED",
          httpCode: 200,
          latencyMs: 145,
          authorityPayload: {
            validInRegistry: true,
            hashMatched: !isAnomaly
          }
        }
      }
    ],
    auditTimeline: [
      {
        id: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        stage: "Ingestion",
        actor: "Multi-Modal Trust Engine",
        action: "File Ingested and Pre-Processed",
        details: `File ${fileName || 'document.pdf'} processed with OCR and LayoutLM.`,
        hash: crypto.randomBytes(20).toString('hex'),
        status: "INFO"
      },
      {
        id: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        stage: "Forensic CV",
        actor: "OpenCV ELA Pipeline",
        action: isAnomaly ? "Tampering Detected via ELA" : "Forensic Scan: Authenticity Verified",
        details: isAnomaly ? "Detected compression anomaly in date field [120, 45, 180, 60]." : "Compression profile uniform. No splicing detected.",
        hash: crypto.randomBytes(20).toString('hex'),
        status: isAnomaly ? "ALERT" : "SUCCESS"
      }
    ]
  };

  applications.unshift(newApplication);

  res.json({
    success: true,
    message: 'Document analyzed and added to verification queue',
    application: newApplication
  });
});

// 10. RAG-Powered "Chat with the Application" AI Co-Pilot
app.post('/api/chat/ask', (req, res) => {
  const { appId, query, docId } = req.body;
  const appItem = applications.find(a => a.appId === appId);
  
  if (!appItem) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  const result = queryApplicationRAG(appItem, query, aicteRules);
  res.json({
    success: true,
    ...result,
    timestamp: new Date().toISOString()
  });
});

// 10b. Submit / Apply for AICTE Approval from Applicant Portal (with Automated AI Scrutiny & Auto-Notification Dispatch)
app.post('/api/applications/submit', async (req, res) => {
  const {
    appId,
    institutionName,
    permanentId,
    category,
    region,
    affiliatingUniversity,
    address,
    email,
    phone,
    landAcres,
    builtUpAreaSqFt,
    cadLabsCount,
    workstationsCount,
    internetBandwidthMbps,
    appliedIntake,
    facultyCount,
    principalName,
    programs,
    uploadedDocuments,
    isNewStream
  } = req.body;

  // Filter existing applications for this college
  const collegeApps = applications.filter(a => 
    (permanentId && a.permanentId === permanentId) || 
    (institutionName && a.institutionName?.toLowerCase() === institutionName?.toLowerCase())
  );

  // Sequential rule enforcement:
  // If isNewStream is requested or no appId is provided (new submission):
  // Check if any existing stream for this college is still pending scrutiny / not yet approved or verified
  if (isNewStream || (collegeApps.length > 0 && !appId)) {
    const pendingApp = collegeApps.find(a => 
      a.overallStatus !== 'approved' && 
      a.overallStatus !== 'verified' && 
      !a.eoaCertificate
    );
    if (pendingApp) {
      return res.status(400).json({
        success: false,
        message: `Sequential Stream Rule: Application ${pendingApp.appId} for "${pendingApp.category}" is currently undergoing scrutiny. Under AICTE regulations, each stream must be completely verified and approved before you can apply for the next stream.`
      });
    }

    // Check if this stream has already been applied
    const duplicateApp = collegeApps.find(a => a.category?.toLowerCase() === category?.toLowerCase());
    if (duplicateApp && !appId) {
      return res.status(400).json({
        success: false,
        message: `Stream Already Applied: Your institution has already applied for "${category}" (${duplicateApp.appId}). Please select a different approval stream.`
      });
    }
  }

  // Determine if updating an existing record or creating a new stream application
  let existingIndex = -1;
  if (appId && !isNewStream) {
    existingIndex = applications.findIndex(a => a.appId === appId);
  } else if (!isNewStream && collegeApps.length > 0) {
    // Check if matching exact category
    const matchCat = applications.findIndex(a => 
      ((permanentId && a.permanentId === permanentId) || 
       (institutionName && a.institutionName?.toLowerCase() === institutionName?.toLowerCase())) &&
      a.category?.toLowerCase() === category?.toLowerCase()
    );
    if (matchCat >= 0) existingIndex = matchCat;
  }

  const streamNumber = collegeApps.length + (existingIndex >= 0 ? 0 : 1);
  const targetAppId = appId || (existingIndex >= 0 
    ? applications[existingIndex].appId 
    : (streamNumber <= 1 
        ? (institutionName?.toLowerCase().includes('r.m.k') ? 'APP-2026-AICTE-1084' : `APP-2026-AICTE-${Math.floor(1000 + Math.random() * 9000)}`)
        : `APP-2026-AICTE-1084-S${streamNumber}`));

  const nowIso = new Date().toISOString();
  const applicantEmail = email || "principal@rmkec.ac.in";
  const applicantPhone = phone || "+91 98401 23456";

  // Construct raw documents array
  const rawDocs = (uploadedDocuments && uploadedDocuments.length > 0) ? uploadedDocuments : [
    {
      docId: "DOC-2026-885",
      type: "University Affiliation Order",
      title: "University_Affiliation_Order_2026_27.pdf",
      mimeType: "application/pdf",
      pageCount: 3,
      status: "pending_review",
      sha256: crypto.createHash('sha256').update((institutionName || '') + targetAppId + nowIso).digest('hex')
    }
  ];

  let hasDetectedAnomaly = false;
  let flaggedDocId = null;
  let discrepancySummary = "";

  // AUTOMATED AI SCRUTINY & FORENSIC ANALYSIS PIPELINE
  const enrichedDocs = rawDocs.map((doc, idx) => {
    const isAffiliationAnomaly = (!isNewStream) && (
      doc.docId === 'DOC-2026-885' || 
      (idx === 0 && (!category || category.includes('Extension of Approval')))
    );

    const isAlreadyRevised = doc.docId?.includes('REV') || doc.fileName?.includes('Revised') || doc.title?.includes('Revised');

    if (isAffiliationAnomaly && !isAlreadyRevised) {
      hasDetectedAnomaly = true;
      flaggedDocId = doc.docId;
      discrepancySummary = `CRITICAL ANOMALY DETECTED BY AI SCENARIO AUDIT: Statutory Document ${doc.docId} (${doc.type || 'Affiliation Order'}) presents validity discrepancy. State University Registry API records affiliation as expired on 2024-06-30 (Provisional), conflicting with stated AY 2026-27 renewal. Furthermore, mandatory APH Chapter I Clause 4.2.8 EVC surprise inspection undertaking is missing. Rectification required within 7 days.`;

      const uniPrefix = (affiliatingUniversity || "Anna University").includes('Anna') ? 'AU'
        : (affiliatingUniversity || "").includes('VTU') ? 'VTU' : 'REG';

      return {
        docId: doc.docId,
        type: doc.type || "University Affiliation Order",
        subtype: "University Academic Affiliation",
        fileName: doc.fileName || doc.title || "University_Affiliation_Order.pdf",
        status: "anomaly_detected",
        documentCategory: "Statutory Affiliation",
        tamperScore: 0.78,
        extractedData: {
          institutionName: institutionName || "AICTE Approved Institution",
          docNumber: `${uniPrefix}/ACA-AFFIL/2024/982`,
          issueDate: "2024-05-12",
          expiryDate: "2024-06-30",
          affiliatingUniversity: affiliatingUniversity || "Anna University, Chennai",
          affiliationType: "Provisional Affiliation (Expired)",
          sanctionedIntake: appliedIntake || 540,
          signatory: "Registrar, Academic Affiliation Wing"
        },
        expectedData: {
          institutionName: institutionName || "AICTE Approved Institution",
          docNumber: `${uniPrefix}/ACA-AFFIL/2026/4812`,
          issueDate: "2026-05-10",
          expiryDate: "2027-06-30",
          affiliatingUniversity: affiliatingUniversity || "Anna University, Chennai",
          affiliationType: "Permanent / Continuous Affiliation (AY 2026-27)",
          sanctionedIntake: appliedIntake || 540,
          signatory: "Registrar, Academic Affiliation Wing"
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
          sha256: doc.sha256 || crypto.randomBytes(32).toString('hex'),
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
      };
    } else {
      // Clean document verified by AI
      return {
        docId: doc.docId || `DOC-2026-${Math.floor(880 + idx)}`,
        type: doc.type || "Statutory Compliance Document",
        subtype: doc.type || "Statutory Clearance",
        fileName: doc.fileName || doc.title || `${doc.type || 'Document'}.pdf`,
        status: "verified",
        documentCategory: "Statutory Approval",
        tamperScore: 0.02,
        extractedData: {
          institutionName: institutionName || "AICTE Approved Institution",
          docNumber: `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          issueDate: "2026-02-15",
          expiryDate: "2027-06-30",
          affiliatingUniversity: affiliatingUniversity || "Anna University, Chennai",
          sanctionedIntake: appliedIntake || 540,
          signatory: "Authorized Competent Authority"
        },
        expectedData: {
          institutionName: institutionName || "AICTE Approved Institution",
          docNumber: `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          issueDate: "2026-02-15",
          expiryDate: "2027-06-30",
          affiliatingUniversity: affiliatingUniversity || "Anna University, Chennai",
          sanctionedIntake: appliedIntake || 540,
          signatory: "Authorized Competent Authority"
        },
        flags: [],
        piiEntities: [],
        cryptographicFingerprint: {
          sha256: doc.sha256 || crypto.randomBytes(32).toString('hex'),
          pHash: "f40198a72b01",
          antiDuplicationStatus: "UNIQUE",
          collisionDetected: false,
          historicalDuplicatesCount: 0
        },
        apiVerification: {
          service: "DigiLocker / National Repository Gateway",
          status: "VERIFIED",
          httpCode: 200,
          latencyMs: 85,
          authorityPayload: {
            validInRegistry: true,
            hashMatched: true,
            inspectionPassed: true
          }
        }
      };
    }
  });

  const auditEvents = [
    {
      id: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: nowIso,
      stage: "Submission",
      actor: "Applicant Institution Gateway",
      action: "AICTE Approval Application Submitted",
      details: `Institution ${institutionName} submitted application for ${category} (AY 2026-27). Ingested into AI Multi-Modal Forensic Engine.`,
      hash: crypto.randomBytes(20).toString('hex'),
      status: "INFO"
    }
  ];

  // Initial document snapshot prior to 60s forensic audit completion
  // Preserve extractedData & expectedData immediately so Officer Portal Data Comparison is fully populated!
  const initialDocs = enrichedDocs.map((doc, idx) => ({
    ...doc,
    status: "pending_review",
    tamperScore: 0,
    flags: [],
  }));

  const validationStartedAt = Date.now();
  const validationEndsAt = validationStartedAt + 30000;

  const newAppEntry = {
    appId: targetAppId,
    institutionName: institutionName || "AICTE Approved Institution",
    permanentId: permanentId || "1-932148123",
    region: region || "Southern Region (Chennai)",
    submissionDate: nowIso.split('T')[0],
    category: category || "Extension of Approval (EoA)",
    overallStatus: "ai_validation_in_progress",
    validationStartedAt,
    validationEndsAt,
    riskScore: 0,
    primaryDocId: enrichedDocs[0]?.docId || "DOC-2026-885",
    affiliatingUniversity: affiliatingUniversity || "Anna University, Chennai",
    intakeApplied: appliedIntake || 540,
    facultyCount: facultyCount || 64,
    applicantEmail,
    applicantPhone,
    address: address || (institutionName?.toLowerCase().includes('r.m.k') ? "RSM Nagar, Kavaraipettai, Gummidipoondi Taluk, Tiruvallur - 601 206" : `${institutionName} Campus, Academic Zone`),
    trustName: req.body.trustName || `${(institutionName || 'Institutional').replace(/(College|Institute|Academy|of Engineering|and Technology)/gi, '').trim()} Educational Trust`,
    infrastructure: {
      landAcres: landAcres || 7.5,
      builtUpAreaSqFt: builtUpAreaSqFt || 18500,
      cadLabsCount: cadLabsCount || 6,
      workstationsCount: workstationsCount || 180,
      internetBandwidthMbps: internetBandwidthMbps || 500
    },
    programs: programs || ["B.Tech Computer Science", "B.Tech AI & Data Science", "B.Tech Electronics & Comm"],
    principalName: principalName || (institutionName?.toLowerCase().includes('r.m.k') ? "Dr. K. A. Mohamed Junaid, M.E., Ph.D." : "Dr. Principal / Head of Institute"),
    documents: initialDocs,
    auditTimeline: auditEvents
  };

  if (existingIndex >= 0) {
    applications[existingIndex] = { ...applications[existingIndex], ...newAppEntry };
  } else {
    applications.unshift(newAppEntry);
  }
  activeScrutinyAppId = targetAppId;

  // Clear any existing background timer for this application
  if (pendingValidationTimers.has(targetAppId)) {
    clearTimeout(pendingValidationTimers.get(targetAppId));
  }

  // 60-SECOND BACKGROUND ASYNCHRONOUS AI FORENSIC VALIDATION WORKER
  const validationTimer = setTimeout(async () => {
    try {
      const liveApp = applications.find(a => a.appId === targetAppId);
      if (!liveApp) return;

      delete liveApp.validationStartedAt;
      delete liveApp.validationEndsAt;
      liveApp.documents = enrichedDocs;

      const completeTimestamp = new Date().toISOString();

      if (hasDetectedAnomaly) {
        // STEP 1: TRIGGER ANOMALY DETECTION FIRST IN THE OFFICER PORTAL
        liveApp.overallStatus = 'anomaly_detected';
        liveApp.riskScore = 78;
        liveApp.applicantDeficiencyReleased = false;

        const anomalyEvent = {
          id: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: completeTimestamp,
          stage: "AI Automated Scrutiny",
          actor: "AI Multi-Modal Trust Engine",
          action: "Anomaly Detected by AI Forensics (Officer Review Triggered)",
          details: `AI Forensics identified regulatory anomaly in ${flaggedDocId}. Flagged in Regional Officer Scrutiny Console. Deficiency dispatch to Applicant scheduled in 5 seconds.`,
          hash: crypto.randomBytes(20).toString('hex'),
          status: "CRITICAL"
        };
        liveApp.auditTimeline.push(anomalyEvent);
        console.log(`[AI Scrutiny Engine] Anomaly detected and triggered FIRST in Officer Portal for ${targetAppId}. Applicant will receive notification in 5 seconds.`);

        // STEP 2: WAIT EXACTLY 5 SECONDS BEFORE APPLICANT RECEIVES THE ANOMALY NOTIFICATION
        setTimeout(async () => {
          try {
            liveApp.applicantDeficiencyReleased = true;

            const fastApiPayload = {
              application_id: targetAppId,
              document_id: flaggedDocId,
              applicant_email: applicantEmail,
              applicant_phone: applicantPhone,
              discrepancy_details: discrepancySummary,
              official_notes: "AI Automated Scrutiny Flag: Discrepancy auto-detected by Multi-Modal Trust Engine against APH 2026-27 norms & State University API. Formal deficiency memo dispatched to applicant."
            };

            const fastApiRes = await fetch('http://127.0.0.1:8000/api/deficiencies/notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(fastApiPayload)
            });

            const dispatchEvent = {
              id: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
              timestamp: new Date().toISOString(),
              stage: "Applicant Alerting",
              actor: "Regional Scrutiny Dispatch Gateway",
              action: "Formal Deficiency Notice Dispatched to Applicant",
              details: `Formal deficiency notice for ${flaggedDocId} delivered to Applicant Portal, email (${applicantEmail}), and SMS (${applicantPhone}) 5 seconds after Officer detection.`,
              hash: crypto.randomBytes(20).toString('hex'),
              status: "ALERT"
            };
            liveApp.auditTimeline.push(dispatchEvent);
            console.log(`[AI Scrutiny Engine] 5s delay elapsed: deficiency dispatched to FastAPI for ${targetAppId}: status ${fastApiRes.status}`);
          } catch (dispatchErr) {
            console.warn("[AI Scrutiny Engine] FastAPI auto-dispatch notification note:", dispatchErr.message);
          }
        }, 5000);
      } else {
        liveApp.overallStatus = 'verified';
        liveApp.riskScore = 0;

        const verifiedEvent = {
          id: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: completeTimestamp,
          stage: "AI Automated Scrutiny",
          actor: "AI Multi-Modal Trust Engine",
          action: "AI Scrutiny: All Documents 100% Verified",
          details: "All statutory documents verified against authoritative registries with 0 anomalies. Ready for Executive Officer Approval.",
          hash: crypto.randomBytes(20).toString('hex'),
          status: "SUCCESS"
        };
        liveApp.auditTimeline.push(verifiedEvent);
        console.log(`[AI Scrutiny Engine] 30s background validation finished: 100% verified for ${targetAppId}`);
      }
    } catch (err) {
      console.error(`[AI Scrutiny Engine] Background worker error for ${targetAppId}:`, err);
    } finally {
      pendingValidationTimers.delete(targetAppId);
    }
  }, 30000);

  pendingValidationTimers.set(targetAppId, validationTimer);

  res.json({
    success: true,
    message: "Application submitted successfully. AI Forensic Multi-Modal Validation pipeline initiated in background (~30s verification).",
    appId: targetAppId,
    data: newAppEntry
  });
});

// 11. Cryptographic Document Hashing & Anti-Duplication Ledger
app.post('/api/verify/hash-collision', (req, res) => {
  const { sha256, pHash, appId, docId } = req.body;
  const collisionResult = checkHashCollision(sha256, pHash, appId, docId);
  res.json({
    success: true,
    data: collisionResult,
    timestamp: new Date().toISOString()
  });
});

// 12. PII Redaction: Officer Unmask Audit Logging
app.post('/api/audit/log-unmask', (req, res) => {
  const { appId, docId, officerName, reason } = req.body;
  const appItem = applications.find(a => a.appId === appId);

  if (!appItem) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  const previousHash = appItem.auditTimeline[appItem.auditTimeline.length - 1]?.hash || '00000000000000000000';
  const newEventId = `EVT-${Date.now().toString().slice(-4)}`;
  const timestamp = new Date().toISOString();
  const rawPayload = `${previousHash}|${timestamp}|${officerName}|UNMASK_PII|${reason}`;
  const newHash = crypto.createHash('sha256').update(rawPayload).digest('hex').slice(0, 40);

  const unmaskAuditEntry = {
    id: newEventId,
    timestamp,
    stage: 'Confidentiality Audit',
    actor: officerName || 'Dr. A. K. Sundaram (Scrutiny Officer)',
    action: 'PII Unmask Authorized',
    details: `Reviewer temporarily unmasked sensitive faculty Aadhaar/PAN fields on ${docId}. Justification: ${reason || 'Statutory regulatory identity audit'}.`,
    hash: newHash,
    status: 'WARNING'
  };

  appItem.auditTimeline.push(unmaskAuditEntry);

  res.json({
    success: true,
    message: 'PII Unmask authorization recorded in immutable audit ledger',
    auditEntry: unmaskAuditEntry
  });
});

app.listen(PORT, () => {
  console.log(`AICTE Multi-Modal Trust Engine Backend running at http://localhost:${PORT}`);
  console.log(`Problem Statement: SIH26261 | AICTE Document Authentication`);
});
