"""Fuzzy Matching — يقارن اسم دواء مكتوب يدوياً مع قائمة الأدوية المعروفة
ويرجّع أقرب تطابق مع نسبة تشابه. يعمل بمعزل تام عن FastAPI وقاعدة البيانات
(حسب متطلبات المرحلة 3 بخطة التنفيذ).
"""

from dataclasses import dataclass

from rapidfuzz import fuzz, process

DEFAULT_CONFIDENCE_THRESHOLD = 70.0


@dataclass(frozen=True)
class Medication:
    id: int
    name: str
    generic_name: str = ""
    therapeutic_class: str = ""


@dataclass(frozen=True)
class MatchResult:
    query: str
    medication: Medication | None
    matched_text: str | None
    score: float
    is_confident: bool


def _build_search_index(medications: list[Medication]) -> dict[tuple[int, str], str]:
    """يبني فهرس بحث يغطي الاسم التجاري والمكوّن الفعّال معاً، لأن المستخدم
    ممكن يكتب أي منهم."""
    index: dict[tuple[int, str], str] = {}
    for med in medications:
        index[(med.id, "name")] = med.name
        if med.generic_name:
            index[(med.id, "generic_name")] = med.generic_name
    return index


def find_best_match(
    query: str,
    medications: list[Medication],
    threshold: float = DEFAULT_CONFIDENCE_THRESHOLD,
) -> MatchResult | None:
    """ترجع أقرب دواء لاسم مكتوب. None إذا كانت القائمة أو الاستعلام فاضي."""
    normalized_query = query.strip()
    if not normalized_query or not medications:
        return None

    index = _build_search_index(medications)
    by_id = {med.id: med for med in medications}

    result = process.extractOne(normalized_query, index, scorer=fuzz.WRatio)
    if result is None:
        return None

    matched_text, score, key = result
    med_id, _field = key

    return MatchResult(
        query=normalized_query,
        medication=by_id[med_id],
        matched_text=matched_text,
        score=score,
        is_confident=score >= threshold,
    )


def match_prescription(
    queries: list[str],
    medications: list[Medication],
    threshold: float = DEFAULT_CONFIDENCE_THRESHOLD,
) -> list[MatchResult]:
    """يطبّق find_best_match على كل اسم بقائمة وصفة كاملة."""
    results = []
    for query in queries:
        match = find_best_match(query, medications, threshold=threshold)
        if match is not None:
            results.append(match)
    return results
