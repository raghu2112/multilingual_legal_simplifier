from pydantic import BaseModel
from typing import List, Optional


class RiskClause(BaseModel):
    clause: str
    explanation: str
    severity: str  # "high" | "medium" | "low"


class KeyTerm(BaseModel):
    term: str
    value: str


class DocumentResponse(BaseModel):
    id: str
    fileName: str
    fileUrl: str
    documentType: str
    summary: str
    riskClauses: List[RiskClause]
    keyTerms: List[KeyTerm]
    detectedLanguage: str
    outputLanguage: str
    createdAt: str


class DocumentListItem(BaseModel):
    id: str
    fileName: str
    documentType: str
    summary: str
    outputLanguage: str
    createdAt: str
