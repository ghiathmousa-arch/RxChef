"""اختبار مستقل لخوارزمية Alternative Suggestion. بيانات العيّنة هون
للاختبار فقط، مو بيانات المرحلة 2 الحقيقية.
"""

import pytest

from app.algorithms.alternative_suggestion import suggest_alternatives
from app.algorithms.fuzzy_matching import Medication
from app.algorithms.interaction_graph import Interaction

WARFARIN = Medication(id=1, name="Coumadin", generic_name="Warfarin", therapeutic_class="Anticoagulant")
ASPIRIN = Medication(id=2, name="Aspirin", generic_name="Aspirin", therapeutic_class="NSAID/Antiplatelet")
APIXABAN = Medication(id=3, name="Eliquis", generic_name="Apixaban", therapeutic_class="Anticoagulant")
RIVAROXABAN = Medication(id=4, name="Xarelto", generic_name="Rivaroxaban", therapeutic_class="Anticoagulant")
DABIGATRAN = Medication(id=5, name="Pradaxa", generic_name="Dabigatran", therapeutic_class="Anticoagulant")
METFORMIN = Medication(id=6, name="Glucophage", generic_name="Metformin", therapeutic_class="Antidiabetic")

ALL_MEDICATIONS = [WARFARIN, ASPIRIN, APIXABAN, RIVAROXABAN, DABIGATRAN, METFORMIN]


def test_ranks_safe_alternatives_by_fewest_known_interactions():
    # Warfarin-Aspirin major؛ Rivaroxaban نفسه بيتفاعل مع Aspirin (غير آمن)؛
    # Dabigatran عنده تفاعل تاني (بيزيد درجته)، فـApixaban لازم يطلع أول
    interactions = [
        Interaction(1, 2, severity="major", description="Warfarin-Aspirin"),
        Interaction(4, 2, severity="major", description="Rivaroxaban-Aspirin"),
        Interaction(5, 6, severity="minor", description="Dabigatran-Metformin"),
    ]
    result = suggest_alternatives(
        drug_to_replace=WARFARIN,
        rest_of_prescription=[ASPIRIN],
        all_medications=ALL_MEDICATIONS,
        known_interactions=interactions,
    )
    assert [alt.medication.id for alt in result] == [3, 5]  # Apixaban أول، Dabigatran تاني
    assert "Anticoagulant" in result[0].reason


def test_excludes_candidate_that_conflicts_with_rest_of_prescription():
    # بس Apixaban وRivaroxaban كمرشّحين؛ Rivaroxaban بيتعارض مع Aspirin
    interactions = [
        Interaction(1, 2, severity="major", description="Warfarin-Aspirin"),
        Interaction(4, 2, severity="major", description="Rivaroxaban-Aspirin"),
    ]
    result = suggest_alternatives(
        drug_to_replace=WARFARIN,
        rest_of_prescription=[ASPIRIN],
        all_medications=[WARFARIN, ASPIRIN, APIXABAN, RIVAROXABAN],
        known_interactions=interactions,
    )
    assert len(result) == 1
    assert result[0].medication.id == 3  # Apixaban فقط


def test_returns_empty_list_when_no_safe_alternative_exists():
    # كل المرشّحين (Rivaroxaban، Dabigatran) بيتعارضوا مع Aspirin
    interactions = [
        Interaction(1, 2, severity="major", description="Warfarin-Aspirin"),
        Interaction(4, 2, severity="major", description="Rivaroxaban-Aspirin"),
        Interaction(5, 2, severity="major", description="Dabigatran-Aspirin"),
    ]
    result = suggest_alternatives(
        drug_to_replace=WARFARIN,
        rest_of_prescription=[ASPIRIN],
        all_medications=[WARFARIN, ASPIRIN, RIVAROXABAN, DABIGATRAN],
        known_interactions=interactions,
    )
    assert result == []


def test_returns_empty_list_when_no_other_drug_shares_the_class():
    # Metformin لحاله بفئته العلاجية بهالكتالوج
    result = suggest_alternatives(
        drug_to_replace=METFORMIN,
        rest_of_prescription=[WARFARIN],
        all_medications=ALL_MEDICATIONS,
        known_interactions=[],
    )
    assert result == []


def test_returns_empty_list_for_medication_with_no_therapeutic_class():
    unclassified = Medication(id=99, name="Unknown", generic_name="Unknown", therapeutic_class="")
    result = suggest_alternatives(
        drug_to_replace=unclassified,
        rest_of_prescription=[],
        all_medications=ALL_MEDICATIONS,
        known_interactions=[],
    )
    assert result == []


def test_never_suggests_the_drug_being_replaced():
    interactions = [Interaction(1, 2, severity="major", description="Warfarin-Aspirin")]
    result = suggest_alternatives(
        drug_to_replace=WARFARIN,
        rest_of_prescription=[ASPIRIN],
        all_medications=ALL_MEDICATIONS,
        known_interactions=interactions,
    )
    assert WARFARIN.id not in {alt.medication.id for alt in result}


def test_respects_max_alternatives_cap():
    # أربع مرشّحين آمنين لأنيكوأغيولانت، بس الحد الأقصى 2
    extra = Medication(id=7, name="ExtraAnti", generic_name="ExtraAnti", therapeutic_class="Anticoagulant")
    result = suggest_alternatives(
        drug_to_replace=WARFARIN,
        rest_of_prescription=[ASPIRIN],
        all_medications=ALL_MEDICATIONS + [extra],
        known_interactions=[Interaction(1, 2, severity="major", description="Warfarin-Aspirin")],
    )
    assert len(result) <= 2


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
