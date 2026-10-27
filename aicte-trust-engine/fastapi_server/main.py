import os
import asyncio
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import DeficiencyLog
from schemas import (
    DeficiencyNotifyRequest, 
    DeficiencyResolveRequest,
    StandardResponse,
    DeficiencyLogResponse
)

# Initialize database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AICTE Multi-Modal Trust Engine - Automated Deficiency Notification API",
    description="Enterprise-grade deficiency dispatch and applicant audit service for AICTE Document Verification (SIH26261)",
    version="2.0.0"
)

# Enable CORS for React frontend (Vite port 3050 & 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================================
# ASYNCHRONOUS PLACEHOLDER FUNCTIONS FOR RESEND (EMAIL) & TWILIO (SMS)
# =========================================================================

async def send_email_via_resend(email: str, message: str) -> bool:
    """
    Asynchronous dispatcher for institutional email alerts via Resend API.
    
    API KEY CONFIGURATION:
    1. Sign up and obtain an API key at: https://resend.com
    2. Place your API key in environment variables:
       export RESEND_API_KEY="re_123456789abcdef..."
       (or in a .env file loaded via python-dotenv)
    3. Production implementation using httpx:
       ```python
       import os, httpx
       resend_api_key = os.getenv("RESEND_API_KEY", "your_resend_api_key_here")
       headers = {
           "Authorization": f"Bearer {resend_api_key}",
           "Content-Type": "application/json"
       }
       payload = {
           "from": "AICTE Regulation Bureau <deficiencies@aicte-india.org>",
           "to": [email],
           "subject": "URGENT: AICTE Document Deficiency Notice - Scrutiny Action Required",
           "text": message
       }
       async with httpx.AsyncClient() as client:
           resp = await client.post("https://api.resend.com/emails", json=payload, headers=headers)
       ```
    """
    print(f"\n[RESEND EMAIL DISPATCH] Mock Email alert dispatched to: {email}")
    print(f"[RESEND EMAIL CONTENT] Payload snippet: {message[:140]}...")
    # Simulate async non-blocking network I/O
    await asyncio.sleep(0.08)
    return True


async def send_sms_via_twilio(phone: str, message: str) -> bool:
    """
    Asynchronous dispatcher for high-priority SMS alerts via Twilio REST API.
    
    API KEY CONFIGURATION:
    1. Obtain Account SID, Auth Token, and Twilio Phone Number from: https://console.twilio.com
    2. Place credentials in environment variables:
       export TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
       export TWILIO_AUTH_TOKEN="your_auth_token_here"
       export TWILIO_PHONE_NUMBER="+1234567890"  # (or registered DLT Sender ID 'AICTEG')
    3. Production implementation:
       ```python
       import os
       from twilio.rest import Client
       account_sid = os.getenv("TWILIO_ACCOUNT_SID", "AC_placeholder_sid")
       auth_token = os.getenv("TWILIO_AUTH_TOKEN", "auth_placeholder_token")
       from_number = os.getenv("TWILIO_PHONE_NUMBER", "+1234567890")
       
       client = Client(account_sid, auth_token)
       # client.messages.create(body=message[:160], from_=from_number, to=phone)
       ```
    """
    print(f"\n[TWILIO SMS DISPATCH] Mock SMS dispatched to phone: {phone}")
    print(f"[TWILIO SMS CONTENT] Message: {message[:90]}...")
    # Simulate async non-blocking network I/O
    await asyncio.sleep(0.08)
    return True


# =========================================================================
# FASTAPI ROUTING & LOGIC
# =========================================================================

@app.get("/api/health")
def health_check():
    return {
        "status": "ONLINE",
        "service": "AICTE Deficiency Notification Gateway (FastAPI)",
        "database": "SQLite / SQLAlchemy Active",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/api/deficiencies/notify", response_model=StandardResponse, status_code=status.HTTP_201_CREATED)
async def raise_and_notify_deficiency(
    payload: DeficiencyNotifyRequest, 
    db: Session = Depends(get_db)
):
    """
    Primary endpoint: POST /api/deficiencies/notify
    Accepts JSON containing application_id, document_id, applicant_email, 
    applicant_phone, and discrepancy_details.
    
    1. Asynchronously triggers Resend email dispatch
    2. Asynchronously triggers Twilio SMS dispatch
    3. Stores notification in deficiency_logs table with status 'pending_applicant_action'
    """
    # 1. Compose formal notification text
    formal_email_body = (
        f"OFFICIAL DEFICIENCY MEMO - ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)\n"
        f"Application ID: {payload.application_id}\n"
        f"Document ID: {payload.document_id}\n"
        f"Date: {datetime.utcnow().strftime('%d %B %Y')}\n\n"
        f"Discrepancy Detected:\n{payload.discrepancy_details}\n\n"
    )
    if payload.official_notes:
        formal_email_body += f"Official Reviewer Remarks:\n{payload.official_notes}\n\n"
    
    formal_email_body += (
        "Action Required: Please log in to your AICTE Institution Portal and re-upload "
        "the corrected documentary evidence within 7 working days to prevent halting "
        "of Extension of Approval (EoA)."
    )

    sms_body = (
        f"AICTE ALERT: Discrepancy noted in Document {payload.document_id} for "
        f"{payload.application_id}. Action required on portal within 7 days."
    )

    # 2. Asynchronous notifications dispatch
    try:
        await asyncio.gather(
            send_email_via_resend(payload.applicant_email, formal_email_body),
            send_sms_via_twilio(payload.applicant_phone, sms_body)
        )
    except Exception as e:
        print(f"Non-blocking notification dispatch warning: {e}")

    # 3. Insert record into deficiency_logs table with status 'pending_applicant_action'
    new_log = DeficiencyLog(
        application_id=payload.application_id,
        document_id=payload.document_id,
        applicant_email=payload.applicant_email,
        applicant_phone=payload.applicant_phone,
        discrepancy_details=payload.discrepancy_details,
        official_notes=payload.official_notes,
        status="pending_applicant_action",
        channels_alerted="EMAIL_AND_SMS",
        created_at=datetime.utcnow()
    )

    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    return StandardResponse(
        success=True,
        message="Deficiency alert successfully logged and dispatched via Email & SMS",
        data=new_log.to_dict()
    )


@app.get("/api/deficiencies/notifications")
def list_all_deficiencies(
    app_id: Optional[str] = Query(None, description="Optional filter by application_id"),
    status_filter: Optional[str] = Query(None, description="Optional filter by status"),
    db: Session = Depends(get_db)
):
    """
    Returns list of logged deficiencies for the Applicant Dashboard Notifications Inbox.
    """
    query = db.query(DeficiencyLog)
    if app_id:
        query = query.filter(DeficiencyLog.application_id == app_id)
    if status_filter:
        query = query.filter(DeficiencyLog.status == status_filter)
    
    logs = query.order_by(DeficiencyLog.created_at.desc()).all()
    return {
        "success": True,
        "count": len(logs),
        "data": [log.to_dict() for log in logs]
    }


@app.get("/api/deficiencies/application/{application_id}")
def get_deficiencies_for_application(
    application_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve all deficiency logs associated with a specific institution application.
    """
    logs = (
        db.query(DeficiencyLog)
        .filter(DeficiencyLog.application_id == application_id)
        .order_by(DeficiencyLog.created_at.desc())
        .all()
    )
    return {
        "success": True,
        "application_id": application_id,
        "count": len(logs),
        "has_pending": any(l.status == "pending_applicant_action" for l in logs),
        "has_resolved": any(l.status in ["resolved_by_applicant", "resolved"] for l in logs),
        "data": [log.to_dict() for log in logs]
    }


@app.post("/api/deficiencies/resolve/{deficiency_id}")
def resolve_deficiency(
    deficiency_id: int,
    payload: DeficiencyResolveRequest,
    db: Session = Depends(get_db)
):
    """
    Applicant action endpoint: Marks a deficiency as resolved upon document re-upload.
    """
    log_entry = db.query(DeficiencyLog).filter(DeficiencyLog.id == deficiency_id).first()
    if not log_entry:
        raise HTTPException(status_code=404, detail="Deficiency log not found")

    log_entry.status = "resolved_by_applicant"
    log_entry.resolved_at = datetime.utcnow()
    log_entry.applicant_response = payload.applicant_response
    if payload.reuploaded_document_id:
        log_entry.reuploaded_document_id = payload.reuploaded_document_id

    db.commit()
    db.refresh(log_entry)

    return {
        "success": True,
        "message": "Deficiency successfully resolved by applicant. Queued for official re-scrutiny.",
        "data": log_entry.to_dict()
    }


@app.post("/api/deficiencies/verify-document/{document_id}")
def verify_deficiency_document(
    document_id: str,
    db: Session = Depends(get_db)
):
    """
    Officer action endpoint: Marks resolved deficiency as re_audit_passed upon successful AI re-scan.
    """
    logs = db.query(DeficiencyLog).filter(
        (DeficiencyLog.document_id == document_id) |
        (DeficiencyLog.reuploaded_document_id == document_id) |
        (DeficiencyLog.document_id.like(f"%{document_id}%"))
    ).all()

    for log in logs:
        log.status = "re_audit_passed"
    db.commit()

    return {
        "success": True,
        "message": f"Deficiency logs for {document_id} updated to re_audit_passed",
        "updated_count": len(logs),
        "data": [l.to_dict() for l in logs]
    }


@app.post("/api/deficiencies/verify/{deficiency_id}")
def verify_deficiency_by_id(
    deficiency_id: int,
    db: Session = Depends(get_db)
):
    """
    Officer action endpoint: Marks specific deficiency by ID as re_audit_passed.
    """
    log_entry = db.query(DeficiencyLog).filter(DeficiencyLog.id == deficiency_id).first()
    if not log_entry:
        raise HTTPException(status_code=404, detail="Deficiency log not found")

    log_entry.status = "re_audit_passed"
    db.commit()
    db.refresh(log_entry)

    return {
        "success": True,
        "message": "Deficiency successfully marked as re_audit_passed",
        "data": log_entry.to_dict()
    }


@app.delete("/api/deficiencies/application/{application_id}")
def delete_deficiencies_for_application(
    application_id: str,
    db: Session = Depends(get_db)
):
    """
    Cascade deletion endpoint: Purges all deficiency records and officer messages
    associated with an application when the application is deleted by an officer.
    """
    deleted_count = db.query(DeficiencyLog).filter(
        (DeficiencyLog.application_id == application_id) |
        (DeficiencyLog.application_id.like(f"%{application_id}%"))
    ).delete(synchronize_session=False)
    db.commit()
    print(f"[FastAPI Cascade] Purged {deleted_count} deficiency logs for application {application_id}")
    return {
        "success": True,
        "message": f"Successfully purged {deleted_count} deficiency logs for application {application_id}",
        "deleted_count": deleted_count
    }


@app.delete("/api/deficiencies/clear-all")
def clear_all_deficiencies(db: Session = Depends(get_db)):
    """
    Administrative endpoint to flush all deficiency logs.
    """
    deleted_count = db.query(DeficiencyLog).delete(synchronize_session=False)
    db.commit()
    print(f"[FastAPI Clear] Purged all {deleted_count} deficiency logs from database.")
    return {
        "success": True,
        "message": f"Successfully purged all {deleted_count} deficiency logs",
        "deleted_count": deleted_count
    }
