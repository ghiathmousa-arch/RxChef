"""اختبار مستقل لخوارزمية Fuzzy Matching — بمعزل عن FastAPI وقاعدة البيانات.
بيانات العيّنة هون للاختبار فقط، مو بيانات المرحلة 2 الحقيقية.
"""

import pytest

from app.algorithms.fuzzy_matching import Medication, find_best_match, match_prescription

SAMPLE_MEDICATIONS = [
    Medication(id=1, name="Amoxicillin", generic_name="Amoxicillin"),
    Medication(id=2, name="Panadol", generic_name="Paracetamol"),
    Medication(id=3, name="Augmentin", generic_name="Amoxicillin/Clavulanate"),
    Medication(id=4, name="Voltaren", generic_name="Diclofenac"),
    Medication(id=5, name="Glucophage", generic_name="Metformin"),
    Medication(id=6, name="Concor", generic_name="Bisoprolol"),
    Medication(id=7, name="Ventolin", generic_name="Salbutamol"),
]


def test_exact_match_is_confident():
    result = find_best_match("Panadol", SAMPLE_MEDICATIONS)
    assert result is not None
    assert result.medication.id == 2
    assert result.is_confident
    assert result.score > 95


def test_typo_still_matches():
    result = find_best_match("Amoxicilin", SAMPLE_MEDICATIONS)  # حرف ناقص
    assert result is not None
    assert result.medication.name == "Amoxicillin"
    assert result.is_confident


def test_matches_via_generic_name():
    result = find_best_match("Metformin", SAMPLE_MEDICATIONS)
    assert result is not None
    assert result.medication.id == 5
    assert result.matched_text == "Metformin"


def test_unrelated_input_is_not_confident():
    result = find_best_match("xyzqqq123", SAMPLE_MEDICATIONS)
    assert result is not None  # rapidfuzz لازم يرجّع أقرب شي، بس بثقة واطئة
    assert not result.is_confident


def test_empty_query_returns_none():
    assert find_best_match("", SAMPLE_MEDICATIONS) is None
    assert find_best_match("   ", SAMPLE_MEDICATIONS) is None


def test_empty_medication_list_returns_none():
    assert find_best_match("Panadol", []) is None


def test_match_prescription_batch():
    results = match_prescription(["Panadol", "Concor", "Ventolin"], SAMPLE_MEDICATIONS)
    assert len(results) == 3
    matched_ids = {r.medication.id for r in results}
    assert matched_ids == {2, 6, 7}


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
