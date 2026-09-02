"""اختبار مستقل لـ Multi-class Severity. بياخد النموذج الأفضل يلي طلعته
Model Comparison على بيانات اصطناعية، ويتأكد إن التصنيف متعدد الفئات
شغال صح فوقه (نفس المنطق ينطبق على أي من النماذج الثلاثة الأفضل).
"""

import numpy as np
import pytest
from sklearn.datasets import make_classification

from app.algorithms.model_comparison import SEVERITY_CLASSES, compare_models
from app.algorithms.severity_classifier import SeverityClassifier


@pytest.fixture
def fitted_classifier():
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
    result = compare_models(X, y)
    return SeverityClassifier(result.best.model), X


def test_classify_returns_one_prediction_per_row(fitted_classifier):
    classifier, X = fitted_classifier
    predictions = classifier.classify(X[:10])
    assert len(predictions) == 10


def test_predicted_class_is_a_known_severity(fitted_classifier):
    classifier, X = fitted_classifier
    predictions = classifier.classify(X[:10])
    for prediction in predictions:
        assert prediction.predicted_class in SEVERITY_CLASSES


def test_probabilities_sum_to_one(fitted_classifier):
    classifier, X = fitted_classifier
    predictions = classifier.classify(X[:10])
    for prediction in predictions:
        assert sum(prediction.probabilities.values()) == pytest.approx(1.0, abs=1e-6)


def test_confidence_matches_max_probability(fitted_classifier):
    classifier, X = fitted_classifier
    predictions = classifier.classify(X[:10])
    for prediction in predictions:
        assert prediction.confidence == pytest.approx(max(prediction.probabilities.values()))


def test_confidence_is_probability_of_predicted_class(fitted_classifier):
    classifier, X = fitted_classifier
    predictions = classifier.classify(X[:10])
    for prediction in predictions:
        assert prediction.confidence == pytest.approx(
            prediction.probabilities[prediction.predicted_class]
        )


def test_empty_input_returns_empty_list(fitted_classifier):
    classifier, X = fitted_classifier
    assert classifier.classify(X[:0]) == []


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
