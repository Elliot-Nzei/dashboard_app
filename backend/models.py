from pydantic import BaseModel
from typing import Optional

class JobApplication(BaseModel):
    id: Optional[int]
    position: str
    company: str
    status: str  # e.g., "pending", "accepted", "rejected"
    applied_date: Optional[str]  # e.g., "2025-06-10"
