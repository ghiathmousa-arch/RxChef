"""Multi-class Severity — يصنّف كل تفاعل مكتشف لإحدى ثلاث درجات شدّة
(minor / moderate / major) باستخدام النموذج يلي اختارته Model Comparison
كأفضل نموذج. يعمل بمعزل تام عن FastAPI وقاعدة البيانات.
"""

from dataclasses import dataclass
from typing import Any

import numpy as np


@dataclass(frozen=True)
class SeverityPrediction:
    predicted_class: str
    confidence: float
    probabilities: dict[str, float]


class SeverityClassifier:
    """غلاف خفيف حول أي نموذج مُدرَّب متوافق مع sklearn (مخرج Model
    Comparison) يوحّد شكل التصنيف متعدد الفئات لكل تفاعل مكتشف، بغض النظر
    عن أي من النماذج الثلاثة كان الأفضل."""

    def __init__(self, model: Any):
        self._model = model

    def classify(self, X: np.ndarray) -> list[SeverityPrediction]:
        if len(X) == 0:
            return []

        predictions = self._model.predict(X)
        probabilities = self._model.predict_proba(X)
        class_labels = [str(label) for label in self._model.classes_]

        results = []
        for predicted_class, proba_row in zip(predictions, probabilities):
            probabilities_by_class = dict(zip(class_labels, (float(p) for p in proba_row)))
            results.append(
                SeverityPrediction(
                    predicted_class=str(predicted_class),
                    confidence=float(max(proba_row)),
                    probabilities=probabilities_by_class,
                )
            )
        return results
