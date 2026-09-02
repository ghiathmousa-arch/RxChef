import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from pydantic import BaseModel

from app.algorithms.fuzzy_matching import Medication
from app.algorithms.interaction_graph import Interaction
from app.pipeline import analyze_prescription
from app.severity_model import get_trained_severity_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    """بيدرّب نموذج الشدّة وقت إقلاع الخدمة، مش عند أول طلب /analyze.
    بدون هيك، أول تحليل بعد كل إقلاع كان بياخد ~8 ثواني زيادة (تدريب
    Model Comparison) — وعلى استضافة مجانية بتنام عند الخمول، هاد كان
    بيتراكم مع وقت الإقلاع ويأدي لانتهاء مهلة الطلب. to_thread عشان
    التدريب (CPU-bound) ما يجمّد الحلقة غير المتزامنة."""
    await asyncio.to_thread(get_trained_severity_model)
    yield


app = FastAPI(title="RxChef Analysis Service", lifespan=lifespan)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


class MedicationIn(BaseModel):
    id: int
    name: str
    generic_name: str = ""
    therapeutic_class: str = ""


class InteractionIn(BaseModel):
    drug_a_id: int
    drug_b_id: int
    severity: str
    description: str = ""


class AnalyzeRequest(BaseModel):
    drug_names: list[str]
    medications: list[MedicationIn] | None = None
    known_interactions: list[InteractionIn] | None = None


class MatchedDrugOut(BaseModel):
    query: str
    medication_id: int
    medication_name: str
    matched_text: str
    score: float


class UnmatchedDrugOut(BaseModel):
    query: str
    closest_guess: str | None
    score: float


class AlternativeOut(BaseModel):
    medication_id: int
    medication_name: str
    generic_name: str
    reason: str


class InteractionOut(BaseModel):
    drug_a_id: int
    drug_a_name: str
    drug_b_id: int
    drug_b_name: str
    catalog_severity: str
    description: str
    predicted_severity: str
    predicted_confidence: float
    alternatives: list[AlternativeOut]


class AnalyzeResponse(BaseModel):
    matched: list[MatchedDrugOut]
    unmatched: list[UnmatchedDrugOut]
    interactions: list[InteractionOut]
    summary: dict[str, int]


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    """يشغّل الخوارزميات بالتسلسل الصحيح: Fuzzy Matching → Graph
    Interaction Check → Model Comparison (مُدرَّب مسبقاً) → Multi-class
    Severity → Alternative Suggestion (للتفاعلات major). لو
    medications/known_interactions ما انبعتوا، بيستخدم الكتالوج المرجعي
    المدمج بالخدمة."""
    medications = (
        [
            Medication(
                id=m.id, name=m.name, generic_name=m.generic_name, therapeutic_class=m.therapeutic_class
            )
            for m in request.medications
        ]
        if request.medications is not None
        else None
    )
    known_interactions = (
        [
            Interaction(
                drug_a_id=i.drug_a_id,
                drug_b_id=i.drug_b_id,
                severity=i.severity,
                description=i.description,
            )
            for i in request.known_interactions
        ]
        if request.known_interactions is not None
        else None
    )

    report = analyze_prescription(request.drug_names, medications, known_interactions)

    return AnalyzeResponse(
        matched=[
            MatchedDrugOut(
                query=m.query,
                medication_id=m.medication.id,
                medication_name=m.medication.name,
                matched_text=m.matched_text,
                score=m.score,
            )
            for m in report.matched
        ],
        unmatched=[
            UnmatchedDrugOut(query=u.query, closest_guess=u.closest_guess, score=u.score)
            for u in report.unmatched
        ],
        interactions=[
            InteractionOut(
                drug_a_id=i.drug_a.id,
                drug_a_name=i.drug_a.name,
                drug_b_id=i.drug_b.id,
                drug_b_name=i.drug_b.name,
                catalog_severity=i.catalog_severity,
                description=i.description,
                predicted_severity=i.predicted_severity,
                predicted_confidence=i.predicted_confidence,
                alternatives=[
                    AlternativeOut(
                        medication_id=alt.medication.id,
                        medication_name=alt.medication.name,
                        generic_name=alt.medication.generic_name,
                        reason=alt.reason,
                    )
                    for alt in i.alternatives
                ],
            )
            for i in report.interactions
        ],
        summary={
            "total_input": len(request.drug_names),
            "matched_count": len(report.matched),
            "unmatched_count": len(report.unmatched),
            "interactions_found": len(report.interactions),
            "alternatives_found": sum(len(i.alternatives) for i in report.interactions),
        },
    )
