"""Alternative Suggestion — لما تفاعل خطير (major) معروف بين دوائين،
بيقترح بدائل آمنة لأحد الطرفين: نفس الفئة العلاجية، وبلا تفاعل معروف مع
باقي الوصفة. يعمل بمعزل تام عن FastAPI وقاعدة البيانات.

قيد مبسّط مهم (موثّق هون صراحة، مو مخفي): اختيار مين الطرفين
("drug_to_replace") هو المرشّح للاستبدال هو **قرار تقني**، مبني على
ترتيب تطبيع drug_a_id/drug_b_id يلي يستخدمه InteractionGraph (الأصغر
أولاً)، مو قرار سريري. ما في معيار طبي هون يحدد مين الدواء "الأهم"
إكلينيكياً بين الاثنين — القرار الحقيقي (متل: مين أصعب استبداله علاجياً)
بده تقييم صيدلاني حقيقي، خارج نطاق هالتبسيط.
"""

from dataclasses import dataclass

from app.algorithms.fuzzy_matching import Medication
from app.algorithms.interaction_graph import Interaction, InteractionGraph

MAX_ALTERNATIVES = 2


@dataclass(frozen=True)
class AlternativeSuggestion:
    medication: Medication
    reason: str


def _build_total_degree_map(interactions: list[Interaction]) -> dict[int, int]:
    degree: dict[int, int] = {}
    for interaction in interactions:
        degree[interaction.drug_a_id] = degree.get(interaction.drug_a_id, 0) + 1
        degree[interaction.drug_b_id] = degree.get(interaction.drug_b_id, 0) + 1
    return degree


def suggest_alternatives(
    drug_to_replace: Medication,
    rest_of_prescription: list[Medication],
    all_medications: list[Medication],
    known_interactions: list[Interaction],
) -> list[AlternativeSuggestion]:
    """بدائل آمنة لدواء واحد. ترجع [] صراحة لو ما في أي مرشّح مناسب
    (مو خطأ — نتيجة محتملة وصحيحة، لازم تُعرض للمستخدم بصراحة)."""
    if not drug_to_replace.therapeutic_class:
        return []

    graph = InteractionGraph(known_interactions)
    rest_ids = {med.id for med in rest_of_prescription if med.id != drug_to_replace.id}

    candidates = [
        med
        for med in all_medications
        if med.id != drug_to_replace.id
        and med.therapeutic_class == drug_to_replace.therapeutic_class
    ]

    total_degree = _build_total_degree_map(known_interactions)

    safe_candidates = []
    for candidate in candidates:
        conflicts = graph.check_prescription([candidate.id, *rest_ids])
        candidate_conflicts = [
            match
            for match in conflicts
            if candidate.id in (match.drug_a_id, match.drug_b_id)
        ]
        if candidate_conflicts:
            continue
        safe_candidates.append(candidate)

    safe_candidates.sort(key=lambda med: total_degree.get(med.id, 0))

    return [
        AlternativeSuggestion(
            medication=candidate,
            reason=(
                f"نفس الفئة العلاجية ({candidate.therapeutic_class})، "
                "بدون تفاعل معروف مع باقي الوصفة"
            ),
        )
        for candidate in safe_candidates[:MAX_ALTERNATIVES]
    ]
