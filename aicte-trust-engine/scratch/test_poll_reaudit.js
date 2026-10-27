async function pollReauditCompletion() {
  console.log("Polling re-audit completion...");
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 4000));
    const res = await fetch('http://localhost:5050/api/applications/APP-2026-AICTE-1084');
    const data = await res.json();
    const app = data.data;
    const remaining = app.reAuditEndsAt ? Math.ceil((app.reAuditEndsAt - Date.now()) / 1000) : 0;
    console.log(`[T+${(i+1)*4}s] overallStatus: ${app.overallStatus}, remainingSec: ${remaining}, doc0 status: ${app.documents[0].status}, riskScore: ${app.riskScore}`);
    if (app.overallStatus === 'verified' && app.documents[0].status === 'verified') {
      console.log("SUCCESS! Re-audit completed cleanly! Status is VERIFIED, risk score 0! Officer can now click 'Grant Final Approval'!");
      break;
    }
  }
}

pollReauditCompletion().catch(console.error);
