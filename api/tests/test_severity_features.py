"""اختبار مستقل لهندسة فيتشرز Multi-class Severity، على بيانات حقيقية
من الكتالوج المرجعي (مو اصطناعية).
"""

import pytest

from app.algorithms.severity_features import FEATURE_NAMES, build_feature_vector, build_training_matrix
from app.data_loader import load_reference_interactions, load_reference_medications


@pytest.fixture
def catalog():
    return list(load_reference_medications()), list(load_reference_interactions())


def test_feature_vector_has_expected_length(catalog):
    medications, interactions = catalog
    by_id = {m.id: m for m in medications}
    first = interactions[0]
    vector = build_feature_vector(by_id[first.drug_a_id], by_id[first.drug_b_id], interactions)
    assert len(vector) == len(FEATURE_NAMES)


def test_known_interacting_pair_has_nonzero_degree(catalog):
    medications, interactions = catalog
    by_id = {m.id: m for m in medications}
    first = interactions[0]
    vector = build_feature_vector(by_id[first.drug_a_id], by_id[first.drug_b_id], interactions)
    _, degree_a, degree_b, *_rest = vector
    assert degree_a >= 1
    assert degree_b >= 1


def test_leave_one_out_excludes_the_pair_being_scored(catalog):
    # فيتشرز الزوج (drug_a, drug_b) ما لازم تعتمد على severity التفاعل
    # نفسه — لازم يعطوا نفس القيمة بغض النظر شو severity هالتفاعل
    medications, interactions = catalog
    by_id = {m.id: m for m in medications}
    first = interactions[0]
    drug_a, drug_b = by_id[first.drug_a_id], by_id[first.drug_b_id]

    vector_with_pair = build_feature_vector(drug_a, drug_b, interactions)
    other_interactions = [i for i in interactions if i is not first]
    vector_without_pair = build_feature_vector(drug_a, drug_b, other_interactions)
    assert vector_with_pair == vector_without_pair


def test_unrelated_pair_has_zero_shared_neighbors(catalog):
    medications, interactions = catalog
    by_id = {m.id: m for m in medications}
    # Amoxicillin وMontelukast ما إلهم أي تفاعل معروف أو جيران مشتركين
    amoxicillin = next(m for m in medications if m.generic_name == "Amoxicillin")
    montelukast = next(m for m in medications if m.generic_name == "Montelukast")
    vector = build_feature_vector(amoxicillin, montelukast, interactions)
    same_class, _, _, shared, *_rest = vector
    assert same_class == 0.0
    assert shared == 0.0


def test_training_matrix_shape_matches_known_interactions(catalog):
    medications, interactions = catalog
    X, y = build_training_matrix(interactions, medications)
    assert X.shape == (len(interactions), len(FEATURE_NAMES))
    assert y.shape == (len(interactions),)


def test_training_labels_are_known_severity_classes(catalog):
    medications, interactions = catalog
    _, y = build_training_matrix(interactions, medications)
    assert set(y) <= {"minor", "moderate", "major"}


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
