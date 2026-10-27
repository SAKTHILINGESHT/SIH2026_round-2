# AICTE Multi-Modal Trust Engine — SIH 2026 Round 2 🛡️
### Problem Statement ID: SIH26261
**Automated Scrutiny, Document Authentication, Fraud Prevention & Deficiency Resolution**

**Organization:** All India Council for Technical Education (AICTE), New Delhi  
**Theme:** Smart Automation / AI Forensics  
**Repository:** [SIH2026_round-2](https://github.com/SAKTHILINGESHT/SIH2026_round-2)

---

## 📌 Project Overview
This repository contains the complete implementation for **SIH26261**:
1. **Officer Scrutiny Cockpit (Port 3050):** 
   - Global Scrutiny Queue table with live institutional statistics.
   - 5-Stage multi-modal forensic inspection (Cryptographic Ingestion, LayoutLM OCR, OpenCV Error Level Analysis, State Gazette Cross-Checks, AICTE APH Regulatory Clearance).
   - 30-Second live automated re-audit pipeline with laser radar visualization.
   - Official AICTE EoA decree issuance and cryptographic approval certificate generation.
2. **Applicant Institutional Portal (Port 3051):**
   - Live application tracker and deficiency notifications inbox.
   - Interactive document resolution modal with statutory compliance re-upload.
   - Instant EoA Certificate download and QR verification.
3. **Scrutiny Engine Backend (Port 5050 - Node.js Express):**
   - Ingests institutional applications, simulates OCR/ELA forensics, manages state & live polling.
4. **Deficiency Gateway (Port 8000 - Python FastAPI):**
   - Automated discrepancy dispatch (Email & SMS mock integration) with SQLite audit trails.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **Python** (v3.10+ recommended)
- **Git**

### 2. Installation & Running

#### A. Backend Scrutiny Engine (Port 5050)
```bash
cd aicte-trust-engine/server
npm install
node src/index.js
```

#### B. FastAPI Deficiency Gateway (Port 8000)
```bash
cd aicte-trust-engine
python -m uvicorn fastapi_server.main:app --port 8000 --host 127.0.0.1
```

#### C. Officer Portal (Port 3050)
```bash
cd aicte-trust-engine/client
npm install
npm run dev
```

#### D. Applicant Portal (Port 3051)
```bash
cd aicte-trust-engine/applicant-portal
npm install
npm run dev
```

---

## 🏛️ System Ports Summary
- **Officer Cockpit:** [http://localhost:3050](http://localhost:3050)
- **Applicant Portal:** [http://localhost:3051](http://localhost:3051)
- **Express Backend:** [http://localhost:5050](http://localhost:5050)
- **FastAPI Gateway:** [http://127.0.0.1:8000](http://127.0.0.1:8000) / [Docs](http://127.0.0.1:8000/docs)
