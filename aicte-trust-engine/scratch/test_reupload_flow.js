async function testReuploadFlow() {
  console.log("=== 1. Checking GET /api/applications ===");
  const appsRes = await fetch('http://localhost:5050/api/applications');
  const appsData = await appsRes.json();
  console.log("Success:", appsData.success);
  console.log("Active Scrutiny App ID:", appsData.activeScrutinyAppId);
  console.log("Total Applications:", appsData.data.length);
  const app1084 = appsData.data.find(a => a.appId === 'APP-2026-AICTE-1084');
  console.log("Found APP-1084:", Boolean(app1084), "Status:", app1084?.overallStatus);

  console.log("\n=== 2. Checking FastAPI Deficiencies for APP-1084 ===");
  const defRes = await fetch('http://localhost:8000/api/deficiencies/application/APP-2026-AICTE-1084');
  const defData = await defRes.json();
  console.log("Deficiencies count:", defData.data?.length);
  const deficiency = defData.data?.[0];
  console.log("Deficiency ID:", deficiency?.id, "Doc ID:", deficiency?.document_id, "Status:", deficiency?.status);

  if (deficiency) {
    console.log("\n=== 3. Simulating Applicant Re-uploading Document ===");
    const reuploadRes = await fetch(`http://localhost:5050/api/documents/${deficiency.document_id}/compliance-reupload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appId: 'APP-2026-AICTE-1084',
        reuploadedDocId: 'DOC-2026-885-REV',
        applicantResponse: 'Statutory permanent affiliation order for AY 2026-27 re-uploaded with Syndicate clearance seal.',
        fileName: 'Anna_Univ_Affiliation_RMK_2026_Rev.pdf'
      })
    });
    const reuploadData = await reuploadRes.json();
    console.log("Re-upload Response:", reuploadData.success, reuploadData.message);

    console.log("\n=== 4. Checking Officer Portal State Immediately After Re-upload ===");
    const freshAppsRes = await fetch('http://localhost:5050/api/applications');
    const freshAppsData = await freshAppsRes.json();
    const fresh1084 = freshAppsData.data.find(a => a.appId === 'APP-2026-AICTE-1084');
    console.log("APP-1084 overallStatus:", fresh1084.overallStatus);
    console.log("Active Scrutiny App ID:", freshAppsData.activeScrutinyAppId);
    console.log("Re-audit Timer Active:", Boolean(fresh1084.reAuditEndsAt));
    const secondsRemaining = Math.ceil((fresh1084.reAuditEndsAt - Date.now()) / 1000);
    console.log("Seconds Remaining for AI Forensic Analysis:", secondsRemaining);
    console.log("Target Document Status:", fresh1084.documents[0].status);
    console.log("Compliance Submission Status:", fresh1084.documents[0].complianceSubmission?.status);
  }
}

testReuploadFlow().catch(console.error);
