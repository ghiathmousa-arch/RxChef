"""اختبار تكامل لخط الأنابيب الكامل (analyze_prescription) على الكتالوج
المرجعي الحقيقي — كل الخوارزميات مع بعض، بوصفة واقعية.
"""

import pytest

from app.pipeline import analyze_prescription


def test_realistic_prescription_finds_known_major_interaction():
    # Coumadin (Warfarin) + Aspirin: تفاعل major معروف بالكتالوج
    report = analyze_prescription(["Coumadin", "Aspirin"])
    assert len(report.matched) == 2
    assert len(report.interactions) == 1

    interaction = report.interactions[0]
    assert interaction.catalog_severity == "major"
    assert interaction.predicted_severity in {"minor", "moderate", "major"}
    assert 0.0 <= interaction.predicted_confidence <= 1.0


def test_typo_in_drug_name_still_matches():
    report = analyze_prescription(["Coumadn", "Aspirn"])  # حروف ناقصة
    assert len(report.matched) == 2
    assert len(report.unmatched) == 0


def test_unknown_drug_is_reported_as_unmatched():
    report = analyze_prescription(["Coumadin", "TotallyFakeDrugXYZ"])
    assert len(report.matched) == 1
    assert len(report.unmatched) == 1
    assert report.unmatched[0].query == "TotallyFakeDrugXYZ"


def test_prescription_with_no_interactions():
    # Amoxicillin وVentolin ما إلهم تفاعل معروف بالكتالوج
    report = analyze_prescription(["Amoxicillin", "Ventolin"])
    assert len(report.matched) == 2
    assert report.interactions == []


def test_multiple_known_interactions_in_one_prescription():
    # Warfarin+Aspirin (major), Warfarin+Clarithromycin (moderate),
    # Simvastatin+Clarithromycin (major) — كل الأزواج الثلاثة معروفة بالكتالوج
    report = analyze_prescription(["Coumadin", "Aspirin", "Zocor", "Clarithromycin"])
    assert len(report.matched) == 4
    assert len(report.interactions) == 3


def test_major_interaction_includes_safe_alternatives():
    # Coumadin (Warfarin) + Aspirin: major → لازم يقترح بدائل أنيكوأغيولانت
    # (نفس الفئة العلاجية) ما إلها تفاعل معروف مع Aspirin
    report = analyze_prescription(["Coumadin", "Aspirin"])
    interaction = report.interactions[0]
    assert interaction.catalog_severity == "major"
    assert len(interaction.alternatives) > 0
    for alt in interaction.alternatives:
        assert alt.medication.therapeutic_class == "Anticoagulant"
        assert alt.medication.id != interaction.drug_b.id


def test_moderate_and_minor_interactions_have_no_alternatives():
    # Warfarin+Clarithromycin moderate — بدائل بتنعرض بس للتفاعلات major
    report = analyze_prescription(["Coumadin", "Clarithromycin"])
    interaction = report.interactions[0]
    assert interaction.catalog_severity == "moderate"
    assert interaction.alternatives == []


def test_empty_prescription():
    report = analyze_prescription([])
    assert report.matched == []
    assert report.unmatched == []
    assert report.interactions == []


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
