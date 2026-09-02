"""هندسة فيتشرز Multi-class Severity — مشتقّة كلها من بيانات حقيقية موجودة
بالكتالوج المرجعي (الفئة العلاجية لكل دواء + بنية غراف التفاعلات المعروفة)،
بلا أي بيانات مفبركة.
"""

import numpy as np

from app.algorithms.fuzzy_matching import Medication
from app.algorithms.interaction_graph import Interaction

FEATURE_NAMES = (
    "same_therapeutic_class",
    "degree_a",
    "degree_b",
    "shared_neighbors",
    "major_count_a",
    "moderate_count_a",
    "minor_count_a",
    "major_count_b",
    "moderate_count_b",
    "minor_count_b",
)

_SEVERITY_CLASSES = ("major", "moderate", "minor")


def _build_neighbor_map(interactions: list[Interaction]) -> dict[int, set[int]]:
    neighbors: dict[int, set[int]] = {}
    for interaction in interactions:
        neighbors.setdefault(interaction.drug_a_id, set()).add(interaction.drug_b_id)
        neighbors.setdefault(interaction.drug_b_id, set()).add(interaction.drug_a_id)
    return neighbors


def _build_severity_count_map(interactions: list[Interaction]) -> dict[int, dict[str, int]]:
    """عدد تفاعلات كل دواء لكل درجة شدّة لحالها (مو مجموع موزون واحد) —
    بيعطي النماذج الشجرية مرونة أكتر تتعلّم أنماط حقيقية (متل: دواء عنده
    تفاعل major واحد بس أخطر من دواء عنده 5 تفاعلات minor)."""
    counts: dict[int, dict[str, int]] = {}
    for interaction in interactions:
        for drug_id in (interaction.drug_a_id, interaction.drug_b_id):
            drug_counts = counts.setdefault(drug_id, {s: 0 for s in _SEVERITY_CLASSES})
            if interaction.severity in drug_counts:
                drug_counts[interaction.severity] += 1
    return counts


def _exclude_pair(
    interactions: list[Interaction], drug_a_id: int, drug_b_id: int
) -> list[Interaction]:
    """Leave-one-out: بيشيل تفاعل (drug_a, drug_b) نفسه من قائمة التفاعلات
    قبل حساب الفيتشرز. بدونها، فيتشرز التدريب لأي زوج بتتضمّن جزء من
    الليبل نفسه (تسريب بيانات خفيف) — لأن عدّاد شدّة الدواء بيشمل
    التفاعل يلي عم نحاول نتوقّع شدّته بالضبط."""
    pair = {drug_a_id, drug_b_id}
    return [i for i in interactions if {i.drug_a_id, i.drug_b_id} != pair]


def build_feature_vector(
    drug_a: Medication,
    drug_b: Medication,
    interactions: list[Interaction],
) -> list[float]:
    """فيتشرز زوج أدوية: نفس الفئة العلاجية؟ درجة كل دواء بغراف التفاعلات؟
    كم جار مشترك؟ وعدد تفاعلات كل دواء لكل درجة شدّة لحالها. الحساب كله
    يستبعد تفاعل (drug_a, drug_b) نفسه لو كان موجود بالقائمة (leave-one-out)."""
    other_interactions = _exclude_pair(interactions, drug_a.id, drug_b.id)

    neighbors = _build_neighbor_map(other_interactions)
    neighbors_a = neighbors.get(drug_a.id, set())
    neighbors_b = neighbors.get(drug_b.id, set())

    severity_counts = _build_severity_count_map(other_interactions)
    counts_a = severity_counts.get(drug_a.id, {s: 0 for s in _SEVERITY_CLASSES})
    counts_b = severity_counts.get(drug_b.id, {s: 0 for s in _SEVERITY_CLASSES})

    same_class = float(
        bool(drug_a.therapeutic_class) and drug_a.therapeutic_class == drug_b.therapeutic_class
    )
    shared_neighbors = len(neighbors_a & neighbors_b)

    return [
        same_class,
        float(len(neighbors_a)),
        float(len(neighbors_b)),
        float(shared_neighbors),
        float(counts_a["major"]),
        float(counts_a["moderate"]),
        float(counts_a["minor"]),
        float(counts_b["major"]),
        float(counts_b["moderate"]),
        float(counts_b["minor"]),
    ]


def build_training_matrix(
    labeled_interactions: list[Interaction],
    medications: list[Medication],
    context_interactions: list[Interaction] | None = None,
) -> tuple[np.ndarray, np.ndarray]:
    """يبني مصفوفة تدريب: X = فيتشرز الزوج، y = درجة الشدّة المسجّلة.

    labeled_interactions: بس التفاعلات يلي عندها تصنيف شدّة موثوق —
    هاي يلي بتصير أمثلة تدريب (X, y). context_interactions (اختياري):
    الكتالوج الكامل (بما فيه تفاعلات بلا تصنيف شدّة موثوق) تستخدم فقط
    لحساب فيتشرز بنية الغراف (degree, shared_neighbors...) — غراف أوسع
    وأدق، بمعزل عن كونه صالح لتدريب مباشر. افتراضياً بتستخدم
    labeled_interactions نفسها كسياق لو ما انبعت قيمة منفصلة."""
    context = context_interactions if context_interactions is not None else labeled_interactions
    by_id = {med.id: med for med in medications}

    rows: list[list[float]] = []
    labels: list[str] = []
    for interaction in labeled_interactions:
        drug_a = by_id[interaction.drug_a_id]
        drug_b = by_id[interaction.drug_b_id]
        rows.append(build_feature_vector(drug_a, drug_b, context))
        labels.append(interaction.severity)

    return np.array(rows), np.array(labels)
