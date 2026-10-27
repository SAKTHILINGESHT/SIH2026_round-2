from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class DeficiencyNotifyRequest(BaseModel):
    """
    Input schema for POST /api/deficiencies/notify
    Payload containing application_id, document_id, applicant_email, applicant_phone, and discrepancy_details.
    """
    application_id: str = Field(..., description="Unique AICTE Application ID (e.g. APP-2026-AICTE-1084)")
    document_id: str = Field(..., description="Document identifier with flagged anomaly (e.g. DOC-2026-885)")
    applicant_email: str = Field(..., description="Registered Email of institution / registrar")
    applicant_phone: str = Field(..., description="Authorized mobile number for SMS alert")
    discrepancy_details: str = Field(..., description="Specific mismatch description (e.g. Permanent vs Provisional)")
    official_notes: Optional[str] = Field(None, description="Additional notes or instructions added by reviewing official")

class DeficiencyResolveRequest(BaseModel):
    """
    Input schema for POST /api/deficiencies/resolve/{id}
    Used by applicant to submit re-uploaded document or explanation
    """
    applicant_response: str = Field(..., description="Explanatory text from applicant regarding the resolution")
    reuploaded_document_id: Optional[str] = Field(None, description="ID of the re-uploaded replacement document")

class DeficiencyLogResponse(BaseModel):
    id: int
    application_id: str
    document_id: str
    applicant_email: str
    applicant_phone: str
    discrepancy_details: str
    official_notes: Optional[str] = None
    status: str
    channels_alerted: str
    created_at: Optional[str] = None
    resolved_at: Optional[str] = None
    applicant_response: Optional[str] = None
    reuploaded_document_id: Optional[str] = None

class StandardResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
