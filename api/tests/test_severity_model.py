"""اختبار مستقل لتدريب نموذج الشدّة المُخبّأ (get_trained_severity_model)
وتوثيق Feature Importance المطلوب بالمرحلة 7 من الخطة.
"""

import pytest

from app.algorithms.severity_features import FEATURE_NAMES
from app.severity_model import get_trained_severity_model


def test_returns_same_cached_instance_on_repeated_calls():
    first = get_trained_severity_model()
    second = get_trained_severity_model()
    assert first is second


def test_chosen_model_is_one_of_the_three_candidates():
    trained = get_trained_severity_model()
    assert trained.chosen_model_name in {"logistic_regression", "random_forest", "xgboost"}
    assert set(trained.candidate_accuracies) == {"logistic_regression", "random_forest", "xgboost"}


def test_chosen_model_has_the_highest_accuracy_among_candidates():
    trained = get_trained_severity_model()
    assert trained.chosen_model_accuracy == max(trained.candidate_accuracies.values())


def test_feature_importances_cover_all_known_features():
    trained = get_trained_severity_model()
    assert trained.feature_importances is not None
    assert set(trained.feature_importances) == set(FEATURE_NAMES)


def test_feature_importances_are_non_negative():
    trained = get_trained_severity_model()
    for value in trained.feature_importances.values():
        assert value >= 0.0


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
