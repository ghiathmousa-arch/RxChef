"""اختبار مستقل لخط أنابيب Model Comparison — بيانات اصطناعية (make_classification)
تقوم مقام فيتشرز التفاعلات الحقيقية لحد ما تجهز المرحلة 2. الهدف هون التأكد
إن آلية التدريب/المقارنة/اختيار الأفضل شغالة صح، مو دقّة نموذج معيّن.
"""

import numpy as np
import pytest
from sklearn.datasets import make_classification

from app.algorithms.model_comparison import SEVERITY_CLASSES, compare_models


@pytest.fixture
def synthetic_dataset():
    X, y_index = make_classification(
        n_samples=300,
        n_features=8,
        n_informative=5,
        n_redundant=1,
        n_classes=3,
        n_clusters_per_class=1,
        random_state=42,
    )
    y = np.array(SEVERITY_CLASSES)[y_index]
    return X, y


def test_compares_all_three_models(synthetic_dataset):
    X, y = synthetic_dataset
    result = compare_models(X, y)
    names = {score.name for score in result.scores}
    assert names == {"logistic_regression", "random_forest", "xgboost"}


def test_accuracies_are_valid_probabilities(synthetic_dataset):
    X, y = synthetic_dataset
    result = compare_models(X, y)
    for score in result.scores:
        assert 0.0 <= score.accuracy <= 1.0


def test_best_model_has_highest_accuracy(synthetic_dataset):
    X, y = synthetic_dataset
    result = compare_models(X, y)
    assert result.best.accuracy == max(score.accuracy for score in result.scores)


def test_best_model_predicts_known_classes(synthetic_dataset):
    X, y = synthetic_dataset
    result = compare_models(X, y)
    predictions = result.best.model.predict(X[:5])
    assert set(predictions).issubset(set(SEVERITY_CLASSES))


def test_comparison_is_reproducible_with_same_random_state(synthetic_dataset):
    X, y = synthetic_dataset
    result_a = compare_models(X, y, random_state=7)
    result_b = compare_models(X, y, random_state=7)
    accuracies_a = {s.name: s.accuracy for s in result_a.scores}
    accuracies_b = {s.name: s.accuracy for s in result_b.scores}
    assert accuracies_a == accuracies_b


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
