from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from database import Base

class DeficiencyLog(Base):
    """
    SQLAlchemy Model for deficiency_logs table.
    Tracks automated notifications sent to institutions regarding document discrepancies.
    Status defaults to 'pending_applicant_action'.
    """
    __tablename__ = "deficiency_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    application_id = Column(String(64), index=True, nullable=False)
    document_id = Column(String(64), index=True, nullable=False)
    applicant_email = Column(String(128), nullable=False)
    applicant_phone = Column(String(32), nullable=False)
    discrepancy_details = Column(Text, nullable=False)
    official_notes = Column(Text, nullable=True)
    status = Column(String(64), default="pending_applicant_action", nullable=False)
    channels_alerted = Column(String(64), default="EMAIL_AND_SMS", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    resolved_at = Column(DateTime, nullable=True)
    applicant_response = Column(Text, nullable=True)
    reuploaded_document_id = Column(String(64), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "application_id": self.application_id,
            "document_id": self.document_id,
            "applicant_email": self.applicant_email,
            "applicant_phone": self.applicant_phone,
            "discrepancy_details": self.discrepancy_details,
            "official_notes": self.official_notes,
            "status": self.status,
            "channels_alerted": self.channels_alerted,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "applicant_response": self.applicant_response,
            "reuploaded_document_id": self.reuploaded_document_id
        }
