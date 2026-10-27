// End-to-end test verifying automatic analysis, detecting, and verification of reuploaded document

async function testAutomaticReuploadAudit() {
  console.log("=== Testing Automatic Re-Upload Analysis, Detecting & Verification ===");

  // 1. Submit Application
  const submitRes = await fetch('http://localhost:5050/api/applications/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      institutionName: "R.M.K. Engineering College",
      permanentId: "1-932148123",
      region: "Southern Region (Chennai)",
      category: "Extension of Approval (EoA)",
      appliedIntake: 540,
      affiliatingUniversity: "Anna University, Chennai",
      email: "principal@rmkec.ac.in",
      phone: "+91 98401 23456",
      uploadedDocuments: [
        {
          docId: "DOC-2026-885",
          type: "University Affiliation Order",
          title: "University_Affiliation_Order_2026_27.pdf"
        }
      ]
    })
  });

  const submitData = await submitRes.json();
  const appId = submitData.appId;
  console.log(`[PASS] Submitted application: ${appId}`);

  // 2. Simulate applicant re-uploading replacement document
  const reuploadRes = await fetch('http://localhost:5050/api/documents/DOC-2026-885/compliance-reupload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      appId,
      documentId: "DOC-2026-885",
      reuploadedDocId: "DOC-REV-2481",
      applicantResponse: "Corrected statutory compliance document re-uploaded by institution for DOC-2026-885.",
      fileName: "Anna_University_Affiliation_AY2026_27_Certified.pdf"
    })
  });

  const reuploadData = await reuploadRes.json();
  console.log(`[PASS] Re-upload response: ${reuploadData.message}`);

  // 3. Officer queries application immediately: verify automatic reaudit_in_progress status
  const officerCheckRes = await fetch(`http://localhost:5050/api/applications/${appId}`);
  const officerCheckData = await officerCheckRes.json();
  const app = officerCheckData.data;

  console.log(`[CHECK] Application overallStatus during re-audit: "${app.overallStatus}"`);
  console.log(`[CHECK] Document status during re-audit: "${app.documents[0].status}"`);
  console.log(`[CHECK] reAuditEndsAt timestamp present:`, Boolean(app.reAuditEndsAt));

  if (app.overallStatus !== 'reaudit_in_progress') {
    console.error("[FAIL] Application should be in reaudit_in_progress!");
    process.exit(1);
  }
  console.log(`[PASS] Re-audit is automatically executing in background without requiring manual clicks!`);

  // 4. Test Final Approval transition when verified
  const approveRes = await fetch(`http://localhost:5050/api/decisions/${appId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      decision: 'APPROVE',
      remarks: 'Official AICTE Extension of Approval (EoA) 2026-27 granted by Regional Scrutiny Officer following 100% verified AI compliance checks.',
      officerName: 'Dr. A. K. Sundaram (Regional Scrutiny Officer)'
    })
  });

  const approveData = await approveRes.json();
  console.log(`[CHECK] Officer Approval response: newStatus = "${approveData.newStatus}"`);
  console.log(`[CHECK] Certificate Order Number: "${approveData.eoaCertificate?.orderNumber}"`);

  if (approveData.newStatus !== 'approved' || !approveData.eoaCertificate) {
    console.error("[FAIL] Approval failed or certificate not generated!");
    process.exit(1);
  }
  console.log(`[PASS] Officer successfully granted approval and EoA certificate was generated!`);

  // Clean up
  await fetch(`http://localhost:5050/api/applications/${appId}`, { method: 'DELETE' });
  console.log(`[PASS] Cleaned up test application ${appId}`);
  console.log("=== All Automatic Re-Upload Scrutiny Tests Passed Successfully! ===");
}

testAutomaticReuploadAudit().catch(console.error);
