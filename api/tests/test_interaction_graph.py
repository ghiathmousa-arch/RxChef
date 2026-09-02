"""اختبار مستقل لخوارزمية Graph-based Interaction Check.
بيانات العيّنة هون للاختبار فقط، مو بيانات المرحلة 2 الحقيقية.

الأدوية (بمعرّفات هالملف فقط):
1 Warfarin, 2 Aspirin, 3 Simvastatin, 4 Clarithromycin, 5 Metformin, 6 Lisinopril
"""

import pytest

from app.algorithms.interaction_graph import Interaction, InteractionGraph

SAMPLE_INTERACTIONS = [
    Interaction(1, 2, severity="major", description="Increased bleeding risk"),
    Interaction(3, 4, severity="major", description="Risk of rhabdomyolysis"),
    Interaction(1, 6, severity="minor", description="Monitor renal function"),
]


@pytest.fixture
def graph():
    return InteractionGraph(SAMPLE_INTERACTIONS)


def test_finds_single_known_pair(graph):
    matches = graph.check_prescription([1, 2, 5])  # Warfarin + Aspirin + Metformin
    assert len(matches) == 1
    assert (matches[0].drug_a_id, matches[0].drug_b_id) == (1, 2)
    assert matches[0].severity == "major"


def test_finds_multiple_pairs_in_same_prescription(graph):
    matches = graph.check_prescription([1, 2, 3, 4, 5])
    pairs = {(m.drug_a_id, m.drug_b_id) for m in matches}
    assert pairs == {(1, 2), (3, 4)}


def test_pair_order_in_prescription_does_not_matter(graph):
    matches_forward = graph.check_prescription([1, 2])
    matches_backward = graph.check_prescription([2, 1])
    assert matches_forward == matches_backward


def test_no_interaction_among_unrelated_drugs(graph):
    matches = graph.check_prescription([5])  # Metformin لحاله
    assert matches == []


def test_no_edge_between_non_interacting_drugs(graph):
    matches = graph.check_prescription([2, 5])  # Aspirin + Metformin، ما في تفاعل معروف
    assert matches == []


def test_duplicate_drug_ids_do_not_duplicate_matches(graph):
    matches = graph.check_prescription([1, 1, 2, 2])
    assert len(matches) == 1


def test_transitive_chain_finds_both_edges_not_third(graph):
    # Warfarin-Lisinopril تفاعل معروف، بس Lisinopril-Aspirin مش معروف كتفاعل مباشر
    matches = graph.check_prescription([1, 2, 6])
    pairs = {(m.drug_a_id, m.drug_b_id) for m in matches}
    assert pairs == {(1, 2), (1, 6)}


def test_empty_prescription_returns_empty():
    graph = InteractionGraph(SAMPLE_INTERACTIONS)
    assert graph.check_prescription([]) == []


def test_empty_known_interactions_returns_empty():
    graph = InteractionGraph([])
    assert graph.check_prescription([1, 2, 3]) == []


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
