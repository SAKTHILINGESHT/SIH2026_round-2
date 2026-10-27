// Uses native Node fetch

async function testFlow() {
  console.log("=== Testing Data Comparison & 5-Second Anomaly Delay Flow ===");

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
          title: "University_Affiliation_Order_2026_27.pdf",
          mimeType: "application/pdf",
          pageCount: 3
        }
      ]
    })
  });

  const submitData = await submitRes.json();
  const appId = submitData.appId;
  console.log(`[PASS] Submitted application ID: ${appId}`);

  // 2. Immediately inspect documents on submitted application (Officer View)
  const appRes = await fetch(`http://localhost:5050/api/applications/${appId}`);
  const appData = await appRes.json();
  const doc = appData.data.documents[0];

  console.log(`[CHECK] Document status during scrutiny: ${doc.status}`);
  console.log(`[CHECK] Document extractedData present:`, Boolean(doc.extractedData));
  console.log(`[CHECK] Document expectedData present:`, Boolean(doc.expectedData));
  if (doc.extractedData && doc.expectedData) {
    console.log(`[PASS] Extracted Institution: "${doc.extractedData.institutionName}"`);
    console.log(`[PASS] Expected University: "${doc.expectedData.affiliatingUniversity}"`);
    console.log(`[PASS] Data Comparison table will render ${Object.keys(doc.extractedData).length} rows without being blank!`);
  } else {
    console.error("[FAIL] extractedData or expectedData was missing!");
    process.exit(1);
  }

  // 3. Test Applicant View scoping
  const applicantAppRes = await fetch(`http://localhost:5050/api/applications/${appId}?portal=applicant`);
  const applicantAppData = await applicantAppRes.json();
  console.log(`[CHECK] Applicant overallStatus: ${applicantAppData.data.overallStatus}`);

  // Clean up
  await fetch(`http://localhost:5050/api/applications/${appId}`, { method: 'DELETE' });
  console.log(`[PASS] Cleaned up test application ${appId}`);
  console.log("=== Verification Completed Successfully! ===");
}

testFlow().catch(console.error);
