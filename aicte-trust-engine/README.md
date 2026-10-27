# Multi-Modal Trust Engine for Application Validation 🛡️
### Smart India Hackathon 2026 — Problem Statement ID: SIH26261
**AICTE Document Authentication • Automated Deficiency Notification & Multi-Modal Scrutiny**
**Organization:** All India Council for Technical Education (AICTE), New Delhi  
**Department:** Regulation Bureau | **Category:** Software | **Theme:** Smart Automation / AI Forensics

---

## 🌟 Executive Overview
This platform implements an enterprise-grade decision-support dashboard for **SIH26261** that ingests institutional documents for Extension of Approval (EoA), detects digital tampering via forensic Error Level Analysis (ELA), cross-checks regulatory norms (AICTE APH 2026-27), redacts PII, prevents cryptographic document recycling, and features an **end-to-end Automated Deficiency Notification System** bridging the Scrutiny Officer and Applicant Institution.

---

## 🚀 Live System Architecture & Ports

| Service Component | Technology Stack | Active Local Port | Purpose |
| :--- | :--- | :--- | :--- |
| **Interactive Frontend** | React 19, Tailwind CSS v4, Vite | `http://localhost:3050` | Scrutiny Officer View & Applicant College Portal |
| **Deficiency Gateway** | Python 3.14, **FastAPI**, SQLAlchemy, SQLite | `http://127.0.0.1:8000` | Automated alert dispatch (Resend Email & Twilio SMS) & SQLite deficiency logs |
| **Scrutiny Engine API** | Node.js Express, Python OpenCV | `http://localhost:5050` | Forensic ELA, RAG Regulatory Copilot, DigiLocker Mock APIs |

---

## 🔔 Automated Deficiency Notification System

### 1. Official's Verification View (React/Tailwind)
- **Prominent Red "Raise Deficiency" Button:** Positioned directly on the document verification split-screen next to detected discrepancy flags in [`VerificationView.jsx`](file:///C:/Users/SAKTHI%20LINGESH/.gemini/antigravity/scratch/aicte-trust-engine/client/src/components/VerificationView.jsx), [`ExtractedDataComparison.jsx`](file:///C:/Users/SAKTHI%20LINGESH/.gemini/antigravity/scratch/aicte-trust-engine/client/src/components/ExtractedDataComparison.jsx), and [`DocumentViewer.jsx`](file:///C:/Users/SAKTHI%20LINGESH/.gemini/antigravity/scratch/aicte-trust-engine/client/src/components/DocumentViewer.jsx).
- **"Draft Applicant Notification" Modal ([`DraftDeficiencyModal.jsx`](file:///C:/Users/SAKTHI%20LINGESH/.gemini/antigravity/scratch/aicte-trust-engine/client/src/components/DraftDeficiencyModal.jsx)):**
  - Auto-populates professional message templates referencing specific data mismatches (e.g., *"Document DOC-2026-885 claims Permanent affiliation, but University API returns Provisional (1-Year Condition)"*).
  - Pre-populates registered institutional email and authorized mobile number.
  - Editable text area for official instructions.
  - Primary button labeled **"Send Alert (Email & SMS)"**.
  - On submit, closes the modal and triggers a green **"Notification Sent"** toast.

### 2. Applicant's Dashboard View ([`ApplicantDashboard.jsx`](file:///C:/Users/SAKTHI%20LINGESH/.gemini/antigravity/scratch/aicte-trust-engine/client/src/components/ApplicantDashboard.jsx))
- Easily toggled via the **Portal Role Switcher** in the top navigation header (`🏛️ AICTE Scrutiny Officer` vs `🎓 Applicant Portal`).
- **Prominent Red/Amber Alert Banner at the top:**
  `"🚨 Action Required: Discrepancy detected in recent upload."` with 7-day SLA compliance countdown.
- **Notifications Inbox Component:**
  - Displays the full text of the deficiency message and official remarks.
  - Delivery verification badges: `Email (Resend) ✓ Delivered` and `SMS (Twilio) ✓ Delivered`.
  - **"Resolve / Re-upload" Button:** Opens a resolution workflow allowing the college to upload a corrected document and submit explanatory remarks.
  - Updates database status from `pending_applicant_action` to `resolved_by_applicant`.

### 3. FastAPI Routing & Database Logic (Python)
Located in [`fastapi_server/main.py`](file:///C:/Users/SAKTHI%20LINGESH/.gemini/antigravity/scratch/aicte-trust-engine/fastapi_server/main.py):
- **`POST /api/deficiencies/notify`:**
  - Accepts JSON: `application_id`, `document_id`, `applicant_email`, `applicant_phone`, `discrepancy_details`, `official_notes`.
  - Database logic: Uses SQLAlchemy to insert records into the `deficiency_logs` SQLite table with default status `'pending_applicant_action'`.
  - Two asynchronous dispatchers with inline configuration comments:
    * `async def send_email_via_resend(email, message)` (Resend REST API)
    * `async def send_sms_via_twilio(phone, message)` (Twilio SMS REST API)
  - Returns `{ "success": true, "message": "...", "data": {...} }`.
- **`GET /api/deficiencies/notifications`:** Queries logged notifications for the applicant inbox.
- **`POST /api/deficiencies/resolve/{id}`:** Records applicant document re-upload and updates resolution status.

---

## 🎯 Full Jury Demonstration Flow

1. Open **[http://localhost:3050](http://localhost:3050)**.
2. Select **St. Xavier College of Engineering** (`APP-2026-AICTE-1084`, `DOC-2026-885`).
3. In the split-screen, observe the discrepancy: document claims *Permanent*, but University API returns *Provisional*.
4. Click the prominent red **"Raise Deficiency"** button.
5. In the **"Draft Applicant Notification"** modal, observe the auto-populated mismatch template. Add reviewer notes and click **"Send Alert (Email & SMS)"**.
6. A green toast **"Notification Sent"** appears, and the event is recorded on the audit ledger.
7. Switch to the **Applicant Portal** via the header switcher.
8. Point out the prominent red alert banner: *"Action Required: Discrepancy detected in recent upload."*
9. Review the notification in the **Notifications Inbox** showing Resend & Twilio delivery tags.
10. Click **"Resolve / Re-upload"**, attach the corrected syndicate affiliation copy, and submit. The alert banner updates to green *Resolved* status.
