"""يشغّل الخوارزميات بالتسلسل الصحيح على وصفة كاملة: Fuzzy Matching →
Graph-based Interaction Check → (Model Comparison مُدرَّب مسبقاً) →
Multi-class Severity → Alternative Suggestion (للتفاعلات major فقط)،
ويرجّع تقرير شامل واحد. هاد المنطق يلي بيستدعيه POST /analyze بملف main.py.
"""

from dataclasses import dataclass

from app.algorithms.alternative_suggestion import AlternativeSuggestion, suggest_alternatives
from app.algorithms.fuzzy_matching import Medication, find_best_match
from app.algorithms.interaction_graph import Interaction, InteractionGraph
from app.algorithms.severity_features import build_feature_vector
from app.data_loader import (
    load_reference_interactions,
    load_reference_medications,
    load_verified_severity_interactions,
)
from app.severity_model import get_trained_severity_model

ALTERNATIVE_TRIGGER_SEVERITIES = {"major"}


@dataclass(frozen=True)
class MatchedDrug:
    query: str
    medication: Medication
    matched_text: str
    score: float


@dataclass(frozen=True)
class UnmatchedDrug:
    query: str
    closest_guess: str | None
    score: float


@dataclass(frozen=True)
class DetectedInteraction:
    drug_a: Medication
    drug_b: Medication
    catalog_severity: str
    description: str
    predicted_severity: str
    predicted_confidence: float
    alternatives: list[AlternativeSuggestion]


@dataclass(frozen=True)
class AnalysisReport:
    matched: list[MatchedDrug]
    unmatched: list[UnmatchedDrug]
    interactions: list[DetectedInteraction]


def analyze_prescription(
    drug_names: list[str],
    medications: list[Medication] | None = None,
    known_interactions: list[Interaction] | None = None,
) -> AnalysisReport:
    """medications/known_interactions اختياريين: لو ما انبعتوا، بيستخدم
    الكتالوج المرجعي المدمج. هيك FastAPI تقدر تضل بلا حالة فعلياً لما
    Next.js يصير جاهز يبعت كتالوجه من SQLite."""
    medications = medications if medications is not None else list(load_reference_medications())
    using_default_catalog = known_interactions is None
    known_interactions = (
        known_interactions
        if known_interactions is not None
        else list(load_reference_interactions())
    )
    # فيتشرز التصنيف لازم تتحسب بنفس سياق التدريب (بس التفاعلات الموثوقة
    # الشدّة: manual + onc_high) وإلا بصير train/serve skew وتنكسر دقّة
    # النموذج الحقيقية. لو المتصل بعت كتالوج خاص عبر الطلب، منستخدمه كامل
    # — ما في مفهوم "موثوق/غير موثوق" لبيانات متصل خارجي.
    verified_interactions = (
        list(load_verified_severity_interactions()) if using_default_catalog else known_interactions
    )

    # 1) Fuzzy Matching
    matched: list[MatchedDrug] = []
    unmatched: list[UnmatchedDrug] = []
    for name in drug_names:
        result = find_best_match(name, medications)
        if result is None:
            unmatched.append(UnmatchedDrug(query=name, closest_guess=None, score=0.0))
        elif result.is_confident:
            matched.append(
                MatchedDrug(
                    query=result.query,
                    medication=result.medication,
                    matched_text=result.matched_text,
                    score=result.score,
                )
            )
        else:
            unmatched.append(
                UnmatchedDrug(
                    query=result.query, closest_guess=result.matched_text, score=result.score
                )
            )

    # 2) Graph-based Interaction Check
    graph = InteractionGraph(known_interactions)
    matched_ids = [m.medication.id for m in matched]
    raw_matches = graph.check_prescription(matched_ids)

    # 3) Model Comparison (مُدرَّب مسبقاً ومخبّأ) + 4) Multi-class Severity
    trained_model = get_trained_severity_model()
    by_id = {med.id: med for med in medications}
    matched_medications = [m.medication for m in matched]

    interactions_out: list[DetectedInteraction] = []
    for raw_match in raw_matches:
        drug_a = by_id[raw_match.drug_a_id]
        drug_b = by_id[raw_match.drug_b_id]
        feature_vector = build_feature_vector(drug_a, drug_b, verified_interactions)
        prediction = trained_model.classifier.classify([feature_vector])[0]

        # 5) Alternative Suggestion — للتفاعلات الخطيرة (major) بس. اختيار
        # drug_b تحديداً كـ"المرشّح للاستبدال" قرار تقني (ترتيب تطبيع الـ
        # id بـInteractionGraph)، مو قرار سريري — راجع alternative_suggestion.py.
        alternatives: list[AlternativeSuggestion] = []
        if raw_match.severity in ALTERNATIVE_TRIGGER_SEVERITIES:
            rest_of_prescription = [med for med in matched_medications if med.id != drug_b.id]
            alternatives = suggest_alternatives(
                drug_to_replace=drug_b,
                rest_of_prescription=rest_of_prescription,
                all_medications=medications,
                known_interactions=known_interactions,
            )

        interactions_out.append(
            DetectedInteraction(
                drug_a=drug_a,
                drug_b=drug_b,
                catalog_severity=raw_match.severity,
                description=raw_match.description,
                predicted_severity=prediction.predicted_class,
                predicted_confidence=prediction.confidence,
                alternatives=alternatives,
            )
        )

    return AnalysisReport(matched=matched, unmatched=unmatched, interactions=interactions_out)
