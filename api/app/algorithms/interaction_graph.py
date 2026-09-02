"""Graph-based Interaction Check — يبني غراف من التفاعلات الدوائية المعروفة
(كل دواء عقدة، وكل تفاعل معروف حافة بينهم)، وياخد قائمة أدوية وصفة ويرجّع
كل الأزواج المتفاعلة فعلياً ضمنها. يعمل بمعزل تام عن FastAPI وقاعدة البيانات.
"""

from collections import defaultdict
from dataclasses import dataclass


@dataclass(frozen=True)
class Interaction:
    drug_a_id: int
    drug_b_id: int
    severity: str
    description: str = ""


@dataclass(frozen=True)
class InteractionMatch:
    drug_a_id: int
    drug_b_id: int
    severity: str
    description: str


class InteractionGraph:
    """غراف غير موجّه: كل دواء عقدة، وكل تفاعل معروف حافة. البحث عن
    التفاعلات ضمن وصفة معيّنة يمشي فقط على جيران أدوية الوصفة (مش كل
    التفاعلات المعروفة بالنظام)، وهاد الفرق الجوهري عن مقارنة كل زوج ممكن."""

    def __init__(self, interactions: list[Interaction]):
        self._adjacency: dict[int, dict[int, Interaction]] = defaultdict(dict)
        for interaction in interactions:
            self._adjacency[interaction.drug_a_id][interaction.drug_b_id] = interaction
            self._adjacency[interaction.drug_b_id][interaction.drug_a_id] = interaction

    def check_prescription(self, drug_ids: list[int]) -> list[InteractionMatch]:
        """ترجع كل الأزواج المتفاعلة بين أدوية الوصفة، بدون تكرار."""
        prescription_ids = set(drug_ids)
        seen_pairs: set[tuple[int, int]] = set()
        matches: list[InteractionMatch] = []

        for drug_id in prescription_ids:
            neighbors = self._adjacency.get(drug_id)
            if not neighbors:
                continue
            for neighbor_id, interaction in neighbors.items():
                if neighbor_id not in prescription_ids:
                    continue
                pair_key = (min(drug_id, neighbor_id), max(drug_id, neighbor_id))
                if pair_key in seen_pairs:
                    continue
                seen_pairs.add(pair_key)
                matches.append(
                    InteractionMatch(
                        drug_a_id=pair_key[0],
                        drug_b_id=pair_key[1],
                        severity=interaction.severity,
                        description=interaction.description,
                    )
                )

        return matches
